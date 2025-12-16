// tests/components/dm-screen/PartySummary.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PartySummary from '~/components/dm-screen/PartySummary.vue'
import type { DmScreenPartySummary, DmScreenCharacter } from '~/types/dm-screen'

// Minimal mock character factory for testing
function createMockCharacter(overrides: Partial<DmScreenCharacter> = {}): DmScreenCharacter {
  return {
    id: 1,
    public_id: 'test-char',
    name: 'Test Character',
    level: 5,
    class_name: 'Fighter',
    hit_points: { current: 40, max: 50, temp: 0 },
    armor_class: 16,
    proficiency_bonus: 3,
    combat: {
      initiative_modifier: 2,
      speeds: { walk: 30, fly: null, swim: null, climb: null },
      death_saves: { successes: 0, failures: 0 },
      concentration: { active: false, spell: null }
    },
    senses: {
      passive_perception: 12,
      passive_investigation: 10,
      passive_insight: 11,
      darkvision: null
    },
    capabilities: {
      languages: ['Common'],
      size: 'Medium',
      tool_proficiencies: []
    },
    equipment: {
      armor: null,
      weapons: [],
      shield: false
    },
    saving_throws: { STR: 5, DEX: 2, CON: 5, INT: 0, WIS: 1, CHA: -1 },
    conditions: [],
    spell_slots: {},
    counters: [],
    ...overrides
  }
}

const mockSummary: DmScreenPartySummary = {
  all_languages: ['Common', 'Elvish', 'Dwarvish', 'Undercommon', 'Draconic'],
  darkvision_count: 3,
  no_darkvision: ['Aldric the Human'],
  has_healer: true,
  healers: ['Mira (Cleric)', 'Finn (Druid)'],
  has_detect_magic: true,
  has_dispel_magic: false,
  has_counterspell: true
}

