// tests/components/character/sheet/CombatStatsGrid.test.ts
/**
 * CombatStatsGrid Tests
 *
 * Tests the 6-cell grid layout component. HP and currency behavior
 * is delegated to manager components (tested separately).
 *
 * @see HitPointsManager.test.ts - HP editing behavior
 * @see CurrencyManager.test.ts - Currency editing behavior
 * @see Issue #584 - Character sheet component refactor
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import CombatStatsGrid from '~/components/character/sheet/CombatStatsGrid.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

// Character with Barbarian class (has Unarmored Defense: 10 + DEX + CON)
const mockBarbarianCharacter = {
  id: 1,
  speed: 30,
  proficiency_bonus: 2,
  has_inspiration: false,
  is_dead: false,
  death_save_successes: 0,
  death_save_failures: 0,
  currency: { pp: 0, gp: 50, ep: 0, sp: 25, cp: 0 },
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
  id: 2,
  speed: 30,
  proficiency_bonus: 2,
  has_inspiration: false,
  is_dead: false,
  death_save_successes: 0,
  death_save_failures: 0,
  currency: { pp: 5, gp: 100, ep: 10, sp: 50, cp: 200 },
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

const mockStats = {
  armor_class: 16,
  hit_points: { max: 28, current: 22, temporary: 5 },
  initiative_bonus: 2,
  passive_perception: 14,
  passive_investigation: 10,
  passive_insight: 11
}

/** Global pinia instance for tests */
let pinia: ReturnType<typeof createPinia>

/**
 * Helper to initialize the play state store before mounting CombatStatsGrid
 */
function initializeStore(character: any, stats: any) {
  const store = useCharacterPlayStateStore()
  store.initialize({
    characterId: character.id,
    isDead: character.is_dead ?? false,
    hitPoints: {
      current: stats.hit_points?.current ?? 0,
      max: stats.hit_points?.max ?? 0,
      temporary: stats.hit_points?.temporary ?? 0
    },
    deathSaves: {
      successes: character.death_save_successes ?? 0,
      failures: character.death_save_failures ?? 0
    },
    currency: character.currency ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
  })
  return store
}

describe('CharacterSheetCombatStatsGrid', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('basic rendering', () => {
    it('displays armor class', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('16')
      expect(wrapper.text()).toContain('AC')
    })

    it('displays initiative bonus', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('+2')
      expect(wrapper.text()).toContain('Initiative')
    })

    it('displays speed', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('ft')
    })

    it('displays proficiency bonus', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('+2')
      expect(wrapper.text()).toContain('Prof')
    })
  })

  describe('HP display (via HitPointsManager)', () => {
    it('displays hit points from store', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('22')
      expect(wrapper.text()).toContain('28')
    })

    it('displays temporary HP from store', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('+5')
    })
  })

  describe('currency display (via CurrencyManager)', () => {
    it('displays currency section', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('Currency')
    })

    it('shows currency values from store', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('5') // pp
      expect(wrapper.text()).toContain('100') // gp
    })
  })

  describe('alternate movement speeds', () => {
    it('shows fly speed when present', async () => {
      const charWithFly = { ...mockArmoredCharacter, speeds: { walk: 30, fly: 50, swim: null, climb: null } }
      initializeStore(charWithFly, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: charWithFly, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('fly 50')
    })

    it('shows swim speed when present', async () => {
      const charWithSwim = { ...mockArmoredCharacter, speeds: { walk: 30, fly: null, swim: 30, climb: null } }
      initializeStore(charWithSwim, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: charWithSwim, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('swim 30')
    })

    it('shows climb speed when present', async () => {
      const charWithClimb = { ...mockArmoredCharacter, speeds: { walk: 30, fly: null, swim: null, climb: 30 } }
      initializeStore(charWithClimb, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: charWithClimb, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('climb 30')
    })

    it('shows multiple alternate speeds', async () => {
      const charWithSpeeds = { ...mockArmoredCharacter, speeds: { walk: 25, fly: 50, swim: 30, climb: null } }
      initializeStore(charWithSpeeds, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: charWithSpeeds, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('fly 50')
      expect(wrapper.text()).toContain('swim 30')
    })

    it('hides alternate speeds when all are null', async () => {
      const charNoSpeeds = { ...mockArmoredCharacter, speeds: { walk: 30, fly: null, swim: null, climb: null } }
      initializeStore(charNoSpeeds, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: charNoSpeeds, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).not.toContain('fly')
      expect(wrapper.text()).not.toContain('swim')
      expect(wrapper.text()).not.toContain('climb')
    })

    it('handles missing speeds object gracefully', async () => {
      const charNoSpeedsObj = { ...mockArmoredCharacter, speeds: null }
      initializeStore(charNoSpeedsObj, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: charNoSpeedsObj, stats: mockStats },
        global: { plugins: [pinia] }
      })
      // Should still show walking speed from character.speed
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('ft')
    })
  })

  describe('editable prop', () => {
    it('accepts editable prop', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats, editable: true },
        global: { plugins: [pinia] }
      })
      expect(wrapper.props('editable')).toBe(true)
    })

    it('defaults editable to false', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.props('editable')).toBeFalsy()
    })
  })

  describe('AC tooltip', () => {
    it('renders StatArmorClass with tooltip', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.find('[data-testid="ac-cell"]').exists()).toBe(true)
      expect(wrapper.find('.cursor-help').exists()).toBe(true)
    })

    it('passes character data to StatArmorClass for tooltip', async () => {
      initializeStore(mockBarbarianCharacter, { ...mockStats, armor_class: 15 })
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockBarbarianCharacter, stats: { ...mockStats, armor_class: 15 } },
        global: { plugins: [pinia] }
      })
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('AC')
    })

    it('has AC cell with data-testid for tooltip', async () => {
      initializeStore(mockArmoredCharacter, mockStats)
      const wrapper = await mountSuspended(CombatStatsGrid, {
        props: { character: mockArmoredCharacter, stats: mockStats },
        global: { plugins: [pinia] }
      })
      expect(wrapper.find('[data-testid="ac-cell"]').exists()).toBe(true)
    })
  })
})
