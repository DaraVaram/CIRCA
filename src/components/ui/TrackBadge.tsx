import { Link } from 'react-router-dom'
import { getTrack } from '@/lib/content'
import type { TrackId } from '@/types/content'
import { trackVar } from '@/lib/theme'

interface Props {
  id: TrackId
  /** Renders as a plain span instead of a link, for use inside other links. */
  static?: boolean
  size?: 'sm' | 'md'
}

export default function TrackBadge({ id, static: isStatic, size = 'sm' }: Props) {
  const track = getTrack(id)
  if (!track) return null

  const cls = `inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wider transition-colors ${
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'
  }`

  const accent = trackVar(track.id)
  const style = {
    borderColor: `color-mix(in srgb, ${accent} 32%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
    color: accent,
  }

  const inner = (
    <>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
      {track.label}
    </>
  )

  if (isStatic) {
    return (
      <span className={cls} style={style}>
        {inner}
      </span>
    )
  }

  return (
    <Link to={`/research/${track.id}`} className={`${cls} hover:brightness-125`} style={style}>
      {inner}
    </Link>
  )
}
