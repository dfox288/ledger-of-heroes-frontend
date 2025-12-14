<!-- app/components/dm-screen/CombatTable.vue -->
<script setup lang="ts">
import type { DmScreenCharacter } from '~/types/dm-screen'

interface CombatState {
  initiatives: Record<number, number>
  currentTurnId: number | null
  round: number
  inCombat: boolean
}

interface Props {
  characters: DmScreenCharacter[]
  combatState: CombatState
}

const props = defineProps<Props>()

const emit = defineEmits<{
  rollAll: []
  startCombat: []
  nextTurn: []
  previousTurn: []
  resetCombat: []
  setInitiative: [characterId: number, value: number]
}>()

const expandedCharacterId = ref<number | null>(null)

function toggleExpand(characterId: number) {
  if (expandedCharacterId.value === characterId) {
    expandedCharacterId.value = null
  } else {
    expandedCharacterId.value = characterId
  }
}

// Sort characters by initiative (highest first), tiebreaker: DEX modifier
// Characters without initiative go to end in original order
const sortedCharacters = computed(() => {
  const withInit: DmScreenCharacter[] = []
  const withoutInit: DmScreenCharacter[] = []

  for (const character of props.characters) {
    if (props.combatState.initiatives[character.id] !== undefined) {
      withInit.push(character)
    } else {
      withoutInit.push(character)
    }
  }

  withInit.sort((a, b) => {
    const initA = props.combatState.initiatives[a.id] ?? 0
    const initB = props.combatState.initiatives[b.id] ?? 0
    if (initB !== initA) return initB - initA
    // Tiebreaker: higher DEX modifier goes first (D&D rules)
    return b.combat.initiative_modifier - a.combat.initiative_modifier
  })

  return [...withInit, ...withoutInit]
})

function isCurrentTurn(characterId: number): boolean {
  return props.combatState.inCombat && props.combatState.currentTurnId === characterId
}

function getInitiative(characterId: number): number | null {
  return props.combatState.initiatives[characterId] ?? null
}

// Check if any character has initiative set
const hasAnyInitiative = computed(() => {
  return Object.keys(props.combatState.initiatives).length > 0
})
</script>

<template>
  <div class="overflow-x-auto">
    <!-- Combat Toolbar -->
    <div
      v-if="characters.length > 0"
      class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
    >
      <div class="flex items-center gap-2">
        <!-- Roll All / Start Combat -->
        <template v-if="!combatState.inCombat">
          <UButton
            data-testid="roll-all-btn"
            icon="i-heroicons-cube"
            size="sm"
            variant="soft"
            @click="emit('rollAll')"
          >
            Roll Initiative
          </UButton>
          <UButton
            v-if="hasAnyInitiative"
            data-testid="start-combat-btn"
            icon="i-heroicons-play"
            size="sm"
            color="primary"
            @click="emit('startCombat')"
          >
            Start Combat
          </UButton>
        </template>

        <!-- In Combat Controls -->
        <template v-else>
          <UButton
            data-testid="prev-turn-btn"
            icon="i-heroicons-chevron-left"
            size="sm"
            variant="ghost"
            @click="emit('previousTurn')"
          />
          <UButton
            data-testid="next-turn-btn"
            icon="i-heroicons-chevron-right"
            size="sm"
            variant="soft"
            color="primary"
            @click="emit('nextTurn')"
          >
            Next Turn
          </UButton>
        </template>

        <!-- Reset -->
        <UButton
          v-if="hasAnyInitiative || combatState.inCombat"
          data-testid="reset-combat-btn"
          icon="i-heroicons-arrow-path"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="emit('resetCombat')"
        >
          Reset
        </UButton>
      </div>

      <!-- Round Counter -->
      <div
        v-if="combatState.inCombat"
        class="flex items-center gap-2 text-sm"
      >
        <span class="text-neutral-500">Round</span>
        <UBadge
          data-testid="round-counter"
          color="primary"
          variant="solid"
          size="lg"
          class="font-mono font-bold"
        >
          {{ combatState.round }}
        </UBadge>
      </div>
    </div>

    <!-- Table -->
    <table
      v-if="characters.length > 0"
      class="w-full text-sm"
    >
      <thead>
        <tr class="border-b border-neutral-200 dark:border-neutral-700 text-left">
          <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400">
            Name
          </th>
          <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 min-w-[180px]">
            HP
          </th>
          <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
            AC
          </th>
          <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
            Init
          </th>
          <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
            Perc
          </th>
          <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
            Inv
          </th>
          <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
            Ins
          </th>
        </tr>
      </thead>
      <tbody
        v-for="character in sortedCharacters"
        :key="character.id"
      >
        <DmScreenCombatTableRow
          :character="character"
          :expanded="expandedCharacterId === character.id"
          :is-current-turn="isCurrentTurn(character.id)"
          :initiative="getInitiative(character.id)"
          @toggle="toggleExpand(character.id)"
          @update:initiative="(value) => emit('setInitiative', character.id, value)"
        />
        <tr
          v-if="expandedCharacterId === character.id"
          data-testid="character-detail"
        >
          <td colspan="7">
            <DmScreenCharacterDetail :character="character" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty state -->
    <div
      v-else
      class="text-center py-12 text-neutral-500"
    >
      <UIcon
        name="i-heroicons-users"
        class="w-12 h-12 mx-auto mb-4 text-neutral-300"
      />
      <p>No characters in party</p>
    </div>
  </div>
</template>
