import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import PublicationRow from '@/components/ui/PublicationRow'
import TrackBadge from '@/components/ui/TrackBadge'
import { pi, piProfile, publicationsForMember, tracks } from '@/lib/content'
import { scholar } from '@/lib/content'
import { assetUrl } from '@/lib/assets'

export default function PrincipalInvestigator() {
  const p = piProfile
  const pubs = publicationsForMember(pi).sort((a, b) => (b.year ?? 9999) - (a.year ?? 9999))
  const supervised = tracks.filter((t) => pi.tracks.includes(t.id))

  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div>
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-ink-700/60 bg-ink-850">
              <img
                src={assetUrl(p.photo)}
                alt={p.name}
                className="h-full w-full object-cover"
              />
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Position" value={p.title} />
              <Row label="Department" value={p.department} />
              <Row label="Institution" value={p.institution} />
            </dl>

            <ul className="mt-6 space-y-2 text-sm">
              <li>
                <a href={`mailto:${p.email}`} className="text-signal-400 transition-colors hover:text-signal-300">
                  {p.email}
                </a>
              </li>
              <li>
                <a href={`mailto:${p.altEmail}`} className="text-signal-400 transition-colors hover:text-signal-300">
                  {p.altEmail}
                </a>
              </li>
              <li>
                <a
                  href={p.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-signal-400 transition-colors hover:text-signal-300"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">Principal Investigator</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
              {p.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{p.lede}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {supervised.map((t) => (
                <TrackBadge key={t.id} id={t.id} size="md" />
              ))}
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-ink-800 pt-6">
              <Metric value={scholar.citations.toLocaleString()} label="Citations" />
              <Metric value={String(scholar.hIndex)} label="h-index" />
              <Metric value={String(pubs.length)} label="Publications" />
            </dl>
          </div>
        </div>
      </header>

      <Section eyebrow="Biography" title="Background">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="max-w-3xl space-y-5">
            {p.bio.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-slate-400">
                {para}
              </p>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-5">
              <p className="eyebrow">Research areas</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {p.researchAreas.map((area) => (
                  <li key={area} className="flex items-center gap-2.5">
                    <span className="h-1 w-1 rounded-full bg-signal-400" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            <figure className="overflow-hidden rounded-xl border border-ink-700/60">
              <img src={assetUrl(p.photoAlt)} alt="" className="w-full object-cover" loading="lazy" />
              <figcaption className="bg-ink-900/60 px-4 py-3 text-xs leading-relaxed text-slate-500">
                Doctoral commencement, MIT, June 2023.
              </figcaption>
            </figure>
          </aside>
        </div>
      </Section>

      <Section eyebrow="Education" title="Training" className="border-t border-ink-800">
        <ol className="divide-y divide-ink-800 border-y border-ink-800">
          {p.education.map((e) => (
            <li key={e.degree} className="grid gap-4 py-7 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <div>
                <p className="font-mono text-sm text-signal-400">{e.degree}</p>
                <p className="mt-1 font-mono text-xs text-slate-600">{e.years}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-100">{e.institution}</h3>
                <p className="mt-1 text-sm text-slate-400">{e.field}</p>
                {e.detail && <p className="mt-2 text-xs text-slate-500">{e.detail}</p>}
                <p className="mt-3 text-sm text-slate-400">
                  <span className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
                    Thesis{' '}
                  </span>
                  <span className="italic">{e.thesis}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Appointments" title="Positions held" className="border-t border-ink-800">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
              Academic
            </p>
            <ul className="mt-4 divide-y divide-ink-800 border-y border-ink-800">
              {p.appointments.map((a) => (
                <li key={`${a.role}-${a.org}`} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-sm font-medium text-slate-100">{a.role}</h3>
                    <span className="shrink-0 font-mono text-xs text-slate-600">{a.years}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{a.org}</p>
                  {a.detail && <p className="mt-1 text-xs text-slate-500">{a.detail}</p>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
              Industry
            </p>
            <ul className="mt-4 divide-y divide-ink-800 border-y border-ink-800">
              {p.industry.map((a) => (
                <li key={a.org} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-sm font-medium text-slate-100">{a.org}</h3>
                    <span className="shrink-0 font-mono text-xs text-slate-600">{a.years}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{a.role}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{a.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section eyebrow="Teaching" title="Courses taught" className="border-t border-ink-800">
        <div className="grid gap-4 lg:grid-cols-3">
          {p.teaching.map((c) => (
            <article
              key={c.code}
              className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-sm text-signal-400">{c.code}</p>
                <span className="rounded-full border border-ink-600 px-2 py-0.5 font-mono text-[10px] tracking-wider text-slate-500 uppercase">
                  {c.level}
                </span>
              </div>
              <h3 className="mt-3 text-lg leading-snug font-medium text-slate-100">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.description}</p>
              <p className="mt-4 font-mono text-[11px] text-slate-600">{c.terms.join(', ')}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <p className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
            Graduate coursework completed at MIT
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.graduateCoursework.map((c) => (
              <li
                key={c}
                className="rounded-full border border-ink-700 px-3 py-1 text-xs text-slate-400"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        eyebrow="Recognition"
        title="Awards and honors"
        lead={`${p.awards.length} awards spanning academic distinction, professional service and national recognition.`}
        className="border-t border-ink-800"
      >
        <ol className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {p.awards.map((a, i) => (
            <li
              key={i}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-b border-ink-800 py-4"
            >
              <span className="font-mono text-xs text-slate-600">{a.year}</span>
              <span className="text-sm leading-relaxed text-slate-400">{a.text}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Outreach" title={p.seminarSeries.title} className="border-t border-ink-800">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="max-w-3xl">
            <p className="font-mono text-sm text-signal-400">
              {p.seminarSeries.role}, {p.seminarSeries.years}
            </p>
            <ul className="mt-5 space-y-3">
              {p.seminarSeries.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-sm leading-relaxed text-slate-400">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-400" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Service"
        title="Editorial and professional service"
        className="border-t border-ink-800"
      >
        <ul className="divide-y divide-ink-800 border-y border-ink-800">
          {p.service.map((s, i) => (
            <li key={i} className="grid gap-2 py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)_7rem]">
              <span className="font-mono text-xs tracking-wider text-slate-500 uppercase">
                {s.role}
              </span>
              <span className="text-sm text-slate-300">{s.org}</span>
              <span className="font-mono text-xs text-slate-600 sm:text-right">{s.years}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Public service"
        title="UAE government roles"
        className="border-t border-ink-800"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {p.governmentRoles.map((g) => (
            <article key={g.org} className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-6">
              <h3 className="text-base leading-snug font-medium text-slate-100">{g.org}</h3>
              <p className="mt-1 text-xs text-slate-500">{g.body}</p>
              <p className="mt-1 font-mono text-xs text-slate-600">{g.years}</p>
              <ul className="mt-4 space-y-2.5">
                {g.points.map((pt) => (
                  <li key={pt} className="flex gap-2.5 text-xs leading-relaxed text-slate-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-signal-400" />
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Publications"
        title={`${pubs.length} publications`}
        lead="Journals, conferences, book chapters, theses and datasets."
        className="border-t border-ink-800"
      >
        <ul className="divide-y divide-ink-800 border-y border-ink-800">
          {pubs.slice(0, 8).map((pub) => (
            <PublicationRow key={pub.id} publication={pub} />
          ))}
        </ul>
        <Link
          to="/publications"
          className="mt-8 inline-flex items-center gap-1.5 text-sm text-signal-400 transition-colors hover:text-signal-300"
        >
          View the full record
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </Section>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-ink-800 pb-2">
      <dt className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">{label}</dt>
      <dd className="mt-1 leading-snug text-slate-300">{value}</dd>
    </div>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-mono text-2xl text-slate-50 tabular-nums">{value}</dd>
      <dt className="mt-1 text-xs text-slate-500">{label}</dt>
    </div>
  )
}
