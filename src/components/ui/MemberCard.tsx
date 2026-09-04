import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge'
import { assetUrl } from '@/lib/assets'
import type { Member } from '@/types/content'

/** Initials for members who have no photograph yet. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
}

/**
 * A circular portrait card. Everything that used to hide behind a hover is
 * visible now, because a visitor scanning the group should not have to discover
 * what somebody works on.
 */
export default function MemberCard({ member }: { member: Member }) {
  return (
    <Link
      to={`/people/${member.slug}`}
      className="group flex flex-col items-center rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6 text-center transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-900/70"
    >
      <div className="relative">
        {member.photo ? (
          <img
            src={assetUrl(member.photo)}
            alt=""
            loading="lazy"
            className="h-24 w-24 rounded-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-ink-700 bg-ink-850 font-mono text-xl text-slate-600">
            {initials(member.name)}
          </div>
        )}
        {member.activeCollaborator && (
          <span
            className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-signal-400"
            title="Still active on group projects"
          />
        )}
      </div>

      <h3 className="mt-5 text-[15px] font-medium text-slate-100">{member.name}</h3>
      {member.program && <p className="mt-1 text-xs text-slate-500">{member.program}</p>}

      {member.currentProject && (
        <p className="mt-3 text-xs leading-relaxed text-slate-400">{member.currentProject}</p>
      )}

      {member.tracks.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {member.tracks.map((t) => (
            <TrackBadge key={t} id={t} static />
          ))}
        </div>
      )}

      {member.destination && (
        <div className="mt-auto w-full border-t border-ink-800 pt-3.5">
          {/* Several current researchers also hold industry roles. Labelling
              those "Now" read as though they had left the group. */}
          <p className="font-mono text-[9.5px] tracking-[0.14em] text-slate-600 uppercase">
            {member.status === 'alumni' ? 'Now' : 'Also'}
          </p>
          <p className="mt-1 text-[11.5px] leading-snug text-slate-400">
            {member.destination.role}
            {member.destination.org ? `, ${member.destination.org}` : ''}
          </p>
        </div>
      )}
    </Link>
  )
}
