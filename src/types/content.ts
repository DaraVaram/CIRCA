/** Research track identifiers. Every publication and project tags 1-2 of these. */
export type TrackId =
  | 'optimization'
  | 'efficient-ml'
  | 'wireless'
  | 'generative'
  | 'applied'

export interface Track {
  id: TrackId
  /** Short label for badges and filter chips. */
  label: string
  /** Full title for the track card and detail page. */
  title: string
  /** One line, used on the card. */
  blurb: string
  /** Long-form body for the track page. Markdown-lite: paragraphs split on \n\n. */
  description: string
  /** Which constraint this track pushes against. Powers the group's framing. */
  constraint: string
  /** Tailwind-safe accent hue, used for badges and the track page. */
  accent: string
}

export type PublicationKind =
  | 'journal'
  | 'conference'
  | 'book-chapter'
  | 'thesis'
  | 'dataset'

export type PublicationStatus = 'published' | 'submitted' | 'in-press'

export interface Publication {
  /** Stable key, mirrors the CV labels: J12, C7, B1, T3, D1. */
  id: string
  kind: PublicationKind
  status: PublicationStatus
  title: string
  /** Author names as written. Match `Member.name` to link them. */
  authors: string[]
  venue: string
  /** null while a paper is under review. */
  year: number | null
  tracks: TrackId[]
  doi?: string
  url?: string
  pdf?: string
  /** Masthead or figure image, shown on the publication row when present. */
  figure?: string
  /** Free-text honors, e.g. "Most Popular Article for 18 months". */
  note?: string
}

export type MemberStatus = 'current' | 'alumni'
export type MemberRole =
  | 'pi'
  | 'phd'
  | 'msc'
  | 'undergraduate'
  | 'research-assistant'

export interface Member {
  /** URL slug, used for /people/:slug. */
  slug: string
  name: string
  status: MemberStatus
  role: MemberRole
  /** Display line under the name, e.g. "MSc in Machine Learning". */
  program?: string
  photo?: string | null
  tracks: TrackId[]
  thesisTitle?: string
  thesisAbstract?: string
  /** One-liner shown on the card's flipped face. */
  currentProject?: string
  /** Where they went next. Alumni only. */
  destination?: { role: string; org: string } | null
  /**
   * Alumni who are still active on group projects. They keep appearing on track
   * pages, in the co-authorship graph and on the collaboration map rather than
   * being archived.
   */
  activeCollaborator?: boolean
  gradYear?: number | null
  startYear?: number | null
  awards?: string[]
  links?: { label: string; url: string }[]
  bio?: string
}

export type NewsCategory =
  | 'publication'
  | 'award'
  | 'competition'
  | 'people'
  | 'venture'
  | 'milestone'

export interface NewsItem {
  id: string
  /** ISO date. Pad with 01 for the parts that are not known. */
  date: string
  /**
   * How much of the date is real. Some items are only known to the year, and
   * printing "1 January" for those would be a fabrication.
   */
  datePrecision?: 'day' | 'month' | 'year'
  category: NewsCategory
  title: string
  body?: string
  tracks?: TrackId[]
  /** Attribution line under the card: authors, venue, or awarding body. */
  source?: string
  /**
   * The publication this item announces. The card then links straight to the
   * paper through its DOI and can inherit its figure, which is what makes a
   * publication announcement useful rather than a pointer to a list.
   */
  publication?: string
  /**
   * A link to the work itself when there is no publication record for it yet,
   * such as an arXiv preprint.
   */
  externalUrl?: string
  /** Link into the site, used when neither of the above applies. */
  href?: string
  image?: string
  /**
   * How to present the image. A 'figure' is a paper artifact on a white ground,
   * a journal title block or an architecture diagram, so the UI frames it as a
   * document rather than bleeding it into the dark layout. News items that
   * announce a paper inherit that paper's figure and this kind automatically.
   */
  imageKind?: 'photo' | 'figure'
  /** Surface on the Home ticker. */
  featured?: boolean
}

export interface Collaborator {
  id: string
  institution: string
  /** Lab, school or department, when the collaboration is with a specific one. */
  department?: string
  country: string
  /** [longitude, latitude] */
  coords: [number, number]
  /** People at that institution we publish with. */
  people: string[]
  /** Publication ids backing the collaboration. */
  publications: string[]
  /** 'home' marks the group's own institution, the origin of every arc. */
  kind: 'home' | 'academic' | 'industry' | 'government'
}

/** Senior design and capstone projects, the applied and industry-facing record. */
/**
 * Something a capstone team achieved. `kind` ranks it, so the page can make a
 * founded company or a published paper louder than a competition placing.
 */
export interface ProjectOutcome {
  text: string
  kind?: 'venture' | 'publication' | 'award' | 'grant' | 'patent' | 'dataset'
}

export interface Project {
  id: string
  title: string
  year: number
  term: string
  students: string[]
  tracks: TrackId[]
  outcomes: ProjectOutcome[]
  industrySponsor: boolean
  undergraduateResearchGrant: boolean
  /** Set when the project has its own page section, e.g. Shaheen or ORCA. */
  system?: string
}

/** A system built in the group and taken into the field. */
export interface SystemProject {
  id: string
  index: string
  name: string
  /** Shown above the name, e.g. "System 01 - Shaheen". */
  eyebrow: string
  headline: string
  lede: string
  /** The one sentence that reframes the problem. Rendered as a pull quote. */
  pullQuote: string
  body: string
  accentTrack: TrackId
  image?: string
  imageAlt?: string
  kpis: { value: string; label: string }[]
  components?: { index: string; title: string; body: string }[]
  recognition?: string[]
  team?: { members: string[]; note: string; image?: string; imageAlt?: string }
  /** Closing argument about where the defensible advantage sits. */
  note?: string
  /** Present when the system has been spun out. */
  venture?: {
    name: string
    lede: string
    benefits: { title: string; body: string }[]
    teamNote: string
  }
}

/** The PI profile, assembled from the CV. Lives in `data/pi.json`. */
export interface PiProfile {
  name: string
  title: string
  department: string
  institution: string
  photo: string
  photoAlt: string
  email: string
  altEmail: string
  linkedin: string
  lede: string
  bio: string[]
  researchAreas: string[]
  education: {
    degree: string
    field: string
    institution: string
    years: string
    detail: string
    thesis: string
  }[]
  appointments: { role: string; org: string; detail: string; years: string }[]
  industry: { role: string; org: string; years: string; detail: string }[]
  teaching: {
    code: string
    title: string
    level: string
    terms: string[]
    description: string
    /** The course's own site, where one exists. */
    url?: string
  }[]
  awards: { year: string; text: string }[]
  seminarSeries: { title: string; role: string; years: string; points: string[] }
  service: { role: string; org: string; years: string }[]
  governmentRoles: { org: string; body: string; years: string; points: string[] }[]
  graduateCoursework: string[]
}
