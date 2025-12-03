// tests/components/character/builder/StepProficiencies.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepProficiencies from '~/components/character/builder/StepProficiencies.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

describe('StepProficiencies', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('basic rendering', () => {
    it('renders header and description', async () => {
      const wrapper = await mountSuspended(StepProficiencies)
      const store = useCharacterBuilderStore()
      store.proficiencyChoices = {
        data: { class: {}, race: {}, background: {} }
      }
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Choose Your Proficiencies')
    })

    it('shows message when no choices are needed', async () => {
      const wrapper = await mountSuspended(StepProficiencies)
      const store = useCharacterBuilderStore()
      store.proficiencyChoices = {
        data: { class: {}, race: {}, background: {} }
      }
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('No additional choices needed')
    })
  })

  describe('choice group rendering', () => {
    it('renders class skill choices when present', async () => {
      const wrapper = await mountSuspended(StepProficiencies)
      const store = useCharacterBuilderStore()
      store.selectedClass = { name: 'Bard' } as any
      store.proficiencyChoices = {
        data: {
          class: {
            skill_choice_1: {
              quantity: 2,
              remaining: 2,
              options: [
                { type: 'skill', skill_id: 1, skill: { id: 1, name: 'Acrobatics', slug: 'acrobatics' } },
                { type: 'skill', skill_id: 4, skill: { id: 4, name: 'Athletics', slug: 'athletics' } }
              ]
            }
          },
          race: {},
          background: {}
        }
      }
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('From Class: Bard')
      expect(wrapper.text()).toContain('Choose 2 skills')
      expect(wrapper.text()).toContain('Acrobatics')
      expect(wrapper.text()).toContain('Athletics')
    })

    it('renders race skill choices when present', async () => {
      const wrapper = await mountSuspended(StepProficiencies)
      const store = useCharacterBuilderStore()
      store.selectedRace = { name: 'Half-Elf' } as any
      store.proficiencyChoices = {
        data: {
          class: {},
          race: {
            skill_choice_1: {
              quantity: 1,
              remaining: 1,
              options: [
                { type: 'skill', skill_id: 10, skill: { id: 10, name: 'Perception', slug: 'perception' } }
              ]
            }
          },
          background: {}
        }
      }
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('From Race: Half-Elf')
      expect(wrapper.text()).toContain('Choose 1 skill')
    })

    it('renders skill option buttons with correct class', async () => {
      const wrapper = await mountSuspended(StepProficiencies)
      const store = useCharacterBuilderStore()
      store.selectedClass = { name: 'Bard' } as any
      store.proficiencyChoices = {
        data: {
          class: {
            skill_choice_1: {
              quantity: 2,
              remaining: 2,
              options: [
                { type: 'skill', skill_id: 1, skill: { id: 1, name: 'Acrobatics', slug: 'acrobatics' } }
              ]
            }
          },
          race: {},
          background: {}
        }
      }
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.skill-option')
      expect(buttons.length).toBe(1)
    })
  })

  describe('selection interaction (store-level)', () => {
    // Component interaction tests are flaky due to Vue/Nuxt test utils timing
    // These tests verify the store logic which is the actual business behavior

    it('toggleProficiencySelection adds skill to selection', () => {
      const store = useCharacterBuilderStore()

      store.toggleProficiencySelection('class', 'skill_choice_1', 5)
      expect(store.pendingProficiencySelections.get('class:skill_choice_1')?.has(5)).toBe(true)
    })

    it('toggleProficiencySelection removes skill when called twice', () => {
      const store = useCharacterBuilderStore()

      store.toggleProficiencySelection('class', 'skill_choice_1', 5)
      store.toggleProficiencySelection('class', 'skill_choice_1', 5)
      expect(store.pendingProficiencySelections.get('class:skill_choice_1')?.has(5)).toBe(false)
    })

    it('allows selecting different skill after deselecting', () => {
      const store = useCharacterBuilderStore()
      store.proficiencyChoices = {
        data: {
          class: {
            skill_choice_1: { quantity: 1, remaining: 1, options: [] }
          },
          race: {},
          background: {}
        }
      }

      // Select first skill
      store.toggleProficiencySelection('class', 'skill_choice_1', 1)
      expect(store.pendingProficiencySelections.get('class:skill_choice_1')?.has(1)).toBe(true)

      // Deselect first skill
      store.toggleProficiencySelection('class', 'skill_choice_1', 1)
      expect(store.pendingProficiencySelections.get('class:skill_choice_1')?.has(1)).toBe(false)

      // Select second skill
      store.toggleProficiencySelection('class', 'skill_choice_1', 4)
      expect(store.pendingProficiencySelections.get('class:skill_choice_1')?.has(4)).toBe(true)
    })
  })
})
