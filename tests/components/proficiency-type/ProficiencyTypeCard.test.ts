import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProficiencyTypeCard from '~/components/proficiency-type/ProficiencyTypeCard.vue'

describe('ProficiencyTypeCard', () => {
  const mockProficiencyType = {
    id: 1,
    name: 'Light Armor',
    category: 'armor',
    subcategory: 'light'
  }

  it('displays proficiency type name as title', async () => {
    const wrapper = await mountSuspended(ProficiencyTypeCard, {
      props: { proficiencyType: mockProficiencyType }
    })

    expect(wrapper.text()).toContain('Light Armor')
  })

  it('displays category badge', async () => {
    const wrapper = await mountSuspended(ProficiencyTypeCard, {
      props: { proficiencyType: mockProficiencyType }
    })

    expect(wrapper.text()).toContain('armor')
  })

  it('displays subcategory badge when present', async () => {
    const wrapper = await mountSuspended(ProficiencyTypeCard, {
      props: { proficiencyType: mockProficiencyType }
    })

    expect(wrapper.text()).toContain('light')
  })

  it('handles missing subcategory gracefully', async () => {
    const noSubcategory = {
      id: 2,
      name: 'Simple Weapons',
      category: 'weapon',
      subcategory: null
    }

    const wrapper = await mountSuspended(ProficiencyTypeCard, {
      props: { proficiencyType: noSubcategory }
    })

    expect(wrapper.text()).toContain('Simple Weapons')
    expect(wrapper.text()).toContain('weapon')
    expect(wrapper.text()).not.toContain('null')
  })

  it('displays type category badge', async () => {
    const wrapper = await mountSuspended(ProficiencyTypeCard, {
      props: { proficiencyType: mockProficiencyType }
    })

    expect(wrapper.text()).toContain('Proficiency Type')
  })

  describe('background images', () => {
    it('computes background image URL correctly', async () => {
      const wrapper = await mountSuspended(ProficiencyTypeCard, {
        props: {
          proficiencyType: {
            id: 1,
            name: 'Light Armor',
            slug: 'light-armor',
            category: 'armor'
          }
        }
      })

      // Check that the background div exists and has the image style
      const html = wrapper.html()
      expect(html).toContain('light-armor.png')
    })
  })
})
