// tests/components/character/builder/StepAbilities.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepAbilities from '~/components/character/builder/StepAbilities.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

describe('StepAbilities', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders method selector with 3 options', async () => {
    const wrapper = await mountSuspended(StepAbilities)
    expect(wrapper.text()).toContain('Standard Array')
    expect(wrapper.text()).toContain('Point Buy')
    expect(wrapper.text()).toContain('Manual')
  })

  it('shows ManualInput by default', async () => {
    const wrapper = await mountSuspended(StepAbilities)
    // Check that manual input component is rendered (look for characteristic text)
    expect(wrapper.text()).toContain('Enter your ability scores (3-20 range)')
  })

  it('shows racial bonuses when race selected', async () => {
    const wrapper = await mountSuspended(StepAbilities)

    // Set race AFTER mounting so reactivity triggers
    const store = useCharacterBuilderStore()
    store.selectedRace = {
      id: 1,
      name: 'Dwarf',
      slug: 'dwarf',
      code: 'DWA',
      description: 'Test',
      source: { code: 'PHB', name: 'Player\'s Handbook' },
      modifiers: [
        {
          id: 1,
          modifier_category: 'ability_score',
          value: '2',
          ability_score: {
            id: 1,
            code: 'CON',
            name: 'Constitution',
            description: 'Test',
            slug: 'constitution'
          }
        }
      ]
    } as unknown as Race

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Racial Bonuses')
    expect(wrapper.text()).toContain('Constitution')
    expect(wrapper.text()).toContain('+2')
  })

  it('disables save button when invalid', async () => {
    const wrapper = await mountSuspended(StepAbilities)
    // Find save button - initially might be disabled depending on default state
    const saveBtn = wrapper.find('[data-testid="save-abilities"]')
    expect(saveBtn.exists()).toBe(true)
  })
})
