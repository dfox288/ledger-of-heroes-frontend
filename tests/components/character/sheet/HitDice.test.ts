// tests/components/character/sheet/HitDice.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HitDice from '~/components/character/sheet/HitDice.vue'

describe('CharacterSheetHitDice', () => {
  it('displays title', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: { hitDice: [] }
    })
    expect(wrapper.text()).toContain('Hit Dice')
  })

  it('displays empty state when no hit dice', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: { hitDice: [] }
    })
    // Should show title but no dice rows
    expect(wrapper.text()).toContain('Hit Dice')
    const diceRows = wrapper.findAll('[data-testid^="dice-row"]')
    expect(diceRows.length).toBe(0)
  })

  it('displays single die type with all dice available', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [{ die: 'd10', total: 5, current: 5 }]
      }
    })
    expect(wrapper.text()).toContain('d10')
    const filledDice = wrapper.findAll('[data-testid="dice-d10-filled"]')
    const emptyDice = wrapper.findAll('[data-testid="dice-d10-empty"]')
    expect(filledDice.length).toBe(5)
    expect(emptyDice.length).toBe(0)
  })

  it('displays single die type with some dice used', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [{ die: 'd8', total: 4, current: 2 }]
      }
    })
    expect(wrapper.text()).toContain('d8')
    const filledDice = wrapper.findAll('[data-testid="dice-d8-filled"]')
    const emptyDice = wrapper.findAll('[data-testid="dice-d8-empty"]')
    expect(filledDice.length).toBe(2)
    expect(emptyDice.length).toBe(2)
  })

  it('displays single die type with all dice used', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [{ die: 'd6', total: 3, current: 0 }]
      }
    })
    expect(wrapper.text()).toContain('d6')
    const filledDice = wrapper.findAll('[data-testid="dice-d6-filled"]')
    const emptyDice = wrapper.findAll('[data-testid="dice-d6-empty"]')
    expect(filledDice.length).toBe(0)
    expect(emptyDice.length).toBe(3)
  })

  it('displays multiclass with multiple die types', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [
          { die: 'd10', total: 5, current: 3 },
          { die: 'd8', total: 2, current: 1 }
        ]
      }
    })
    expect(wrapper.text()).toContain('d10')
    expect(wrapper.text()).toContain('d8')

    // Check d10 dice
    const filledD10 = wrapper.findAll('[data-testid="dice-d10-filled"]')
    const emptyD10 = wrapper.findAll('[data-testid="dice-d10-empty"]')
    expect(filledD10.length).toBe(3)
    expect(emptyD10.length).toBe(2)

    // Check d8 dice
    const filledD8 = wrapper.findAll('[data-testid="dice-d8-filled"]')
    const emptyD8 = wrapper.findAll('[data-testid="dice-d8-empty"]')
    expect(filledD8.length).toBe(1)
    expect(emptyD8.length).toBe(1)
  })

  it('displays multiclass with three die types', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [
          { die: 'd12', total: 2, current: 2 },
          { die: 'd10', total: 3, current: 1 },
          { die: 'd6', total: 1, current: 0 }
        ]
      }
    })
    expect(wrapper.text()).toContain('d12')
    expect(wrapper.text()).toContain('d10')
    expect(wrapper.text()).toContain('d6')

    const diceRows = wrapper.findAll('[data-testid^="dice-row"]')
    expect(diceRows.length).toBe(3)
  })

  it('displays count text (current/total)', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [{ die: 'd10', total: 5, current: 3 }]
      }
    })
    expect(wrapper.text()).toContain('3/5')
  })

  it('displays count text for multiclass', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [
          { die: 'd10', total: 5, current: 3 },
          { die: 'd8', total: 2, current: 2 }
        ]
      }
    })
    expect(wrapper.text()).toContain('3/5')
    expect(wrapper.text()).toContain('2/2')
  })

  it('handles large number of dice gracefully', async () => {
    const wrapper = await mountSuspended(HitDice, {
      props: {
        hitDice: [{ die: 'd8', total: 20, current: 15 }]
      }
    })
    // Component should still render without errors
    expect(wrapper.text()).toContain('d8')
    expect(wrapper.text()).toContain('15/20')
  })
})
