import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge'
import type { Member } from '@/types/content'
import { assetUrl } from '@/lib/assets'

/**
 * Photo by default. On hover the card lifts to reveal the one-line project
 * summary and track tags. Falls back to a monogram when no photo exists.
 */
export default function MemberCard({ member }: { member: Member }) {
  return (
    <Link
      to={`/people/${member.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-ink-700/60 bg-ink-900/40 transition-all hover:-translate-y-0.5 hover:border-ink-600"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-850">
        {member.photo ? (
          <img
            src={assetUrl(member.photo)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-4xl text-ink-600">
              {member.name
                .split(/\s+/)
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

        {/* Revealed on hover / focus. */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
          {member.currentProject && (
            <p className="text-xs leading-relaxed text-slate-300">{member.currentProject}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {member.tracks.map((t) => (
              <TrackBadge key={t} id={t} static />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-slate-100">{member.name}</h3>
          {member.activeCollaborator && (
            <span
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-400"
              title="Still active on group projects"
            />
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{member.program}</p>
        {member.destination && (
          <p className="mt-2 text-[11px] text-slate-600">
            &rarr; {member.destination.role}, {member.destination.org}
          </p>
        )}
      </div>
    </Link>
  )
}
