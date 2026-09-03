import { Link } from 'react-router-dom'
import NewsCard from '@/components/ui/NewsCard'
import { news } from '@/lib/content'

/** The three newest items, in the same card the News page uses. */
export default function LatestNews() {
  const items = news.slice(0, 3)
  if (items.length === 0) return null

  return (
    <div className="border-y border-ink-800 bg-ink-900/30">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[60ch]">
            <p className="eyebrow">Latest news</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 text-balance sm:text-4xl">
              What has been happening.
            </h2>
          </div>
          <Link
            to="/news"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink-700 px-5 py-3 text-sm text-slate-300 transition-all hover:-translate-y-0.5 hover:border-ink-600 hover:text-slate-100"
          >
            All news <span aria-hidden="true">&rarr;</span>
          </Link>
        </header>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
