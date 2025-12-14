<!-- app/components/party/Card.vue -->
<script setup lang="ts">
import type { PartyListItem } from '~/types'

const props = defineProps<{
  party: PartyListItem
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const characterLabel = computed(() =>
  props.party.character_count === 1 ? 'character' : 'characters'
)
</script>

<template>
  <NuxtLink
    :to="`/parties/${party.id}`"
    class="block h-full"
  >
    <UCard class="h-full hover:shadow-lg transition-shadow border-2 border-primary-300 dark:border-primary-700 hover:border-primary-500">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-lg truncate text-gray-900 dark:text-white">
            {{ party.name }}
          </h3>
          <UDropdownMenu
            :items="[[
              { label: 'Edit Party', icon: 'i-heroicons-pencil' },
              { label: 'Delete Party', icon: 'i-heroicons-trash', color: 'error' }
            ]]"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton
              data-testid="party-actions"
              icon="i-heroicons-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="sm"
              @click.prevent.stop
            />
            <template #item="{ item }">
              <span
                class="flex items-center gap-2"
                :class="{ 'text-error-500': item.color === 'error' }"
                @click.prevent.stop="item.label === 'Edit Party' ? $emit('edit') : $emit('delete')"
              >
                <UIcon :name="item.icon" class="w-4 h-4" />
                {{ item.label }}
              </span>
            </template>
          </UDropdownMenu>
        </div>
      </template>

      <div class="space-y-3">
        <!-- Description -->
        <p
          v-if="party.description"
          class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
        >
          {{ party.description }}
        </p>

        <!-- Character Count -->
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
          <span>{{ party.character_count }} {{ characterLabel }}</span>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
