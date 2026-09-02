/**
 * Resolves a path stored in the data files against the app's deploy base.
 *
 * Content JSON holds site-absolute paths like "/images/members/Dara.jpeg".
 * When the site is served from a subpath, such as GitHub Pages at
 * /CIRCA/, those would resolve against the domain root and 404. Vite exposes
 * the configured base as import.meta.env.BASE_URL, always with a trailing
 * slash, so joining here keeps every stored path deploy-independent.
 */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  // Leave anything already absolute or inlined alone.
  if (/^(https?:|data:|blob:)/.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
