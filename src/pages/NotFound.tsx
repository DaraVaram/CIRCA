import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start px-6 py-32">
      <p className="font-mono text-sm text-signal-400">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-50">
        No feasible point here.
      </h1>
      <p className="mt-4 max-w-md text-slate-400">
        That page does not exist. The constraint set may have changed since you last
        looked.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg border border-ink-600 px-5 py-2.5 text-sm text-slate-300 transition-colors hover:border-signal-500/60 hover:text-signal-300"
      >
        Back to the start
      </Link>
    </div>
  )
}
