<!-- app/components/dm-screen/CombatTable.vue -->
<script setup lang="ts">
import type { DmScreenCharacter, EncounterMonster } from '~/types/dm-screen'

interface CombatState {
  initiatives: Record<string, number>
  currentTurnId: string | null
  round: number
  inCombat: boolean
}

interface Combatant {
  type: 'character' | 'monster'
  key: string
  data: DmScreenCharacter | EncounterMonster
  init: number | null
}

interface Props {
  characters: DmScreenCharacter[]
  monsters?: EncounterMonster[]
  combatState: CombatState
}

const props = withDefaults(defineProps<Props>(), {
  monsters: () => []
})

const emit = defineEmits<{
  startCombat: []
  nextTurn: []
  previousTurn: []
  resetCombat: []
  setInitiative: [key: string, value: number]
  addMonster: []
  updateMonsterHp: [instanceId: number, value: number]
  updateMonsterLabel: [instanceId: number, value: string]
  removeMonster: [instanceId: number]
  clearEncounter: []
}>()

// Check if there are monsters in the encounter
const hasMonsters = computed(() => props.monsters.length > 0)

const expandedKey = ref<string | null>(null)

function toggleExpand(key: string) {
  if (expandedKey.value === key) {
    expandedKey.value = null
  } else {
    expandedKey.value = key
  }
}

// Sort all combatants by initiative (highest first), tiebreaker: DEX modifier for characters
// Combatants without initiative go to end in original order
const sortedCombatants = computed<Combatant[]>(() => {
  const combatants: Combatant[] = []

  // Add characters
  for (const character of props.characters) {
    const key = `char_${character.id}`
    combatants.push({
      type: 'character',
      key,
      data: character,
      init: props.combatState.initiatives[key] ?? null
    })
  }

  // Add monsters
  for (const monster of props.monsters) {
    const key = `monster_${monster.id}`
    combatants.push({
      type: 'monster',
      key,
      data: monster,
      init: props.combatState.initiatives[key] ?? null
    })
  }

  const withInit = combatants.filter(c => c.init !== null)
  const withoutInit = combatants.filter(c => c.init === null)

  withInit.sort((a, b) => {
    if ((b.init ?? 0) !== (a.init ?? 0)) return (b.init ?? 0) - (a.init ?? 0)
    // Tiebreaker: higher DEX modifier goes first (characters only)
    const modA = a.type === 'character'
      ? (a.data as DmScreenCharacter).combat.initiative_modifier
      : 0
    const modB = b.type === 'character'
      ? (b.data as DmScreenCharacter).combat.initiative_modifier
      : 0
    return modB - modA
  })

  return [...withInit, ...withoutInit]
})

function isCurrentTurn(key: string): boolean {
  return props.combatState.inCombat && props.combatState.currentTurnId === key
}


// Check if there are any combatants (characters or monsters)
const hasCombatants = computed(() => {
  return props.characters.length > 0 || props.monsters.length > 0
})
</script>

<template>
  <div class="overflow-x-auto">
    <!-- Combat Toolbar -->
    <div
      v-if="hasCombatants"
      class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
    >
      <div class="flex items-center gap-2">
        <!-- Start Encounter / Start Combat -->
        <template v-if="!combatState.inCombat">
          <UButton
            data-testid="start-encounter-btn"
            icon="i-heroicons-play"
            size="sm"
            color="primary"
            @click="emit('startCombat')"
          >
            Start Encounter
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

        <!-- Add Monster -->
        <UButton
          data-testid="add-monster-btn"
          icon="i-heroicons-plus"
          size="sm"
          variant="soft"
          color="monster"
          @click="emit('addMonster')"
        >
          Add Monster
        </UButton>

        <!-- Clear Encounter -->
        <UButton
          v-if="hasMonsters"
          data-testid="clear-encounter-btn"
          icon="i-heroicons-trash"
          size="sm"
          variant="ghost"
          color="error"
          @click="emit('clearEncounter')"
        >
          Clear Encounter
        </UButton>

        <!-- Reset (End Encounter) -->
        <UButton
          v-if="combatState.inCombat"
          data-testid="reset-combat-btn"
          icon="i-heroicons-arrow-path"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="emit('resetCombat')"
        >
          End Encounter
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
      v-if="hasCombatants"
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
          <!-- In combat: show Actions header | Not in combat: show Passives -->
          <template v-if="combatState.inCombat">
            <th
              colspan="3"
              class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400"
            >
              Actions / Weapons
            </th>
          </template>
          <template v-else>
            <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
              Perc
            </th>
            <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
              Inv
            </th>
            <th class="py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400 text-center">
              Ins
            </th>
          </template>
        </tr>
      </thead>
      <tbody
        v-for="combatant in sortedCombatants"
        :key="combatant.key"
      >
        <!-- Character Row -->
        <DmScreenCombatTableRow
          v-if="combatant.type === 'character'"
          :character="(combatant.data as DmScreenCharacter)"
          :expanded="expandedKey === combatant.key"
          :is-current-turn="isCurrentTurn(combatant.key)"
          :initiative="combatant.init"
          :in-combat="combatState.inCombat"
          @toggle="toggleExpand(combatant.key)"
          @update:initiative="(value) => emit('setInitiative', combatant.key, value)"
        />
        <!-- Monster Row -->
        <DmScreenMonsterTableRow
          v-else
          :monster="(combatant.data as EncounterMonster)"
          :expanded="expandedKey === combatant.key"
          :is-current-turn="isCurrentTurn(combatant.key)"
          :initiative="combatant.init"
          @toggle="toggleExpand(combatant.key)"
          @update:initiative="(value) => emit('setInitiative', combatant.key, value)"
          @update:hp="(value) => emit('updateMonsterHp', (combatant.data as EncounterMonster).id, value)"
          @update:label="(value) => emit('updateMonsterLabel', (combatant.data as EncounterMonster).id, value)"
          @remove="emit('removeMonster', (combatant.data as EncounterMonster).id)"
        />
        <!-- Expanded Detail -->
        <tr
          v-if="expandedKey === combatant.key"
          :data-testid="combatant.type === 'character' ? 'character-detail' : 'monster-detail'"
        >
          <td colspan="7">
            <DmScreenCharacterDetail
              v-if="combatant.type === 'character'"
              :character="(combatant.data as DmScreenCharacter)"
            />
            <DmScreenMonsterDetail
              v-else
              :monster="(combatant.data as EncounterMonster)"
            />
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
      <UButton
        class="mt-4"
        variant="soft"
        color="monster"
        icon="i-heroicons-plus"
        @click="emit('addMonster')"
      >
        Add Monster
      </UButton>
    </div>
  </div>
</template>
