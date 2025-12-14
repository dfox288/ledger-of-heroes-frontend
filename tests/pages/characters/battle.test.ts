// tests/pages/characters/battle.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import BattlePage from '~/pages/characters/[publicId]/battle.vue'

// Mock useRoute
mockNuxtImport('useRoute', () => () => ({
  params: { publicId: 'test-char-abc1' }
}))

// Mock API responses
const mockCharacter = {
  id: 1,
  public_id: 'test-char-abc1',
  name: 'Test Fighter',
  level: 5,
  is_dead: false,
  death_save_successes: 0,
  death_save_failures: 0,
  currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 },
  speed: 30,
  speeds: { walk: 30, fly: null, swim: null, climb: null },
  proficiency_bonus: 3
}

const mockStats = {
  character_id: 1,
  level: 5,
  proficiency_bonus: 3,
  armor_class: 16,
  initiative_bonus: 2,
  hit_points: { current: 45, max: 45, temporary: 0 },
  ability_scores: {
    STR: { score: 16, modifier: 3 },
    DEX: { score: 14, modifier: 2 },
    CON: { score: 14, modifier: 2 },
    INT: { score: 10, modifier: 0 },
    WIS: { score: 12, modifier: 1 },
    CHA: { score: 8, modifier: -1 }
  },
  saving_throws: {
    STR: { modifier: 3, proficient: true, total: 6 },
    DEX: { modifier: 2, proficient: false, total: 2 },
    CON: { modifier: 2, proficient: true, total: 5 },
    INT: { modifier: 0, proficient: false, total: 0 },
    WIS: { modifier: 1, proficient: false, total: 1 },
    CHA: { modifier: -1, proficient: false, total: -1 }
  },
  weapons: [
    {
      name: 'Longsword',
      damage_dice: '1d8',
      attack_bonus: 0,
      damage_bonus: 0,
      ability_used: 'STR',
      is_proficient: true
    }
  ],
  damage_resistances: [],
  damage_immunities: [],
  damage_vulnerabilities: [],
  condition_advantages: [],
  condition_immunities: [],
  spellcasting: null
}

const mockConditions: never[] = []

// Mock useApi
const mockApiFetch = vi.fn()
mockNuxtImport('useApi', () => () => ({
  apiFetch: mockApiFetch
}))

describe('Battle Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockApiFetch.mockReset()

    // Setup default API responses
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStats })
      if (url.includes('/conditions')) return Promise.resolve({ data: mockConditions })
      if (url.includes('/characters/')) return Promise.resolve({ data: mockCharacter })
      return Promise.resolve({ data: null })
    })
  })

  it('renders loading skeleton initially', async () => {
    // Don't resolve API calls immediately
    mockApiFetch.mockImplementation(() => new Promise(() => {}))

    const wrapper = await mountSuspended(BattlePage)
    expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true)
  })

  it('displays character name in header', async () => {
    const wrapper = await mountSuspended(BattlePage)
    expect(wrapper.text()).toContain('Test Fighter')
  })

  it('shows WeaponsPanel with character weapons', async () => {
    const wrapper = await mountSuspended(BattlePage)
    expect(wrapper.find('[data-testid="weapons-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Longsword')
  })

  it('shows SavingThrowsList', async () => {
    const wrapper = await mountSuspended(BattlePage)
    expect(wrapper.find('[data-testid="saving-throws-list"]').exists()).toBe(true)
  })

  it('shows CombatStatsGrid', async () => {
    const wrapper = await mountSuspended(BattlePage)
    // CombatStatsGrid shows AC
    expect(wrapper.text()).toContain('16') // AC value
  })

  it('hides DeathSavesManager when HP > 0 and not in play mode', async () => {
    const wrapper = await mountSuspended(BattlePage)
    // Death saves should not be visible by default
    expect(wrapper.find('[data-testid="death-saves-manager"]').exists()).toBe(false)
  })

  it('shows DefensesPanel when character has defenses', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/stats')) {
        return Promise.resolve({
          data: {
            ...mockStats,
            damage_resistances: [{ type: 'Fire', condition: null, source: 'Tiefling' }]
          }
        })
      }
      if (url.includes('/conditions')) return Promise.resolve({ data: mockConditions })
      if (url.includes('/characters/')) return Promise.resolve({ data: mockCharacter })
      return Promise.resolve({ data: null })
    })

    const wrapper = await mountSuspended(BattlePage)
    expect(wrapper.find('[data-testid="defenses-panel"]').exists()).toBe(true)
  })
})
