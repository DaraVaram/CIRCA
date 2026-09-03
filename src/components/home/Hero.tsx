import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { siteConfig } from '@/site.config'
import { tracks } from '@/lib/content'
import { metrics } from '@/lib/metrics'
import { trackVar } from '@/lib/theme'
import AuroraField from '@/components/viz/AuroraField'

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.07 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* The color field sits to the right and is masked away from the copy, so
          the headline never has to fight it for contrast. */}
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
          <AuroraField />
        </div>
        <div className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-ink-950 via-ink-950 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <motion.p
          custom={0}
          initial="hidden"
          animate="show"
          variants={fade}
          className="inline-flex items-center gap-2.5 rounded-full border border-ink-700/70 bg-ink-900/70 px-4 py-2 font-mono text-[10.5px] tracking-[0.12em] text-slate-500 uppercase backdrop-blur"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-500" />
          </span>
          {siteConfig.name} at the {siteConfig.pi.institution}
        </motion.p>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-7 max-w-[19ch] text-5xl leading-[1.02] font-semibold tracking-tight text-slate-50 text-balance sm:text-6xl lg:text-7xl"
        >
          Intelligence,{' '}
          <span className="bg-gradient-to-r from-signal-500 via-signal-400 to-track-wireless bg-clip-text text-transparent">
            under constraint.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-7 max-w-[54ch] text-lg leading-relaxed text-slate-400 sm:text-xl"
        >
          {siteConfig.description}
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/research"
            className="inline-flex items-center gap-2 rounded-xl bg-signal-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-signal-500/20 transition-all hover:-translate-y-0.5 hover:bg-signal-600"
          >
            The research <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            to="/systems"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/60 px-5 py-3 text-sm text-slate-300 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:text-slate-100"
          >
            What we have built
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-slate-500 transition-colors hover:text-signal-400"
          >
            Join the group
          </Link>
        </motion.div>

        {/* Inline rather than in a separate band: the numbers are part of the
            first impression, not a footnote to it. */}
        <motion.dl
          custom={4}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-16 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-5"
        >
          {metrics.map((m) => (
            <div key={m.key}>
              <dd className="font-mono text-3xl leading-none font-medium text-slate-50 tabular-nums">
                {m.value.toLocaleString()}
                {m.suffix && <span className="text-signal-400">{m.suffix}</span>}
              </dd>
              <dt className="mt-2 text-[13px] leading-snug text-slate-500">{m.label}</dt>
            </div>
          ))}
        </motion.dl>

        <motion.div
          custom={5}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-14 flex flex-wrap gap-x-6 gap-y-3 border-t border-ink-800 pt-6"
        >
          {tracks.map((track) => (
            <Link
              key={track.id}
              to={`/research/${track.id}`}
              className="group flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-slate-200"
            >
              <span
                className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150"
                style={{ backgroundColor: trackVar(track.id) }}
              />
              <span className="font-mono tracking-wide">{track.constraint}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
