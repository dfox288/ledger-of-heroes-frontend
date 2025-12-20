// tests/composables/useSpellGrouping.test.ts
/**
 * Tests for spell grouping composable
 * @see Issue #778 - Extract spell grouping logic to composable
 */
import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { groupSpellsByLevel, getSortedLevels, useSpellGrouping } from '~/composables/useSpellGrouping'
import type { CharacterSpell } from '~/types/character'

// Factory for creating mock spells
function createMockSpell(overrides: Partial<{
  id: number
  name: string
  level: number
  is_prepared: boolean
}>): CharacterSpell {
  const id = overrides.id ?? Math.random() * 1000
  return {
    id,
    spell: {
      id,
      name: overrides.name ?? 'Test Spell',
      level: overrides.level ?? 1,
      slug: 'test-spell',
      school: 'Evocation',
      casting_time: '1 action',
      range: '30 feet',
      components: 'V, S',
      duration: 'Instantaneous',
      concentration: false,
      ritual: false
    },
    is_prepared: overrides.is_prepared ?? false,
    is_always_prepared: false,
    class_slug: 'phb:wizard',
    source: 'wizard'
  } as CharacterSpell
}

describe('useSpellGrouping', () => {
  describe('groupSpellsByLevel', () => {
    it('groups spells by their level', () => {
      const spells = [
        createMockSpell({ id: 1, name: 'Fireball', level: 3 }),
        createMockSpell({ id: 2, name: 'Magic Missile', level: 1 }),
        createMockSpell({ id: 3, name: 'Shield', level: 1 }),
        createMockSpell({ id: 4, name: 'Counterspell', level: 3 })
      ]

      const grouped = groupSpellsByLevel(spells)

      expect(Object.keys(grouped)).toHaveLength(2)
      expect(grouped[1]).toHaveLength(2)
      expect(grouped[3]).toHaveLength(2)
    })

    it('sorts spells alphabetically within each level', () => {
      const spells = [
        createMockSpell({ id: 1, name: 'Shield', level: 1 }),
        createMockSpell({ id: 2, name: 'Magic Missile', level: 1 }),
        createMockSpell({ id: 3, name: 'Absorb Elements', level: 1 })
      ]

      const grouped = groupSpellsByLevel(spells)

      expect(grouped[1]![0]!.spell!.name).toBe('Absorb Elements')
      expect(grouped[1]![1]!.spell!.name).toBe('Magic Missile')
      expect(grouped[1]![2]!.spell!.name).toBe('Shield')
    })

    it('handles empty array', () => {
      const grouped = groupSpellsByLevel([])
      expect(Object.keys(grouped)).toHaveLength(0)
    })

    it('handles cantrips (level 0)', () => {
      const spells = [
        createMockSpell({ id: 1, name: 'Fire Bolt', level: 0 }),
        createMockSpell({ id: 2, name: 'Prestidigitation', level: 0 })
      ]

      const grouped = groupSpellsByLevel(spells)

      expect(grouped[0]).toHaveLength(2)
    })
  })

  describe('getSortedLevels', () => {
    it('returns levels sorted numerically', () => {
      const grouped = {
        3: [],
        1: [],
        9: [],
        2: []
      }

      const levels = getSortedLevels(grouped)

      expect(levels).toEqual([1, 2, 3, 9])
    })

    it('includes level 0 (cantrips) first', () => {
      const grouped = {
        1: [],
        0: [],
        2: []
      }

      const levels = getSortedLevels(grouped)

      expect(levels).toEqual([0, 1, 2])
    })

    it('handles empty object', () => {
      const levels = getSortedLevels({})
      expect(levels).toEqual([])
    })
  })

  describe('useSpellGrouping composable', () => {
    it('returns reactive grouped spells', () => {
      const spells = ref([
        createMockSpell({ id: 1, name: 'Fireball', level: 3 }),
        createMockSpell({ id: 2, name: 'Magic Missile', level: 1 })
      ])

      const { spellsByLevel, sortedLevels } = useSpellGrouping(spells)

      expect(spellsByLevel.value[1]).toHaveLength(1)
      expect(spellsByLevel.value[3]).toHaveLength(1)
      expect(sortedLevels.value).toEqual([1, 3])
    })

    it('updates when source ref changes', () => {
      const spells = ref<CharacterSpell[]>([
        createMockSpell({ id: 1, name: 'Fireball', level: 3 })
      ])

      const { sortedLevels } = useSpellGrouping(spells)

      expect(sortedLevels.value).toEqual([3])

      // Add a level 1 spell
      spells.value = [
        ...spells.value,
        createMockSpell({ id: 2, name: 'Magic Missile', level: 1 })
      ]

      expect(sortedLevels.value).toEqual([1, 3])
    })

    it('works with computed source', () => {
      const allSpells = ref([
        createMockSpell({ id: 1, name: 'Fireball', level: 3, is_prepared: true }),
        createMockSpell({ id: 2, name: 'Magic Missile', level: 1, is_prepared: false })
      ])

      const preparedOnly = computed(() => allSpells.value.filter(s => s.is_prepared))
      const { sortedLevels } = useSpellGrouping(preparedOnly)

      expect(sortedLevels.value).toEqual([3])
    })
  })
})
