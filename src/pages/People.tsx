import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import MemberCard from '@/components/ui/MemberCard'
import ProjectCard from '@/components/ui/ProjectCard'
import { assetUrl } from '@/lib/assets'
import {
  alumni,
  currentMembers,
  piProfile,
  projects,
  undergraduateCount,
} from '@/lib/content'

// d3-force plus the whole author corpus. Split it out of the initial bundle.
const CoauthorshipGraph = lazy(() => import('@/components/viz/CoauthorshipGraph'))

export default function People() {
  // Newest cohort first.
  const byYear = [...projects].sort((a, b) => b.year - a.year)

  return (
    <>
      <Section
        eyebrow={`${currentMembers.length} researchers`}
        title="Current members"
        lead="Graduate researchers across the five tracks. Hover a card for what they are working on."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentMembers.map((m) => (
            <MemberCard key={m.slug} member={m} />
          ))}
        </div>

        <Link
          to="/pi"
          className="group mt-10 flex items-center gap-5 rounded-xl border border-ink-700/60 bg-ink-900/40 p-5 transition-colors hover:border-ink-600"
        >
          <img
            src={assetUrl(piProfile.photo)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="eyebrow">Principal Investigator</p>
            <p className="mt-1.5 text-sm text-slate-300">
              {piProfile.name}, {piProfile.title}
            </p>
          </div>
          <span className="ml-auto shrink-0 text-sm text-slate-500 transition-colors group-hover:text-signal-300">
            Full profile <span aria-hidden="true">&rarr;</span>
          </span>
        </Link>
      </Section>

      <Section
        eyebrow="Alumni"
        title="Where they went next"
        lead="Graduates of the group, and what they are doing now. A marked card means they are still active on group projects."
        className="border-t border-ink-800"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {alumni.map((m) => (
            <MemberCard key={m.slug} member={m} />
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-400" />
          Still collaborating on active projects
        </p>
      </Section>

      <Section
        eyebrow={`${undergraduateCount} undergraduates`}
        title="Senior design and capstone projects"
        lead="Every year the group runs undergraduate capstone teams at AUS. Several have placed in the Dell Technologies Envision the Future competition, one has spun out into a company, and one is in patent prosecution."
        className="border-t border-ink-800"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {byYear.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Co-authorship"
        title="Who has worked with whom"
        lead="Every author across the group's publication record, linked where they share a paper. Group members are filled, and clicking one opens their profile."
        className="border-t border-ink-800"
      >
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-xl border border-ink-700/60 bg-ink-900/40" />
          }
        >
          <CoauthorshipGraph />
        </Suspense>
      </Section>
    </>
  )
}
