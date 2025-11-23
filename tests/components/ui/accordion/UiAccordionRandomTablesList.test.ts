import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionRandomTablesList from '~/components/ui/accordion/UiAccordionRandomTablesList.vue'
import type { components } from '~/types/api/generated'

type RandomTableResource = components['schemas']['RandomTableResource']

describe('UiAccordionRandomTablesList', () => {
  const mockTables: RandomTableResource[] = [
    {
      id: 1,
      table_name: 'Treasure Type',
      dice_type: 'd6',
      description: 'Roll to determine treasure',
      entries: [
        { id: 1, roll_min: 1, roll_max: 2, result_text: 'Gold' },
        { id: 2, roll_min: 3, roll_max: 4, result_text: 'Silver' },
        { id: 3, roll_min: 5, roll_max: 6, result_text: 'Copper' }
      ]
    }
  ]

  it('renders table name and dice type', async () => {
    const wrapper = await mountSuspended(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    expect(wrapper.text()).toContain('Treasure Type')
    expect(wrapper.text()).toContain('d6')
  })

  it('displays roll ranges and results', async () => {
    const wrapper = await mountSuspended(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    expect(wrapper.text()).toContain('1-2')
    expect(wrapper.text()).toContain('Gold')
    expect(wrapper.text()).toContain('5-6')
    expect(wrapper.text()).toContain('Copper')
  })

  it('handles pipe-delimited columns', async () => {
    const mockWithPipes: RandomTableResource[] = [
      {
        id: 1,
        table_name: 'Multi-column',
        dice_type: 'd4',
        entries: [
          { id: 1, roll_min: 1, roll_max: 1, result_text: 'House Cannith | Alchemist supplies' },
          { id: 2, roll_min: 2, roll_max: 2, result_text: 'House Deneith | Smith tools' }
        ]
      }
    ]

    const wrapper = await mountSuspended(UiAccordionRandomTablesList, {
      props: { tables: mockWithPipes }
    })

    expect(wrapper.text()).toContain('House Cannith')
    expect(wrapper.text()).toContain('Alchemist supplies')
  })

  it('handles empty tables array', async () => {
    const wrapper = await mountSuspended(UiAccordionRandomTablesList, {
      props: { tables: [] }
    })

    expect(wrapper.text()).toBe('')
  })

  it('should NOT render border-l-4 class on table wrapper', async () => {
    const wrapper = await mountSuspended(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    // Find the wrapper div for each table
    const html = wrapper.html()

    // Should not contain border-l-4 class
    expect(html).not.toContain('border-l-4')
    expect(html).not.toContain('pl-4')
  })

  it('should NOT render border color classes', async () => {
    const wrapper = await mountSuspended(UiAccordionRandomTablesList, {
      props: {
        tables: mockTables,
        borderColor: 'purple-500'
      }
    })

    const html = wrapper.html()
    expect(html).not.toContain('border-purple-500')
    expect(html).not.toContain('border-primary-500')
  })

  it('should still render spacing classes', async () => {
    const wrapper = await mountSuspended(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    const html = wrapper.html()

    // Outer wrapper should have p-4 and space-y-6
    expect(html).toContain('p-4')
    expect(html).toContain('space-y-6')

    // Inner wrappers should have space-y-2
    expect(html).toContain('space-y-2')
  })
})
