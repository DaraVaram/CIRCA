import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { tracks } from '@/lib/content'
import { trackVar } from '@/lib/theme'
import type { TrackId } from '@/types/content'
import ConstrainedDescent from '@/components/viz/ConstrainedDescent'

// Only the first slide is in the main bundle. The rest arrive when selected.
const QuantizationDemo = lazy(() => import('@/components/viz/QuantizationDemo'))
const MultipathDemo = lazy(() => import('@/components/viz/MultipathDemo'))
const SeparationDemo = lazy(() => import('@/components/viz/SeparationDemo'))
const FingerprintDemo = lazy(() => import('@/components/viz/FingerprintDemo'))

/** The question each demo actually answers, in the group's own framing. */
const SLIDES: Record<TrackId, { question: string; body: string; demo: React.ReactNode }> = {
  optimization: {
    question: 'When objectives disagree, which one yields?',
    body: 'Standard multi-objective methods treat every objective as equally important and stall in conflict equilibria. Priority-constrained descent keeps the primary objective’s direction and deforms it by the smallest amount that still guarantees progress on the secondary one.',
    demo: <ConstrainedDescent />,
  },
  'efficient-ml': {
    question: 'How few bits can a layer survive?',
    body: 'Quantization replaces a continuous weight with one of 2^b levels. The saving is exactly 32/b, the error is not linear at all, and the layers differ. That gap is why mixed-precision assignment is worth solving rather than guessing.',
    demo: <QuantizationDemo />,
  },
  wireless: {
    question: 'What does a room look like to a radio?',
    body: 'Every wall adds a delayed, attenuated copy of the signal. The set of arrivals is a fingerprint of the geometry, distinct enough to name the room and place a device inside it without any dedicated positioning hardware.',
    demo: <MultipathDemo />,
  },
  generative: {
    question: 'Where does a network decide what things are?',
    body: 'Classes are entangled at the input and separated at the output. Tracking between-class against within-class scatter across depth shows where that work actually happens, and where the remaining layers are doing something else.',
    demo: <SeparationDemo />,
  },
  applied: {
    question: 'What happens when the anchors go down?',
    body: 'Wi-Fi fingerprinting holds only while distinct places give distinct readings. Access points are both the anchors of that guarantee and the attack surface. Take enough offline and separate rooms become indistinguishable.',
    demo: <FingerprintDemo />,
  },
}

export default function TrackShowcase() {
  const [index, setIndex] = useState(0)
  const track = tracks[index]
  const slide = SLIDES[track.id]
  const tabsRef = useRef<HTMLDivElement>(null)

  const go = useCallback(
    (next: number) => setIndex((next + tracks.length) % tracks.length),
    [],
  )

  // Arrow keys move between slides while the tab strip has focus.
  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
      else return
      e.preventDefault()
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [index, go])

  return (
    <div className="border-y border-ink-800 bg-ink-900/30">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Live from the lab</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-50 text-balance sm:text-4xl">
              Five constraints, five working demos
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Each of these runs the real method in your browser. Nothing here is a
              screenshot.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Arrow label="Previous track" onClick={() => go(index - 1)}>
              <path d="M15 6l-6 6 6 6" />
            </Arrow>
            <span className="font-mono text-xs text-slate-600 tabular-nums">
              {String(index + 1).padStart(2, '0')} / {String(tracks.length).padStart(2, '0')}
            </span>
            <Arrow label="Next track" onClick={() => go(index + 1)}>
              <path d="M9 6l6 6-6 6" />
            </Arrow>
          </div>
        </div>

        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Research track demos"
          className="mt-9 flex flex-wrap gap-2"
        >
          {tracks.map((t, i) => {
            const selected = i === index
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(i)}
                className={`rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide transition-colors ${
                  selected
                    ? 'text-slate-50'
                    : 'border-ink-700 text-slate-500 hover:border-ink-600 hover:text-slate-200'
                }`}
                style={
                  selected
                    ? {
                        borderColor: `color-mix(in srgb, ${trackVar(t.id)} 55%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${trackVar(t.id)} 16%, transparent)`,
                      }
                    : undefined
                }
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid items-start gap-12 lg:grid-cols-2"
          >
            <div>
              <p
                className="font-mono text-[10px] tracking-[0.18em] uppercase"
                style={{ color: trackVar(track.id) }}
              >
                {track.constraint}
              </p>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-50 text-balance sm:text-3xl">
                {slide.question}
              </h3>
              <p className="mt-5 text-base leading-relaxed text-slate-400">{slide.body}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  to={`/research/${track.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-signal-400 transition-colors hover:text-signal-300"
                >
                  Read the {track.label} track
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  to={`/publications?track=${track.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-200"
                >
                  Papers on this track
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-ink-700/60 bg-ink-900/50 p-5">
              <Suspense
                fallback={
                  <div className="aspect-4/3 w-full animate-pulse rounded-lg bg-ink-850" />
                }
              >
                {slide.demo}
              </Suspense>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Arrow({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-md border border-ink-700 p-1.5 text-slate-400 transition-colors hover:border-ink-600 hover:text-slate-100"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  )
}
