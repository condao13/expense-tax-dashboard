/**
 * The date as YYYY-MM-DD in the user's own time zone.
 *
 * `new Date().toISOString().slice(0, 10)` gives the UTC date instead: in Brazil (UTC-3),
 * after 9 p.m. that is already tomorrow.
 */
export function localIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
