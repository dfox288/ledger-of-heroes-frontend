<!-- app/components/character/EntityPickerCard.vue -->
<script setup lang="ts">
/**
 * Generic entity picker card for character wizard selection steps.
 *
 * Provides the shared UI structure:
 * - Selection ring styling
 * - Background image layer
 * - Selected checkmark badge
 * - Entity name and description
 * - View Details button
 *
 * Entity-specific content (badges, stats) is passed via slots.
 *
 * @example
 * <EntityPickerCard
 *   :entity="race"
 *   :selected="isSelected"
 *   color="race"
 *   image-type="races"
 *   @select="handleSelect"
 *   @view-details="openModal"
 * >
 *   <template #badges>
 *     <UBadge>Custom Badge</UBadge>
 *   </template>
 *   <template #stats>
 *     <span>Speed: 30 ft</span>
 *   </template>
 * </EntityPickerCard>
 */

type EntityColor = 'race' | 'class' | 'background' | 'feat' | 'spell' | 'item'
type ImageType = 'races' | 'classes' | 'backgrounds' | 'feats' | 'spells' | 'items'

interface Entity {
  name: string
  slug: string
  description?: string
}

interface Props {
  entity: Entity
  selected: boolean
  /** Color theme for borders and accents */
  color: EntityColor
  /** Image type for background image lookup (e.g., 'races', 'classes') */
  imageType?: ImageType
  /** Custom image slug (defaults to entity.slug) */
  imageSlug?: string
  /** Hide the View Details button */
  hideViewDetails?: boolean
  /** Custom data-testid attribute (defaults to 'picker-card') */
  testId?: string
  /** Disable selection (visually dimmed, no select event) */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  imageType: undefined,
  imageSlug: undefined,
  hideViewDetails: false,
  testId: 'picker-card',
  disabled: false
})

const emit = defineEmits<{
  'select': [entity: Entity]
  'view-details': []
}>()

/**
 * Handle card click - emit select event (unless disabled)
 */
function handleCardClick() {
  if (!props.disabled) {
    emit('select', props.entity)
  }
}

/**
 * Handle View Details click - emit event, stop propagation
 */
function handleViewDetails(event: Event) {
  event.stopPropagation()
  emit('view-details')
}

/**
 * Get background image path
 */
const { getImagePath } = useEntityImage()
const backgroundImage = computed(() => {
  if (!props.imageType) return null
  const slug = props.imageSlug ?? props.entity.slug
  return getImagePath(props.imageType, slug, 256)
})

/**
 * Dynamic color classes based on color prop
 */
const ringColorClass = computed(() => `ring-${props.color}-500`)
const borderColorClass = computed(() => `border-${props.color}-300 dark:border-${props.color}-700`)
const borderHoverClass = computed(() => `hover:border-${props.color}-500`)
</script>

<template>
  <div
    :data-testid="testId"
    class="relative transition-all"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      selected ? `ring-2 ${ringColorClass} ring-offset-2` : ''
    ]"
    @click="handleCardClick"
  >
    <UCard
      class="relative overflow-hidden transition-shadow h-full border-2"
      :class="[borderColorClass, disabled ? '' : borderHoverClass, disabled ? '' : 'hover:shadow-lg']"
    >
      <!-- Background Image Layer -->
      <div
        v-if="backgroundImage"
        class="absolute inset-0 bg-cover bg-center opacity-15 transition-all duration-300"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- Selected Checkmark -->
      <div
        v-if="selected"
        data-testid="selected-check"
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
          <!-- Badges Slot -->
          <div
            v-if="$slots.badges"
            class="flex items-center gap-2 flex-wrap"
          >
            <slot name="badges" />
          </div>

          <!-- Entity Name -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {{ entity.name }}
          </h3>

          <!-- Stats Slot -->
          <div
            v-if="$slots.stats"
            class="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400"
          >
            <slot name="stats" />
          </div>

          <!-- Description -->
          <p
            v-if="entity.description"
            class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
          >
            {{ entity.description }}
          </p>
        </div>

        <!-- View Details Button -->
        <div
          v-if="!hideViewDetails"
          class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700"
        >
          <UButton
            data-testid="view-details-btn"
            variant="ghost"
            :color="color"
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
