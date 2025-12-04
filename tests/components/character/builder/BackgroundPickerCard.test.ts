import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundPickerCard from '~/components/character/builder/BackgroundPickerCard.vue'
import { createMockBackground } from '../../../helpers/mockFactories'
import { testPickerCardBehavior } from '../../../helpers/pickerCardBehavior'

const mockBackground = createMockBackground()
// Uses default Acolyte with Insight, Religion skills; 2 languages

describe('BackgroundPickerCard', () => {
  // Test common picker card behavior
  testPickerCardBehavior({
    component: BackgroundPickerCard,
    mockEntity: mockBackground,
    entityName: 'Acolyte',
    propName: 'background'
  })

  // Background-specific tests
  describe('Background-specific behavior', () => {
    it('displays feature name badge', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })

      expect(wrapper.text()).toContain('Shelter of the Faithful')
    })

    it('displays skill proficiencies', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })

      expect(wrapper.text()).toContain('Insight')
      expect(wrapper.text()).toContain('Religion')
    })
  })
})
