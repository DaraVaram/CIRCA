import { Link } from 'react-router-dom'
import { systems } from '@/lib/content'
import { trackVar } from '@/lib/theme'
import { assetUrl } from '@/lib/assets'

/**
 * The proof half of the argument. The research sections above say what the
 * group knows, this says what it shipped, which is the part an industry reader
 * scans for first.
 */
export default function SystemsTeaser() {
  return (
    <div className="border-y border-ink-800 bg-ink-900/30">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <header className="max-w-[62ch]">
          <p className="eyebrow">From the lab to the field</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 text-balance sm:text-4xl">
            We build the products that prove it.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
            Two systems out of this group, both aimed at the same hard case: someone is in
            danger, there is no reliable network, and the computer you have fits in your hand.
            Both were built by students. One has become a company.
          </p>
        </header>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {systems.map((system) => (
            <Link
              key={system.id}
              to={`/systems#${system.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/50 transition-all hover:-translate-y-0.5 hover:border-ink-600"
            >
              {system.image ? (
                <div className="aspect-16/9 overflow-hidden bg-ink-850">
                  <img
                    src={assetUrl(system.image)}
                    alt={system.imageAlt ?? ''}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                // ORCA has no photograph, so the venture name stands in as the
                // image. It is the more useful thing to show anyway.
                <div
                  className="flex aspect-16/9 flex-col justify-center border-b border-ink-800 px-8"
                  style={{
                    background: `linear-gradient(140deg, color-mix(in srgb, ${trackVar(
                      system.accentTrack,
                    )} 16%, transparent), transparent 70%)`,
                  }}
                >
                  <p className="font-serif text-4xl tracking-tight text-slate-50">
                    {system.venture?.name ?? system.name}
                  </p>
                  <p className="mt-3 font-mono text-[10px] tracking-[0.16em] text-slate-500 uppercase">
                    {system.venture ? `${system.name}, now commercialized` : system.name}
                  </p>
                </div>
              )}

              <div className="flex flex-1 flex-col p-7">
                <p
                  className="font-mono text-[10px] tracking-[0.18em] uppercase"
                  style={{ color: trackVar(system.accentTrack) }}
                >
                  {system.eyebrow}
                </p>
                <h3 className="mt-4 text-xl leading-snug font-medium text-slate-100">
                  {system.headline}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{system.lede}</p>

                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-ink-800 pt-5">
                  {system.kpis.map((kpi) => (
                    <div key={kpi.label}>
                      <dd className="font-mono text-base text-slate-100 tabular-nums">
                        {kpi.value}
                      </dd>
                      <dt className="mt-1 text-[11px] leading-snug text-slate-500">{kpi.label}</dt>
                    </div>
                  ))}
                </dl>

                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors group-hover:text-signal-400">
                  How it works <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
