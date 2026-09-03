import { Link } from 'react-router-dom'
import { systems } from '@/lib/content'
import { trackVar } from '@/lib/theme'
import { assetUrl } from '@/lib/assets'
import type { SystemProject } from '@/types/content'

export default function Systems() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow">From the lab to the field</p>
          <h1 className="mt-4 max-w-[24ch] text-4xl font-bold tracking-tight text-slate-50 text-balance sm:text-5xl">
            We build the products that prove it.
          </h1>
          <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-slate-400">
            Two systems out of this group, both aimed at the same hard case: someone is in
            danger, there is no reliable network, and the computer you have fits in your hand.
            Both were built by students. One has become a company.
          </p>
        </div>
      </header>

      {systems.map((system, i) => (
        <SystemSection key={system.id} system={system} banded={i % 2 === 1} />
      ))}

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-50 text-balance">
          Both of these started as student projects.
        </h2>
        <p className="mx-auto mt-5 max-w-[62ch] text-base leading-relaxed text-slate-400">
          That is not a footnote. It is the model. The research pipeline produces the engineers
          and the founders as well as the science.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 rounded-xl bg-signal-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-signal-500/20 transition-all hover:-translate-y-0.5 hover:bg-signal-600"
          >
            See all twelve teams <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-5 py-3 text-sm text-slate-300 transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:text-slate-100"
          >
            Work with us
          </Link>
        </div>
      </section>
    </>
  )
}

function SystemSection({ system, banded }: { system: SystemProject; banded: boolean }) {
  const accent = trackVar(system.accentTrack)

  return (
    <section
      id={system.id}
      className={`scroll-mt-24 ${banded ? 'border-y border-ink-800 bg-ink-900/30' : ''}`}
    >
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div
          className={`grid items-start gap-12 ${system.image ? 'lg:grid-cols-[minmax(0,1fr)_26rem]' : ''}`}
        >
          <div className={system.image ? '' : 'max-w-[76ch]'}>
            <p
              className="font-mono text-[10px] tracking-[0.18em] uppercase"
              style={{ color: accent }}
            >
              {system.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 text-balance sm:text-4xl">
              {system.headline}
            </h2>
            <p className="mt-5 max-w-[64ch] text-base leading-relaxed text-slate-400 sm:text-lg">
              {system.lede}
            </p>

            {/* The line that reframes the problem, so it gets to be loud. */}
            <blockquote
              className="mt-8 max-w-[62ch] rounded-r-xl border-l-2 py-4 pl-6"
              style={{
                borderColor: accent,
                backgroundColor: `color-mix(in srgb, ${accent} 7%, transparent)`,
              }}
            >
              <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
                {system.pullQuote}
              </p>
            </blockquote>

            <p className="mt-7 max-w-[64ch] text-sm leading-relaxed text-slate-400">
              {system.body}
            </p>

            <dl className="mt-9 grid max-w-2xl grid-cols-3 gap-6 border-t border-ink-800 pt-6">
              {system.kpis.map((kpi) => (
                <div key={kpi.label}>
                  <dd
                    className="font-mono text-2xl leading-none tabular-nums"
                    style={{ color: accent }}
                  >
                    {kpi.value}
                  </dd>
                  <dt className="mt-2 text-[11.5px] leading-snug text-slate-500">{kpi.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {system.image && (
            <figure className="overflow-hidden rounded-2xl border border-ink-700/60">
              <img
                src={assetUrl(system.image)}
                alt={system.imageAlt ?? ''}
                className="w-full object-cover"
              />
            </figure>
          )}
        </div>

        {system.components && (
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {system.components.map((c) => (
              <article
                key={c.index}
                className="rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6"
              >
                <p
                  className="font-mono text-[10px] tracking-[0.18em] uppercase"
                  style={{ color: accent }}
                >
                  Component {c.index}
                </p>
                <h3 className="mt-4 text-lg font-medium text-slate-100">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.body}</p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {system.recognition && (
            <div className="rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6">
              <p
                className="font-mono text-[10px] tracking-[0.18em] uppercase"
                style={{ color: accent }}
              >
                Recognition
              </p>
              <ul className="mt-5 space-y-3">
                {system.recognition.map((r) => (
                  <li key={r} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {system.team && (
            <div className="overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/40">
              {system.team.image && (
                <img
                  src={assetUrl(system.team.image)}
                  alt={system.team.imageAlt ?? ''}
                  loading="lazy"
                  className="w-full object-cover"
                />
              )}
              <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
                  The team
                </p>
                <p className="mt-3 text-[15px] leading-snug font-medium text-slate-100">
                  {system.team.members.join(' · ')}
                </p>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
                  {system.team.note}
                </p>
              </div>
            </div>
          )}
        </div>

        {system.note && (
          <div className="mt-6 rounded-2xl border border-dashed border-ink-700 p-6">
            <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
              Where the advantage sits
            </p>
            <p className="mt-3 max-w-[80ch] text-sm leading-relaxed text-slate-400">
              {system.note}
            </p>
          </div>
        )}

        {system.venture && (
          <div
            className="mt-10 rounded-3xl border p-8 sm:p-10"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 34%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`,
            }}
          >
            <p
              className="font-mono text-[10px] tracking-[0.18em] uppercase"
              style={{ color: accent }}
            >
              Now a company
            </p>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-50">
              {system.venture.name}
            </h3>
            <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-slate-400">
              {system.venture.lede}
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {system.venture.benefits.map((b, i) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5"
                >
                  <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
                    Benefit {String(i + 1).padStart(2, '0')}
                  </p>
                  <h4 className="mt-3 text-[15px] font-medium text-slate-100">{b.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{b.body}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 border-t border-ink-800 pt-6 text-sm leading-relaxed text-slate-400">
              <span className="font-medium text-slate-200">The team. </span>
              {system.venture.teamNote}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
