import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useSpellcastingTabs } from '~/composables/useSpellcastingTabs'
import type { CharacterStats, ClassSpellcastingInfo } from '~/types/character'

// Helper to create mock spellcasting info
function createSpellcastingInfo(overrides: Partial<ClassSpellcastingInfo> = {}): ClassSpellcastingInfo {
  return {
    ability: 'INT',
    ability_modifier: 3,
    spell_save_dc: 15,
    spell_attack_bonus: 7,
    preparation_method: 'prepared',
    ...overrides
  }
}

// Helper to create mock stats with spellcasting
function createMockStats(spellcasting: Record<string, ClassSpellcastingInfo> | null): CharacterStats {
  return {
    level: 5,
    proficiency_bonus: 3,
    hit_points: { max: 35, current: 35, temporary: 0 },
    armor_class: 16,
    initiative_bonus: 2,
    passive_perception: 12,
    ability_scores: {
      STR: { score: 10, modifier: 0 },
      DEX: { score: 14, modifier: 2 },
      CON: { score: 14, modifier: 2 },
      INT: { score: 16, modifier: 3 },
      WIS: { score: 12, modifier: 1 },
      CHA: { score: 8, modifier: -1 }
    },
    saving_throws: {
      STR: { total: 0, proficient: false },
      DEX: { total: 2, proficient: false },
      CON: { total: 2, proficient: false },
      INT: { total: 6, proficient: true },
      WIS: { total: 4, proficient: true },
      CHA: { total: -1, proficient: false }
    },
    skills: [],
    spellcasting,
    damage_resistances: [],
    damage_immunities: [],
    damage_vulnerabilities: [],
    condition_advantages: [],
    condition_disadvantages: [],
    speeds: { walk: 30 },
    spell_slots: null,
    unarmed_strike: null,
    senses: []
  }
}

