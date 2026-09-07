/**
 * The single entry point to all content. Pages and components import from here,
 * never from `/data/*.json` directly, so the storage format can change without
 * touching a component.
 */
import tracksRaw from '@/data/tracks.json'
import membersRaw from '@/data/members.json'
import publicationsRaw from '@/data/publications.json'
import newsRaw from '@/data/news.json'
import collaboratorsRaw from '@/data/collaborators.json'
import projectsRaw from '@/data/projects.json'
import scholarRaw from '@/data/scholar.json'
import piRaw from '@/data/pi.json'
import undergraduatesRaw from '@/data/undergraduates.json'
import systemsRaw from '@/data/systems.json'

import type {
  Collaborator,
  Member,
  NewsItem,
  PiProfile,
  Project,
  Publication,
  SystemProject,
  Track,
  TrackId,
} from '@/types/content'

export const tracks = tracksRaw as Track[]
export const members = membersRaw as Member[]
export const publications = publicationsRaw as Publication[]
export const projects = projectsRaw as Project[]
export const collaborators = collaboratorsRaw as Collaborator[]
export const piProfile = piRaw as PiProfile
export const systems = systemsRaw as SystemProject[]
export const systemById = new Map(systems.map((x) => [x.id, x]))

/** Undergraduate alumni whose current role we know. Keyed by name. */
export const undergraduates = undergraduatesRaw as {
  name: string
  role: string
  org: string
}[]

const destinationByName = new Map(undergraduates.map((u) => [u.name, u]))

/** Where an undergraduate went after the capstone, if we know. */
export const destinationFor = (name: string) => destinationByName.get(name)

/**
 * The capstone team a member ran before joining the group, if they came up that
 * way. Two of the current graduate researchers did, which is the clearest
 * evidence the undergraduate pipeline actually feeds the group, so it is worth
 * deriving rather than restating by hand in two places.
 */
export function capstoneOriginFor(member: Member): Project | undefined {
  const target = authorKey(member.name)
  return projects.find((p) => p.students.some((s) => authorKey(s) === target))
}

/** Capstone projects grouped by academic year, newest first. */
export const projectsByCohort = Array.from(
  projects.reduce((acc, p) => {
    const list = acc.get(p.term) ?? []
    list.push(p)
    acc.set(p.term, list)
    return acc
  }, new Map<string, Project[]>()),
).sort((a, b) => b[0].localeCompare(a[0]))


/** Every student who has run a capstone project with the group. */
export const undergraduateCount = new Set(projects.flatMap((p) => p.students)).size
export const scholar = scholarRaw as {
  citations: number
  hIndex: number
  i10Index: number | null
  lastUpdated: string
  source: string
}

/** News is authored newest-first but we sort defensively, as the file is hand-edited. */
export const news = (newsRaw as NewsItem[])
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date))

// ---------------------------------------------------------------- lookups

export const trackById = new Map(tracks.map((t) => [t.id, t]))
export const memberBySlug = new Map(members.map((m) => [m.slug, m]))
export const publicationById = new Map(publications.map((p) => [p.id, p]))

export const getTrack = (id: TrackId) => trackById.get(id)

export const currentMembers = members.filter(
  (m) => m.status === 'current' && m.role !== 'pi',
)
export const alumni = members.filter((m) => m.status === 'alumni')
export const pi = members.find((m) => m.role === 'pi')!

/**
 * Match a publication author string to a member. Author lists use the formal
 * CV spelling ("Hamza A. Abushahla") while slugs use the short form, so we
 * compare on surname plus first initial.
 */
const authorKey = (name: string) => {
  const parts = name.trim().split(/\s+/)
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return `${first[0] ?? ''}|${last}`.toLowerCase()
}

const memberByAuthorKey = new Map(members.map((m) => [authorKey(m.name), m]))

export const memberForAuthor = (author: string): Member | undefined =>
  memberByAuthorKey.get(authorKey(author))

/** Members who arrived through a capstone team, newest cohort first. */
export const membersFromCapstone = members
  .map((m) => ({ member: m, project: capstoneOriginFor(m) }))
  .filter((x): x is { member: Member; project: Project } => Boolean(x.project))
  .sort((a, b) => b.project.year - a.project.year)

/**
 * Undergraduate destinations to list on the students page. Two of them stayed
 * on as graduate researchers and are already shown above that list with their
 * own cards, so they are dropped here rather than appearing twice.
 */
export const undergraduateDestinations = undergraduates.filter(
  (u) => !memberByAuthorKey.has(authorKey(u.name)),
)

