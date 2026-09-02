/**
 * Single source of truth for branding. Nothing else in the codebase should
 * hardcode the group name, tagline, or logo. Swap final branding in here.
 */
export const siteConfig = {
  /** Group name. */
  name: 'CIRCA',
  /** Short form used in the nav and footer when space is tight. */
  shortName: 'CIRCA',
  /** What the acronym stands for, shown in the footer and About page. */
  expansion: 'Constrained Inference, Representation, Compression and Applications',
  /** One-line positioning statement. Appears in the hero. */
  tagline: 'Intelligent systems under real-world constraints.',
  /** Longer hero subline. Two audiences: researchers and industry partners. */
  description:
    'We build learning systems that hold up when the bits, the bandwidth, the memory, and the objectives all run out. Optimization theory through to silicon.',

  /** Path to a custom logo file in /public. Null uses the built-in mark. */
  logo: null as string | null,
  /**
   * Which built-in mark to use. All five are circle approximations, matching
   * what the name means. See src/components/ui/Mark.tsx.
   *   A  seven chords, open as a C
   *   B  the same chords with the exact circle ghosted behind
   *   C  a constrained path bending around a boundary
   *   D  the circle snapped to an integer lattice
   *   E  three arcs, coarser toward the center
   */
  logoVariant: 'E' as 'A' | 'B' | 'C' | 'D' | 'E',

  pi: {
    name: 'Dr. Mohamed AlHajri',
    title: 'Assistant Professor',
    department: 'Computer Science and Engineering',
    institution: 'American University of Sharjah',
    email: 'mialhajri@aus.edu',
    altEmail: 'malhajri@mit.edu',
    linkedin: 'https://www.linkedin.com/in/mohamedibrahimalhajri/',
    scholar: '', // TODO: add Google Scholar profile URL
    photo: '/images/pi/mohamed-alhajri.jpg' as string | null,
  },

  location: {
    label: 'American University of Sharjah',
    line1: 'Department of Computer Science and Engineering',
    line2: 'Sharjah, United Arab Emirates',
  },

  /** Contact routing for two audiences, with two inboxes if you want them split. */
  contact: {
    students: 'mialhajri@aus.edu',
    industry: 'mialhajri@aus.edu',
  },

  nav: [
    { label: 'Research', to: '/research' },
    { label: 'PI', to: '/pi' },
    { label: 'People', to: '/people' },
    { label: 'Publications', to: '/publications' },
    { label: 'News', to: '/news' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
} as const

export type SiteConfig = typeof siteConfig
