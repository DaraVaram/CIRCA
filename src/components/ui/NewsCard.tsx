import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge'
import { newsImage, newsLink } from '@/lib/content'
import { formatNewsDate } from '@/lib/format'
import { assetUrl } from '@/lib/assets'
import type { NewsCategory, NewsItem } from '@/types/content'

/** Category colors reuse the track palette, so the whole site stays one system. */
const CATEGORY: Record<NewsCategory, { label: string; color: string }> = {
  publication: { label: 'Publication', color: 'var(--color-signal-400)' },
  award: { label: 'Award', color: 'var(--color-track-efficient-ml)' },
  competition: { label: 'Competition', color: 'var(--color-track-wireless)' },
  people: { label: 'People', color: 'var(--color-track-generative)' },
  venture: { label: 'Venture', color: 'var(--color-track-applied)' },
  milestone: { label: 'Milestone', color: 'var(--viz-neutral)' },
}

interface Props {
  item: NewsItem
  /** Lays the card out side by side instead of stacked. Used on the home page. */
  wide?: boolean
}

export default function NewsCard({ item, wide = false }: Props) {
  const image = newsImage(item)
  const link = newsLink(item)
  const cat = CATEGORY[item.category]

  return (
    <article
      className={`group flex overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/50 transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:shadow-lg hover:shadow-ink-950/5 ${
        wide ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      {image && (
        <div
          className={
            wide
              ? 'shrink-0 sm:w-[38%] sm:border-r sm:border-ink-800'
              : 'border-b border-ink-800'
          }
        >
          {image.kind === 'figure' ? (
            // Paper artifacts have a baked-in white ground, so they get their
            // own surface and are contained rather than cropped.
            <div className="paper flex aspect-video items-center justify-center p-3 sm:h-full">
              <img
                src={assetUrl(image.src)}
                alt=""
                loading="lazy"
                className="max-h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video overflow-hidden bg-ink-850 sm:h-full">
              <img
                src={assetUrl(image.src)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <span
            className="rounded-md px-2 py-1 font-mono text-[9.5px] tracking-[0.1em] uppercase"
            style={{
              color: cat.color,
              backgroundColor: `color-mix(in srgb, ${cat.color} 14%, transparent)`,
            }}
          >
            {cat.label}
          </span>
          <span className="font-mono text-[10.5px] tracking-wider text-slate-600 uppercase">
            {formatNewsDate(item.date, item.datePrecision)}
          </span>
        </div>

        <h3 className="text-[17px] leading-snug font-medium text-slate-100">
          {link && !link.external ? (
            <Link to={link.href} className="transition-colors hover:text-signal-400">
              {item.title}
            </Link>
          ) : link ? (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-signal-400"
            >
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h3>

        {item.body && (
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-400">{item.body}</p>
        )}

        {item.tracks && item.tracks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tracks.map((t) => (
              <TrackBadge key={t} id={t} static />
            ))}
          </div>
        )}

        {(item.source || link) && (
          <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-ink-800 pt-3.5 text-xs">
            <span className="text-slate-600">{item.source}</span>
            {link &&
              (link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-medium whitespace-nowrap text-signal-400 transition-colors hover:text-signal-300"
                >
                  {link.label} <span aria-hidden="true">{'↗'}</span>
                </a>
              ) : (
                <Link
                  to={link.href}
                  className="shrink-0 font-medium whitespace-nowrap text-slate-500 transition-colors hover:text-signal-400"
                >
                  {link.label} <span aria-hidden="true">&rarr;</span>
                </Link>
              ))}
          </div>
        )}
      </div>
    </article>
  )
}

export { CATEGORY as NEWS_CATEGORY }
