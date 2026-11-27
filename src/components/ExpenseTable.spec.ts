import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Expense } from '../types'
import ExpenseTable from './ExpenseTable.vue'

const expenses: Expense[] = [
  { id: 'a', description: 'Rent', amount: 1500, category: 'Housing', date: '2026-10-01', deductible: false },
  { id: 'b', description: 'Dentist', amount: 180, category: 'Health', date: '2026-11-03', deductible: true },
]

describe('ExpenseTable', () => {
  it('marks rows above 1,000 as big', () => {
    const wrapper = mount(ExpenseTable, { props: { expenses } })
    const rows = wrapper.findAll('tbody tr')
    // Newest first: Dentist, then Rent.
    expect(rows.map((r) => r.classes('big'))).toEqual([false, true])
  })

  it('emits the whole expense on Edit and its id on Remove', async () => {
    const wrapper = mount(ExpenseTable, { props: { expenses } })
    await wrapper.find('button.edit').trigger('click')
    await wrapper.find('button.remove').trigger('click')
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(expenses[1])
    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('b')
  })

  it('hides the actions column when nothing is editable or removable', () => {
    const wrapper = mount(ExpenseTable, { props: { expenses, removable: false, editable: false } })
    expect(wrapper.findAll('th')).toHaveLength(5)
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
