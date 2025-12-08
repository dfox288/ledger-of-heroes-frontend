import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import PersonalitySection from '~/components/character/wizard/PersonalitySection.vue'
import type { components } from '~/types/api/generated'

type EntityDataTableResource = components['schemas']['EntityDataTableResource']

// Mock personality data tables (from Acolyte background)
const mockDataTables: EntityDataTableResource[] = [
  {
    id: 301,
    table_name: 'Personality Trait',
    dice_type: 'd8',
    table_type: 'random',
    description: null,
    entries: [
      { id: 1, roll_min: 1, roll_max: 1, result_text: 'I idolize a particular hero.', level: null, sort_order: 0 },
      { id: 2, roll_min: 2, roll_max: 2, result_text: 'I can find common ground.', level: null, sort_order: 1 },
      { id: 3, roll_min: 3, roll_max: 3, result_text: 'I see omens everywhere.', level: null, sort_order: 2 },
      { id: 4, roll_min: 4, roll_max: 4, result_text: 'Nothing shakes my optimism.', level: null, sort_order: 3 },
      { id: 5, roll_min: 5, roll_max: 5, result_text: 'I quote sacred texts.', level: null, sort_order: 4 },
      { id: 6, roll_min: 6, roll_max: 6, result_text: 'I am tolerant of others.', level: null, sort_order: 5 },
      { id: 7, roll_min: 7, roll_max: 7, result_text: 'I enjoy fine food.', level: null, sort_order: 6 },
      { id: 8, roll_min: 8, roll_max: 8, result_text: 'I have little experience.', level: null, sort_order: 7 }
    ]
  },
  {
    id: 302,
    table_name: 'Ideal',
    dice_type: 'd6',
    table_type: 'random',
    description: null,
    entries: [
      { id: 10, roll_min: 1, roll_max: 1, result_text: 'Tradition. (Lawful)', level: null, sort_order: 0 },
      { id: 11, roll_min: 2, roll_max: 2, result_text: 'Charity. (Good)', level: null, sort_order: 1 },
      { id: 12, roll_min: 3, roll_max: 3, result_text: 'Change. (Chaotic)', level: null, sort_order: 2 },
      { id: 13, roll_min: 4, roll_max: 4, result_text: 'Power. (Lawful)', level: null, sort_order: 3 },
      { id: 14, roll_min: 5, roll_max: 5, result_text: 'Faith. (Lawful)', level: null, sort_order: 4 },
      { id: 15, roll_min: 6, roll_max: 6, result_text: 'Aspiration. (Any)', level: null, sort_order: 5 }
    ]
  },
  {
    id: 303,
    table_name: 'Bond',
    dice_type: 'd6',
    table_type: 'random',
    description: null,
    entries: [
      { id: 20, roll_min: 1, roll_max: 1, result_text: 'I would die for an ancient relic.', level: null, sort_order: 0 },
      { id: 21, roll_min: 2, roll_max: 2, result_text: 'I will get revenge.', level: null, sort_order: 1 },
      { id: 22, roll_min: 3, roll_max: 3, result_text: 'I owe my life to a priest.', level: null, sort_order: 2 },
      { id: 23, roll_min: 4, roll_max: 4, result_text: 'Everything for common people.', level: null, sort_order: 3 },
      { id: 24, roll_min: 5, roll_max: 5, result_text: 'I protect the temple.', level: null, sort_order: 4 },
      { id: 25, roll_min: 6, roll_max: 6, result_text: 'I preserve a sacred text.', level: null, sort_order: 5 }
    ]
  },
  {
    id: 304,
    table_name: 'Flaw',
    dice_type: 'd6',
    table_type: 'random',
    description: null,
    entries: [
      { id: 30, roll_min: 1, roll_max: 1, result_text: 'I judge harshly.', level: null, sort_order: 0 },
      { id: 31, roll_min: 2, roll_max: 2, result_text: 'I trust those in power.', level: null, sort_order: 1 },
      { id: 32, roll_min: 3, roll_max: 3, result_text: 'I blindly trust the faithful.', level: null, sort_order: 2 },
      { id: 33, roll_min: 4, roll_max: 4, result_text: 'I am inflexible.', level: null, sort_order: 3 },
      { id: 34, roll_min: 5, roll_max: 5, result_text: 'I am suspicious of strangers.', level: null, sort_order: 4 },
      { id: 35, roll_min: 6, roll_max: 6, result_text: 'I become obsessed with goals.', level: null, sort_order: 5 }
    ]
  }
]

