import Section from '@/components/ui/Section'
import { siteConfig } from '@/site.config'
import { tracks } from '@/lib/content'
import { trackVar } from '@/lib/theme'

export default function Contact() {
  return (
    <Section
      eyebrow="Contact"
      title="Two ways in"
      lead="The group works with prospective students and with industry partners. The route differs."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          eyebrow="Prospective students"
          title="Join the group"
          body="We take MSc and PhD students working across the five tracks. Strong mathematical foundations matter more than a specific background. Several current members arrived from signal processing, others from pure systems work."
          bullets={[
            'Include a CV, transcript, and a short note on which track interests you and why.',
            'Mention any implementation work you are proud of, whether code, hardware, or both.',
            'Undergraduates at AUS: capstone and research-grant projects run every year.',
          ]}
          email={siteConfig.contact.students}
          cta="Email about a position"
        />

        <Card
          eyebrow="Industry & partners"
          title="Work with us"
          body="The group's applied record runs from spectrum sensing on microcontrollers to computer-vision safety systems that have spun out into companies. We collaborate on sponsored capstone projects, joint research, and targeted technical consulting."
          bullets={[
            'Sponsored capstone projects run on an academic-year cycle.',
            'Joint research suits problems where a deployment constraint is the hard part.',
            'Prior partners span telecoms, aviation, civil defense and semiconductor manufacturing.',
          ]}
          email={siteConfig.contact.industry}
          cta="Email about a collaboration"
        />
      </div>

      <div className="mt-12 grid gap-8 rounded-xl border border-ink-700/60 bg-ink-900/40 p-8 sm:grid-cols-2">
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
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trackVar(t.id) }} />
                {t.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

function Card({
  eyebrow,
  title,
  body,
  bullets,
  email,
  cta,
}: {
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  email: string
  cta: string
}) {
  return (
    <div className="flex flex-col rounded-xl border border-ink-700/60 bg-ink-900/40 p-8">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-medium text-slate-100">{title}</h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">{body}</p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3 text-sm leading-relaxed text-slate-500">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-500" />
            {b}
          </li>
        ))}
      </ul>
      <a
        href={`mailto:${email}`}
        className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg border border-ink-600 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-signal-500/60 hover:text-signal-300"
      >
        {cta}
        <span>&rarr;</span>
      </a>
    </div>
  )
}
