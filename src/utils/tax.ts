import { CATEGORIES, type Category, type CategoryTotal, type Expense, type MonthTotal, type NewExpense } from '../types'

/** Rounds to cents, avoiding floating point noise like 0.1 + 0.2. */
export function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}

export function sumAmounts(expenses: readonly Expense[]): number {
  return roundCents(expenses.reduce((sum, e) => sum + e.amount, 0))
}

export function deductibleTotal(expenses: readonly Expense[]): number {
  return sumAmounts(expenses.filter((e) => e.deductible))
}

export function countDeductible(expenses: readonly Expense[]): number {
  return expenses.filter((e) => e.deductible).length
}

/** Tax saved by deducting the deductible expenses at the given marginal rate (0..1). */
export function estimatedTaxSavings(expenses: readonly Expense[], rate: number): number {
  return roundCents(deductibleTotal(expenses) * rate)
}

/** Totals per category, largest first. Categories with no expenses are left out. */
export function totalsByCategory(expenses: readonly Expense[]): CategoryTotal[] {
  const totals = new Map<Category, number>()
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total: roundCents(total) }))
    .sort((a, b) => b.total - a.total)
}

/** Totals per month (YYYY-MM), oldest first. */
export function totalsByMonth(expenses: readonly Expense[]): MonthTotal[] {
  const totals = new Map<string, number>()
  for (const e of expenses) {
    const month = e.date.slice(0, 7)
    totals.set(month, (totals.get(month) ?? 0) + e.amount)
  }
  return [...totals.entries()]
    .map(([month, total]) => ({ month, total: roundCents(total) }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export type ExpenseErrors = Partial<Record<keyof NewExpense, string>>

/** Returns one message per invalid field; an empty object means the input is valid. */
export function validateExpense(input: Partial<NewExpense>): ExpenseErrors {
  const errors: ExpenseErrors = {}
  if (!input.description || input.description.trim().length < 3) {
    errors.description = 'Use at least 3 characters.'
  }
  if (input.amount === undefined || !Number.isFinite(input.amount) || input.amount <= 0) {
    errors.amount = 'Enter an amount greater than zero.'
  }
  if (!input.category || !CATEGORIES.includes(input.category)) {
    errors.category = 'Pick a category.'
  }
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    errors.date = 'Pick a date.'
  }
  return errors
}
