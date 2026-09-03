import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicationRow from '@/components/ui/PublicationRow'
import MemberCard from '@/components/ui/MemberCard'
import ConstrainedDescent from '@/components/viz/ConstrainedDescent'

const QuantizationDemo = lazy(() => import('@/components/viz/QuantizationDemo'))
const MultipathDemo = lazy(() => import('@/components/viz/MultipathDemo'))
const SeparationDemo = lazy(() => import('@/components/viz/SeparationDemo'))
const FingerprintDemo = lazy(() => import('@/components/viz/FingerprintDemo'))

/** Each track carries its own working demo, matching the home page carousel. */
const DEMOS: Record<TrackId, React.ReactNode> = {
  optimization: <ConstrainedDescent />,
  'efficient-ml': <QuantizationDemo />,
  wireless: <MultipathDemo />,
  generative: <SeparationDemo />,
  applied: <FingerprintDemo />,
}
import {
  getTrack,
  membersForTrack,
  projectsForTrack,
  publicationsForTrack,
} from '@/lib/content'
import type { TrackId } from '@/types/content'
import { trackVar } from '@/lib/theme'
import NotFound from './NotFound'

export default function TrackDetail() {
  const { trackId } = useParams<{ trackId: string }>()
  const track = getTrack(trackId as TrackId)
  if (!track) return <NotFound />

  const pubs = publicationsForTrack(track.id).sort((a, b) => (b.year ?? 9999) - (a.year ?? 9999))
  const people = membersForTrack(track.id)
  const projects = projectsForTrack(track.id)

  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${trackVar(track.id)}, transparent)` }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <Link to="/research" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
            &larr; All tracks
          </Link>
          <p
            className="mt-6 font-mono text-[10px] tracking-[0.18em] uppercase"
            style={{ color: trackVar(track.id) }}
          >
            Constraint: {track.constraint}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-50 text-balance sm:text-5xl">
            {track.title}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="max-w-3xl space-y-5">
            {track.description.split('\n\n').map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-slate-400">
                {para}
              </p>
            ))}

            <div className="pt-6">
              <p className="eyebrow">Try it</p>
              <div className="mt-4 rounded-xl border border-ink-700/60 bg-ink-900/50 p-5">
                <Suspense
                  fallback={
                    <div className="aspect-4/3 w-full animate-pulse rounded-lg bg-ink-850" />
                  }
                >
                  {DEMOS[track.id]}
                </Suspense>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div>
              <p className="eyebrow">At a glance</p>
              <dl className="mt-4 space-y-3 text-sm">
                <Stat label="Publications" value={pubs.length} />
                <Stat label="Members" value={people.length} />
                <Stat label="Capstone projects" value={projects.length} />
              </dl>
            </div>
          </aside>
        </div>

        {people.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow">People on this track</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {people.map((m) => (
                <MemberCard key={m.slug} member={m} />
              ))}
            </div>
          </section>
        )}

        {pubs.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow">Publications on this track</p>
            <ul className="mt-6 divide-y divide-ink-800 border-y border-ink-800">
              {pubs.map((p) => (
                <PublicationRow key={p.id} publication={p} />
              ))}
            </ul>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow">Applied projects</p>
            <ul className="mt-6 space-y-3">
              {projects.map((p) => (
                <li key={p.id} className="rounded-lg border border-ink-700/60 bg-ink-900/40 p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-medium text-slate-100">{p.title}</h3>
                    <span className="shrink-0 font-mono text-xs text-slate-600">{p.term}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{p.students.join(', ')}</p>
                  {p.outcomes.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {p.outcomes.map((o) => (
                        <li key={o.text} className="text-xs text-track-wireless">
                          {o.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink-800 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-mono text-slate-100 tabular-nums">{value}</dd>
    </div>
  )
}
