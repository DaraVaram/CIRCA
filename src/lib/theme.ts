import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'lab-theme'

/**
 * Theme state lives on the document element rather than in React, so the inline
 * script in index.html can set it before first paint and avoid a flash of the
 * wrong theme. React subscribes to it through useSyncExternalStore.
 */
const listeners = new Set<() => void>()

function current(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Private browsing or blocked storage. The theme still applies this visit.
  }
  listeners.forEach((fn) => fn())
}

export function toggleTheme() {
  setTheme(current() === 'dark' ? 'light' : 'dark')
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, current, () => 'dark' as Theme)
}

/**
 * Reads a CSS custom property off the document element. Canvas and other
 * imperative drawing code cannot use Tailwind classes, so it pulls the active
 * theme's values through here instead of hardcoding hexes.
 */
export function cssVar(name: string, fallback = '#000000'): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** The palette a canvas visual needs, resolved against the active theme. */
export function vizPalette() {
  return {
    brand: cssVar('--color-signal-500', '#a62b42'),
    accent: cssVar('--color-signal-400', '#ce6478'),
    accentBright: cssVar('--color-signal-300', '#e39aa6'),
    neutral: cssVar('--viz-neutral', '#a99795'),
    faint: cssVar('--viz-faint', '#5c4b49'),
    body: cssVar('--viz-body', '#ddd0ce'),
    surface: cssVar('--color-ink-900', '#100b0d'),
    border: cssVar('--color-ink-700', '#2b2021'),
    land: cssVar('--viz-land', '#241a19'),
    landStroke: cssVar('--viz-land-stroke', '#3b2b2a'),
    graticule: cssVar('--viz-graticule', '#2a1f20'),
    track: {
      optimization: cssVar('--color-track-optimization', '#d2687c'),
      'efficient-ml': cssVar('--color-track-efficient-ml', '#c9a24f'),
      wireless: cssVar('--color-track-wireless', '#c97a45'),
      generative: cssVar('--color-track-generative', '#a87fb5'),
      applied: cssVar('--color-track-applied', '#7fa88f'),
    },
  }
}

export type VizPalette = ReturnType<typeof vizPalette>

/** CSS reference to a track's accent, safe to use inside an inline style. */
export const trackVar = (id: string) => `var(--color-track-${id})`

/** rgba() helper for canvas work, which needs per-stroke alpha. */
export function rgba(color: string, alpha: number): string {
  const hex = color.trim()
  if (!hex.startsWith('#')) return hex
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex
  const n = parseInt(full.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}
