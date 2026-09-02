import { Link } from 'react-router-dom'
import { news } from '@/lib/content'
import { formatNewsDate } from '@/lib/format'


const CATEGORY_COLOR: Record<string, string> = {
  publication: 'var(--color-signal-400)',
  award: 'var(--color-track-efficient-ml)',
  defense: 'var(--color-track-applied)',
  talk: 'var(--color-track-generative)',
  media: 'var(--color-track-wireless)',
  grant: 'var(--color-track-applied)',
  milestone: 'var(--viz-neutral)',
}

export default function NewsTicker() {
  const items = news.filter((n) => n.featured).slice(0, 8)
  if (items.length === 0) return null

  // Rendered twice so the -50% keyframe wraps seamlessly.
  const loop = [...items, ...items]

  return (
    <div className="relative flex items-center gap-4 overflow-hidden border-b border-ink-800 bg-ink-900/60 py-2.5">
      <span className="z-10 shrink-0 border-r border-ink-700 bg-ink-900 py-1 pr-4 pl-6 font-mono text-[10px] tracking-[0.18em] text-signal-400 uppercase">
        Latest
      </span>

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <div className="animate-ticker flex shrink-0 items-center gap-10 pr-10 whitespace-nowrap">
          {loop.map((item, i) => (
            <TickerItem key={`${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>

      <Link
        to="/news"
        className="z-10 shrink-0 bg-ink-900 py-1 pr-6 pl-4 text-xs text-slate-500 transition-colors hover:text-signal-300"
      >
        All news &rarr;
      </Link>
    </div>
  )
}

function TickerItem({ item }: { item: (typeof news)[number] }) {
  const color = CATEGORY_COLOR[item.category] ?? 'var(--viz-neutral)'
  const body = (
    <>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-mono text-[11px] text-slate-600">
        {formatNewsDate(item.date, item.monthOnly)}
      </span>
      <span className="text-sm text-slate-400 transition-colors group-hover:text-slate-100">
        {item.title}
      </span>
    </>
  )

  if (item.href?.startsWith('/')) {
    return (
      <Link to={item.href} className="group flex items-center gap-2.5">
        {body}
      </Link>
    )
  }
  return <span className="group flex items-center gap-2.5">{body}</span>
}
