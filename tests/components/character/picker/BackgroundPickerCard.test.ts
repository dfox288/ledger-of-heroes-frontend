// tests/components/character/picker/BackgroundPickerCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundPickerCard from '~/components/character/picker/BackgroundPickerCard.vue'
import { testPickerCardBehavior } from '../../../helpers/pickerCardBehavior'
import { createMockBackground } from '../../../helpers/mockFactories'

const mockBackground = createMockBackground({
  name: 'Soldier',
  slug: 'soldier',
  feature_name: 'Military Rank',
  proficiencies: [
    {
      id: 1,
      proficiency_type: 'skill',
      proficiency_subcategory: null,
      proficiency_type_id: null,
      skill: { id: 4, name: 'Athletics', code: 'ATH', description: null, ability_score: null },
      proficiency_name: 'Athletics',
      grants: true,
      is_choice: false,
      quantity: 1
    },
    {
      id: 2,
      proficiency_type: 'skill',
      proficiency_subcategory: null,
      proficiency_type_id: null,
      skill: { id: 10, name: 'Intimidation', code: 'INT', description: null, ability_score: null },
      proficiency_name: 'Intimidation',
      grants: true,
      is_choice: false,
      quantity: 1
    },
    {
      id: 3,
      proficiency_type: 'tool',
      proficiency_subcategory: null,
      proficiency_type_id: null,
      skill: null,
      proficiency_name: 'Tool',
      grants: true,
      is_choice: false,
      quantity: 1
    }
  ],
  languages: [
    { language: { id: 1, name: 'Common' }, is_choice: false }
  ]
})

describe('BackgroundPickerCard', () => {
  // Test common picker card behavior
  testPickerCardBehavior({
    component: BackgroundPickerCard,
    mockEntity: mockBackground,
    entityName: 'Soldier',
    propName: 'background'
  })

  describe('background-specific features', () => {
    it('shows feature name badge when provided', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })
      expect(wrapper.text()).toContain('Military Rank')
    })

    it('shows skill proficiencies', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })
      expect(wrapper.text()).toContain('Athletics')
      expect(wrapper.text()).toContain('Intimidation')
    })

    it('shows skills separated by commas', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })
      expect(wrapper.text()).toContain('Athletics, Intimidation')
    })

    it('does not show non-skill proficiencies in skills list', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })
      // The tool proficiency should not appear
      const text = wrapper.text()
      // Should only show skill names, not the tool type
      expect(text).not.toContain('tool')
    })

    it('shows language count with singular form', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })
      expect(wrapper.text()).toContain('1 Language')
      expect(wrapper.text()).not.toContain('1 Languages')
    })

    it('shows language count with plural form', async () => {
      const backgroundWithMultipleLanguages = {
        ...mockBackground,
        languages: [
          { id: 1, name: 'Common', code: 'COMM' },
          { id: 2, name: 'Elvish', code: 'ELV' }
        ]
      }
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: backgroundWithMultipleLanguages, selected: false }
      })
      expect(wrapper.text()).toContain('2 Languages')
    })

    it('does not show language section when no languages', async () => {
      const backgroundWithoutLanguages = {
        ...mockBackground,
        languages: []
      }
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: backgroundWithoutLanguages, selected: false }
      })
      expect(wrapper.text()).not.toContain('Language')
    })

    it('handles missing feature name gracefully', async () => {
      const backgroundWithoutFeature = { ...mockBackground, feature_name: undefined }
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: backgroundWithoutFeature, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing proficiencies gracefully', async () => {
      const backgroundWithoutProficiencies = { ...mockBackground, proficiencies: undefined }
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: backgroundWithoutProficiencies, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles empty proficiencies gracefully', async () => {
      const backgroundWithEmptyProficiencies = { ...mockBackground, proficiencies: [] }
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: backgroundWithEmptyProficiencies, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('handles missing languages gracefully', async () => {
      const backgroundWithoutLanguages = { ...mockBackground, languages: undefined }
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: backgroundWithoutLanguages, selected: false }
      })
      expect(wrapper.html()).toBeTruthy()
    })

    it('shows selected checkmark when selected', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: true }
      })
      const selectedCheck = wrapper.find('[data-testid="selected-check"]')
      expect(selectedCheck.exists()).toBe(true)
    })

    it('does not show selected checkmark when not selected', async () => {
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: mockBackground, selected: false }
      })
      const selectedCheck = wrapper.find('[data-testid="selected-check"]')
      expect(selectedCheck.exists()).toBe(false)
    })

    it('filters proficiencies with null skills', async () => {
      const backgroundWithNullSkill = {
        ...mockBackground,
        proficiencies: [
          {
            id: 1,
            proficiency_type: 'skill',
            skill: { id: 4, name: 'Athletics', code: 'ATH' }
          },
          {
            id: 2,
            proficiency_type: 'skill',
            skill: null
          }
        ]
      }
      const wrapper = await mountSuspended(BackgroundPickerCard, {
        props: { background: backgroundWithNullSkill, selected: false }
      })
      expect(wrapper.text()).toContain('Athletics')
      // Should not throw or show null
      expect(wrapper.text()).not.toContain('null')
    })
  })
})
