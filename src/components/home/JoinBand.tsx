import { Link } from 'react-router-dom'
import { siteConfig } from '@/site.config'

/**
 * The closing ask. The ground is the saturated brand maroon in both themes, so
 * the text here is explicitly light rather than role-tokened.
 */
export default function JoinBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-signal-600 to-signal-500 px-8 py-14 sm:px-14">
        <div
          className="absolute inset-0 opacity-25"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(60% 80% at 85% 20%, rgba(255,255,255,0.5), transparent 65%)',
          }}
        />
        <div className="relative max-w-[62ch]">
          <p className="font-mono text-[10.5px] tracking-[0.18em] text-white/70 uppercase">
            Work with us
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
            Come and make something small.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/85 sm:text-lg">
            We take a real constraint, prove the mathematics that removes it, and ship the
            result. If that is the kind of problem you want to spend a few years on, get in touch.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-signal-600 transition-transform hover:-translate-y-0.5"
            >
              Open positions <span aria-hidden="true">&rarr;</span>
            </Link>
            <a
              href={`mailto:${siteConfig.pi.email}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              {siteConfig.pi.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
