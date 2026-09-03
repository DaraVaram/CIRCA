const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export type DatePrecision = 'day' | 'month' | 'year'

/**
 * Dates are authored as YYYY-MM-DD with the unknown parts padded, so the
 * precision decides how much to print. Showing "1 January 2021" for something
 * only known to the year would invent a day that was never recorded.
 */
export function formatNewsDate(iso: string, precision: DatePrecision = 'month'): string {
  const [y, m, d] = iso.split('-').map(Number)
  const month = MONTHS[(m ?? 1) - 1] ?? ''
  if (precision === 'year') return String(y)
  if (precision === 'month') return `${month} ${y}`
  return `${d} ${month} ${y}`
}

export function shortNewsDate(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  return `${(MONTHS[(m ?? 1) - 1] ?? '').slice(0, 3)} ${y}`
}
