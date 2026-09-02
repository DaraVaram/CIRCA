import { Link, useParams } from 'react-router-dom'
import TrackBadge from '@/components/ui/TrackBadge'
import PublicationRow from '@/components/ui/PublicationRow'
import { memberBySlug, publicationsForMember } from '@/lib/content'
import { assetUrl } from '@/lib/assets'
import NotFound from './NotFound'

export default function PersonDetail() {
  const { slug } = useParams<{ slug: string }>()
  const member = slug ? memberBySlug.get(slug) : undefined
  if (!member) return <NotFound />

  const pubs = publicationsForMember(member).sort((a, b) => (b.year ?? 9999) - (a.year ?? 9999))

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Link to="/people" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
        &larr; All people
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside>
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-ink-700/60 bg-ink-850">
            {member.photo ? (
              <img src={assetUrl(member.photo)} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-4xl text-ink-600">
                {member.name
                  .split(/\s+/)
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            {member.gradYear && <Row label="Graduated" value={String(member.gradYear)} />}
            {member.startYear && <Row label="Joined" value={String(member.startYear)} />}
            {member.destination && (
              <Row
                label="Now"
                value={`${member.destination.role}, ${member.destination.org}`}
              />
            )}
          </dl>

          {member.links && member.links.length > 0 && (
            <ul className="mt-6 space-y-2">
              {member.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-signal-400 transition-colors hover:text-signal-300"
                  >
                    {l.label} &nearr;
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div>
          <p className="eyebrow">
            {member.status === 'alumni'
              ? member.activeCollaborator
                ? 'Alumni, active collaborator'
                : 'Alumni'
              : member.role === 'pi'
                ? 'Principal investigator'
                : 'Current member'}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">{member.name}</h1>
          <p className="mt-2 text-slate-500">{member.program}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {member.tracks.map((t) => (
              <TrackBadge key={t} id={t} size="md" />
            ))}
          </div>

          {member.bio && (
            <p className="mt-8 max-w-3xl text-base leading-relaxed text-slate-400">{member.bio}</p>
          )}

          {member.thesisTitle && (
            <section className="mt-10">
              <p className="eyebrow">Thesis</p>
              <h2 className="mt-3 max-w-3xl text-xl leading-snug font-medium text-slate-100">
                {member.thesisTitle}
              </h2>
              {member.thesisAbstract && (
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400">
                  {member.thesisAbstract}
                </p>
              )}
            </section>
          )}

          {member.awards && member.awards.length > 0 && (
            <section className="mt-10">
              <p className="eyebrow">Awards</p>
              <ul className="mt-4 space-y-2">
                {member.awards.map((a) => (
                  <li key={a} className="flex gap-3 text-sm text-slate-400">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-track-wireless" />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pubs.length > 0 && (
            <section className="mt-12">
              <p className="eyebrow">Publications</p>
              <ul className="mt-4 divide-y divide-ink-800 border-y border-ink-800">
                {pubs.map((p) => (
                  <PublicationRow key={p.id} publication={p} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-ink-800 pb-2">
      <dt className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">{label}</dt>
      <dd className="mt-1 text-slate-300">{value}</dd>
    </div>
  )
}
