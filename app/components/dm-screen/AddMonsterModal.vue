<!-- app/components/dm-screen/AddMonsterModal.vue -->
<script setup lang="ts">
import type { Monster } from '~/types'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'add': [monsterId: number, quantity: number]
}>()

const { apiFetch } = useApi()

const searchQuery = ref('')
const searchResults = ref<Monster[]>([])
const searching = ref(false)
const selectedMonster = ref<Monster | null>(null)
const quantity = ref(1)

// Debounced search
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const response = await apiFetch<{ data: Monster[] }>(
      `/monsters?q=${encodeURIComponent(query)}&per_page=10`
    )
    searchResults.value = response.data
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}, 300)

watch(searchQuery, (query) => {
  debouncedSearch(query)
})

function selectMonster(monster: Monster) {
  selectedMonster.value = monster
}

function clearSelection() {
  selectedMonster.value = null
}

function increaseQuantity() {
  if (quantity.value < 20) {
    quantity.value++
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function handleAdd() {
  if (!selectedMonster.value) return
  emit('add', selectedMonster.value.id, quantity.value)
  handleClose()
}

function handleClose() {
  emit('update:open', false)
}

// Reset state when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    searchResults.value = []
    selectedMonster.value = null
    quantity.value = 1
  }
})
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <h3 class="text-lg font-semibold">
        Add Monster to Encounter
      </h3>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Search Input -->
        <UInput
          v-model="searchQuery"
          placeholder="Search monsters..."
          icon="i-heroicons-magnifying-glass"
          :loading="searching"
          autofocus
        />

        <!-- Selected Monster -->
        <div
          v-if="selectedMonster"
          data-testid="selected-monster"
          class="p-3 rounded-lg border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-medium">{{ selectedMonster.name }}</div>
              <div class="text-sm text-neutral-500">
                CR {{ selectedMonster.challenge_rating }} ·
                HP {{ selectedMonster.hit_points_average }} ·
                AC {{ selectedMonster.armor_class }}
              </div>
            </div>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              size="xs"
              @click="clearSelection"
            />
          </div>

          <!-- Quantity -->
          <div class="mt-3 flex items-center gap-3">
            <span class="text-sm text-neutral-600 dark:text-neutral-400">Quantity:</span>
            <div class="flex items-center gap-1">
              <UButton
                data-testid="decrease-qty"
                icon="i-heroicons-minus"
                size="xs"
                variant="soft"
                :disabled="quantity <= 1"
                @click="decreaseQuantity"
              />
              <span class="w-8 text-center font-mono font-medium">{{ quantity }}</span>
              <UButton
                data-testid="increase-qty"
                icon="i-heroicons-plus"
                size="xs"
                variant="soft"
                :disabled="quantity >= 20"
                @click="increaseQuantity"
              />
            </div>
          </div>
        </div>

        <!-- Search Results -->
        <div
          v-else-if="searchResults.length > 0"
          class="space-y-2 max-h-64 overflow-y-auto"
        >
          <div
            v-for="monster in searchResults"
            :key="monster.id"
            data-testid="monster-result"
            class="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            @click="selectMonster(monster)"
          >
            <div class="font-medium">{{ monster.name }}</div>
            <div class="text-sm text-neutral-500">
              CR {{ monster.challenge_rating }} ·
              HP {{ monster.hit_points_average }} ·
              AC {{ monster.armor_class }}
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div
          v-else-if="searchQuery && !searching"
          class="text-center py-8 text-neutral-500"
        >
          <p>No monsters found</p>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-8 text-neutral-500"
        >
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="w-8 h-8 mx-auto mb-2 opacity-50"
          />
          <p>Search for a monster to add</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          data-testid="cancel-btn"
          color="neutral"
          variant="ghost"
          @click="handleClose"
        >
          Cancel
        </UButton>
        <UButton
          data-testid="add-btn"
          color="primary"
          :disabled="!selectedMonster"
          :loading="loading"
          @click="handleAdd"
        >
          Add {{ quantity > 1 ? `${quantity} Monsters` : 'Monster' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
