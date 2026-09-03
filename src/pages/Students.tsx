import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import ProjectCard from '@/components/ui/ProjectCard'
import { alumni, memberBySlug, projects, undergraduates } from '@/lib/content'
import { impact } from '@/lib/metrics'
import { assetUrl } from '@/lib/assets'

/** Initials for people we have no photograph of. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
}

interface Placement {
  name: string
  role: string
  org: string
  photo?: string | null
  slug?: string
}

export default function Students() {
  const byYear = [...projects].sort((a, b) => b.year - a.year)

  // Graduate alumni come off their member records rather than being retyped, so
  // a change on the People page shows up here too.
  const gradPlacements: Placement[] = alumni
    .filter((m) => m.destination)
    .map((m) => ({
      name: m.name,
      role: m.destination!.role,
      org: m.destination!.org,
      photo: m.photo,
      slug: m.slug,
    }))

  const undergradPlacements: Placement[] = undergraduates.map((u) => {
    // A few undergraduates later joined as graduate researchers, so reuse their
    // portrait and profile link where one exists.
    const member = [...memberBySlug.values()].find((m) => m.name === u.name)
    return { ...u, photo: member?.photo, slug: member?.slug }
  })

  const placements = [...gradPlacements, ...undergradPlacements]

  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow">Undergraduate research</p>
          <h1 className="mt-4 max-w-[26ch] text-4xl font-bold tracking-tight text-slate-50 text-balance sm:text-5xl">
            {impact.capstoneProjects} senior design teams, and counting.
          </h1>
          <p className="mt-6 max-w-[70ch] text-lg leading-relaxed text-slate-400">
            Undergraduates in this group do not do exercises. They build systems that win
            international competitions, get patents filed, turn into journal papers, and, once,
            into a company.
          </p>
        </div>
      </header>

      <Section>
        <Link
          to="/systems#shaheen"
          className="group grid items-center gap-8 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6 transition-all hover:border-ink-600 lg:grid-cols-2 lg:p-8"
        >
          <img
            src={assetUrl('/images/group/team-shaheen.jpg')}
            alt="The Shaheen team with Dr. Mohamed AlHajri"
            className="w-full rounded-xl border border-ink-700/60 object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-signal-400">
              Second in the world, out of 259 teams.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Yousef Irshaid, Malik Hader, Ahmad Alsaleh and Adham Elmosalamy built Shaheen as
              their senior design project: a fixed-wing platform that finds a person in open
              desert at 98.2% accuracy, on under 2 MB of memory and 0.895 W of power, and radios
              their location back with no mobile network in the loop.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              One of them is now an MSc researcher in this group. Another is an Offensive
              Security Consultant at IBM.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                'Dell ETF 2025, 2nd worldwide',
                'AUS Senior Design, 1st',
                'Patent filed',
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wider text-track-efficient-ml uppercase"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--color-track-efficient-ml) 14%, transparent)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
              How Shaheen works <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </Link>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-ink-800 py-7 sm:grid-cols-4">
          <Stat value={impact.capstoneProjects} label="Capstone teams" />
          <Stat value={impact.awardedProjects} label="With awards or outcomes" />
          <Stat value={impact.industrySponsored} label="Industry sponsored" />
          <Stat value={impact.studentsSupervised} label="Undergraduates mentored" />
        </dl>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {byYear.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Where our students go"
        title="Alumni destinations."
        lead="A partial list. We are still catching up with everyone who has come through the group."
        className="border-t border-ink-800"
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {placements.map((p) => {
            const body = (
              <>
                {p.photo ? (
                  <img
                    src={assetUrl(p.photo)}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-850 font-mono text-[11px] text-slate-600">
                    {initials(p.name)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-200">{p.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                    {p.role}
                    {p.org ? `, ${p.org}` : ''}
                  </span>
                </span>
              </>
            )
            return (
              <li key={p.name}>
                {p.slug ? (
                  <Link
                    to={`/people/${p.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-ink-700/60 bg-ink-900/40 p-4 transition-colors hover:border-ink-600"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-900/20 p-4">
                    {body}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <p className="mt-8 rounded-xl border border-dashed border-ink-700 p-5 text-sm leading-relaxed text-slate-400">
          If you were part of this group and your entry is missing or out of date,{' '}
          <a
            href="mailto:mialhajri@aus.edu?subject=Alumni%20update"
            className="text-signal-400 transition-colors hover:text-signal-300"
          >
            send us a line
          </a>
          . We would like to keep this complete.
        </p>
      </Section>
    </>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="font-mono text-3xl leading-none text-slate-50 tabular-nums">{value}</dd>
      <dt className="mt-2 text-[12.5px] leading-snug text-slate-500">{label}</dt>
    </div>
  )
}
