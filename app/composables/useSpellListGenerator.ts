import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { CharacterClass } from '~/types'

interface SpellSlots {
  cantrips: number
  [key: string]: number // '1st', '2nd', etc.
}

// Prepared casters calculate spells as: level + ability modifier
const PREPARED_CASTER_CLASSES = ['wizard', 'cleric', 'druid', 'paladin', 'artificer']

// Known casters use fixed tables by level
const KNOWN_SPELLS_BY_CLASS: Record<string, number[]> = {
  'bard': [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  'sorcerer': [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  'warlock': [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  'ranger': [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
  'eldritch-knight': [0, 0, 2, 3, 3, 4, 4, 4, 4, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9],
  'arcane-trickster': [0, 0, 2, 3, 3, 4, 4, 4, 4, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9]
}

const DEFAULT_ABILITY_MODIFIER = 3

export interface UseSpellListGeneratorReturn {
  selectedClass: Ref<CharacterClass | null>
  characterLevel: Ref<number>
  selectedSpells: Ref<Set<number>> // DEPRECATED: Use selectedCantrips + selectedLeveledSpells
  selectedCantrips: Ref<Set<number>>
  selectedLeveledSpells: Ref<Set<number>>
  spellSlots: ComputedRef<SpellSlots>
  maxSpells: ComputedRef<number> // DEPRECATED: Use maxCantrips + maxLeveledSpells
  maxCantrips: ComputedRef<number>
  maxLeveledSpells: ComputedRef<number>
  toggleSpell: (spellId: number, spellLevel?: number) => boolean
  selectionCount: ComputedRef<number> // DEPRECATED: Use cantripCount + leveledSpellCount
  cantripCount: ComputedRef<number>
  leveledSpellCount: ComputedRef<number>
  setClassData: (classData: CharacterClass) => void
  saveToStorage: () => void
  loadFromStorage: () => void
  clearAll: () => void
}

export function useSpellListGenerator(): UseSpellListGeneratorReturn {
  const selectedClass = ref<CharacterClass | null>(null)
  const characterLevel = ref(1)
  const selectedSpells = ref<Set<number>>(new Set()) // DEPRECATED
  const selectedCantrips = ref<Set<number>>(new Set())
  const selectedLeveledSpells = ref<Set<number>>(new Set())

  const setClassData = (classData: CharacterClass) => {
    selectedClass.value = classData
  }

  const spellSlots = computed(() => {
    if (!selectedClass.value?.level_progression) {
      return { cantrips: 0 }
    }

    const progression = selectedClass.value.level_progression[characterLevel.value - 1]
    if (!progression) {
      return { cantrips: 0 }
    }

    const slots: SpellSlots = {
      cantrips: progression.cantrips_known || 0
    }

    // Map spell_slots_1st, spell_slots_2nd, etc. to '1st', '2nd', etc.
    for (let i = 1; i <= 9; i++) {
      const key = `spell_slots_${i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : `${i}th`}`
      const value = (progression[key as keyof typeof progression] as number) || 0
      if (value > 0 || i <= 3) { // Always include 1st-3rd
        const slotKey = i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : `${i}th`
        slots[slotKey] = value
      }
    }

    return slots
  })

  const maxCantrips = computed(() => {
    if (!selectedClass.value?.level_progression) return 0
    const progression = selectedClass.value.level_progression[characterLevel.value - 1]
    return progression?.cantrips_known || 0
  })

  const maxLeveledSpells = computed(() => {
    if (!selectedClass.value) return 0

    const classSlug = selectedClass.value.slug
    const level = characterLevel.value

    // Prepared casters: level + ability modifier
    if (PREPARED_CASTER_CLASSES.includes(classSlug)) {
      return level + DEFAULT_ABILITY_MODIFIER
    }

    // Known casters: lookup from table
    if (KNOWN_SPELLS_BY_CLASS[classSlug]) {
      return KNOWN_SPELLS_BY_CLASS[classSlug][level - 1] || 0
    }

    // Fallback for unknown classes
    return level + DEFAULT_ABILITY_MODIFIER
  })

  const maxSpells = computed(() => maxLeveledSpells.value) // DEPRECATED

  const toggleSpell = (spellId: number, spellLevel = 0) => {
    const isCantrip = spellLevel === 0

    if (isCantrip) {
      if (selectedCantrips.value.has(spellId)) {
        // Deselect cantrip
        selectedCantrips.value.delete(spellId)
        selectedCantrips.value = new Set(selectedCantrips.value)
        // Also remove from deprecated selectedSpells
        selectedSpells.value.delete(spellId)
        selectedSpells.value = new Set(selectedSpells.value)
      } else {
        // Check cantrip limit
        if (selectedCantrips.value.size >= maxCantrips.value) {
          return false
        }
        selectedCantrips.value.add(spellId)
        selectedCantrips.value = new Set(selectedCantrips.value)
        // Also add to deprecated selectedSpells for backwards compat
        selectedSpells.value.add(spellId)
        selectedSpells.value = new Set(selectedSpells.value)
      }
    } else {
      if (selectedLeveledSpells.value.has(spellId)) {
        // Deselect leveled spell
        selectedLeveledSpells.value.delete(spellId)
        selectedLeveledSpells.value = new Set(selectedLeveledSpells.value)
        // Also remove from deprecated selectedSpells
        selectedSpells.value.delete(spellId)
        selectedSpells.value = new Set(selectedSpells.value)
      } else {
        // Check leveled spell limit
        if (selectedLeveledSpells.value.size >= maxLeveledSpells.value) {
          return false
        }
        selectedLeveledSpells.value.add(spellId)
        selectedLeveledSpells.value = new Set(selectedLeveledSpells.value)
        // Also add to deprecated selectedSpells for backwards compat
        selectedSpells.value.add(spellId)
        selectedSpells.value = new Set(selectedSpells.value)
      }
    }
    return true
  }

  const cantripCount = computed(() => selectedCantrips.value.size)
  const leveledSpellCount = computed(() => selectedLeveledSpells.value.size)
  const selectionCount = computed(() => selectedSpells.value.size) // DEPRECATED

  // LocalStorage helpers
  const getStorageKey = () => {
    if (!selectedClass.value) return null
    return `dnd-spell-list-${selectedClass.value.slug}`
  }

  const saveToStorage = () => {
    const key = getStorageKey()
    if (!key) return

    const data = {
      classSlug: selectedClass.value!.slug,
      characterLevel: characterLevel.value,
      selectedSpells: Array.from(selectedSpells.value)
    }
    localStorage.setItem(key, JSON.stringify(data))
  }

  const loadFromStorage = () => {
    const key = getStorageKey()
    if (!key) return

    const stored = localStorage.getItem(key)
    if (!stored) return

    try {
      const data = JSON.parse(stored)
      characterLevel.value = data.characterLevel || 1
      selectedSpells.value = new Set(data.selectedSpells || [])
    } catch (e) {
      console.error('Failed to load spell list from localStorage:', e)
    }
  }

  const clearAll = () => {
    selectedSpells.value = new Set()
    selectedCantrips.value = new Set()
    selectedLeveledSpells.value = new Set()
    characterLevel.value = 1
    const key = getStorageKey()
    if (key) {
      localStorage.removeItem(key)
    }
  }

  return {
    selectedClass,
    characterLevel,
    selectedSpells, // DEPRECATED
    selectedCantrips,
    selectedLeveledSpells,
    spellSlots,
    maxSpells, // DEPRECATED
    maxCantrips,
    maxLeveledSpells,
    toggleSpell,
    selectionCount, // DEPRECATED
    cantripCount,
    leveledSpellCount,
    setClassData,
    saveToStorage,
    loadFromStorage,
    clearAll
  }
}