// ---------------------------------------------------------------- queries

export const publicationsForTrack = (id: TrackId) =>
  publications.filter((p) => p.tracks.includes(id))

export const projectsForTrack = (id: TrackId) =>
  projects.filter((p) => p.tracks.includes(id))

export const membersForTrack = (id: TrackId) =>
  members.filter((m) => m.tracks.includes(id))

export const publicationsForMember = (member: Member) =>
  publications.filter((p) => p.authors.some((a) => authorKey(a) === authorKey(member.name)))

export const newsForTrack = (id: TrackId) =>
  news.filter((n) => n.tracks?.includes(id))

/**
 * The publication a news item announces, if any. Set explicitly on the item
 * rather than parsed out of a link, because the link now points at the paper
 * itself rather than at our own list.
 */
export function publicationForNews(item: NewsItem): Publication | undefined {
  return item.publication ? publicationById.get(item.publication) : undefined
}

/** The image a news item should show, and how to frame it. */
export function newsImage(item: NewsItem): { src: string; kind: 'photo' | 'figure' } | null {
  if (item.image) return { src: item.image, kind: item.imageKind ?? 'photo' }
  const figure = publicationForNews(item)?.figure
  return figure ? { src: figure, kind: 'figure' } : null
}

export interface NewsLink {
  href: string
  /** True when the link leaves the site and should open in a new tab. */
  external: boolean
  label: string
}

/**
 * Where a news card should take you. An announcement about a paper should land
 * on the paper, so an explicit external link wins, then the publication's own
 * resolved URL, and only then an internal page.
 */
export function newsLink(item: NewsItem): NewsLink | null {
  if (item.externalUrl) {
    const arxiv = /arxiv\.org\/abs\/(\S+)$/.exec(item.externalUrl)
    return {
      href: item.externalUrl,
      external: true,
      label: arxiv ? `arXiv:${arxiv[1]}` : 'Read the paper',
    }
  }
  const pub = publicationForNews(item)
  if (pub?.url) {
    return {
      href: pub.url,
      external: true,
      label: pub.doi ? `doi:${pub.doi}` : 'Read the paper',
    }
  }
  if (item.href) return { href: item.href, external: false, label: 'Read more' }
  return null
}

/** Distinct venues, for the publications filter. */
export const venues = Array.from(new Set(publications.map((p) => p.venue))).sort()

/** Distinct years present in the corpus, newest first. */
export const years = Array.from(
  new Set(publications.map((p) => p.year).filter((y): y is number => y !== null)),
).sort((a, b) => b - a)

/** Every author across the corpus, for the author filter. */
export const authors = Array.from(
  new Set(publications.flatMap((p) => p.authors)),
).sort((a, b) => {
  const la = a.split(/\s+/).pop() ?? ''
  const lb = b.split(/\s+/).pop() ?? ''
  return la.localeCompare(lb)
})

// ------------------------------------------------------ co-authorship graph

export interface CoauthorNode {
  id: string
  name: string
  /** Set when the author is a group member, enabling a link to their profile. */
  slug?: string
  count: number
  isGroup: boolean
}

export interface CoauthorLink {
  source: string
  target: string
  weight: number
  publications: string[]
}

/** Builds the node-link structure for the co-authorship graph. */
export function buildCoauthorshipGraph() {
  const nodes = new Map<string, CoauthorNode>()
  const links = new Map<string, CoauthorLink>()

  for (const pub of publications) {
    for (const author of pub.authors) {
      const member = memberForAuthor(author)
      const existing = nodes.get(author)
      if (existing) existing.count += 1
      else
        nodes.set(author, {
          id: author,
          name: author,
          slug: member?.slug,
          count: 1,
          isGroup: Boolean(member),
        })
    }

    for (let i = 0; i < pub.authors.length; i++) {
      for (let j = i + 1; j < pub.authors.length; j++) {
        const [a, b] = [pub.authors[i], pub.authors[j]].sort()
        const key = `${a} ${b}`
        const link = links.get(key)
        if (link) {
          link.weight += 1
          link.publications.push(pub.id)
        } else {
          links.set(key, { source: a, target: b, weight: 1, publications: [pub.id] })
        }
      }
    }
  }

  return { nodes: [...nodes.values()], links: [...links.values()] }
}

/** Researchers ordered by seniority, so the hierarchy reads without headings. */
const ROLE_ORDER: Record<Member['role'], number> = {
  pi: 0,
  phd: 1,
  msc: 2,
  'research-assistant': 3,
  undergraduate: 4,
}
export const researchers = currentMembers
  .slice()
  .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name))
