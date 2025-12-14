<!-- app/components/party/CharacterList.vue -->
<script setup lang="ts">
import type { PartyCharacter } from '~/types'

defineProps<{
  characters: PartyCharacter[]
}>()

defineEmits<{
  remove: [characterId: number]
}>()
</script>

<template>
  <div>
    <!-- Character Grid -->
    <div
      v-if="characters.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UCard
        v-for="character in characters"
        :key="character.id"
        class="relative"
      >
        <div class="flex items-center gap-3">
          <!-- Portrait -->
          <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <UIcon
              v-if="!character.portrait?.thumb"
              name="i-heroicons-user"
              class="w-6 h-6 text-gray-400"
            />
            <img
              v-else
              :src="character.portrait.thumb"
              :alt="character.name"
              class="w-12 h-12 rounded-full object-cover"
            >
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <NuxtLink
              :to="`/characters/${character.public_id}`"
              class="font-medium text-gray-900 dark:text-white hover:text-primary-500 truncate block"
            >
              {{ character.name }}
            </NuxtLink>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ character.class_name }} &middot; Level {{ character.level }}
            </div>
          </div>

          <!-- Remove Button -->
          <UButton
            icon="i-heroicons-x-mark"
            color="error"
            variant="ghost"
            size="sm"
            @click="$emit('remove', character.id)"
          />
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-heroicons-user-group"
        class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
      />
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
        No characters in this party
      </h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Add characters to track their stats together
      </p>
    </div>
  </div>
</template>
