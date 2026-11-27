import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExpenseForm from './ExpenseForm.vue'

describe('ExpenseForm', () => {
  it('shows errors and does not emit when the form is empty', async () => {
    const wrapper = mount(ExpenseForm)
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('.error').length).toBeGreaterThanOrEqual(3)
  })

  it('emits a typed expense and resets when the input is valid', async () => {
    const wrapper = mount(ExpenseForm)
    await wrapper.find('input[name="description"]').setValue('Health insurance')
    await wrapper.find('input[name="amount"]').setValue('420')
    await wrapper.find('select[name="category"]').setValue('Health')
    await wrapper.find('input[name="date"]').setValue('2026-11-01')
    await wrapper.find('input[name="deductible"]').setValue(true)
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      description: 'Health insurance',
      amount: 420,
      category: 'Health',
      date: '2026-11-01',
      deductible: true,
    })
    expect((wrapper.find('input[name="description"]').element as HTMLInputElement).value).toBe('')
  })

  it('fills the form from `initial`, emits the edited values, and can cancel', async () => {
    const wrapper = mount(ExpenseForm, {
      props: {
        initial: { id: 's6', description: 'Dentist', amount: 180, category: 'Health', date: '2026-11-03', deductible: true },
      },
    })
    const description = wrapper.find('input[name="description"]')
    expect((description.element as HTMLInputElement).value).toBe('Dentist')
    expect(wrapper.find('button[type="submit"]').text()).toBe('Save changes')

    await wrapper.find('input[name="amount"]').setValue('380')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ description: 'Dentist', amount: 380, category: 'Health' })

    await wrapper.find('button.secondary').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('goes back to an empty "Add" form when `initial` becomes null', async () => {
    const wrapper = mount(ExpenseForm, {
      props: {
        initial: { id: 's6', description: 'Dentist', amount: 180, category: 'Health', date: '2026-11-03', deductible: true },
      },
    })
    await wrapper.setProps({ initial: null })
    expect((wrapper.find('input[name="description"]').element as HTMLInputElement).value).toBe('')
    expect(wrapper.find('button[type="submit"]').text()).toBe('Add expense')
  })
})
