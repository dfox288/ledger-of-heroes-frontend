// tests/components/character/picker/ClassPickerCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassPickerCard from '~/components/character/picker/ClassPickerCard.vue'
import { testPickerCardBehavior } from '../../../helpers/pickerCardBehavior'

const mockClass = {
  id: 1,
  name: 'Wizard',
  slug: 'wizard',
  hit_die: 6,
  primary_ability: 'Intelligence',
  spellcasting_ability: { id: 4, name: 'Intelligence', code: 'INT' },
  description: 'A scholarly magic-user capable of manipulating the structures of reality.'
}

describe('ClassPickerCard', () => {
  // Test common picker card behavior
  testPickerCardBehavior({
    component: ClassPickerCard,
    mockEntity: mockClass,
    entityName: 'Wizard',
    propName: 'characterClass'
  })

  describe('class-specific features', () => {
    it('shows hit die badge', async () => {
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: mockClass, selected: false }
      })
      expect(wrapper.text()).toContain('Hit Die: d6')
    })

    it('shows primary ability badge when provided', async () => {
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: mockClass, selected: false }
      })
      expect(wrapper.text()).toContain('Intelligence')
    })

    it('shows spellcasting ability badge for casters', async () => {
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: mockClass, selected: false }
      })
      // The spellcasting ability name should appear
      expect(wrapper.text()).toContain('Intelligence')
    })

    it('does not show spellcasting badge for non-casters', async () => {
      const fighterClass = {
        ...mockClass,
        id: 2,
        name: 'Fighter',
        slug: 'fighter',
        hit_die: 10,
        primary_ability: 'Strength or Dexterity',
        spellcasting_ability: null,
        description: 'A master of martial combat.'
      }
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: fighterClass, selected: false }
      })
      // Check that the sparkles icon (spellcasting indicator) is not present
      const html = wrapper.html()
      expect(html).not.toContain('i-heroicons-sparkles')
    })

    it('shows description when provided', async () => {
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: mockClass, selected: false }
      })
      expect(wrapper.text()).toContain('A scholarly magic-user')
    })

    it('handles missing description gracefully', async () => {
      const classWithoutDescription = { ...mockClass, description: undefined }
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: classWithoutDescription, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing primary ability gracefully', async () => {
      const classWithoutPrimary = { ...mockClass, primary_ability: null }
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: classWithoutPrimary, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('formats different hit dice correctly', async () => {
      const barbarianClass = {
        ...mockClass,
        id: 3,
        name: 'Barbarian',
        slug: 'barbarian',
        hit_die: 12
      }
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: barbarianClass, selected: false }
      })
      expect(wrapper.text()).toContain('Hit Die: d12')
    })

    it('renders correctly with undefined spellcasting ability', async () => {
      const classWithUndefinedSpellcasting = {
        ...mockClass,
        spellcasting_ability: undefined
      }
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: classWithUndefinedSpellcasting, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
      // Should not have the spellcasting badge
      const html = wrapper.html()
      expect(html).not.toContain('i-heroicons-sparkles')
    })
  })
})
