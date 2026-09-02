import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { siteConfig } from '@/site.config'
import { piProfile, tracks } from '@/lib/content'
import { trackVar } from '@/lib/theme'
import ConstrainedDescent from '@/components/viz/ConstrainedDescent'
import { assetUrl } from '@/lib/assets'

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-800">
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <div>
            <motion.p custom={0} initial="hidden" animate="show" variants={fade} className="eyebrow">
              {siteConfig.pi.institution}
            </motion.p>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="show"
              variants={fade}
              className="mt-6 text-5xl leading-[1.05] font-semibold tracking-tight text-slate-50 text-balance sm:text-6xl lg:text-7xl"
            >
              Intelligence,
              <br />
              <span className="text-signal-400">under constraint.</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="show"
              variants={fade}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-400"
            >
              {siteConfig.description}
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="show"
              variants={fade}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/research"
                className="rounded-lg bg-signal-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal-600"
              >
                Research tracks
              </Link>
              <Link
                to="/contact"
                className="rounded-lg border border-ink-600 px-5 py-2.5 text-sm text-slate-300 transition-colors hover:border-signal-500/60 hover:text-signal-400"
              >
                Work with us
              </Link>
            </motion.div>

            <motion.div
              custom={4}
              initial="hidden"
              animate="show"
              variants={fade}
              className="mt-12 flex flex-wrap gap-x-6 gap-y-3"
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

          {/* The PI, with the live solver directly beneath: a face for the group
              and proof the work is real, both inside the first screen. */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="show"
            variants={fade}
            className="space-y-4"
          >
            <Link
              to="/pi"
              className="group relative block overflow-hidden rounded-2xl border border-ink-700/60"
            >
              <img
                src={assetUrl(piProfile.photo)}
                alt={piProfile.name}
                className="aspect-4/5 w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-mono text-[10px] tracking-[0.18em] text-signal-400 uppercase">
                  Principal Investigator
                </p>
                <p className="mt-1.5 font-serif text-xl text-slate-50">{piProfile.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {piProfile.title}, {siteConfig.pi.department}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors group-hover:text-signal-400">
                  Full profile <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>

            <div className="relative hidden h-40 overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/40 sm:block">
              <ConstrainedDescent ambient />
              <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-wider text-slate-600 uppercase">
                Priority-constrained descent, running live
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
