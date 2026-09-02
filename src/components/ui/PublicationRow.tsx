import { useState } from 'react'
import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge'
import { memberForAuthor } from '@/lib/content'
import { toBibTeX, toPlainCitation } from '@/lib/citation'
import type { Publication } from '@/types/content'
import { assetUrl } from '@/lib/assets'

const KIND_LABEL: Record<Publication['kind'], string> = {
  journal: 'Journal',
  conference: 'Conference',
  'book-chapter': 'Book chapter',
  thesis: 'Thesis',
  dataset: 'Dataset',
}

export default function PublicationRow({ publication }: { publication: Publication }) {
  return (
    <li id={publication.id} className="scroll-mt-24 py-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] tracking-wider text-slate-600 uppercase">
          {KIND_LABEL[publication.kind]}
        </span>
        {publication.tracks.map((t) => (
          <TrackBadge key={t} id={t} />
        ))}
        {publication.status === 'submitted' ? (
          <span className="rounded-full border border-ink-600 px-2 py-0.5 font-mono text-[10px] tracking-wider text-slate-500 uppercase">
            Under review
          </span>
        ) : (
          <span className="font-mono text-xs text-slate-600">{publication.year}</span>
        )}
      </div>

      <h3 className="mt-3 max-w-3xl text-base leading-snug font-medium text-slate-100">
        {publication.url ? (
          <a
            href={publication.url}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-signal-400"
          >
            {publication.title}
          </a>
        ) : (
          publication.title
        )}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {publication.authors.map((author, i) => {
          const member = memberForAuthor(author)
          return (
            <span key={author}>
              {i > 0 && ', '}
              {member ? (
                <Link
                  to={`/people/${member.slug}`}
                  className="text-slate-300 transition-colors hover:text-signal-400"
                >
                  {author}
                </Link>
              ) : (
                author
              )}
            </span>
          )
        })}
      </p>

      <p className="mt-1 text-sm text-slate-600 italic">{publication.venue}</p>

      {publication.note && (
        <p className="mt-2 text-xs text-track-wireless">{publication.note}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {publication.doi && (
          <a
            href={`https://doi.org/${publication.doi}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-slate-500 transition-colors hover:text-signal-400"
          >
            doi:{publication.doi}
          </a>
        )}
        {!publication.doi && publication.url && (
          <a
            href={publication.url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-slate-500 transition-colors hover:text-signal-400"
          >
            View record
          </a>
        )}
        <CopyButton label="BibTeX" value={toBibTeX(publication)} />
        <CopyButton label="Citation" value={toPlainCitation(publication)} />
      </div>

      {publication.figure && (
        <figure className="paper mt-4 max-w-lg overflow-hidden rounded-lg border border-ink-700/60 p-3">
          <img src={assetUrl(publication.figure)} alt="" loading="lazy" className="w-full object-contain" />
        </figure>
      )}
    </li>
  )
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard can be blocked by permissions. Fall back to a selection.
      const el = document.createElement('textarea')
      el.value = value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      el.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="font-mono text-[11px] text-slate-500 transition-colors hover:text-signal-400"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}
