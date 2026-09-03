import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Section from '@/components/ui/Section'
import NewsCard, { NEWS_CATEGORY } from '@/components/ui/NewsCard'
import { news } from '@/lib/content'
import type { NewsCategory } from '@/types/content'

const ORDER: NewsCategory[] = [
  'publication',
  'award',
  'competition',
  'people',
  'venture',
  'milestone',
]

export default function News() {
  const [params, setParams] = useSearchParams()
  const [category, setCategory] = useState<NewsCategory | 'all'>(
    () => (params.get('category') as NewsCategory | null) ?? 'all',
  )

  // Keep the filter in the URL so a filtered view is linkable and survives reload.
  useEffect(() => {
    const next = new URLSearchParams(params)
    if (category === 'all') next.delete('category')
    else next.set('category', category)
    if (next.toString() !== params.toString()) setParams(next, { replace: true })
  }, [category, params, setParams])

  // Only offer a chip for a category that actually has items behind it.
  const present = useMemo(
    () => ORDER.filter((c) => news.some((n) => n.category === c)),
    [],
  )

  const items = useMemo(
    () => (category === 'all' ? news : news.filter((n) => n.category === category)),
    [category],
  )

  // "The newest three" is only meaningful across the whole feed. Inside a
  // filtered subset it would just be the first three of a short list.
  const featured = category === 'all' ? items.slice(0, 3) : []
  const rest = category === 'all' ? items.slice(3) : items

  return (
    <Section
      eyebrow="News"
      title="What has been happening."
      lead="Publications, awards, competitions, defenses and press, newest first."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={category === 'all'} onClick={() => setCategory('all')}>
          Everything
        </Chip>
        {present.map((c) => (
          <Chip
            key={c}
            active={category === c}
            color={NEWS_CATEGORY[c].color}
            onClick={() => setCategory(c)}
          >
            {NEWS_CATEGORY[c].label}
          </Chip>
        ))}
        <p className="ml-auto font-mono text-xs text-slate-500">
          {items.length} of {news.length}
        </p>
      </div>

      {featured.length > 0 && (
        <div className="mt-10 grid gap-5">
          {featured.map((item) => (
            <NewsCard key={item.id} item={item} wide />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div
          className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${featured.length > 0 ? 'mt-5' : 'mt-10'}`}
        >
          {rest.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="mt-12 text-sm text-slate-500">
          Nothing in that category yet.{' '}
          <button
            type="button"
            onClick={() => setCategory('all')}
            className="text-signal-400 transition-colors hover:text-signal-300"
          >
            Show everything
          </button>
          .
        </p>
      )}
    </Section>
  )
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
        active
          ? 'text-slate-50'
          : 'border-ink-700 text-slate-500 hover:border-ink-600 hover:text-slate-200'
      }`}
      style={
        active
          ? {
              borderColor: `color-mix(in srgb, ${color ?? 'var(--color-signal-400)'} 55%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${color ?? 'var(--color-signal-400)'} 16%, transparent)`,
            }
          : undefined
      }
    >
      {children}
    </button>
  )
}
