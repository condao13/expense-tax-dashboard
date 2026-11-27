import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import type { Expense, NewExpense } from '../types'
import {
  countDeductible,
  deductibleTotal,
  estimatedTaxSavings,
  sumAmounts,
  totalsByCategory,
  totalsByMonth,
} from '../utils/tax'

const STORAGE_KEY = 'expense-tax-dashboard:v1'
const DEFAULT_TAX_RATE = 0.275

interface PersistedState {
  expenses: Expense[]
  taxRate: number
}

const SAMPLE_EXPENSES: Expense[] = [
  { id: 's1', description: 'Health insurance', amount: 420, category: 'Health', date: '2026-09-05', deductible: true },
  { id: 's2', description: 'Online course: TypeScript', amount: 89.9, category: 'Education', date: '2026-09-12', deductible: true },
  { id: 's3', description: 'Rent', amount: 1500, category: 'Housing', date: '2026-10-01', deductible: false },
  { id: 's4', description: 'IDE license', amount: 24.5, category: 'Software', date: '2026-10-08', deductible: true },
  { id: 's5', description: 'Groceries', amount: 312.75, category: 'Food', date: '2026-10-20', deductible: false },
  { id: 's6', description: 'Dentist', amount: 180, category: 'Health', date: '2026-11-03', deductible: true },
]

function defaultState(): PersistedState {
  return { expenses: structuredClone(SAMPLE_EXPENSES), taxRate: DEFAULT_TAX_RATE }
}

/** Checks the shape of what was read from storage before trusting it. */
function isPersistedState(value: unknown): value is PersistedState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<PersistedState>
  return Array.isArray(candidate.expenses) && typeof candidate.taxRate === 'number'
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Setup store: the persisted ref is the state, `computed`s are the getters,
 * plain functions are the actions.
 */
export const useExpensesStore = defineStore('expenses', () => {
  // One persisted ref holds the whole state, so the saved format stays the same
  // and data saved by earlier versions still loads.
  const state = useLocalStorage(STORAGE_KEY, defaultState(), isPersistedState)

  // Writable computeds expose each field as its own ref (read and write),
  // so the rest of the app does not need to know about `state`.
  const expenses = computed({
    get: () => state.value.expenses,
    set: (value: Expense[]) => {
      state.value.expenses = value
    },
  })
  const taxRate = computed({
    get: () => state.value.taxRate,
    set: (value: number) => {
      state.value.taxRate = value
    },
  })

  const total = computed(() => sumAmounts(expenses.value))
  const deductible = computed(() => deductibleTotal(expenses.value))
  const deductibleCount = computed(() => countDeductible(expenses.value))
  const taxSavings = computed(() => estimatedTaxSavings(expenses.value, taxRate.value))
  const byCategory = computed(() => totalsByCategory(expenses.value))
  const byMonth = computed(() => totalsByMonth(expenses.value))
  const latest = computed(() => [...expenses.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5))

  function addExpense(input: NewExpense): Expense {
    const expense: Expense = { ...input, description: input.description.trim(), id: newId() }
    expenses.value.push(expense)
    return expense
  }

  /** Applies `changes` to the expense with this id. Returns it, or `undefined` if no such expense exists. */
  function updateExpense(id: string, changes: Partial<NewExpense>): Expense | undefined {
    const expense = expenses.value.find((e) => e.id === id)
    if (!expense) return undefined
    Object.assign(expense, changes)
    if (changes.description !== undefined) expense.description = changes.description.trim()
    return expense
  }

  function removeExpense(id: string): void {
    expenses.value = expenses.value.filter((e) => e.id !== id)
  }

  function setTaxRate(rate: number): void {
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      throw new RangeError('Tax rate must be between 0 and 1.')
    }
    taxRate.value = rate
  }

  function resetToSample(): void {
    state.value = defaultState()
  }

  return {
    expenses,
    taxRate,
    total,
    deductible,
    deductibleCount,
    taxSavings,
    byCategory,
    byMonth,
    latest,
    addExpense,
    updateExpense,
    removeExpense,
    setTaxRate,
    resetToSample,
  }
})
