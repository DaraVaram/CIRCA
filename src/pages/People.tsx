import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import MemberCard from '@/components/ui/MemberCard'
import TrackBadge from '@/components/ui/TrackBadge'
import { alumni, membersFromCapstone, pi, piProfile, researchers } from '@/lib/content'
import { impact } from '@/lib/metrics'
import { assetUrl } from '@/lib/assets'

// d3-force plus the whole author corpus. Split it out of the initial bundle.
const CoauthorshipGraph = lazy(() => import('@/components/viz/CoauthorshipGraph'))

export default function People() {
  const doctoral = researchers.filter((m) => m.role === 'phd').length
  const graduate = researchers.filter((m) => m.role === 'msc').length

  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow">People</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            The group.
          </h1>
          <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-slate-400">
            A principal investigator, a doctoral researcher and {graduate} graduate researchers,
            fed by a stream of undergraduates who take their projects to global competition
            finals.
          </p>

          {/* The counts belong next to the claim, so the page opens with the
              actual shape of the group rather than a single blurred number. */}
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            <Count value={1} label="Principal investigator" />
            <Count value={doctoral} label="Doctoral researcher" />
            <Count value={graduate} label="Graduate researchers" />
            <Count value={alumni.length} label="Alumni" />
            <Count value={impact.studentsSupervised} label="Undergraduates" />
          </dl>
        </div>
      </header>

      <Section eyebrow="Principal investigator">
        <Link
          to="/pi"
          className="group grid gap-8 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6 transition-colors hover:border-ink-600 sm:grid-cols-[12rem_minmax(0,1fr)] sm:p-8"
        >
          <img
            src={assetUrl(piProfile.photo)}
            alt=""
            className="aspect-square w-full max-w-48 rounded-2xl object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-50">{piProfile.name}</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {piProfile.title}, {piProfile.department}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {pi.tracks.map((t) => (
                <TrackBadge key={t} id={t} static />
              ))}
            </div>
            <p className="mt-5 max-w-[62ch] text-sm leading-relaxed text-slate-400">
              {piProfile.lede}
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
              Full profile, publications and teaching <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </Link>
      </Section>

      {/* Ordered doctoral first, so seniority reads off the grid without
          splitting one PhD student into a section of his own. */}
      <Section
        eyebrow="Researchers"
        title="Current members"
        lead="Each card carries what that person is working on now."
        className="border-t border-ink-800"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {researchers.map((m) => (
            <MemberCard key={m.slug} member={m} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Alumni"
        title="Where they went next"
        lead="Graduates of the group. A marked portrait means they are still active on group projects."
        className="border-t border-ink-800"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((m) => (
            <MemberCard key={m.slug} member={m} />
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-signal-400" />
          Still collaborating on active projects
        </p>
      </Section>

      {/* The pipeline is the most interesting thing the data says about this
          group, and it was previously invisible on both pages. */}
      {membersFromCapstone.length > 0 && (
        <Section
          eyebrow="The pipeline"
          title="Some of them started here as undergraduates"
          lead="Capstone projects in this group are a route into it. These researchers ran a senior design team before joining as graduate students."
          className="border-t border-ink-800"
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {membersFromCapstone.map(({ member, project }) => (
              <li key={member.slug}>
                <Link
                  to={`/people/${member.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-5 transition-colors hover:border-ink-600"
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
                      Ran <span className="text-slate-300">{project.title}</span> as a{' '}
                      {project.term} senior design project.
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/students"
            className="group mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-dashed border-ink-700 p-6 transition-colors hover:border-ink-600"
          >
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-400">
              <span className="text-slate-200">
                {impact.capstoneProjects} teams, {impact.studentsSupervised} undergraduates.
              </span>{' '}
              They have placed second worldwide at Dell Technologies' Envision the Future, filed
              patents, published in IEEE journals, and founded a company.
            </p>
            <span className="shrink-0 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
              Undergraduate research <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        </Section>
      )}

      <Section
        eyebrow="Co-authorship"
        title="Who has worked with whom"
        lead="Every author across the group's publication record, linked where they share a paper. Group members are filled, and clicking one opens their profile."
        className="border-t border-ink-800"
      >
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-2xl border border-ink-700/60 bg-ink-900/40" />
          }
        >
          <CoauthorshipGraph />
        </Suspense>
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
