// tests/components/character/builder/ClassPickerCard.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ClassPickerCard from '~/components/character/builder/ClassPickerCard.vue'
import { createMockClass } from '../../../helpers/mockFactories'
import { testPickerCardBehavior } from '../../../helpers/pickerCardBehavior'

const mockClass = createMockClass({
  name: 'Fighter',
  slug: 'fighter',
  hit_die: 10,
  spellcasting_ability: null,
  primary_ability: { id: 1, code: 'STR', name: 'Strength' }
})

const mockCasterClass = createMockClass()
// Uses default Wizard with INT spellcasting from factory

describe('ClassPickerCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test common picker card behavior
  testPickerCardBehavior({
    component: ClassPickerCard,
    mockEntity: mockClass,
    entityName: 'Fighter',
    propName: 'characterClass'
  })

  // Class-specific tests
  describe('Class-specific behavior', () => {
    it('shows hit die', async () => {
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: mockClass, selected: false }
      })
      expect(wrapper.text()).toContain('d10')
    })

    it('shows spellcasting indicator for caster classes', async () => {
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: mockCasterClass, selected: false }
      })
      expect(wrapper.text()).toContain('Intelligence')
    })

    it('does not show spellcasting indicator for non-caster classes', async () => {
      const wrapper = await mountSuspended(ClassPickerCard, {
        props: { characterClass: mockClass, selected: false }
      })
      expect(wrapper.text()).not.toContain('Spellcasting')
    })
  })
})