describe('DmScreenPartySummary', () => {
  it('displays languages section', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Languages')
    expect(wrapper.text()).toContain('Common')
  })

  it('shows all party languages', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    // All languages should be visible for DM planning
    expect(wrapper.text()).toContain('Common')
    expect(wrapper.text()).toContain('Elvish')
    expect(wrapper.text()).toContain('Dwarvish')
    expect(wrapper.text()).toContain('Undercommon')
    expect(wrapper.text()).toContain('Draconic')
  })

  it('displays darkvision count', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).toContain('3')
  })

  it('shows warning for characters without darkvision', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Aldric')
  })

  it('displays healers when present', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Healers')
    expect(wrapper.text()).toContain('Mira')
  })

  it('shows warning when no healers', async () => {
    const noHealerSummary = { ...mockSummary, has_healer: false, healers: [] }
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: noHealerSummary }
    })
    expect(wrapper.text()).toMatch(/no healer|none/i)
  })

  it('displays utility spell coverage', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Utility')
    expect(wrapper.text()).toContain('Detect Magic')
  })

  it('shows checkmark for available utility spells', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    // Detect Magic has checkmark
    const detectSection = wrapper.find('[data-testid="utility-detect-magic"]')
    expect(detectSection.text()).toContain('✓')
  })

  it('shows X for missing utility spells', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    // Dispel Magic is missing
    const dispelSection = wrapper.find('[data-testid="utility-dispel-magic"]')
    expect(dispelSection.classes().join(' ')).toMatch(/muted|neutral|gray/)
  })

  it('is collapsible', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary, collapsed: false }
    })
    const toggle = wrapper.find('[data-testid="summary-toggle"]')
    expect(toggle.exists()).toBe(true)
  })

  describe('Average Party Level (APL)', () => {
    it('displays APL when characters are provided', async () => {
      const characters = [
        createMockCharacter({ id: 1, level: 5 }),
        createMockCharacter({ id: 2, level: 5 }),
        createMockCharacter({ id: 3, level: 4 }),
        createMockCharacter({ id: 4, level: 6 })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // APL = (5 + 5 + 4 + 6) / 4 = 5
      expect(wrapper.text()).toContain('APL')
      expect(wrapper.find('[data-testid="apl-value"]').text()).toBe('5')
    })

    it('rounds APL to nearest integer', async () => {
      const characters = [
        createMockCharacter({ id: 1, level: 5 }),
        createMockCharacter({ id: 2, level: 6 }),
        createMockCharacter({ id: 3, level: 7 })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // APL = (5 + 6 + 7) / 3 = 6
      expect(wrapper.find('[data-testid="apl-value"]').text()).toBe('6')
    })

    it('does not display APL section when no characters provided', async () => {
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary }
      })
      expect(wrapper.find('[data-testid="apl-value"]').exists()).toBe(false)
    })
  })

  describe('Total Party HP', () => {
    it('displays total party HP with percentage', async () => {
      const characters = [
        createMockCharacter({ id: 1, hit_points: { current: 30, max: 50, temp: 0 } }),
        createMockCharacter({ id: 2, hit_points: { current: 40, max: 50, temp: 0 } })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // Total: 70/100 = 70%
      expect(wrapper.text()).toContain('Party HP')
      expect(wrapper.find('[data-testid="party-hp"]').text()).toContain('70/100')
      expect(wrapper.find('[data-testid="party-hp"]').text()).toContain('70%')
    })

    it('shows green color when HP above 50%', async () => {
      const characters = [
        createMockCharacter({ id: 1, hit_points: { current: 45, max: 50, temp: 0 } }),
        createMockCharacter({ id: 2, hit_points: { current: 45, max: 50, temp: 0 } })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // 90/100 = 90% - should be green
      const hpElement = wrapper.find('[data-testid="party-hp-percentage"]')
      expect(hpElement.classes().join(' ')).toMatch(/emerald|green/)
    })

    it('shows yellow color when HP between 25-50%', async () => {
      const characters = [
        createMockCharacter({ id: 1, hit_points: { current: 20, max: 50, temp: 0 } }),
        createMockCharacter({ id: 2, hit_points: { current: 20, max: 50, temp: 0 } })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // 40/100 = 40% - should be yellow
      const hpElement = wrapper.find('[data-testid="party-hp-percentage"]')
      expect(hpElement.classes().join(' ')).toMatch(/amber|yellow/)
    })

    it('shows red color when HP below 25%', async () => {
      const characters = [
        createMockCharacter({ id: 1, hit_points: { current: 10, max: 50, temp: 0 } }),
        createMockCharacter({ id: 2, hit_points: { current: 10, max: 50, temp: 0 } })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // 20/100 = 20% - should be red
      const hpElement = wrapper.find('[data-testid="party-hp-percentage"]')
      expect(hpElement.classes().join(' ')).toMatch(/rose|red/)
    })

    it('does not display HP section when no characters provided', async () => {
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary }
      })
      expect(wrapper.find('[data-testid="party-hp"]').exists()).toBe(false)
    })

    it('handles zero max HP gracefully', async () => {
      const characters = [
        createMockCharacter({ id: 1, hit_points: { current: 0, max: 0, temp: 0 } })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      expect(wrapper.find('[data-testid="party-hp"]').text()).toContain('0/0')
      expect(wrapper.find('[data-testid="party-hp-percentage"]').text()).toContain('(0%)')
    })

    it('shows yellow color at exactly 50%', async () => {
      const characters = [
        createMockCharacter({ id: 1, hit_points: { current: 50, max: 100, temp: 0 } })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // Exactly 50% should be yellow (warning)
      const hpElement = wrapper.find('[data-testid="party-hp-percentage"]')
      expect(hpElement.classes().join(' ')).toMatch(/amber|yellow/)
    })

    it('shows red color at exactly 25%', async () => {
      const characters = [
        createMockCharacter({ id: 1, hit_points: { current: 25, max: 100, temp: 0 } })
      ]
      const wrapper = await mountSuspended(PartySummary, {
        props: { summary: mockSummary, characters }
      })
      // Exactly 25% should be red (critical)
      const hpElement = wrapper.find('[data-testid="party-hp-percentage"]')
      expect(hpElement.classes().join(' ')).toMatch(/rose|red/)
    })
  })
})
