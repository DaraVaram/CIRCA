import { Link } from 'react-router-dom'
import { siteConfig } from '@/site.config'
import { scholar } from '@/lib/content'

export default function Footer() {
  return (
    <footer className="border-t border-ink-700/60 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-mono text-sm tracking-[0.08em] text-slate-100">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
            {siteConfig.expansion}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {siteConfig.tagline}
          </p>
          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            {siteConfig.location.line1}
            <br />
            {siteConfig.location.label}
            <br />
            {siteConfig.location.line2}
          </p>
        </div>

        <div>
          <p className="eyebrow">Navigate</p>
          <ul className="mt-4 space-y-2">
            {siteConfig.nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-slate-400 transition-colors hover:text-signal-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${siteConfig.pi.email}`} className="text-slate-400 transition-colors hover:text-signal-300">
                {siteConfig.pi.email}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.pi.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 transition-colors hover:text-signal-300"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-mono">Citation data via {scholar.source}, updated {scholar.lastUpdated}</p>
        </div>
      </div>
    </footer>
  )
}
