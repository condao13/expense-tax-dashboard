import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useExpensesStore } from './expenses'

describe('expenses store', () => {
  beforeEach(() => {
    localStorage.clear()
    // Each test gets a fresh Pinia, so state never leaks between tests.
    setActivePinia(createPinia())
  })

  it('starts with sample data and the default tax rate', () => {
    const store = useExpensesStore()
    expect(store.expenses.length).toBeGreaterThan(0)
    expect(store.taxRate).toBe(0.275)
  })

  it('adds and removes expenses, and getters follow', () => {
    const store = useExpensesStore()
    store.resetToSample()
    const before = store.total

    const added = store.addExpense({
      description: '  Physio  ',
      amount: 60,
      category: 'Health',
      date: '2026-11-20',
      deductible: true,
    })
    expect(added.description).toBe('Physio')
    expect(store.total).toBe(before + 60)

    store.removeExpense(added.id)
    expect(store.total).toBe(before)
  })

  it('counts deductible expenses', () => {
    const store = useExpensesStore()
    store.resetToSample()
    expect(store.deductibleCount).toBe(4)
    store.addExpense({ description: 'Gym', amount: 99, category: 'Health', date: '2026-11-21', deductible: false })
    expect(store.deductibleCount).toBe(4)
  })

  it('updates an expense in place, and getters follow', async () => {
    const store = useExpensesStore()
    store.resetToSample()
    const before = store.total

    const updated = store.updateExpense('s6', { description: '  Dentist (crown)  ', amount: 380 })

    expect(updated).toMatchObject({ id: 's6', description: 'Dentist (crown)', amount: 380, category: 'Health' })
    expect(store.expenses.find((e) => e.id === 's6')?.amount).toBe(380)
    expect(store.total).toBe(before + 200)

    await nextTick()
    const saved = JSON.parse(localStorage.getItem('expense-tax-dashboard:v1') ?? '{}')
    expect(saved.expenses.find((e: { id: string }) => e.id === 's6').amount).toBe(380)
  })

  it('returns undefined and changes nothing when updating an unknown id', () => {
    const store = useExpensesStore()
    store.resetToSample()
    // A plain JSON copy: structuredClone cannot copy Vue's reactive proxies.
    const before = JSON.parse(JSON.stringify(store.expenses))

    expect(store.updateExpense('missing', { amount: 1 })).toBeUndefined()
    expect(store.expenses).toEqual(before)
  })

  it('loads data saved by earlier versions', () => {
    localStorage.setItem(
      'expense-tax-dashboard:v1',
      JSON.stringify({
        expenses: [{ id: 'a', description: 'Saved', amount: 10, category: 'Food', date: '2026-01-01', deductible: false }],
        taxRate: 0.15,
      }),
    )
    const store = useExpensesStore()
    expect(store.expenses.map((e) => e.id)).toEqual(['a'])
    expect(store.taxRate).toBe(0.15)
  })

  it('rejects tax rates outside 0..1', () => {
    const store = useExpensesStore()
    expect(() => store.setTaxRate(1.5)).toThrow(RangeError)
    store.setTaxRate(0.15)
    expect(store.taxRate).toBe(0.15)
  })

  it('persists changes to localStorage', async () => {
    const store = useExpensesStore()
    store.setTaxRate(0.2)
    await nextTick()
    const saved = JSON.parse(localStorage.getItem('expense-tax-dashboard:v1') ?? '{}')
    expect(saved.taxRate).toBe(0.2)
  })
})
