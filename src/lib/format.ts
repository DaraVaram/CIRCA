const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Dates are authored as YYYY-MM-DD. Many are month-precision only. */
export function formatNewsDate(iso: string, monthOnly?: boolean): string {
  const [y, m, d] = iso.split('-').map(Number)
  const month = MONTHS[(m ?? 1) - 1] ?? ''
  return monthOnly ? `${month} ${y}` : `${d} ${month} ${y}`
}

export function shortNewsDate(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  return `${(MONTHS[(m ?? 1) - 1] ?? '').slice(0, 3)} ${y}`
}
