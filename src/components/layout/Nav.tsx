import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { siteConfig } from '@/site.config'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Mark from '@/components/ui/Mark'
import { assetUrl } from '@/lib/assets'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {siteConfig.logo ? (
            <img src={assetUrl(siteConfig.logo)} alt="" className="h-7 w-7" />
          ) : (
            <Mark />
          )}
          <span className="font-mono text-sm tracking-[0.08em] text-slate-100 transition-colors group-hover:text-signal-400">
            {siteConfig.name}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <nav className="flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'text-signal-400'
                      : 'text-slate-400 hover:bg-ink-800/60 hover:text-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="mx-1 h-5 w-px bg-ink-700" aria-hidden="true" />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-slate-300 hover:bg-ink-800 md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink-700/60 bg-ink-950/95 px-6 py-3 backdrop-blur-xl md:hidden">
          {siteConfig.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2.5 text-sm ${
                  isActive ? 'text-signal-400' : 'text-slate-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
