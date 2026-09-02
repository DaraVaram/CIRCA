import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import Hero from '@/components/home/Hero'
import MetricsStrip from '@/components/home/MetricsStrip'
import NewsTicker from '@/components/home/NewsTicker'
import Section from '@/components/ui/Section'
import TrackShowcase from '@/components/home/TrackShowcase'

// The world topology is ~110 kB. Split it out so it never touches the
// initial bundle. The map sits well below the fold.
const CollaborationMap = lazy(() => import('@/components/viz/CollaborationMap'))
import TrackBadge from '@/components/ui/TrackBadge'
import { collaborators, publications, tracks } from '@/lib/content'
import { impact } from '@/lib/metrics'
import { trackVar } from '@/lib/theme'

export default function Home() {
  const recent = publications
    .filter((p) => p.status === 'published' && p.year !== null)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 4)

  return (
    <>
      <NewsTicker />
      <Hero />
      <MetricsStrip />

      <Section
        eyebrow="Research tracks"
        title="Five constraints, one question"
        lead="Each track is defined by what runs out first. The methods differ. The discipline of building something that still works when the budget binds does not."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Link
              key={track.id}
              to={`/research/${track.id}`}
              className="group relative overflow-hidden rounded-xl border border-ink-700/60 bg-ink-900/40 p-6 transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-900/80"
            >
              <span
                className="absolute inset-x-0 top-0 h-px opacity-40 transition-opacity group-hover:opacity-100"
                style={{ background: `linear-gradient(to right, transparent, ${trackVar(track.id)}, transparent)` }}
              />
              <p
                className="font-mono text-[10px] tracking-[0.18em] uppercase"
                style={{ color: trackVar(track.id) }}
              >
                {track.constraint}
              </p>
              <h3 className="mt-4 text-lg font-medium text-slate-100">{track.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{track.blurb}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors group-hover:text-slate-300">
                Explore track
                <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </span>
            </Link>
          ))}

          <div className="rounded-xl border border-dashed border-ink-700/60 p-6">
            <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
              In numbers
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <span className="font-mono text-slate-100">{impact.underReview}</span> papers under review
              </li>
              <li>
                <span className="font-mono text-slate-100">{impact.capstoneProjects}</span> capstone projects supervised
              </li>
              <li>
                <span className="font-mono text-slate-100">{impact.awardedProjects}</span> of them competition-recognized
              </li>
              <li>
                <span className="font-mono text-slate-100">{impact.studentsSupervised}</span> undergraduates mentored
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <TrackShowcase />

      <Section
        eyebrow="Collaborations"
        title="Where the work reaches"
        lead={`${collaborators.filter((c) => c.kind !== 'home').length} partner institutions across ${new Set(collaborators.filter((c) => c.kind !== 'home').map((c) => c.country)).size} countries. Every arc is backed by joint publications. Select one to see them.`}
      >
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-xl border border-ink-700/60 bg-ink-900/40" />
          }
        >
          <CollaborationMap />
        </Suspense>
      </Section>

      <Section
        eyebrow="Recent work"
        title="Selected publications"
        className="border-t border-ink-800"
      >
        <ul className="divide-y divide-ink-800 border-y border-ink-800">
          {recent.map((pub) => (
            <li key={pub.id} className="group py-6">
              <div className="flex flex-wrap items-center gap-2">
                {pub.tracks.map((t) => (
                  <TrackBadge key={t} id={t} />
                ))}
                <span className="font-mono text-xs text-slate-600">{pub.year}</span>
              </div>
              <h3 className="mt-3 max-w-3xl text-base leading-snug font-medium text-slate-100">
                {pub.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{pub.authors.join(', ')}</p>
              <p className="mt-1 text-sm text-slate-600 italic">{pub.venue}</p>
            </li>
          ))}
        </ul>

        <Link
          to="/publications"
          className="mt-8 inline-flex items-center gap-1.5 text-sm text-signal-400 transition-colors hover:text-signal-300"
        >
          All publications
          <span>&rarr;</span>
        </Link>
      </Section>
    </>
  )
}
