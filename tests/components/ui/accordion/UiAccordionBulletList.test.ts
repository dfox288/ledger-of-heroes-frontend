import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionBulletList from '~/components/ui/accordion/UiAccordionBulletList.vue'

describe('UiAccordionBulletList', () => {
  const mockItems = [
    { id: 1, proficiency_name: 'Stealth' },
    { id: 2, proficiency_name: 'Perception' },
    { id: 3, proficiency_name: 'Athletics' }
  ]

  it('renders bullet list with proficiency names', async () => {
    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: mockItems }
    })

    const text = wrapper.text()
    expect(text).toContain('• Stealth')
    expect(text).toContain('• Perception')
    expect(text).toContain('• Athletics')
  })

  it('uses name property when proficiency_name is not available', async () => {
    const itemsWithNameOnly = [
      { id: 1, name: 'Common' },
      { id: 2, name: 'Elvish' }
    ]

    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: itemsWithNameOnly }
    })

    const text = wrapper.text()
    expect(text).toContain('• Common')
    expect(text).toContain('• Elvish')
  })

  it('prefers proficiency_name over name when both are present', async () => {
    const itemsWithBoth = [
      { id: 1, proficiency_name: 'Tool Proficiency: Smith\'s Tools', name: 'Smith\'s Tools' }
    ]

    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: itemsWithBoth }
    })

    const text = wrapper.text()
    expect(text).toContain('• Tool Proficiency: Smith\'s Tools')
    expect(text).not.toContain('• Smith\'s Tools')
  })

  it('renders empty state when items array is empty', async () => {
    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: [] }
    })

    // Should render container but no bullets
    expect(wrapper.find('.p-4').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('•')
  })

  it('renders correct number of items', async () => {
    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: mockItems }
    })

    const bullets = wrapper.text().match(/•/g)
    expect(bullets).toBeTruthy()
    expect(bullets!.length).toBe(3)
  })

  it('applies correct styling classes', async () => {
    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: mockItems }
    })

    // Check container styling
    const container = wrapper.find('.p-4')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('space-y-2')

    // Check item styling
    const items = wrapper.findAll('.text-gray-700')
    expect(items.length).toBe(3)
  })

  it('uses id as key for v-for rendering', async () => {
    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: mockItems }
    })

    // Verify all items rendered (indirect check via text content)
    const text = wrapper.text()
    mockItems.forEach(item => {
      expect(text).toContain(item.proficiency_name!)
    })
  })

  it('handles single item correctly', async () => {
    const singleItem = [{ id: 1, proficiency_name: 'Investigation' }]

    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: singleItem }
    })

    const text = wrapper.text()
    expect(text).toContain('• Investigation')
    const bullets = text.match(/•/g)
    expect(bullets!.length).toBe(1)
  })

  it('handles items with long names', async () => {
    const longNameItems = [
      {
        id: 1,
        proficiency_name: 'Tool Proficiency: Thieves\' Tools (includes lockpicking and disarming traps)'
      }
    ]

    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: longNameItems }
    })

    const text = wrapper.text()
    expect(text).toContain('Tool Proficiency: Thieves\' Tools')
  })

  it('supports dark mode styling', async () => {
    const wrapper = await mountSuspended(UiAccordionBulletList, {
      props: { items: mockItems }
    })

    const items = wrapper.findAll('.text-gray-700')
    items.forEach(item => {
      expect(item.classes()).toContain('dark:text-gray-300')
    })
  })
})
