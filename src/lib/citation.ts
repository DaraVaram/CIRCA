import type { Publication } from '@/types/content'

const KIND_TO_ENTRY: Record<Publication['kind'], string> = {
  journal: 'article',
  conference: 'inproceedings',
  'book-chapter': 'incollection',
  thesis: 'phdthesis',
  dataset: 'misc',
}

/** Surname of the first author plus year, the usual BibTeX key convention. */
function citeKey(pub: Publication): string {
  const surname = (pub.authors[0] ?? 'unknown').split(/\s+/).pop() ?? 'unknown'
  const word =
    pub.title
      .replace(/[^A-Za-z\s]/g, ' ')
      .split(/\s+/)
      .find((w) => w.length > 4) ?? 'work'
  return `${surname.toLowerCase()}${pub.year ?? 'inreview'}${word.toLowerCase()}`
}

/**
 * BibTeX for one publication. Titles are wrapped in an extra brace pair so
 * BibTeX styles do not lowercase acronyms like NeRV, RF or SDR.
 */
export function toBibTeX(pub: Publication): string {
  const entry = KIND_TO_ENTRY[pub.kind]
  const fields: [string, string | undefined][] = [
    ['author', pub.authors.join(' and ')],
    ['title', `{${pub.title}}`],
    [pub.kind === 'conference' ? 'booktitle' : 'journal', pub.venue],
    ['year', pub.year ? String(pub.year) : undefined],
    ['doi', pub.doi],
    ['url', pub.url],
    ['note', pub.status === 'submitted' ? 'Under review' : undefined],
  ]

  const body = fields
    .filter((f): f is [string, string] => Boolean(f[1]))
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(',\n')

  return `@${entry}{${citeKey(pub)},\n${body}\n}`
}

/** A plain-text reference, for pasting into an email or a slide. */
export function toPlainCitation(pub: Publication): string {
  const authors = pub.authors.join(', ')
  const where = pub.status === 'submitted' ? `${pub.venue} (under review)` : pub.venue
  const year = pub.year ? `, ${pub.year}` : ''
  const doi = pub.doi ? `. https://doi.org/${pub.doi}` : ''
  return `${authors}, "${pub.title}," ${where}${year}${doi}`
}
