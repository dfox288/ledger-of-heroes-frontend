import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { CharacterClass } from '~/types'

interface SpellSlots {
  cantrips: number
  [key: string]: number // '1st', '2nd', etc.
}

export interface UseSpellListGeneratorReturn {
  selectedClass: Ref<CharacterClass | null>
  characterLevel: Ref<number>
  selectedSpells: Ref<Set<number>>
  spellSlots: ComputedRef<SpellSlots>
  setClassData: (classData: CharacterClass) => void
}

export function useSpellListGenerator(): UseSpellListGeneratorReturn {
  const selectedClass = ref<CharacterClass | null>(null)
  const characterLevel = ref(1)
  const selectedSpells = ref<Set<number>>(new Set())

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
      const value = (progression as any)[key] || 0
      if (value > 0 || i <= 3) { // Always include 1st-3rd
        const slotKey = i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : `${i}th`
        slots[slotKey] = value
      }
    }

    return slots
  })

  return {
    selectedClass,
    characterLevel,
    selectedSpells,
    spellSlots,
    setClassData
  }
}
