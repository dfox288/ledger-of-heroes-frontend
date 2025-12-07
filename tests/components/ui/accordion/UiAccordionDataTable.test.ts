import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionDataTable from '~/components/ui/accordion/UiAccordionDataTable.vue'

describe('UiAccordionDataTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value' }
  ]

  const rows = [
    { name: 'Item 1', value: '100' },
    { name: 'Item 2', value: '200' }
  ]

  it('renders table with columns and rows', async () => {
    const wrapper = await mountSuspended(UiAccordionDataTable, {
      props: { columns, rows }
    })

    // Check table exists
    expect(wrapper.find('table').exists()).toBe(true)

    // Check headers
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Value')

    // Check data
    expect(wrapper.text()).toContain('Item 1')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('Item 2')
    expect(wrapper.text()).toContain('200')
  })

  it('renders custom cell content via slots', async () => {
    const wrapper = await mountSuspended(UiAccordionDataTable, {
      props: { columns, rows },
      slots: {
        'cell-value': () => h('span', { class: 'custom-badge' }, '{{ value }}')
      }
    })

    expect(wrapper.find('.custom-badge').exists()).toBe(true)
  })

  it('handles empty rows array', async () => {
    const wrapper = await mountSuspended(UiAccordionDataTable, {
      props: { columns, rows: [] }
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('tbody tr').exists()).toBe(false)
  })

  it('applies striped styling to alternating rows', async () => {
    const wrapper = await mountSuspended(UiAccordionDataTable, {
      props: { columns, rows, striped: true }
    })

    const tableRows = wrapper.findAll('tbody tr')
    expect(tableRows[0].classes()).not.toContain('bg-gray-50')
    expect(tableRows[1].classes()).toContain('bg-gray-50')
  })
})
