import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import Hero from '@/components/home/Hero'
import ProblemSection from '@/components/home/ProblemSection'
import TrackShowcase from '@/components/home/TrackShowcase'
import SystemsTeaser from '@/components/home/SystemsTeaser'
import GroupSection from '@/components/home/GroupSection'
import LatestNews from '@/components/home/LatestNews'
import JoinBand from '@/components/home/JoinBand'
import Section from '@/components/ui/Section'
import { collaborators, tracks } from '@/lib/content'
import { impact } from '@/lib/metrics'
import { trackVar } from '@/lib/theme'

// The world topology is ~110 kB. Split it out so it never touches the
// initial bundle. The map sits well below the fold.
const CollaborationMap = lazy(() => import('@/components/viz/CollaborationMap'))

export default function Home() {
  const partners = collaborators.filter((c) => c.kind !== 'home')
  const countries = new Set(partners.map((c) => c.country)).size

  return (
    <>
      <Hero />
      <ProblemSection />

      <Section
        eyebrow="Research tracks"
        title="Five constraints, one question"
        lead="Each track is defined by what runs out first. The methods differ. The discipline of building something that still works when the budget binds does not."
        className="border-t border-ink-800"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Link
              key={track.id}
              to={`/research/${track.id}`}
              className="group relative overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6 transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-900/80"
            >
              <span
                className="absolute inset-x-0 top-0 h-px opacity-40 transition-opacity group-hover:opacity-100"
                style={{
                  background: `linear-gradient(to right, transparent, ${trackVar(track.id)}, transparent)`,
                }}
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
                <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  &rarr;
                </span>
              </span>
            </Link>
          ))}

          <div className="rounded-2xl border border-dashed border-ink-700/60 p-6">
            <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
              In numbers
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <span className="font-mono text-slate-100">{impact.groupAuthored}</span> papers
                written inside the group
              </li>
              <li>
                <span className="font-mono text-slate-100">{impact.underReview}</span> under review
              </li>
              <li>
                <span className="font-mono text-slate-100">{impact.capstoneProjects}</span> capstone
                projects supervised
              </li>
              <li>
                <span className="font-mono text-slate-100">{impact.studentsSupervised}</span>{' '}
                undergraduates mentored
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <TrackShowcase />
      <SystemsTeaser />
      <GroupSection />
      <LatestNews />

      <Section
        eyebrow="Collaborations"
        title="Where the work reaches"
        lead={`${partners.length} partner institutions across ${countries} countries. Every arc is backed by joint publications. Select one to see them.`}
      >
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-2xl border border-ink-700/60 bg-ink-900/40" />
          }
        >
          <CollaborationMap />
        </Suspense>
      </Section>

      <JoinBand />
    </>
  )
}
