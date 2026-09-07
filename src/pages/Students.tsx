import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import ProjectCard from '@/components/ui/ProjectCard'
import {
  membersFromCapstone,
  projectsByCohort,
  undergraduateDestinations,
} from '@/lib/content'
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

export default function Students() {
  const known = undergraduateDestinations

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

          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            <Count value={impact.capstoneProjects} label="Teams" />
            <Count value={impact.studentsSupervised} label="Undergraduates" />
            <Count value={impact.awardedProjects} label="With awards or outcomes" />
            <Count value={projectsByCohort.length} label="Cohorts" />
          </dl>
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
              {['Dell ETF 2025, 2nd worldwide', 'AUS Senior Design, 1st', 'Patent filed'].map(
                (t) => (
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
                ),
              )}
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
              How Shaheen works <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </Link>
      </Section>

      {/* Grouped by cohort rather than dumped into one grid. Twelve cards in a
          flat list read as a pile, and the academic year is the natural seam. */}
      <Section
        eyebrow="Every team"
        title="By cohort"
        lead="Each academic year, newest first."
        className="border-t border-ink-800"
      >
        <div className="space-y-14">
          {projectsByCohort.map(([term, list]) => (
            <div key={term}>
              <div className="flex items-baseline gap-4 border-b border-ink-800 pb-3">
                <h3 className="font-mono text-lg text-slate-100 tabular-nums">{term}</h3>
                <span className="font-mono text-xs text-slate-600">
                  {list.length} {list.length === 1 ? 'team' : 'teams'}
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Two destinations, kept apart. Staying in the group is a different
          outcome from leaving for industry, and mixing them hid both. */}
      {membersFromCapstone.length > 0 && (
        <Section
          eyebrow="Where they go next"
          title="Into the group"
          lead="The shortest route from a capstone team is into this group as a graduate researcher."
          className="border-t border-ink-800"
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {membersFromCapstone.map(({ member, project }) => (
              <li key={member.slug}>
                <Link
                  to={`/people/${member.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-signal-400) 32%, transparent)',
                    backgroundColor:
                      'color-mix(in srgb, var(--color-signal-400) 7%, transparent)',
                  }}
                >
                  {member.photo && (
                    <img
                      src={assetUrl(member.photo)}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100">{member.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{member.program}</p>
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
                      From the {project.term} cohort.
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title="Into industry and graduate school"
        lead={`A partial list: ${known.length} of ${impact.studentsSupervised} so far. We are still catching up with everyone who has come through the group.`}
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {known.map((p) => (
            <li
              key={p.name}
              className="flex items-center gap-4 rounded-xl border border-ink-700/60 bg-ink-900/40 p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-850 font-mono text-[11px] text-slate-600">
                {initials(p.name)}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-200">{p.name}</span>
                <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                  {p.role}
                  {p.org ? `, ${p.org}` : ''}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-xl border border-dashed border-ink-700 p-5 text-sm leading-relaxed text-slate-400">
          If you were part of this group and your entry is missing or out of date,{' '}
          <a
            href="mailto:mialhajri@aus.edu?subject=Alumni%20update"
            className="text-signal-400 transition-colors hover:text-signal-300"
          >
            send us a line
          </a>
          . We would like to keep this complete. Graduate alumni are on the{' '}
          <Link to="/people" className="text-signal-400 transition-colors hover:text-signal-300">
            people page
          </Link>
          .
        </p>
      </Section>
    </>
  )
}

function Count({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="font-mono text-2xl leading-none text-slate-50 tabular-nums">{value}</dd>
      <dt className="mt-1.5 text-xs text-slate-500">{label}</dt>
    </div>
  )
}
