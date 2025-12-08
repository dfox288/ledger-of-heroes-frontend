// tests/components/character/sheet/CombatStatsGrid.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CombatStatsGrid from '~/components/character/sheet/CombatStatsGrid.vue'

const mockCharacter = {
  speed: 30,
  proficiency_bonus: 2
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

  it('displays all three passive scores', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('Passive')
    expect(wrapper.text()).toContain('Perc')
    expect(wrapper.text()).toContain('14')
    expect(wrapper.text()).toContain('Inv')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('Ins')
    expect(wrapper.text()).toContain('11')
  })

  it('shows temporary HP when present', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+5')
  })

  it('handles null passive scores gracefully', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: {
        character: mockCharacter,
        stats: {
          ...mockStats,
          passive_perception: null,
          passive_investigation: null,
          passive_insight: null
        }
      }
    })
    // Should show em dashes for all null values
    const text = wrapper.text()
    expect(text).toContain('Passive')
    // Count the em dashes - should be 3 for the passive scores
    const dashMatches = text.match(/—/g)
    expect(dashMatches).toBeTruthy()
    expect(dashMatches!.length).toBeGreaterThanOrEqual(3)
  })

  it('handles mixed null and valid passive scores', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: {
        character: mockCharacter,
        stats: {
          ...mockStats,
          passive_perception: 14,
          passive_investigation: null,
          passive_insight: 11
        }
      }
    })
    const text = wrapper.text()
    expect(text).toContain('14')
    expect(text).toContain('11')
    expect(text).toContain('—')
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
