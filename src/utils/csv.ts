import type { Expense } from '../types'

const HEADER = ['Date', 'Description', 'Category', 'Amount', 'Deductible']

/**
 * Makes one value safe for a CSV cell:
 * - a value starting with = + - @ (or a tab/CR) would run as a formula when the file is
 *   opened in Excel or Google Sheets (CSV injection), so it gets a leading apostrophe;
 * - a value with a comma, quote, line break or edge spaces is wrapped in quotes, with
 *   inner quotes doubled (RFC 4180).
 */
export function csvField(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  const needsQuotes = /[",\r\n]/.test(safe) || safe !== safe.trim()
  return needsQuotes ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** One header row plus one row per expense, in the order given. Lines end in CRLF. */
export function expensesToCsv(expenses: readonly Expense[]): string {
  const rows = expenses.map((e) => [e.date, e.description, e.category, e.amount.toFixed(2), e.deductible ? 'Yes' : 'No'])
  return [HEADER, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n') + '\r\n'
}
