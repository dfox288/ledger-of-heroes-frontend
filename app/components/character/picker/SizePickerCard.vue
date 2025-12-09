<!-- app/components/character/picker/SizePickerCard.vue -->
<script setup lang="ts">
/**
 * Size option from pending-choices API
 */
interface SizeOption {
  id: number
  code: string
  name: string
}

interface Props {
  size: SizeOption
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [size: SizeOption]
}>()

/**
 * Get icon based on size
 */
const sizeIcon = computed(() => {
  return props.size.code === 'S'
    ? 'i-heroicons-arrow-down-circle'
    : 'i-heroicons-arrow-up-circle'
})

/**
 * Get description based on size
 */
const sizeDescription = computed(() => {
  if (props.size.code === 'S') {
    return 'Smaller stature. Can move through spaces occupied by larger creatures. Better for sneaking and fitting into tight spaces.'
  }
  return 'Standard humanoid size. No special movement restrictions. Most equipment is designed for Medium creatures.'
})

/**
 * Handle card click
 */
function handleCardClick() {
  emit('select', props.size)
}
</script>

<template>
  <div
    data-testid="size-picker-card"
    class="relative cursor-pointer transition-all"
    :class="[
      selected ? 'ring-2 ring-race-500 ring-offset-2 dark:ring-offset-gray-900' : ''
    ]"
    @click="handleCardClick"
  >
    <UCard
      class="h-full hover:shadow-lg transition-shadow"
      :class="[
        selected
          ? 'border-2 border-race-500 bg-race-50 dark:bg-race-900/20'
          : 'border-2 border-gray-200 dark:border-gray-700 hover:border-race-400'
      ]"
    >
      <!-- Selected Checkmark -->
      <div
        v-if="selected"
        class="absolute top-2 right-2 z-20"
      >
        <UBadge
          color="success"
          variant="solid"
          size="md"
        >
          <UIcon
            name="i-heroicons-check"
            class="w-4 h-4"
          />
        </UBadge>
      </div>

      <div class="flex flex-col items-center text-center space-y-3">
        <!-- Size Icon -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center"
          :class="[
            selected
              ? 'bg-race-100 dark:bg-race-800'
              : 'bg-gray-100 dark:bg-gray-800'
          ]"
        >
          <UIcon
            :name="sizeIcon"
            class="w-8 h-8"
            :class="[
              selected
                ? 'text-race-600 dark:text-race-400'
                : 'text-gray-500 dark:text-gray-400'
            ]"
          />
        </div>

        <!-- Size Name -->
        <h3
          class="text-xl font-semibold"
          :class="[
            selected
              ? 'text-race-700 dark:text-race-300'
              : 'text-gray-900 dark:text-gray-100'
          ]"
        >
          {{ size.name }}
        </h3>

        <!-- Size Code Badge -->
        <UBadge
          :color="selected ? 'primary' : 'neutral'"
          variant="subtle"
          size="lg"
        >
          {{ size.code }}
        </UBadge>

        <!-- Description -->
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ sizeDescription }}
        </p>
      </div>
    </UCard>
  </div>
</template>
