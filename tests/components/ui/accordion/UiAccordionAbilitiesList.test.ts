import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordionAbilitiesList from '~/components/ui/accordion/UiAccordionAbilitiesList.vue'
import { testAccordionListBasics, testNameDescriptionPattern } from '#tests/helpers/accordionListBehavior'

describe('UiAccordionAbilitiesList', () => {
  const mockAbilities = [
    { id: 1, name: 'Spell Storing', description: 'Store a spell in the ring' },
    { id: 2, name: 'Fire Breath', description: 'Exhale a cone of fire' }
  ]

  // Common accordion list behavior tests (via helper)
  testAccordionListBasics({
    componentName: 'UiAccordionAbilitiesList',
    mountWithItems: items => mount(UiAccordionAbilitiesList, {
      props: { abilities: items }
    }),
    mockItems: mockAbilities,
    expectedTexts: ['Spell Storing', 'Store a spell in the ring', 'Fire Breath'],
    spacingClass: 'space-y-4'
  })

  // Name/description pattern tests (via helper)
  testNameDescriptionPattern(
    item => mount(UiAccordionAbilitiesList, {
      props: { abilities: [item] }
    })
  )

  // Component-specific tests
  it('applies highlighted background card', () => {
    const wrapper = mount(UiAccordionAbilitiesList, {
      props: { abilities: mockAbilities }
    })

    const card = wrapper.find('.p-4.rounded-lg')
    expect(card.exists()).toBe(true)
  })
})
