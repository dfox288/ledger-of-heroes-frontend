<!-- app/components/character/picker/EntityDetailModal.vue -->
<script setup lang="ts">
/**
 * Generic entity detail modal wrapper for character wizard selection steps.
 *
 * Provides the shared modal structure:
 * - UModal wrapper with v-model open state
 * - Entity name as title (with fallback)
 *
 * Entity-specific content is passed via the default slot.
 *
 * @example
 * <EntityDetailModal
 *   v-model:open="showModal"
 *   :entity="race"
 *   fallback-title="Race Details"
 * >
 *   <div class="space-y-6">
 *     <p>{{ race.description }}</p>
 *     <!-- More entity-specific content -->
 *   </div>
 * </EntityDetailModal>
 */

interface Entity {
  name: string
}

interface Props {
  /** The entity to display details for */
  entity: Entity | null
  /** Fallback title when entity is null */
  fallbackTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: 'Details'
})

const open = defineModel<boolean>('open', { default: false })

/**
 * Modal title - entity name or fallback
 */
const title = computed(() => props.entity?.name ?? props.fallbackTitle)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
  >
    <template #body>
      <slot v-if="entity" />
    </template>
  </UModal>
</template>
