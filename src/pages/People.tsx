import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import MemberCard from '@/components/ui/MemberCard'
import { alumni, currentMembers, piProfile } from '@/lib/content'
import { impact } from '@/lib/metrics'
import { assetUrl } from '@/lib/assets'

// d3-force plus the whole author corpus. Split it out of the initial bundle.
const CoauthorshipGraph = lazy(() => import('@/components/viz/CoauthorshipGraph'))

export default function People() {
  return (
    <>
      <Section
        eyebrow={`${impact.gradStudents} graduate researchers`}
        title="The group."
        lead="A PhD researcher, five MSc researchers, and a stream of undergraduates who take their projects to global competition finals."
      >
        <Link
          to="/pi"
          className="group flex flex-wrap items-center gap-5 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-5 transition-colors hover:border-ink-600"
        >
          <img
            src={assetUrl(piProfile.photo)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="eyebrow">Principal Investigator</p>
            <p className="mt-1.5 text-sm text-slate-300">
              {piProfile.name}, {piProfile.title}
            </p>
          </div>
          <span className="ml-auto shrink-0 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
            Full profile <span aria-hidden="true">&rarr;</span>
          </span>
        </Link>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentMembers.map((m) => (
            <MemberCard key={m.slug} member={m} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Alumni"
        title="Where they went next"
        lead="Graduates of the group, and what they are doing now. A marked portrait means they are still active on group projects."
        className="border-t border-ink-800"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {alumni.map((m) => (
            <MemberCard key={m.slug} member={m} />
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-signal-400" />
          Still collaborating on active projects
        </p>
      </Section>

      <Section className="border-t border-ink-800">
        <Link
          to="/students"
          className="group flex flex-wrap items-center gap-8 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-8 transition-colors hover:border-ink-600"
        >
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Undergraduate research</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
              {impact.capstoneProjects} senior design teams, and counting.
            </h2>
            <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-slate-400">
              {impact.studentsSupervised} undergraduates have run capstone projects in this group.
              They have placed second worldwide at Dell Technologies' Envision the Future, filed
              patents, published in IEEE journals, and founded a company.
            </p>
          </div>
          <span className="shrink-0 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
            See the teams <span aria-hidden="true">&rarr;</span>
          </span>
        </Link>
      </Section>

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
