import { lazy, Suspense, useState } from 'react'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/manrope'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/geist'
import { siteConfig } from '@/site.config'
import { metrics } from '@/lib/metrics'
import { tracks } from '@/lib/content'
import { trackVar } from '@/lib/theme'

/**
 * A scratch page for choosing typography and the hero background. Not linked
 * from the nav. Delete it, and the font packages it imports, once both are
 * settled.
 */

const AuroraField = lazy(() => import('@/components/viz/AuroraField'))
const ContourField = lazy(() => import('@/components/viz/ContourField'))
const FlowField = lazy(() => import('@/components/viz/FlowField'))

const FONTS = [
  {
    id: 'current',
    name: 'Current',
    note: 'Newsreader serif headings, Inter body',
    display: "'Newsreader Variable', Georgia, serif",
    body: "'Inter Variable', system-ui, sans-serif",
    weight: 500,
    tracking: '-0.015em',
  },
  {
    id: 'grotesk',
    name: 'Space Grotesk',
    note: 'Technical, distinctive letterforms. Inter for body',
    display: "'Space Grotesk Variable', system-ui, sans-serif",
    body: "'Inter Variable', system-ui, sans-serif",
    weight: 600,
    tracking: '-0.03em',
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    note: 'Geometric and warm, one family throughout',
    display: "'Plus Jakarta Sans Variable', system-ui, sans-serif",
    body: "'Plus Jakarta Sans Variable', system-ui, sans-serif",
    weight: 700,
    tracking: '-0.032em',
  },
  {
    id: 'instrument',
    name: 'Instrument Sans',
    note: 'Neutral and current, one family throughout',
    display: "'Instrument Sans Variable', system-ui, sans-serif",
    body: "'Instrument Sans Variable', system-ui, sans-serif",
    weight: 600,
    tracking: '-0.028em',
  },
  {
    id: 'geist',
    name: 'Geist',
    note: 'Clean and engineered, one family throughout',
    display: "'Geist Variable', system-ui, sans-serif",
    body: "'Geist Variable', system-ui, sans-serif",
    weight: 600,
    tracking: '-0.03em',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    note: 'Rounded geometric, friendly, one family throughout',
    display: "'Manrope Variable', system-ui, sans-serif",
    body: "'Manrope Variable', system-ui, sans-serif",
    weight: 700,
    tracking: '-0.03em',
  },
]

const BACKGROUNDS = [
  { id: 'none', name: 'None', note: 'Just the engineering grid' },
  { id: 'aurora', name: 'Aurora', note: 'The current soft gradient field with grain' },
  { id: 'contour', name: 'Contour', note: 'Level sets of a drifting surface, redrawn as lines' },
  { id: 'flow', name: 'Flow', note: 'Descent trajectories, two thousand at once' },
]

export default function Preview() {
  const [font, setFont] = useState(FONTS[1])
  const [bg, setBg] = useState(BACKGROUNDS[2])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="eyebrow">Scratch page</p>
      <h1
        className="mt-3 text-2xl font-semibold text-slate-50"
        style={{ fontFamily: font.display, letterSpacing: font.tracking }}
      >
        Typography and background
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Pick one of each. Not linked from the nav, and deleted once both are settled.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
            Typeface
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFont(f)}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                  font.id === f.id
                    ? 'border-signal-500 bg-signal-500/15 text-signal-400'
                    : 'border-ink-700 text-slate-500 hover:border-ink-600 hover:text-slate-200'
                }`}
                style={{ fontFamily: f.display }}
              >
                {f.name}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-slate-500">{font.note}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
            Background
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBg(b)}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                  bg.id === b.id
                    ? 'border-signal-500 bg-signal-500/15 text-signal-400'
                    : 'border-ink-700 text-slate-500 hover:border-ink-600 hover:text-slate-200'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-slate-500">{bg.note}</p>
        </div>
      </div>

      {/* The real hero copy, so the choice is judged on the actual page. */}
      <section className="relative mt-10 overflow-hidden rounded-3xl border border-ink-700/60">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div
            className="absolute inset-y-[-25%] right-[-15%] left-[26%]"
            style={{
              maskImage:
                'radial-gradient(62% 70% at 74% 46%, #000 22%, rgba(0,0,0,0.5) 55%, transparent 82%)',
              WebkitMaskImage:
                'radial-gradient(62% 70% at 74% 46%, #000 22%, rgba(0,0,0,0.5) 55%, transparent 82%)',
            }}
          >
            <Suspense fallback={null}>
              {bg.id === 'aurora' && <AuroraField />}
              {bg.id === 'contour' && <ContourField />}
              {bg.id === 'flow' && <FlowField />}
            </Suspense>
          </div>
          <div className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-ink-950 via-ink-950 to-transparent" />
        </div>

        <div className="relative px-8 py-16 sm:px-12">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-ink-700/70 bg-ink-900/70 px-4 py-2 font-mono text-[10.5px] tracking-[0.12em] text-slate-500 uppercase backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-500" />
            {siteConfig.name} at the {siteConfig.pi.institution}
          </p>

          <h2
            className="mt-7 max-w-[19ch] text-5xl leading-[1.02] text-slate-50 text-balance sm:text-6xl"
            style={{
              fontFamily: font.display,
              fontWeight: font.weight,
              letterSpacing: font.tracking,
            }}
          >
            Intelligence,{' '}
            <span className="bg-gradient-to-r from-signal-500 via-signal-400 to-track-wireless bg-clip-text text-transparent">
              under constraint.
            </span>
          </h2>

          <p
            className="mt-7 max-w-[54ch] text-lg leading-relaxed text-slate-400"
            style={{ fontFamily: font.body }}
          >
            {siteConfig.description}
          </p>

          <dl
            className="mt-12 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5"
            style={{ fontFamily: font.body }}
          >
            {metrics.map((m) => (
              <div key={m.key}>
                <dd className="font-mono text-3xl leading-none text-slate-50 tabular-nums">
                  {m.value.toLocaleString()}
                  {m.suffix && <span className="text-signal-400">{m.suffix}</span>}
                </dd>
                <dt className="mt-2 text-[13px] text-slate-500">{m.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Body copy at length, which is where a display face usually falls over. */}
      <section className="mt-10 grid gap-8 lg:grid-cols-2" style={{ fontFamily: font.body }}>
        <div>
          <h3
            className="text-2xl text-slate-50"
            style={{
              fontFamily: font.display,
              fontWeight: font.weight,
              letterSpacing: font.tracking,
            }}
          >
            Intelligence outgrew the places that need it most.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            A modern model is measured in hundreds of megabytes. The chip inside a drone, a
            camera, a wearable or a sensor is measured in one. A radio has a band, a battery
            has a budget, and a product has objectives that genuinely conflict.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Cut some parts, round the numbers, retrain and hope. Nobody can tell you in advance
            which parts of a model are actually doing the work. That is a research question, and
            it is the one we answer.
          </p>
        </div>
        <div className="space-y-3">
          {tracks.map((t) => (
            <div key={t.id} className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-5">
              <p
                className="font-mono text-[10px] tracking-[0.18em] uppercase"
                style={{ color: trackVar(t.id) }}
              >
                {t.constraint}
              </p>
              <h4
                className="mt-2.5 text-lg text-slate-100"
                style={{
                  fontFamily: font.display,
                  fontWeight: font.weight,
                  letterSpacing: font.tracking,
                }}
              >
                {t.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
