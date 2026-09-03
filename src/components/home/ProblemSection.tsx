import { Link } from 'react-router-dom'
import { siteConfig } from '@/site.config'

/**
 * The case for the group existing, before any method is named.
 *
 * Three cards in the order cost, limit, gap: what you pay for sending work
 * away, what you cannot send away at all, and why the obvious fix is still
 * guesswork. The third card is the research question, so it carries the weight.
 */
const CARDS = [
  {
    n: '01',
    kicker: 'The cost',
    title: 'Everything that does not fit phones home',
    body: 'Delay, bandwidth, battery drain, privacy exposure, and a cloud bill that grows every time a customer uses the product.',
  },
  {
    n: '02',
    kicker: 'The limit',
    title: 'And some things cannot wait for a network',
    body: 'A drone over a dune with no signal. A camera with three seconds to act. If the intelligence is not on the device, it is not there.',
  },
  {
    n: '03',
    kicker: 'The gap',
    title: 'Today, shrinking a model is guesswork',
    body: 'Cut some parts, round the numbers, retrain and hope. Nobody can tell you in advance which parts of a model are actually doing the work.',
    emphasis: 'That is a research question, and it is the one we answer.',
  },
]

export default function ProblemSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <header className="mx-auto max-w-[64ch] text-center">
        <p className="eyebrow">The problem we work on</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 text-balance sm:text-4xl">
          Intelligence outgrew the places that need it most.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
          A modern model is measured in hundreds of megabytes. The chip inside a drone, a
          camera, a wearable or a sensor is measured in one. A radio has a band, a battery has
          a budget, and a product has objectives that genuinely conflict. That gap is the whole
          reason {siteConfig.name} exists.
        </p>
      </header>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <article
            key={card.n}
            className="rounded-2xl border border-ink-700/60 bg-ink-900/40 p-7 transition-all hover:-translate-y-0.5 hover:border-ink-600"
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-slate-600 uppercase">
              {card.n} <span className="text-signal-400">{card.kicker}</span>
            </p>
            <h3 className="mt-4 text-lg leading-snug font-medium text-slate-100">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.body}</p>
            {card.emphasis && (
              <p className="mt-3 text-sm leading-relaxed font-medium text-slate-200">
                {card.emphasis}
              </p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/research"
          className="inline-flex items-center gap-2 rounded-xl bg-signal-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-signal-500/20 transition-all hover:-translate-y-0.5 hover:bg-signal-600"
        >
          See how we answer it <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  )
}
