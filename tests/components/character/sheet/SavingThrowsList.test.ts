// tests/components/character/sheet/SavingThrowsList.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SavingThrowsList from '~/components/character/sheet/SavingThrowsList.vue'

const mockSavingThrows = [
  { ability: 'STR', modifier: 5, proficient: true },
  { ability: 'DEX', modifier: 2, proficient: false },
  { ability: 'CON', modifier: 4, proficient: true },
  { ability: 'INT', modifier: 0, proficient: false },
  { ability: 'WIS', modifier: 1, proficient: false },
  { ability: 'CHA', modifier: -1, proficient: false }
]

describe('CharacterSheetSavingThrowsList', () => {
  it('displays all 6 saving throws', async () => {
    const wrapper = await mountSuspended(SavingThrowsList, {
      props: { savingThrows: mockSavingThrows }
    })
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('CON')
    expect(wrapper.text()).toContain('INT')
    expect(wrapper.text()).toContain('WIS')
    expect(wrapper.text()).toContain('CHA')
  })

  it('displays modifiers with sign', async () => {
    const wrapper = await mountSuspended(SavingThrowsList, {
      props: { savingThrows: mockSavingThrows }
    })
    expect(wrapper.text()).toContain('+5')
    expect(wrapper.text()).toContain('+4')
    expect(wrapper.text()).toContain('-1')
  })

  it('shows proficiency indicator for proficient saves', async () => {
    const wrapper = await mountSuspended(SavingThrowsList, {
      props: { savingThrows: mockSavingThrows }
    })
    const proficientIndicators = wrapper.findAll('[data-test="proficient"]')
    expect(proficientIndicators.length).toBe(2) // STR and CON
  })
})
