<!-- app/components/character/picker/SubclassPickerCard.vue -->
<script setup lang="ts">
interface Props {
  subclass: {
    id: number
    name: string
    slug: string
    /** Full slug for API references (e.g., "phb:evoker") - see #318 */
    full_slug: string
    source?: { code: string, name: string }
    description?: string
  }
  selected?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [subclass: Props['subclass']]
  'view-details': []
}>()

/**
 * Handle card click - emit select event
 */
function handleCardClick() {
  emit('select', props.subclass)
}

/**
 * Handle View Details click - emit event, stop propagation
 */
function handleViewDetails(event: Event) {
  event.stopPropagation()
  emit('view-details')
}
</script>

<template>
  <div
    data-testid="picker-card"
    class="relative cursor-pointer transition-all"
    :class="[
      selected ? 'ring-2 ring-class-500 ring-offset-2' : ''
    ]"
    @click="handleCardClick"
  >
    <UCard class="relative overflow-hidden hover:shadow-lg transition-shadow h-full border-2 border-class-300 dark:border-class-700 hover:border-class-500">
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

      <!-- Content Layer -->
      <div class="relative z-10 flex flex-col h-full">
        <div class="space-y-3 flex-1">
          <!-- Source Badge -->
          <div
            v-if="subclass.source"
            class="flex items-center gap-2 flex-wrap"
          >
            <UBadge
              color="info"
              variant="subtle"
              size="md"
            >
              {{ subclass.source.code }}
            </UBadge>
          </div>

          <!-- Subclass Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ subclass.name }}
          </h3>

          <!-- Description Preview -->
          <p
            v-if="subclass.description"
            class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
          >
            {{ subclass.description }}
          </p>
        </div>

        <!-- View Details Button -->
        <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <UButton
            data-testid="view-details-btn"
            variant="ghost"
            color="class"
            size="sm"
            block
            @click="handleViewDetails"
          >
            <UIcon
              name="i-heroicons-eye"
              class="w-4 h-4 mr-1"
            />
            View Details
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
