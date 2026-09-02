import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Section from '@/components/ui/Section'
import PublicationRow from '@/components/ui/PublicationRow'
import { authors, publications, tracks, venues, years } from '@/lib/content'
import { trackVar } from '@/lib/theme'
import type { TrackId } from '@/types/content'

export default function Publications() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [track, setTrack] = useState<TrackId | 'all'>(
    () => (params.get('track') as TrackId | null) ?? 'all',
  )
  const [year, setYear] = useState<number | 'all'>('all')
  const [venue, setVenue] = useState<string>('all')
  const [author, setAuthor] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return publications
      .filter((p) => (track === 'all' ? true : p.tracks.includes(track)))
      .filter((p) => (year === 'all' ? true : p.year === year))
      .filter((p) => (venue === 'all' ? true : p.venue === venue))
      .filter((p) => (author === 'all' ? true : p.authors.includes(author)))
      .filter((p) =>
        q === ''
          ? true
          : p.title.toLowerCase().includes(q) ||
            p.venue.toLowerCase().includes(q) ||
            p.authors.some((a) => a.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        // Under-review work floats to the top, then newest first.
        if (a.year === null && b.year !== null) return -1
        if (b.year === null && a.year !== null) return 1
        return (b.year ?? 0) - (a.year ?? 0)
      })
  }, [query, track, year, venue, author])

  // Keep ?track= in the URL so a filtered view is linkable and survives reload.
  useEffect(() => {
    const next = new URLSearchParams(params)
    if (track === 'all') next.delete('track')
    else next.set('track', track)
    if (next.toString() !== params.toString()) setParams(next, { replace: true })
  }, [track, params, setParams])

  const reset = () => {
    setQuery('')
    setTrack('all')
    setYear('all')
    setVenue('all')
    setAuthor('all')
  }

  const active = query !== '' || track !== 'all' || year !== 'all' || venue !== 'all' || author !== 'all'

  return (
    <Section
      eyebrow="Publications"
      title="The full record"
      lead="Journals, conferences, theses and datasets. Filter by track, year, venue or author."
    >
      <div className="space-y-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, venues, authors..."
          className="w-full rounded-lg border border-ink-700 bg-ink-900/60 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-signal-500/60 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <Chip active={track === 'all'} onClick={() => setTrack('all')}>
            All tracks
          </Chip>
          {tracks.map((t) => (
            <Chip
              key={t.id}
              active={track === t.id}
              onClick={() => setTrack(t.id)}
              accent={trackVar(t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            label="Year"
            value={String(year)}
            onChange={(v) => setYear(v === 'all' ? 'all' : Number(v))}
            options={[{ value: 'all', label: 'All years' }, ...years.map((y) => ({ value: String(y), label: String(y) }))]}
          />
          <Select
            label="Venue"
            value={venue}
            onChange={setVenue}
            options={[{ value: 'all', label: 'All venues' }, ...venues.map((v) => ({ value: v, label: v }))]}
          />
          <Select
            label="Author"
            value={author}
            onChange={setAuthor}
            options={[{ value: 'all', label: 'All authors' }, ...authors.map((a) => ({ value: a, label: a }))]}
          />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <p className="font-mono text-xs text-slate-500">
            {filtered.length} of {publications.length} publications
          </p>
          {active && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-signal-400 transition-colors hover:text-signal-300"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-8 divide-y divide-ink-800 border-y border-ink-800">
          {filtered.map((p) => (
            <PublicationRow key={p.id} publication={p} />
          ))}
        </ul>
      ) : (
        <p className="mt-12 text-sm text-slate-500">
          Nothing matches those filters.{' '}
          <button type="button" onClick={reset} className="text-signal-400 hover:text-signal-300">
            Clear them
          </button>
          .
        </p>
      )}
    </Section>
  )
}

function Chip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean
  accent?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
        active
          ? 'border-transparent text-ink-950'
          : 'border-ink-700 text-slate-400 hover:border-ink-600 hover:text-slate-200'
      }`}
      style={active ? { backgroundColor: accent ?? 'var(--color-signal-400)' } : undefined}
    >
      {children}
    </button>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span className="font-mono tracking-wider uppercase">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[16rem] truncate rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-xs text-slate-300 focus:border-signal-500/60 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
