import { toggleTheme, useTheme } from '@/lib/theme'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`rounded-md p-2 text-slate-500 transition-colors hover:bg-ink-800 hover:text-slate-100 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {theme === 'dark' ? (
          // Moon: currently dark, click for light.
          <path d="M20 13.5A8.2 8.2 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M6.7 6.7 5.3 5.3M18.7 18.7l-1.4-1.4M6.7 17.3l-1.4 1.4M18.7 5.3l-1.4 1.4" />
          </>
        )}
      </svg>
    </button>
  )
}
