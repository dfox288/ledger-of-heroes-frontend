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

  // ============================================================================
  // Play Mode (editable) Tests
  // ============================================================================

  describe('play mode (editable)', () => {
    it('does not show rest buttons when editable is false', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: false
        }
      })
      expect(wrapper.find('[data-testid="short-rest-btn"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="long-rest-btn"]').exists()).toBe(false)
    })

    it('shows rest buttons when editable is true', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: true
        }
      })
      expect(wrapper.find('[data-testid="short-rest-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="long-rest-btn"]').exists()).toBe(true)
    })

    it('emits spend event when clicking a filled die', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: true
        }
      })

      const filledDie = wrapper.find('[data-testid="dice-d8-filled"]')
      await filledDie.trigger('click')

      const emitted = wrapper.emitted('spend')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual([{ dieType: 'd8' }])
    })

    it('does not emit spend event when clicking an empty die', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 1 }],
          editable: true
        }
      })

      const emptyDie = wrapper.find('[data-testid="dice-d8-empty"]')
      await emptyDie.trigger('click')

      expect(wrapper.emitted('spend')).toBeFalsy()
    })

    it('does not emit spend event when editable is false', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: false
        }
      })

      const filledDie = wrapper.find('[data-testid="dice-d8-filled"]')
      await filledDie.trigger('click')

      expect(wrapper.emitted('spend')).toBeFalsy()
    })

    it('emits short-rest event when clicking short rest button', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: true
        }
      })

      await wrapper.find('[data-testid="short-rest-btn"]').trigger('click')

      expect(wrapper.emitted('short-rest')).toBeTruthy()
    })

    it('emits long-rest event when clicking long rest button', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: true
        }
      })

      await wrapper.find('[data-testid="long-rest-btn"]').trigger('click')

      expect(wrapper.emitted('long-rest')).toBeTruthy()
    })

    it('shows filled dice as clickable when editable', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: true
        }
      })

      const filledDie = wrapper.find('[data-testid="dice-d8-filled"]')
      expect(filledDie.classes()).toContain('cursor-pointer')
    })

    it('does not show filled dice as clickable when not editable', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 2 }],
          editable: false
        }
      })

      const filledDie = wrapper.find('[data-testid="dice-d8-filled"]')
      expect(filledDie.classes()).not.toContain('cursor-pointer')
    })

    it('disables spend when no dice available', async () => {
      const wrapper = await mountSuspended(HitDice, {
        props: {
          hitDice: [{ die: 'd8', total: 3, current: 0 }],
          editable: true
        }
      })

      // All dice are empty, none should be clickable
      const filledDice = wrapper.findAll('[data-testid="dice-d8-filled"]')
      expect(filledDice.length).toBe(0)
    })
  })
})
