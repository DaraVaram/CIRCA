import TrackBadge from './TrackBadge'
import { destinationFor } from '@/lib/content'
import type { Project } from '@/types/content'

/**
 * A senior design project: the team, the tracks it sat on, what it won, and
 * where the students went afterwards.
 */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-xl border border-ink-700/60 bg-ink-900/40 p-6 transition-colors hover:border-ink-600">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-xs text-slate-600">{project.term}</span>
        <div className="flex shrink-0 gap-1.5">
          {project.industrySponsor && <Tag>Industry sponsored</Tag>}
          {project.undergraduateResearchGrant && <Tag>Research grant</Tag>}
        </div>
      </div>

      <h3 className="mt-3 text-base leading-snug font-medium text-slate-100">
        {project.title}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tracks.map((t) => (
          <TrackBadge key={t} id={t} />
        ))}
      </div>

      <ul className="mt-4 space-y-1.5">
        {project.students.map((s) => {
          const dest = destinationFor(s)
          return (
            <li key={s} className="text-sm text-slate-400">
              {s}
              {dest && (
                <span className="text-slate-600">
                  {' '}
                  &rarr; {dest.role}
                  {dest.org ? `, ${dest.org}` : ''}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {project.awards.length > 0 && (
        <ul className="mt-5 space-y-1.5 border-t border-ink-800 pt-4">
          {project.awards.map((a) => (
            <li key={a} className="flex gap-2.5 text-xs leading-relaxed text-track-efficient">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-track-efficient" />
              {a}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-ink-600 px-2 py-0.5 font-mono text-[10px] tracking-wider text-slate-500 uppercase">
      {children}
    </span>
  )
}
