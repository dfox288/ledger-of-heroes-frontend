import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PersonalityTablePicker from '~/components/character/wizard/PersonalityTablePicker.vue'
import type { components } from '~/types/api/generated'

type EntityDataTableResource = components['schemas']['EntityDataTableResource']

// Mock data table for Personality Traits (d8, pick 2)
const mockTraitsTable: EntityDataTableResource = {
  id: 301,
  table_name: 'Personality Trait',
  dice_type: 'd8',
  table_type: 'random',
  description: null,
  entries: [
    { id: 1, roll_min: 1, roll_max: 1, result_text: 'I idolize a particular hero of my faith.', level: null, sort_order: 0 },
    { id: 2, roll_min: 2, roll_max: 2, result_text: 'I can find common ground between enemies.', level: null, sort_order: 1 },
    { id: 3, roll_min: 3, roll_max: 3, result_text: 'I see omens in every event and action.', level: null, sort_order: 2 },
    { id: 4, roll_min: 4, roll_max: 4, result_text: 'Nothing can shake my optimistic attitude.', level: null, sort_order: 3 },
    { id: 5, roll_min: 5, roll_max: 5, result_text: 'I quote sacred texts in almost every situation.', level: null, sort_order: 4 },
    { id: 6, roll_min: 6, roll_max: 6, result_text: 'I am tolerant of other faiths.', level: null, sort_order: 5 },
    { id: 7, roll_min: 7, roll_max: 7, result_text: 'I have enjoyed fine food and high society.', level: null, sort_order: 6 },
    { id: 8, roll_min: 8, roll_max: 8, result_text: 'I have little practical experience.', level: null, sort_order: 7 }
  ]
}

// Mock data table for Ideal (d6, pick 1)
const mockIdealTable: EntityDataTableResource = {
  id: 302,
  table_name: 'Ideal',
  dice_type: 'd6',
  table_type: 'random',
  description: null,
  entries: [
    { id: 10, roll_min: 1, roll_max: 1, result_text: 'Tradition. The ancient traditions must be preserved. (Lawful)', level: null, sort_order: 0 },
    { id: 11, roll_min: 2, roll_max: 2, result_text: 'Charity. I always try to help those in need. (Good)', level: null, sort_order: 1 },
    { id: 12, roll_min: 3, roll_max: 3, result_text: 'Change. We must help bring about change. (Chaotic)', level: null, sort_order: 2 },
    { id: 13, roll_min: 4, roll_max: 4, result_text: 'Power. I hope to rise to the top. (Lawful)', level: null, sort_order: 3 },
    { id: 14, roll_min: 5, roll_max: 5, result_text: 'Faith. I trust that my deity will guide me. (Lawful)', level: null, sort_order: 4 },
    { id: 15, roll_min: 6, roll_max: 6, result_text: 'Aspiration. I seek to prove myself worthy. (Any)', level: null, sort_order: 5 }
  ]
}