describe('useSpellcastingTabs', () => {
  describe('spellcastingClasses', () => {
    it('returns empty array for non-spellcaster', () => {
      const stats = ref(createMockStats(null))

      const { spellcastingClasses } = useSpellcastingTabs(stats)

      expect(spellcastingClasses.value).toEqual([])
    })

    it('returns empty array when stats is null', () => {
      const stats = ref<CharacterStats | null>(null)

      const { spellcastingClasses } = useSpellcastingTabs(stats)

      expect(spellcastingClasses.value).toEqual([])
    })

    it('returns single class for single-class spellcaster', () => {
      const stats = ref(createMockStats({
        'phb:wizard': createSpellcastingInfo({ ability: 'INT' })
      }))

      const { spellcastingClasses } = useSpellcastingTabs(stats)

      expect(spellcastingClasses.value).toHaveLength(1)
      expect(spellcastingClasses.value[0].slug).toBe('phb:wizard')
      expect(spellcastingClasses.value[0].name).toBe('Wizard')
      expect(spellcastingClasses.value[0].info.ability).toBe('INT')
    })

    it('returns multiple classes for multiclass spellcaster', () => {
      const stats = ref(createMockStats({
        'phb:cleric': createSpellcastingInfo({ ability: 'WIS' }),
        'phb:wizard': createSpellcastingInfo({ ability: 'INT' })
      }))

      const { spellcastingClasses } = useSpellcastingTabs(stats)

      expect(spellcastingClasses.value).toHaveLength(2)
      const slugs = spellcastingClasses.value.map(sc => sc.slug)
      expect(slugs).toContain('phb:cleric')
      expect(slugs).toContain('phb:wizard')
    })

    it('generates safe slot names from slugs', () => {
      const stats = ref(createMockStats({
        'phb:wizard': createSpellcastingInfo()
      }))

      const { spellcastingClasses } = useSpellcastingTabs(stats)

      // "phb:wizard" should become "phb-wizard" for UTabs slot
      expect(spellcastingClasses.value[0].slotName).toBe('phb-wizard')
    })

    it('includes class color', () => {
      const stats = ref(createMockStats({
        'phb:wizard': createSpellcastingInfo()
      }))

      const { spellcastingClasses } = useSpellcastingTabs(stats)

      // Should have some color (exact value depends on classColors util)
      expect(spellcastingClasses.value[0].color).toBeDefined()
      expect(typeof spellcastingClasses.value[0].color).toBe('string')
    })
  })

  describe('isMulticlassSpellcaster', () => {
    it('returns false for non-spellcaster', () => {
      const stats = ref(createMockStats(null))

      const { isMulticlassSpellcaster } = useSpellcastingTabs(stats)

      expect(isMulticlassSpellcaster.value).toBe(false)
    })

    it('returns false for single-class spellcaster', () => {
      const stats = ref(createMockStats({
        'phb:wizard': createSpellcastingInfo()
      }))

      const { isMulticlassSpellcaster } = useSpellcastingTabs(stats)

      expect(isMulticlassSpellcaster.value).toBe(false)
    })

    it('returns true for multiclass spellcaster', () => {
      const stats = ref(createMockStats({
        'phb:cleric': createSpellcastingInfo(),
        'phb:wizard': createSpellcastingInfo()
      }))

      const { isMulticlassSpellcaster } = useSpellcastingTabs(stats)

      expect(isMulticlassSpellcaster.value).toBe(true)
    })
  })

  describe('primarySpellcasting', () => {
    it('returns null for non-spellcaster', () => {
      const stats = ref(createMockStats(null))

      const { primarySpellcasting } = useSpellcastingTabs(stats)

      expect(primarySpellcasting.value).toBeNull()
    })

    it('returns first class for single-class spellcaster', () => {
      const stats = ref(createMockStats({
        'phb:wizard': createSpellcastingInfo({ ability: 'INT' })
      }))

      const { primarySpellcasting } = useSpellcastingTabs(stats)

      expect(primarySpellcasting.value).not.toBeNull()
      expect(primarySpellcasting.value!.slug).toBe('phb:wizard')
    })

    it('returns first class for multiclass spellcaster', () => {
      const stats = ref(createMockStats({
        'phb:cleric': createSpellcastingInfo({ ability: 'WIS' }),
        'phb:wizard': createSpellcastingInfo({ ability: 'INT' })
      }))

      const { primarySpellcasting } = useSpellcastingTabs(stats)

      // Should return the first one (order depends on Object.entries)
      expect(primarySpellcasting.value).not.toBeNull()
    })
  })

  describe('tabItems', () => {
    it('returns empty array for non-spellcaster', () => {
      const stats = ref(createMockStats(null))

      const { tabItems } = useSpellcastingTabs(stats)

      expect(tabItems.value).toEqual([])
    })

    it('returns tabs with "All Prepared Spells" first for multiclass', () => {
      const stats = ref(createMockStats({
        'phb:cleric': createSpellcastingInfo(),
        'phb:wizard': createSpellcastingInfo()
      }))

      const { tabItems } = useSpellcastingTabs(stats)

      expect(tabItems.value.length).toBeGreaterThan(0)
      expect(tabItems.value[0].label).toBe('All Prepared Spells')
      expect(tabItems.value[0].value).toBe('all-spells')
    })

    it('includes per-class tabs after "All Prepared Spells"', () => {
      const stats = ref(createMockStats({
        'phb:cleric': createSpellcastingInfo(),
        'phb:wizard': createSpellcastingInfo()
      }))

      const { tabItems } = useSpellcastingTabs(stats)

      // Should have: All Prepared Spells + 2 class tabs
      expect(tabItems.value).toHaveLength(3)
      const labels = tabItems.value.map(t => t.label)
      expect(labels).toContain('Cleric')
      expect(labels).toContain('Wizard')
    })

    it('uses slot name as value for class tabs', () => {
      const stats = ref(createMockStats({
        'phb:wizard': createSpellcastingInfo()
      }))

      const { tabItems } = useSpellcastingTabs(stats)

      // Even for single class, should generate tabs structure
      const wizardTab = tabItems.value.find(t => t.label === 'Wizard')
      if (wizardTab) {
        expect(wizardTab.value).toBe('phb-wizard')
        expect(wizardTab.slot).toBe('phb-wizard')
      }
    })
  })

  describe('reactivity', () => {
    it('updates when stats change', () => {
      const stats = ref<CharacterStats | null>(null)

      const { spellcastingClasses, isMulticlassSpellcaster } = useSpellcastingTabs(stats)

      expect(spellcastingClasses.value).toEqual([])
      expect(isMulticlassSpellcaster.value).toBe(false)

      // Add spellcasting
      stats.value = createMockStats({
        'phb:cleric': createSpellcastingInfo(),
        'phb:wizard': createSpellcastingInfo()
      })

      expect(spellcastingClasses.value).toHaveLength(2)
      expect(isMulticlassSpellcaster.value).toBe(true)
    })

    it('updates when spellcasting classes change', () => {
      const stats = ref(createMockStats({
        'phb:wizard': createSpellcastingInfo()
      }))

      const { spellcastingClasses, isMulticlassSpellcaster } = useSpellcastingTabs(stats)

      expect(spellcastingClasses.value).toHaveLength(1)
      expect(isMulticlassSpellcaster.value).toBe(false)

      // Multiclass into cleric
      stats.value = createMockStats({
        'phb:wizard': createSpellcastingInfo(),
        'phb:cleric': createSpellcastingInfo()
      })

      expect(spellcastingClasses.value).toHaveLength(2)
      expect(isMulticlassSpellcaster.value).toBe(true)
    })
  })
})
