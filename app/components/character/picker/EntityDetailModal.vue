<!-- app/components/character/picker/EntityDetailModal.vue -->
<script setup lang="ts">
/**
 * Generic entity detail modal wrapper for character wizard selection steps.
 *
 * Provides the shared modal structure:
 * - UModal wrapper with v-model open state
 * - Entity name as title (with fallback)
 * - Close event emission
 *
 * Entity-specific content is passed via the default slot.
 *
 * @example
 * <EntityDetailModal
 *   :entity="race"
 *   :open="showModal"
 *   fallback-title="Race Details"
 *   @close="showModal = false"
 * >
 *   <template #default="{ entity }">
 *     <div class="space-y-6">
 *       <p>{{ entity.description }}</p>
 *       <!-- More entity-specific content -->
 *     </div>
 *   </template>
 * </EntityDetailModal>
 */

interface Entity {
  name: string
}

interface Props {
  /** The entity to display details for */
  entity: Entity | null
  /** Whether the modal is open */
  open: boolean
  /** Fallback title when entity is null */
  fallbackTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: 'Details'
})

const emit = defineEmits<{
  close: []
}>()

/**
 * Computed for v-model binding with UModal.
 * Emits close when modal is closed.
 */
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) emit('close')
  }
})

/**
 * Modal title - entity name or fallback
 */
const title = computed(() => props.entity?.name ?? props.fallbackTitle)
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
  >
    <template #body>
      <slot
        v-if="entity"
        :entity="entity"
      />
    </template>
  </UModal>
</template>
