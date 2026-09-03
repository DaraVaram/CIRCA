import { Link } from 'react-router-dom'
import TrackBadge from './TrackBadge'
import { destinationFor } from '@/lib/content'
import type { Project, ProjectOutcome } from '@/types/content'

/**
 * Outcomes are ranked, not just listed. A founded company and a journal paper
 * are the things this page exists to show, so they sort first and carry a
 * stronger chip than a competition placing or a grant.
 */
const KIND: Record<
  NonNullable<ProjectOutcome['kind']>,
  { label: string; color: string; weight: number }
> = {
  venture: { label: 'Venture', color: 'var(--color-track-applied)', weight: 0 },
  publication: { label: 'Published', color: 'var(--color-signal-400)', weight: 1 },
  patent: { label: 'Patent', color: 'var(--color-track-generative)', weight: 2 },
  award: { label: 'Award', color: 'var(--color-track-efficient-ml)', weight: 3 },
  dataset: { label: 'Dataset', color: 'var(--color-track-wireless)', weight: 4 },
  grant: { label: 'Grant', color: 'var(--viz-neutral)', weight: 5 },
}

const weightOf = (o: ProjectOutcome) => (o.kind ? KIND[o.kind].weight : 6)

export default function ProjectCard({ project }: { project: Project }) {
  const outcomes = [...project.outcomes].sort((a, b) => weightOf(a) - weightOf(b))
  const decorated = outcomes.length > 0

  const inner = (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-xs text-slate-600">{project.term}</span>
        {project.industrySponsor && (
          <span className="shrink-0 rounded-full border border-ink-600 px-2 py-0.5 font-mono text-[9.5px] tracking-wider text-slate-500 uppercase">
            Industry sponsored
          </span>
        )}
      </div>

      <h3 className="mt-3 text-[15px] leading-snug font-medium text-slate-100">{project.title}</h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tracks.map((t) => (
          <TrackBadge key={t} id={t} static />
        ))}
      </div>

      <ul className="mt-4 space-y-1.5">
        {project.students.map((s) => {
          const dest = destinationFor(s)
          return (
            <li key={s} className="text-[13px] leading-snug text-slate-400">
              {s}
              {dest && (
                <span className="text-slate-600">
                  {' '}
                  &middot; {dest.role}
                  {dest.org ? `, ${dest.org}` : ''}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {decorated && (
        <ul className="mt-auto space-y-2.5 border-t border-ink-800 pt-4">
          {outcomes.map((o) => {
            const k = o.kind ? KIND[o.kind] : null
            return (
              <li key={o.text} className="flex flex-wrap items-start gap-2">
                {k ? (
                  <span
                    className="mt-px shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] uppercase"
                    style={{
                      color: k.color,
                      backgroundColor: `color-mix(in srgb, ${k.color} 15%, transparent)`,
                    }}
                  >
                    {k.label}
                  </span>
                ) : (
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                )}
                <span className="min-w-0 flex-1 text-xs leading-relaxed text-slate-400">
                  {o.text}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {project.system && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors group-hover:text-signal-400">
          Read how it works <span aria-hidden="true">&rarr;</span>
        </span>
      )}
    </>
  )

  // A decorated project earns a brighter surface. The ones without outcomes are
  // still here and still real, they just should not compete for attention.
  const shell = `group flex h-full flex-col rounded-2xl border p-6 transition-all ${
    decorated
      ? 'border-ink-700/60 bg-ink-900/50 hover:-translate-y-0.5 hover:border-ink-600'
      : 'border-ink-800 bg-ink-900/20 hover:border-ink-700'
  }`

  if (project.system) {
    return (
      <Link to={`/systems#${project.system}`} className={shell}>
        {inner}
      </Link>
    )
  }
  return <article className={shell}>{inner}</article>
}
