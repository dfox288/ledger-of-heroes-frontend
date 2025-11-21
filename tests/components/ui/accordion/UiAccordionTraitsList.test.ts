import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionTraitsList from '~/components/ui/accordion/UiAccordionTraitsList.vue'

describe('UiAccordionTraitsList', () => {
  it('renders trait names', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Darkvision', description: 'You can see in the dark' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Darkvision')
  })

  it('renders trait descriptions', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Brave', description: 'You have advantage on saving throws against being frightened' }
        ]
      }
    })

    expect(wrapper.text()).toContain('You have advantage on saving throws against being frightened')
  })

  it('renders multiple traits', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Trait 1', description: 'Description 1' },
          { id: 2, name: 'Trait 2', description: 'Description 2' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Trait 1')
    expect(wrapper.text()).toContain('Trait 2')
  })

  it('renders level badge when showLevel is true', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Ability Score Improvement', description: 'Increase stats', level: 4 }
        ],
        showLevel: true
      }
    })

    expect(wrapper.text()).toContain('Level 4')
  })

  it('renders category badge when showCategory is true', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Sneak Attack', description: 'Extra damage', category: 'Combat' }
        ],
        showCategory: true
      }
    })

    expect(wrapper.text()).toContain('Combat')
  })

  it('uses feature_name when provided', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'base_name', description: 'Test', feature_name: 'Custom Feature Name' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Custom Feature Name')
    expect(wrapper.text()).not.toContain('base_name')
  })

  it('applies correct spacing', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Test', description: 'Test' }
        ]
      }
    })

    const container = wrapper.find('.p-4')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('space-y-3')
  })

  it('applies border color', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Test', description: 'Test' }
        ],
        borderColor: 'red-500'
      }
    })

    const border = wrapper.find('.border-l-4')
    expect(border.exists()).toBe(true)
    expect(border.classes()).toContain('border-red-500')
  })

  it('applies dark mode support', async () => {
    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: [
          { id: 1, name: 'Test', description: 'Test description' }
        ]
      }
    })

    // Name should have dark mode classes
    const name = wrapper.find('.font-semibold')
    expect(name.classes()).toContain('text-gray-900')
    expect(name.classes()).toContain('dark:text-gray-100')

    // Description should have dark mode classes
    const description = wrapper.find('.text-gray-700')
    expect(description.classes()).toContain('dark:text-gray-300')
  })

  // Integration tests for random tables (GREEN phase - tables now render)
  it('renders random tables when trait has them', async () => {
    const traitsWithTables = [
      {
        id: 1,
        name: 'Test Trait',
        description: 'A trait with tables',
        random_tables: [
          {
            id: 1,
            table_name: 'Test Table',
            dice_type: 'd10',
            description: null,
            entries: [
              {
                id: 1,
                roll_min: 1,
                roll_max: 1,
                result_text: 'Result 1',
                sort_order: 0
              }
            ]
          }
        ]
      }
    ]

    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: { traits: traitsWithTables }
    })

    // Verify random tables component is rendered (GREEN phase - now working!)
    expect(wrapper.find('table').exists()).toBe(true) // Tables render now!
    expect(wrapper.text()).toContain('Test Table')
    expect(wrapper.text()).toContain('(d10)')
    expect(wrapper.text()).toContain('Result 1')
  })

  it('does not render random tables when array is empty', async () => {
    const traitsWithoutTables = [
      {
        id: 1,
        name: 'Test Trait',
        description: 'A trait without tables',
        random_tables: []
      }
    ]

    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: { traits: traitsWithoutTables }
    })

    // Should not render any table elements
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('passes borderColor to random tables component', async () => {
    const traitsWithTables = [
      {
        id: 1,
        name: 'Test Trait',
        description: 'A trait with tables',
        random_tables: [
          {
            id: 1,
            table_name: 'Test Table',
            dice_type: 'd6',
            description: null,
            entries: [
              {
                id: 1,
                roll_min: 1,
                roll_max: 1,
                result_text: 'Result',
                sort_order: 0
              }
            ]
          }
        ]
      }
    ]

    const wrapper = await mountSuspended(UiAccordionTraitsList, {
      props: {
        traits: traitsWithTables,
        borderColor: 'purple-500'
      }
    })

    // Component should render without errors
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Table')
  })
})
