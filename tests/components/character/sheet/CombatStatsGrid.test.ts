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
})
