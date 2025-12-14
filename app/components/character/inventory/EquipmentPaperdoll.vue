<!-- app/components/character/inventory/EquipmentPaperdoll.vue -->
<script setup lang="ts">
/**
 * Equipment Paperdoll
 *
 * Visual display of all 12 equipment slots arranged around a humanoid silhouette.
 * Click equipped item → scroll to it in item table.
 *
 * Layout designed to resemble a human figure:
 * - Head/neck at top
 * - Arms (weapons) to sides
 * - Torso (armor/cloak/clothes) in center
 * - Rings at hand level
 * - Belt at waist
 * - Gloves and feet at bottom
 */

import type { CharacterEquipment } from '~/types/character'
import { SLOT_LABELS, type EquipmentSlot } from '~/utils/equipmentSlots'

interface Props {
  equipment: CharacterEquipment[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [itemId: number]
}>()

// Get equipped item for a slot
function getEquippedItem(slot: EquipmentSlot): CharacterEquipment | undefined {
  return props.equipment.find(e => e.equipped && e.location === slot)
}

// Get display name for an item
function getItemName(equipment: CharacterEquipment): string {
  if (equipment.custom_name) return equipment.custom_name
  const item = equipment.item as { name?: string } | null
  return item?.name ?? 'Unknown'
}

// Handle click on equipped item
function handleItemClick(item: CharacterEquipment | undefined) {
  if (item) {
    emit('item-click', item.id)
  }
}

// Check if main hand weapon is two-handed (blocks off-hand)
const isTwoHanded = computed(() => {
  const mainHand = getEquippedItem('main_hand')
  if (!mainHand) return false
  const item = mainHand.item as { properties?: string[] } | null
  return item?.properties?.includes('Two-Handed') ?? false
})

// Slot metadata for humanoid layout
interface SlotConfig {
  slot: EquipmentSlot
  gridArea: string
  icon: string
}

const slotConfigs: SlotConfig[] = [
  { slot: 'head', gridArea: 'head', icon: 'i-heroicons-user-circle' },
  { slot: 'neck', gridArea: 'neck', icon: 'i-heroicons-sparkles' },
  { slot: 'cloak', gridArea: 'cloak', icon: 'i-heroicons-cloud' },
  { slot: 'armor', gridArea: 'armor', icon: 'i-heroicons-shield-check' },
  { slot: 'main_hand', gridArea: 'main', icon: 'i-heroicons-hand-raised' },
  { slot: 'off_hand', gridArea: 'off', icon: 'i-heroicons-hand-raised' },
  { slot: 'clothes', gridArea: 'clothes', icon: 'i-heroicons-user' },
  { slot: 'ring_1', gridArea: 'ring1', icon: 'i-heroicons-star' },
  { slot: 'ring_2', gridArea: 'ring2', icon: 'i-heroicons-star' },
  { slot: 'belt', gridArea: 'belt', icon: 'i-heroicons-minus' },
  { slot: 'hands', gridArea: 'hands', icon: 'i-heroicons-hand-thumb-up' },
  { slot: 'feet', gridArea: 'feet', icon: 'i-heroicons-arrow-down-circle' }
]
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
    <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
      Equipment
    </h3>

    <!-- Humanoid Paperdoll Grid -->
    <div class="paperdoll-grid relative">
      <!-- Body silhouette background -->
      <div class="body-silhouette" />

      <!-- Equipment Slots -->
      <template
        v-for="config in slotConfigs"
        :key="config.slot"
      >
        <div
          :data-testid="`slot-${config.slot}`"
          :class="[
            'slot',
            `slot-${config.gridArea}`,
            { 'has-item': getEquippedItem(config.slot) }
          ]"
        >
          <!-- Slot label with icon -->
          <UBadge
            :icon="config.icon"
            color="neutral"
            variant="subtle"
            size="md"
            class="mb-1"
          >
            {{ SLOT_LABELS[config.slot] }}
          </UBadge>

          <!-- Equipped item or empty state -->
          <button
            v-if="getEquippedItem(config.slot)"
            class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary w-full text-center leading-tight transition-colors"
            @click="handleItemClick(getEquippedItem(config.slot))"
          >
            {{ getItemName(getEquippedItem(config.slot)!) }}
          </button>
          <span
            v-else-if="config.slot === 'off_hand' && isTwoHanded"
            class="slot-empty"
          >
            (2H)
          </span>
          <span
            v-else
            class="slot-empty"
          >
            —
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.paperdoll-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas:
    ".     head   ."
    ".     neck   ."
    "main  armor  off"
    "hands cloak  ring1"
    ".     clothes ring2"
    ".     belt   ."
    ".     feet   .";
  gap: 6px;
  padding: 8px;
}

/* Humanoid body silhouette - uses paperdoll.png */
.body-silhouette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url('/paperdoll.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.08;
}

:root.dark .body-silhouette {
  opacity: 0.12;
  filter: invert(1) brightness(1.2);
}

/* Individual slot styling */
.slot {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  min-height: 56px;
  min-width: 0; /* Respect grid column width */
  background: rgba(var(--color-gray-100), 1);
  border: 1px solid rgba(var(--color-gray-200), 1);
  border-radius: 6px;
  transition: all 0.15s ease;
}

:root.dark .slot {
  background: rgba(var(--color-gray-700), 1);
  border-color: rgba(var(--color-gray-600), 1);
}

.slot.has-item {
  background: rgba(var(--color-primary-50), 1);
  border-color: rgba(var(--color-primary-200), 1);
}

:root.dark .slot.has-item {
  background: rgba(var(--color-primary-950), 0.5);
  border-color: rgba(var(--color-primary-700), 0.5);
}

/* Grid area assignments */
.slot-head { grid-area: head; }
.slot-neck { grid-area: neck; }
.slot-main { grid-area: main; }
.slot-armor { grid-area: armor; }
.slot-off { grid-area: off; }
.slot-cloak { grid-area: cloak; }
.slot-clothes { grid-area: clothes; }
.slot-ring1 { grid-area: ring1; }
.slot-ring2 { grid-area: ring2; }
.slot-belt { grid-area: belt; }
.slot-hands { grid-area: hands; }
.slot-feet { grid-area: feet; }

.slot-empty {
  font-size: 10px;
  color: rgba(var(--color-gray-400), 1);
  font-style: italic;
}

:root.dark .slot-empty {
  color: rgba(var(--color-gray-500), 1);
}

/* Make weapon slots slightly larger for emphasis */
.slot-main,
.slot-off {
  min-height: 56px;
}

/* Make armor slot prominent */
.slot-armor {
  min-height: 56px;
}
</style>
