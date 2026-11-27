import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CategoryChart from './CategoryChart.vue'
import MonthlyChart from './MonthlyChart.vue'

describe('CategoryChart', () => {
  const data = [
    { category: 'Housing' as const, total: 1500 },
    { category: 'Health' as const, total: 600 },
  ]

  it('draws one focusable row per category', () => {
    const wrapper = mount(CategoryChart, { props: { data } })
    const rows = wrapper.findAll('g.row')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.attributes('tabindex')).toBe('0')
  })

  it('emits select with the category on click and on Enter', async () => {
    const wrapper = mount(CategoryChart, { props: { data } })
    const rows = wrapper.findAll('g.row')
    await rows[1]!.trigger('click')
    await rows[0]!.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([['Health'], ['Housing']])
  })
})

describe('MonthlyChart', () => {
  it('draws a line and one point per month', () => {
    const wrapper = mount(MonthlyChart, {
      props: {
        data: [
          { month: '2026-09', total: 509.9 },
          { month: '2026-10', total: 1837.25 },
        ],
      },
    })
    expect(wrapper.find('path.line').exists()).toBe(true)
    expect(wrapper.findAll('g.point')).toHaveLength(2)
    expect(wrapper.find('g.point title').text()).toBe('Sep 2026: $509.90')
  })

  it('draws nothing without data', () => {
    const wrapper = mount(MonthlyChart, { props: { data: [] } })
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
