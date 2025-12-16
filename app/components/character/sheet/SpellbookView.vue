<!-- app/components/character/sheet/SpellbookView.vue -->
<script setup lang="ts">
/**
 * Two-column spellbook view for wizards
 *
 * Main container showing spellbook (left) and prepared spells (right).
 * Handles toggle preparation logic via store.
 *
 * For multiclass support, uses props-based limit (wizard-specific)
 * rather than store's combined limit.
 *
 * @see Issue #680 - Wizard Spellbook Phase 2
 * @see Issue #719 - Multiclass preparation limit fix
 */
import type { CharacterSpell } from '~/types/character'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

const props = defineProps<{
  spells: CharacterSpell[]
  preparedCount: number
  preparationLimit: number
  characterId: number
}>()

const store = useCharacterPlayStateStore()

// Compute prepared count reactively from store (for optimistic updates)
// Count only manually prepared spells from this view's spell list
const displayedPreparedCount = computed(() => {
  // Count spells in our list that are in the store's preparedSpellIds
  return props.spells.filter(s =>
    store.preparedSpellIds.has(s.id) && !s.is_always_prepared
  ).length
})

// Check against this class's limit (not store's combined limit)
const atPrepLimit = computed(() =>
  displayedPreparedCount.value >= props.preparationLimit
)

async function handleToggle(spell: CharacterSpell) {
  // Check local limit before allowing prepare
  if (!spell.is_prepared && atPrepLimit.value) {
    // At limit, don't allow preparing more
    return
  }
  try {
    await store.toggleSpellPreparation(spell.id, spell.is_prepared)
  } catch {
    // Error handled by store (shows toast)
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Spellbook Column (unprepared) -->
    <div data-testid="spellbook-column">
      <CharacterSheetSpellbookColumn
        :spells="spells"
        :at-prep-limit="atPrepLimit"
        @toggle="handleToggle"
      />
    </div>

    <!-- Prepared Column -->
    <div data-testid="prepared-column">
      <CharacterSheetPreparedColumn
        :spells="spells"
        :prepared-count="displayedPreparedCount"
        :preparation-limit="preparationLimit"
        @toggle="handleToggle"
      />
    </div>
  </div>
</template>
