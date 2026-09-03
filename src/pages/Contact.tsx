import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import { siteConfig } from '@/site.config'
import { piProfile, tracks } from '@/lib/content'
import { trackVar } from '@/lib/theme'
import type { TrackId } from '@/types/content'

interface Position {
  index: string
  accent: TrackId
  title: string
  body: string
  footnote: React.ReactNode
}

const POSITIONS: Position[] = [
  {
    index: '01',
    accent: 'optimization',
    title: 'Prospective graduate students',
    body: 'MSc and PhD positions in efficient machine learning, optimization theory, and deployment on constrained hardware. Send a CV, a transcript, and a paragraph on what you would want to work on and why. That last paragraph matters more than the first two.',
    footnote: 'Our MSc graduates have gone on to the MIT Senseable City Lab and to a PhD at EPFL.',
  },
  {
    index: '02',
    accent: 'efficient-ml',
    title: 'AUS undergraduates',
    body: "Senior design projects and research assistantships. Teams from this group have placed second worldwide at Dell Technologies' Envision the Future, filed patents, published in IEEE journals and founded a company. If you want a project that leaves the building, come and talk to us.",
    footnote: (
      <>
        Twelve teams so far. See them on the{' '}
        <Link to="/students" className="text-signal-400 transition-colors hover:text-signal-300">
          students page
        </Link>
        .
      </>
    ),
  },
  {
    index: '03',
    accent: 'applied',
    title: 'Industry and collaborators',
    body: 'If you have a hard constraint, whether that is fitting inside this much memory, running on this battery, or never dropping below this accuracy, that is precisely the shape of problem we work on. We are equally interested in partners who want Shaheen or Amana Vision deployed in the field.',
    footnote: (
      <>
        Two patents filed or in progress, one venture inside Sheraa. See the{' '}
        <Link to="/systems" className="text-signal-400 transition-colors hover:text-signal-300">
          systems
        </Link>
        .
      </>
    ),
  },
]

export default function Contact() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow">Work with us</p>
          <h1 className="mt-4 max-w-[24ch] text-4xl font-semibold tracking-tight text-slate-50 text-balance sm:text-5xl">
            Come and make something small.
          </h1>
          <p className="mt-6 max-w-[70ch] text-lg leading-relaxed text-slate-400">
            We take a real constraint, prove the mathematics that removes it, and ship the
            result. If that is the kind of problem you want to spend a few years on, we would
            like to hear from you.
          </p>
        </div>
      </header>

      <Section>
        <div className="grid gap-4 lg:grid-cols-3">
          {POSITIONS.map((p) => (
            <article
              key={p.index}
              className="flex flex-col rounded-2xl border border-ink-700/60 bg-ink-900/40 p-7 transition-all hover:-translate-y-0.5 hover:border-ink-600"
            >
              <p
                className="font-mono text-[10px] tracking-[0.18em] uppercase"
                style={{ color: trackVar(p.accent) }}
              >
                Position {p.index}
              </p>
              <h2 className="mt-4 text-lg leading-snug font-medium text-slate-100">{p.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{p.body}</p>
              <p className="mt-6 border-t border-ink-800 pt-4 text-xs leading-relaxed text-slate-500">
                {p.footnote}
              </p>
            </article>
          ))}
        </div>

        {/* The saturated brand ground is the same in both themes, so the text
            here is explicitly light rather than role-tokened. */}
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-signal-600 to-signal-500 px-8 py-14 sm:px-14">
          <div
            className="absolute inset-0 opacity-25"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(60% 80% at 85% 20%, rgba(255,255,255,0.5), transparent 65%)',
            }}
          />
          <div className="relative">
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-white/70 uppercase">
              Get in touch
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {piProfile.name}
            </h2>
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-white/85">
              {piProfile.department}, {piProfile.institution}, United Arab Emirates.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={`mailto:${piProfile.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-signal-600 transition-transform hover:-translate-y-0.5"
              >
                {piProfile.email}
              </a>
              <a
                href={piProfile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                LinkedIn <span aria-hidden="true">{'↗'}</span>
              </a>
              <Link
                to="/research"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Read the research
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-8 sm:grid-cols-2">
          <div>
            <p className="eyebrow">Location</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {siteConfig.location.line1}
              <br />
              {siteConfig.location.label}
              <br />
              {siteConfig.location.line2}
            </p>
          </div>
          <div>
            <p className="eyebrow">Tracks</p>
            <ul className="mt-4 space-y-1.5">
              {tracks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm text-slate-400">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: trackVar(t.id) }}
                  />
                  {t.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}
