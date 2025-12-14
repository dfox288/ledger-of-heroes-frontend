<!-- app/components/dm-screen/CombatTable.vue -->
<script setup lang="ts">
import type { DmScreenCharacter } from '~/types/dm-screen'

interface Props {
  characters: DmScreenCharacter[]
}

defineProps<Props>()

const expandedCharacterId = ref<number | null>(null)

function toggleExpand(characterId: number) {
  if (expandedCharacterId.value === characterId) {
    expandedCharacterId.value = null
  } else {
    expandedCharacterId.value = characterId
  }
}
</script>

<template>
  <div class="overflow-x-auto">
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
      <tbody>
        <template
          v-for="character in characters"
          :key="character.id"
        >
          <DmScreenCombatTableRow
            :character="character"
            :expanded="expandedCharacterId === character.id"
            @click="toggleExpand(character.id)"
          />
          <tr
            v-if="expandedCharacterId === character.id"
            data-testid="character-detail"
          >
            <td colspan="7">
              <DmScreenCharacterDetail :character="character" />
            </td>
          </tr>
        </template>
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
