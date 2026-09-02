import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import { publicationsForTrack, membersForTrack, tracks } from '@/lib/content'
import { trackVar } from '@/lib/theme'

export default function Research() {
  return (
    <Section
      eyebrow="Research"
      title="Five constraints, one question"
      lead="Every track below is organized around a resource that runs out: bits, bandwidth, memory, joules, or agreement between objectives. The methods differ. The discipline does not."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {tracks.map((track) => {
          const pubs = publicationsForTrack(track.id)
          const people = membersForTrack(track.id)
          return (
            <Link
              key={track.id}
              to={`/research/${track.id}`}
              className="group relative overflow-hidden rounded-xl border border-ink-700/60 bg-ink-900/40 p-7 transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:bg-ink-900/80"
            >
              <span
                className="absolute inset-y-0 left-0 w-px opacity-50 transition-opacity group-hover:opacity-100"
                style={{ background: `linear-gradient(to bottom, transparent, ${trackVar(track.id)}, transparent)` }}
              />
              <p
                className="font-mono text-[10px] tracking-[0.18em] uppercase"
                style={{ color: trackVar(track.id) }}
              >
                {track.constraint}
              </p>
              <h2 className="mt-4 text-xl font-medium text-slate-100">{track.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-400">{track.blurb}</p>
              <div className="mt-6 flex gap-5 font-mono text-xs text-slate-600">
                <span>{pubs.length} publications</span>
                <span>{people.length} members</span>
              </div>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
