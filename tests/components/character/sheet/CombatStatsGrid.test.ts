// tests/components/character/sheet/CombatStatsGrid.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CombatStatsGrid from '~/components/character/sheet/CombatStatsGrid.vue'

const mockCharacter = {
  speed: 30,
  proficiency_bonus: 2,
  has_inspiration: false
}

const mockStats = {
  armor_class: 16,
  hit_points: { max: 28, current: 22, temporary: 5 },
  initiative_bonus: 2,
  passive_perception: 14,
  passive_investigation: 10,
  passive_insight: 11
}

// Character with Barbarian class (has Unarmored Defense: 10 + DEX + CON)
const mockBarbarianCharacter = {
  speed: 30,
  proficiency_bonus: 2,
  has_inspiration: false,
  classes: [
    {
      class: { id: 1, name: 'Barbarian', slug: 'phb:barbarian' },
      level: 1,
      is_primary: true
    }
  ],
  equipped: {
    armor: null,
    shield: null
  },
  modifiers: {
    STR: 2,
    DEX: 2,
    CON: 3,
    INT: 0,
    WIS: 1,
    CHA: -1
  }
}

// Character with armor equipped
const mockArmoredCharacter = {
  speed: 30,
  proficiency_bonus: 2,
  has_inspiration: false,
  classes: [
    {
      class: { id: 1, name: 'Fighter', slug: 'phb:fighter' },
      level: 1,
      is_primary: true
    }
  ],
  equipped: {
    armor: { id: '123', name: 'Chain Mail', armor_class: '16' },
    shield: null
  },
  modifiers: {
    STR: 2,
    DEX: 1,
    CON: 2,
    INT: 0,
    WIS: 1,
    CHA: 0
  }
}

