import { useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/ui/Section'
import TrackBadge from '@/components/ui/TrackBadge'
import { news, newsImage } from '@/lib/content'
import { formatNewsDate } from '@/lib/format'
import type { NewsCategory, NewsItem } from '@/types/content'
import { assetUrl } from '@/lib/assets'

const CATEGORIES: { id: NewsCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'publication', label: 'Publications' },
  { id: 'award', label: 'Awards' },
  { id: 'defense', label: 'Defenses' },
  { id: 'talk', label: 'Talks' },
  { id: 'media', label: 'Media' },
  { id: 'milestone', label: 'Milestones' },
]

export default function News() {
  const [category, setCategory] = useState<NewsCategory | 'all'>('all')
  const items = category === 'all' ? news : news.filter((n) => n.category === category)

  return (
    <Section
      eyebrow="News"
      title="The archive"
      lead="Defenses, publications, awards, talks and press."
    >
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
              category === c.id
                ? 'border-signal-500 bg-signal-500/15 text-signal-300'
                : 'border-ink-700 text-slate-400 hover:border-ink-600 hover:text-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ol className="mt-10 space-y-4">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </ol>

      {items.length === 0 && (
        <p className="mt-12 text-sm text-slate-500">Nothing in that category yet.</p>
      )}
    </Section>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  // Either the item's own image, or the figure from the paper it announces.
  const image = newsImage(item)

  const body = (
    <>
      <p className="font-mono text-xs text-slate-600">
        {formatNewsDate(item.date, item.monthOnly)}
        <span className="mx-2 text-ink-700">/</span>
        <span className="tracking-wider uppercase">{item.category}</span>
      </p>

      <h3 className="mt-2.5 text-lg leading-snug font-medium text-slate-100">{item.title}</h3>

      {item.body && (
        <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
      )}

      {item.tracks && item.tracks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tracks.map((t) => (
            <TrackBadge key={t} id={t} static />
          ))}
        </div>
      )}
    </>
  )

  return (
    <li>
      <article
        className={`group overflow-hidden rounded-xl border border-ink-700/60 bg-ink-900/40 transition-colors hover:border-ink-600 ${
          image ? 'grid sm:grid-cols-[16rem_minmax(0,1fr)]' : ''
        }`}
      >
        {image &&
          (image.kind === 'figure' ? (
            // Paper artifacts, title blocks and diagrams alike, are
            // black-on-white. Framed as a document rather than a hole in the
            // dark layout, and contained so nothing is cropped.
            <div className="paper flex items-center p-4 sm:p-5">
              <img
                src={assetUrl(image.src)}
                alt=""
                loading="lazy"
                className="w-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video overflow-hidden bg-ink-850 sm:aspect-auto">
              <img
                src={assetUrl(image.src)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          ))}

        <div className="p-6">
          {item.href?.startsWith('/') ? (
            <Link to={item.href} className="block">
              {body}
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors group-hover:text-signal-300">
                Read more <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ) : (
            body
          )}
        </div>
      </article>
    </li>
  )
}
