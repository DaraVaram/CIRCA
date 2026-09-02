/**
 * Looks up DOIs for every published entry in publications.json against Crossref.
 *
 * A wrong DOI is worse than no DOI, so a result is only accepted when the
 * returned title matches ours closely AND one of our authors appears on the
 * record. Anything short of that is reported and left blank for a human.
 *
 *   node scripts/fetch-dois.mjs          # report only
 *   node scripts/fetch-dois.mjs --write  # apply the confident matches
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../src/data/publications.json', import.meta.url)
const MAILTO = 'mialhajri@aus.edu'
const WRITE = process.argv.includes('--write')

const pubs = JSON.parse(readFileSync(FILE, 'utf8'))

/** Lowercase, strip punctuation and collapse whitespace. */
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[‐-―]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Token-level Jaccard similarity, which tolerates subtitle punctuation drift. */
function similarity(a, b) {
  const A = new Set(norm(a).split(' ').filter(Boolean))
  const B = new Set(norm(b).split(' ').filter(Boolean))
  if (!A.size || !B.size) return 0
  let shared = 0
  for (const t of A) if (B.has(t)) shared++
  return shared / new Set([...A, ...B]).size
}

const surname = (n) => norm(n).split(' ').pop()

async function lookup(pub) {
  const url =
    'https://api.crossref.org/works?rows=5&mailto=' +
    encodeURIComponent(MAILTO) +
    '&query.bibliographic=' +
    encodeURIComponent(pub.title)

  const res = await fetch(url, { headers: { 'User-Agent': `alhajri-group-site (mailto:${MAILTO})` } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const items = (await res.json()).message.items ?? []

  const ourNames = new Set(pub.authors.map(surname))

  let best = null
  for (const it of items) {
    const title = it.title?.[0]
    if (!title) continue
    const score = similarity(pub.title, title)
    const theirNames = (it.author ?? []).map((a) => norm(a.family ?? '')).filter(Boolean)
    const authorHit = theirNames.some((n) => ourNames.has(n))
    if (!best || score > best.score) {
      best = { score, authorHit, doi: it.DOI, title, venue: it['container-title']?.[0] ?? '', year: it.issued?.['date-parts']?.[0]?.[0] }
    }
  }
  return best
}

const accepted = []
const rejected = []

for (const pub of pubs) {
  if (pub.status !== 'published') continue
  if (pub.kind === 'thesis' || pub.kind === 'dataset') continue
  if (pub.doi) continue

  let best
  try {
    best = await lookup(pub)
  } catch (e) {
    rejected.push({ id: pub.id, why: `lookup failed: ${e.message}` })
    continue
  }
  // Crossref is polite-rate-limited; stay well under it.
  await new Promise((r) => setTimeout(r, 350))

  if (!best) {
    rejected.push({ id: pub.id, why: 'no results' })
    continue
  }
  const confident = best.score >= 0.82 && best.authorHit
  if (confident) {
    accepted.push({ id: pub.id, doi: best.doi, score: best.score, venue: best.venue, year: best.year })
  } else {
    rejected.push({
      id: pub.id,
      why: `score ${best.score.toFixed(2)}${best.authorHit ? '' : ', no author match'}`,
      candidate: `${best.doi} :: ${best.title.slice(0, 70)}`,
    })
  }
}

console.log(`\nACCEPTED (${accepted.length})`)
for (const a of accepted) {
  console.log(`  ${a.id.padEnd(4)} ${a.doi.padEnd(34)} ${a.score.toFixed(2)}  ${String(a.year ?? '').padEnd(5)} ${a.venue.slice(0, 44)}`)
}
console.log(`\nNEEDS A HUMAN (${rejected.length})`)
for (const r of rejected) {
  console.log(`  ${r.id.padEnd(4)} ${r.why}`)
  if (r.candidate) console.log(`       candidate: ${r.candidate}`)
}

if (WRITE && accepted.length) {
  const byId = new Map(accepted.map((a) => [a.id, a.doi]))
  for (const pub of pubs) {
    const doi = byId.get(pub.id)
    if (!doi) continue
    // Store the canonical lowercase DOI plus a resolvable URL for the UI.
    pub.doi = doi.toLowerCase()
    pub.url = `https://doi.org/${doi.toLowerCase()}`
  }
  writeFileSync(FILE, JSON.stringify(pubs, null, 2) + '\n')
  console.log(`\nWrote ${accepted.length} DOIs to publications.json`)
}