describe('CharacterSheetCombatStatsGrid', () => {
  it('displays hit points as current/max', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('22')
    expect(wrapper.text()).toContain('28')
  })

  it('displays armor class', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('16')
    expect(wrapper.text()).toContain('AC')
  })

  it('displays initiative bonus', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('Initiative')
  })

  it('displays speed', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('30')
    expect(wrapper.text()).toContain('ft')
  })

  it('displays proficiency bonus', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('Prof')
  })

  it('displays currency section', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: {
        character: mockCharacter,
        stats: mockStats,
        currency: { pp: 5, gp: 100, ep: 10, sp: 50, cp: 200 }
      }
    })
    expect(wrapper.text()).toContain('Currency')
  })

  it('shows all currency values when provided', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: {
        character: mockCharacter,
        stats: mockStats,
        currency: { pp: 5, gp: 100, ep: 10, sp: 50, cp: 200 }
      }
    })
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('200')
  })

  it('shows placeholder when currency is null', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: {
        character: mockCharacter,
        stats: mockStats,
        currency: null
      }
    })
    expect(wrapper.text()).toContain('—')
  })

  it('shows placeholder when all currencies are zero', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: {
        character: mockCharacter,
        stats: mockStats,
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      }
    })
    expect(wrapper.text()).toContain('—')
  })

  it('only shows non-zero currencies', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: {
        character: mockCharacter,
        stats: mockStats,
        currency: { pp: 0, gp: 50, ep: 0, sp: 25, cp: 0 }
      }
    })
    // Should show GP and SP
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('25')
    // Should NOT show coin indicators for zero currencies
    // (We check by verifying only 2 coin circles exist)
    const coins = wrapper.findAll('.rounded-full')
    expect(coins.length).toBe(2)
  })

  it('shows temporary HP when present', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+5')
  })

  describe('alternate movement speeds', () => {
    it('shows fly speed when present', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: { ...mockCharacter, speeds: { walk: 30, fly: 50, swim: null, climb: null } },
          stats: mockStats
        }
      })
      expect(wrapper.text()).toContain('fly 50')
    })

    it('shows swim speed when present', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: { ...mockCharacter, speeds: { walk: 30, fly: null, swim: 30, climb: null } },
          stats: mockStats
        }
      })
      expect(wrapper.text()).toContain('swim 30')
    })

    it('shows climb speed when present', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: { ...mockCharacter, speeds: { walk: 30, fly: null, swim: null, climb: 30 } },
          stats: mockStats
        }
      })
      expect(wrapper.text()).toContain('climb 30')
    })

    it('shows multiple alternate speeds', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: { ...mockCharacter, speeds: { walk: 25, fly: 50, swim: 30, climb: null } },
          stats: mockStats
        }
      })
      expect(wrapper.text()).toContain('fly 50')
      expect(wrapper.text()).toContain('swim 30')
    })

    it('hides alternate speeds when all are null', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: { ...mockCharacter, speeds: { walk: 30, fly: null, swim: null, climb: null } },
          stats: mockStats
        }
      })
      expect(wrapper.text()).not.toContain('fly')
      expect(wrapper.text()).not.toContain('swim')
      expect(wrapper.text()).not.toContain('climb')
    })

    it('handles missing speeds object gracefully', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: { ...mockCharacter, speeds: null },
          stats: mockStats
        }
      })
      // Should still show walking speed from character.speed
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('ft')
    })
  })

  // =========================================================================
  // Editable Mode Tests
  // =========================================================================

  describe('editable mode', () => {
    describe('props', () => {
      it('accepts editable prop', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        expect(wrapper.props('editable')).toBe(true)
      })

      it('defaults editable to false', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats }
        })
        expect(wrapper.props('editable')).toBeFalsy()
      })
    })

    describe('HP cell interactivity', () => {
      it('HP cell has data-testid', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const hpCell = wrapper.find('[data-testid="hp-cell"]')
        expect(hpCell.exists()).toBe(true)
      })

      it('HP cell has cursor-pointer when editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const hpCell = wrapper.find('[data-testid="hp-cell"]')
        expect(hpCell.classes()).toContain('cursor-pointer')
      })

      it('HP cell does not have cursor-pointer when not editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: false }
        })
        const hpCell = wrapper.find('[data-testid="hp-cell"]')
        expect(hpCell.classes()).not.toContain('cursor-pointer')
      })
    })

    describe('Add Temp HP button', () => {
      it('shows Add Temp HP button when editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const addTempHpBtn = wrapper.find('[data-testid="add-temp-hp-btn"]')
        expect(addTempHpBtn.exists()).toBe(true)
      })

      it('hides Add Temp HP button when not editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: false }
        })
        const addTempHpBtn = wrapper.find('[data-testid="add-temp-hp-btn"]')
        expect(addTempHpBtn.exists()).toBe(false)
      })
    })

    describe('modal state', () => {
      it('opens HP modal when HP cell clicked', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const vm = wrapper.vm as any

        expect(vm.isHpModalOpen).toBe(false)

        const hpCell = wrapper.find('[data-testid="hp-cell"]')
        await hpCell.trigger('click')

        expect(vm.isHpModalOpen).toBe(true)
      })

      it('does not open HP modal when not editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: false }
        })
        const vm = wrapper.vm as any

        const hpCell = wrapper.find('[data-testid="hp-cell"]')
        await hpCell.trigger('click')

        expect(vm.isHpModalOpen).toBe(false)
      })

      it('opens Temp HP modal when Add Temp HP clicked', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const vm = wrapper.vm as any

        expect(vm.isTempHpModalOpen).toBe(false)

        const addTempHpBtn = wrapper.find('[data-testid="add-temp-hp-btn"]')
        await addTempHpBtn.trigger('click')

        expect(vm.isTempHpModalOpen).toBe(true)
      })
    })

    describe('event emissions', () => {
      it('emits hp-change when HP modal applies', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const vm = wrapper.vm as any

        // Simulate modal apply
        vm.handleHpChange(-12)

        expect(wrapper.emitted('hp-change')).toBeTruthy()
        expect(wrapper.emitted('hp-change')![0]).toEqual([-12])
      })

      it('emits temp-hp-set when Temp HP modal applies', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const vm = wrapper.vm as any

        vm.handleTempHpSet(10)

        expect(wrapper.emitted('temp-hp-set')).toBeTruthy()
        expect(wrapper.emitted('temp-hp-set')![0]).toEqual([10])
      })

      it('emits temp-hp-clear when Temp HP modal clears', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { character: mockCharacter, stats: mockStats, editable: true }
        })
        const vm = wrapper.vm as any

        vm.handleTempHpClear()

        expect(wrapper.emitted('temp-hp-clear')).toBeTruthy()
      })
    })
  })

  // =========================================================================
  // Currency Editing Tests (#546)
  // =========================================================================

  describe('currency editing', () => {
    const currencyProps = {
      character: mockCharacter,
      stats: mockStats,
      currency: { pp: 5, gp: 150, ep: 0, sp: 30, cp: 75 }
    }

    describe('currency cell interactivity', () => {
      it('currency cell has data-testid', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { ...currencyProps, editable: true }
        })
        const currencyCell = wrapper.find('[data-testid="currency-cell"]')
        expect(currencyCell.exists()).toBe(true)
      })

      it('currency cell has cursor-pointer when editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { ...currencyProps, editable: true }
        })
        const currencyCell = wrapper.find('[data-testid="currency-cell"]')
        expect(currencyCell.classes()).toContain('cursor-pointer')
      })

      it('currency cell does not have cursor-pointer when not editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { ...currencyProps, editable: false }
        })
        const currencyCell = wrapper.find('[data-testid="currency-cell"]')
        expect(currencyCell.classes()).not.toContain('cursor-pointer')
      })
    })

    describe('currency modal state', () => {
      it('opens currency modal when currency cell clicked', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { ...currencyProps, editable: true }
        })
        const vm = wrapper.vm as any

        expect(vm.internalCurrencyModalOpen).toBe(false)

        const currencyCell = wrapper.find('[data-testid="currency-cell"]')
        await currencyCell.trigger('click')

        expect(vm.internalCurrencyModalOpen).toBe(true)
      })

      it('does not open currency modal when not editable', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { ...currencyProps, editable: false }
        })
        const vm = wrapper.vm as any

        const currencyCell = wrapper.find('[data-testid="currency-cell"]')
        await currencyCell.trigger('click')

        expect(vm.internalCurrencyModalOpen).toBe(false)
      })
    })

    describe('currency event emissions', () => {
      it('emits currency-apply when currency modal applies', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { ...currencyProps, editable: true }
        })
        const vm = wrapper.vm as any

        // Simulate modal apply
        vm.handleCurrencyApply({ gp: '-5', sp: '+10' })

        expect(wrapper.emitted('currency-apply')).toBeTruthy()
        expect(wrapper.emitted('currency-apply')![0]).toEqual([{ gp: '-5', sp: '+10' }])
      })

      it('does not close modal in apply handler (parent controls close)', async () => {
        const wrapper = await mountSuspended(CombatStatsGrid, {
          props: { ...currencyProps, editable: true }
        })
        const vm = wrapper.vm as any

        // Open modal via click
        const currencyCell = wrapper.find('[data-testid="currency-cell"]')
        await currencyCell.trigger('click')

        // Verify modal is open
        expect(vm.internalCurrencyModalOpen).toBe(true)

        // Apply should emit but NOT close the modal
        vm.handleCurrencyApply({ gp: '-5' })

        // Modal stays open (parent decides when to close based on success/failure)
        // The internalCurrencyModalOpen should still be true because handleCurrencyApply
        // only emits, it doesn't close the modal
        expect(vm.internalCurrencyModalOpen).toBe(true)
      })
    })
  })

  // =========================================================================
  // AC Tooltip Tests (#547)
  // =========================================================================

  describe('AC tooltip', () => {
    it('shows armor name when character has armor equipped', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats }
      })
      const vm = wrapper.vm as any
      expect(vm.acTooltipText).toContain('Chain Mail')
    })

    it('shows Unarmored Defense for Barbarian without armor', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockBarbarianCharacter, stats: { ...mockStats, armor_class: 15 } }
      })
      const vm = wrapper.vm as any
      expect(vm.acTooltipText).toContain('Unarmored Defense')
      expect(vm.acTooltipText).toContain('DEX')
      expect(vm.acTooltipText).toContain('CON')
    })

    it('shows Unarmored Defense for Monk without armor', async () => {
      const monkCharacter = {
        ...mockBarbarianCharacter,
        classes: [
          {
            class: { id: 2, name: 'Monk', slug: 'phb:monk' },
            level: 1,
            is_primary: true
          }
        ]
      }
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: monkCharacter, stats: { ...mockStats, armor_class: 14 } }
      })
      const vm = wrapper.vm as any
      expect(vm.acTooltipText).toContain('Unarmored Defense')
      expect(vm.acTooltipText).toContain('DEX')
      expect(vm.acTooltipText).toContain('WIS')
    })

    it('shows basic unarmored AC for other classes', async () => {
      const wizardCharacter = {
        ...mockBarbarianCharacter,
        classes: [
          {
            class: { id: 3, name: 'Wizard', slug: 'phb:wizard' },
            level: 1,
            is_primary: true
          }
        ]
      }
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: wizardCharacter, stats: { ...mockStats, armor_class: 12 } }
      })
      const vm = wrapper.vm as any
      expect(vm.acTooltipText).toContain('Unarmored')
      expect(vm.acTooltipText).toContain('DEX')
    })

    it('shows armor with shield when both equipped', async () => {
      const shieldedCharacter = {
        ...mockArmoredCharacter,
        equipped: {
          armor: { id: '123', name: 'Chain Mail', armor_class: '16' },
          shield: { id: '456', name: 'Shield', armor_class: '2' }
        }
      }
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: shieldedCharacter, stats: { ...mockStats, armor_class: 18 } }
      })
      const vm = wrapper.vm as any
      expect(vm.acTooltipText).toContain('Chain Mail')
      expect(vm.acTooltipText).toContain('Shield')
    })

    it('has AC cell with data-testid for tooltip', async () => {
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockCharacter, stats: mockStats }
      })
      expect(wrapper.find('[data-testid="ac-cell"]').exists()).toBe(true)
    })

    it('shows shield with unarmored for characters with only shield equipped', async () => {
      const shieldOnlyCharacter = {
        ...mockBarbarianCharacter,
        classes: [
          {
            class: { id: 3, name: 'Wizard', slug: 'phb:wizard' },
            level: 1,
            is_primary: true
          }
        ],
        equipped: {
          armor: null,
          shield: { id: '456', name: 'Shield', armor_class: '2' }
        }
      }
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: shieldOnlyCharacter, stats: { ...mockStats, armor_class: 14 } }
      })
      const vm = wrapper.vm as any
      expect(vm.acTooltipText).toContain('Unarmored')
      expect(vm.acTooltipText).toContain('DEX')
      expect(vm.acTooltipText).toContain('Shield')
    })
  })

  // =========================================================================
  // is_dead Flag Tests (#544)
  // =========================================================================

  describe('is_dead flag', () => {
    it('uses backend is_dead flag when available', async () => {
      const deadCharacter = {
        ...mockCharacter,
        is_dead: true,
        death_save_failures: 0 // Shouldn't matter - is_dead takes precedence
      }
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: deadCharacter,
          stats: { ...mockStats, hit_points: { current: 10, max: 20, temporary: 0 } }
        }
      })
      const vm = wrapper.vm as any
      expect(vm.isDead).toBe(true)
    })

    it('shows alive when is_dead is false even with 3 death save failures', async () => {
      const notDeadCharacter = {
        ...mockCharacter,
        is_dead: false,
        death_save_failures: 3 // Should be overridden by is_dead
      }
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: notDeadCharacter,
          stats: { ...mockStats, hit_points: { current: 0, max: 20, temporary: 0 } }
        }
      })
      const vm = wrapper.vm as any
      expect(vm.isDead).toBe(false)
    })

    it('falls back to death save calculation when is_dead is undefined', async () => {
      const legacyCharacter = {
        ...mockCharacter,
        death_save_failures: 3
      }
      // Remove is_dead to simulate legacy data
      delete (legacyCharacter as any).is_dead
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: {
          character: legacyCharacter,
          stats: { ...mockStats, hit_points: { current: 0, max: 20, temporary: 0 } },
          deathSaveFailures: 3
        }
      })
      const vm = wrapper.vm as any
      expect(vm.isDead).toBe(true)
    })
  })
})
