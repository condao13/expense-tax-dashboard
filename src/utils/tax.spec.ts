import { describe, expect, it } from 'vitest'
import type { Expense } from '../types'
import {
  countDeductible,
  deductibleTotal,
  estimatedTaxSavings,
  roundCents,
  sumAmounts,
  totalsByCategory,
  totalsByMonth,
  validateExpense,
} from './tax'

const base: Omit<Expense, 'id' | 'amount' | 'category' | 'date' | 'deductible'> = { description: 'x' }
const expenses: Expense[] = [
  { ...base, id: '1', amount: 0.1, category: 'Food', date: '2026-01-10', deductible: false },
  { ...base, id: '2', amount: 0.2, category: 'Food', date: '2026-01-20', deductible: false },
  { ...base, id: '3', amount: 100, category: 'Health', date: '2026-02-01', deductible: true },
  { ...base, id: '4', amount: 50.5, category: 'Education', date: '2026-02-15', deductible: true },
]

describe('tax utils', () => {
  it('rounds to cents without floating point noise', () => {
    expect(roundCents(0.1 + 0.2)).toBe(0.3)
    expect(sumAmounts(expenses)).toBe(150.8)
  })

  it('sums only deductible expenses', () => {
    expect(deductibleTotal(expenses)).toBe(150.5)
  })

  it('counts only deductible expenses', () => {
    expect(countDeductible(expenses)).toBe(2)
    expect(countDeductible([])).toBe(0)
  })

  it('estimates tax savings at the marginal rate', () => {
    expect(estimatedTaxSavings(expenses, 0.275)).toBe(41.39)
    expect(estimatedTaxSavings([], 0.275)).toBe(0)
  })

  it('groups by category, largest first', () => {
    expect(totalsByCategory(expenses).map((c) => c.category)).toEqual(['Health', 'Education', 'Food'])
  })

  it('groups by month, oldest first', () => {
    expect(totalsByMonth(expenses)).toEqual([
      { month: '2026-01', total: 0.3 },
      { month: '2026-02', total: 150.5 },
    ])
  })

  it('validates every field and accepts a valid expense', () => {
    expect(Object.keys(validateExpense({}))).toEqual(['description', 'amount', 'category', 'date'])
    expect(validateExpense({ description: 'Dentist', amount: 90, category: 'Health', date: '2026-03-01' })).toEqual({})
    expect(validateExpense({ description: 'Dentist', amount: -1, category: 'Health', date: '2026-03-01' }).amount).toBeDefined()
  })
})
