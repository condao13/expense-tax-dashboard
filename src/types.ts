export const CATEGORIES = [
  'Housing',
  'Health',
  'Education',
  'Transport',
  'Food',
  'Software',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Type guard: narrows a plain string (e.g. a route param) to a Category. */
export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}

export interface Expense {
  id: string
  description: string
  /** Amount in the app currency, always positive. */
  amount: number
  category: Category
  /** ISO date, YYYY-MM-DD. */
  date: string
  /** Whether the expense can be deducted from taxable income. */
  deductible: boolean
}

export type NewExpense = Omit<Expense, 'id'>

export interface CategoryTotal {
  category: Category
  total: number
}

export interface MonthTotal {
  /** YYYY-MM */
  month: string
  total: number
}
