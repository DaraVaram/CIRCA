/**
 * Every metric on the home strip is computed from the data files at build time.
 * The only exceptions are citations and h-index, which come from Google Scholar
 * (no public API) and carry a visible `lastUpdated` date so staleness is honest
 * rather than hidden.
 */
import {
  collaborators,
  currentMembers,
  members,
  projects,
  publications,
  scholar,
} from './content'

export interface Metric {
  key: string
  /** The number itself. */
  value: number
  /** Rendered after the value, e.g. "+". */
  suffix?: string
  label: string
  /** Shown on hover or underneath. Says where the number comes from. */
  detail: string
  /** True when the number is derived from repo data and cannot go stale. */
  derived: boolean
}

// The group's own institution is in the collaborators file as the origin of the
// map's arcs, and is not itself a collaboration.
const partners = collaborators.filter((c) => c.kind !== 'home')
const countries = new Set(partners.map((c) => c.country))

export const metrics: Metric[] = [
  {
    key: 'citations',
    value: scholar.citations,
    suffix: '+',
    label: 'Citations',
    detail: `Google Scholar, updated ${scholar.lastUpdated}`,
    derived: false,
  },
  {
    key: 'h-index',
    value: scholar.hIndex,
    label: 'h-index',
    detail: `Google Scholar, updated ${scholar.lastUpdated}`,
    derived: false,
  },
  {
    key: 'publications',
    value: publications.filter((p) => p.status === 'published').length,
    label: 'Publications',
    detail: 'Counted from the publication record',
    derived: true,
  },
  {
    key: 'institutions',
    value: partners.length,
    label: 'Collaborating institutions',
    detail: `Across ${countries.size} countries`,
    derived: true,
  },
  {
    key: 'members',
    value: currentMembers.length,
    label: 'Current members',
    detail: `${members.filter((m) => m.status === 'alumni').length} alumni to date`,
    derived: true,
  },
]

/** Secondary numbers used on About / Contact for the industry-facing story. */
export const impact = {
  capstoneProjects: projects.length,
  awardedProjects: projects.filter((p) => p.awards.length > 0).length,
  industrySponsored: projects.filter((p) => p.industrySponsor).length,
  studentsSupervised: new Set(projects.flatMap((p) => p.students)).size,
  underReview: publications.filter((p) => p.status === 'submitted').length,
}
