import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConfirmDialog from './ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('renders nothing while closed', () => {
    const wrapper = mount(ConfirmDialog, { props: { open: false, title: 'Remove?' } })
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
  })

  it('shows the title, the slot content and the button labels', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { open: true, title: 'Remove expense?', confirmLabel: 'Remove' },
      slots: { default: '<strong>Rent</strong> will be deleted.' },
    })
    expect(wrapper.find('h2').text()).toBe('Remove expense?')
    expect(wrapper.find('.message strong').text()).toBe('Rent')
    expect(wrapper.findAll('button').map((b) => b.text())).toEqual(['Cancel', 'Remove'])
  })

  it('emits confirm and cancel', async () => {
    const wrapper = mount(ConfirmDialog, { props: { open: true, title: 'Remove?' } })
    const [cancel, confirm] = wrapper.findAll('button')

    await confirm!.trigger('click')
    await cancel!.trigger('click')
    await wrapper.find('.dialog').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(2)
  })
})