describe('PersonalityTablePicker', () => {
  describe('rendering', () => {
    it('renders table name and dice type in header', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [],
          maxSelections: 2
        }
      })

      expect(wrapper.text()).toContain('Personality Trait')
      expect(wrapper.text()).toContain('d8')
    })

    it('renders all entries from data table', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [],
          maxSelections: 2
        }
      })

      // Should render all 8 entries
      for (const entry of mockTraitsTable.entries!) {
        expect(wrapper.text()).toContain(entry.result_text)
      }
    })

    it('shows roll number prefix for each entry', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockIdealTable,
          modelValue: [],
          maxSelections: 1
        }
      })

      // Should show roll numbers 1-6
      expect(wrapper.text()).toMatch(/1\.\s*Tradition/)
      expect(wrapper.text()).toMatch(/2\.\s*Charity/)
    })

    it('renders Roll button', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [],
          maxSelections: 2
        }
      })

      const rollButton = wrapper.find('[data-testid="roll-button"]')
      expect(rollButton.exists()).toBe(true)
    })
  })

  describe('single selection mode (maxSelections=1)', () => {
    it('uses radio-style selection', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockIdealTable,
          modelValue: [],
          maxSelections: 1
        }
      })

      // Click first option
      const options = wrapper.findAll('[data-testid="entry-option"]')
      await options[0].trigger('click')

      // Should emit with single value
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Tradition. The ancient traditions must be preserved. (Lawful)']])
    })

    it('selecting new option replaces previous selection', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockIdealTable,
          modelValue: ['Tradition. The ancient traditions must be preserved. (Lawful)'],
          maxSelections: 1
        }
      })

      // Click second option
      const options = wrapper.findAll('[data-testid="entry-option"]')
      await options[1].trigger('click')

      // Should emit with new single value (not array of 2)
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Charity. I always try to help those in need. (Good)']])
    })
  })

  describe('multi selection mode (maxSelections=2)', () => {
    it('allows selecting up to maxSelections items', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [],
          maxSelections: 2
        }
      })

      const options = wrapper.findAll('[data-testid="entry-option"]')

      // Select first
      await options[0].trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['I idolize a particular hero of my faith.']])

      // Update prop to reflect selection
      await wrapper.setProps({ modelValue: ['I idolize a particular hero of my faith.'] })

      // Select second
      await options[1].trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[
        'I idolize a particular hero of my faith.',
        'I can find common ground between enemies.'
      ]])
    })

    it('disables unselected options when max reached', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [
            'I idolize a particular hero of my faith.',
            'I can find common ground between enemies.'
          ],
          maxSelections: 2
        }
      })

      // Third option should be disabled
      const options = wrapper.findAll('[data-testid="entry-option"]')
      expect(options[2].classes()).toContain('opacity-50')
    })

    it('allows deselecting to make room for new selection', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [
            'I idolize a particular hero of my faith.',
            'I can find common ground between enemies.'
          ],
          maxSelections: 2
        }
      })

      // Click first option to deselect
      const options = wrapper.findAll('[data-testid="entry-option"]')
      await options[0].trigger('click')

      // Should emit with only second item
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['I can find common ground between enemies.']])
    })
  })

  describe('roll functionality', () => {
    beforeEach(() => {
      // Mock Math.random for predictable tests
      vi.spyOn(Math, 'random')
    })

    it('roll button selects random entry in single mode', async () => {
      // Mock to return first entry (0 * 6 = 0, floor = 0)
      vi.mocked(Math.random).mockReturnValue(0)

      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockIdealTable,
          modelValue: [],
          maxSelections: 1
        }
      })

      const rollButton = wrapper.find('[data-testid="roll-button"]')
      await rollButton.trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Tradition. The ancient traditions must be preserved. (Lawful)']])
    })

    it('roll button selects multiple unique entries in multi mode', async () => {
      // Mock to return indices 0, then 1
      vi.mocked(Math.random)
        .mockReturnValueOnce(0)    // First roll: index 0
        .mockReturnValueOnce(0.15) // Second roll: index 1 (0.15 * 8 = 1.2, floor = 1)

      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [],
          maxSelections: 2
        }
      })

      const rollButton = wrapper.find('[data-testid="roll-button"]')
      await rollButton.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
      expect(emitted).toHaveLength(2)
      // Should be unique values
      expect(new Set(emitted).size).toBe(2)
    })
  })

  describe('selection indicator', () => {
    it('shows selection count when items selected', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: ['I idolize a particular hero of my faith.'],
          maxSelections: 2
        }
      })

      expect(wrapper.text()).toContain('1 of 2')
    })

    it('shows completed state when all selections made', async () => {
      const wrapper = await mountSuspended(PersonalityTablePicker, {
        props: {
          table: mockTraitsTable,
          modelValue: [
            'I idolize a particular hero of my faith.',
            'I can find common ground between enemies.'
          ],
          maxSelections: 2
        }
      })

      expect(wrapper.text()).toContain('2 of 2')
    })
  })
})