describe('PersonalitySection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('rendering', () => {
    it('renders all 4 personality tables when data_tables provided', async () => {
      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: mockDataTables,
          backgroundName: 'Acolyte'
        }
      })

      expect(wrapper.text()).toContain('Personality Trait')
      expect(wrapper.text()).toContain('Ideal')
      expect(wrapper.text()).toContain('Bond')
      expect(wrapper.text()).toContain('Flaw')
    })

    it('shows background name in header', async () => {
      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: mockDataTables,
          backgroundName: 'Acolyte'
        }
      })

      expect(wrapper.text()).toContain('Acolyte')
    })

    it('renders Roll All and Clear All buttons', async () => {
      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: mockDataTables,
          backgroundName: 'Acolyte'
        }
      })

      expect(wrapper.find('[data-testid="roll-all-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="clear-all-button"]').exists()).toBe(true)
    })

    it('hides when dataTables is empty', async () => {
      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: [],
          backgroundName: 'Acolyte'
        }
      })

      // Should not render any content
      expect(wrapper.text()).not.toContain('Personality')
    })

    it('hides when dataTables has no personality tables', async () => {
      const nonPersonalityTables: EntityDataTableResource[] = [
        {
          id: 999,
          table_name: 'Random Encounter',
          dice_type: 'd20',
          table_type: 'random',
          description: null,
          entries: []
        }
      ]

      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: nonPersonalityTables,
          backgroundName: 'Acolyte'
        }
      })

      expect(wrapper.text()).not.toContain('Personality')
    })
  })

  describe('Roll All functionality', () => {
    it('rolls all 4 tables when Roll All clicked', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1) // Predictable random

      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: mockDataTables,
          backgroundName: 'Acolyte'
        }
      })

      const rollAllButton = wrapper.find('[data-testid="roll-all-button"]')
      await rollAllButton.trigger('click')

      // Check that selections were made (emitted values)
      const emitted = wrapper.emitted('update:selections')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toHaveProperty('traits')
      expect(emitted![0][0]).toHaveProperty('ideal')
      expect(emitted![0][0]).toHaveProperty('bond')
      expect(emitted![0][0]).toHaveProperty('flaw')
    })
  })

  describe('Clear All functionality', () => {
    it('clears all selections when Clear All clicked', async () => {
      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: mockDataTables,
          backgroundName: 'Acolyte',
          selections: {
            traits: ['I idolize a particular hero.', 'I see omens everywhere.'],
            ideal: 'Tradition. (Lawful)',
            bond: 'I protect the temple.',
            flaw: 'I judge harshly.'
          }
        }
      })

      const clearAllButton = wrapper.find('[data-testid="clear-all-button"]')
      await clearAllButton.trigger('click')

      const emitted = wrapper.emitted('update:selections')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toEqual({
        traits: [],
        ideal: null,
        bond: null,
        flaw: null
      })
    })
  })

  describe('selections exposure', () => {
    it('emits selection changes', async () => {
      const wrapper = await mountSuspended(PersonalitySection, {
        props: {
          dataTables: mockDataTables,
          backgroundName: 'Acolyte'
        }
      })

      // Find the first table picker and trigger a selection
      const firstOption = wrapper.find('[data-testid="entry-option"]')
      await firstOption.trigger('click')

      // Should have emitted update:selections
      expect(wrapper.emitted('update:selections')).toBeTruthy()
    })
  })
})
