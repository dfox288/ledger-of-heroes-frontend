<script setup lang="ts">
interface Action {
  id?: number
  name: string
  description: string
  attack_data?: string | null
  recharge?: string | null
  action_cost?: number
}

interface Props {
  actions: Action[]
  title: string
  showCost?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCost: false
})

const items = computed(() => {
  if (!props.actions || props.actions.length === 0) return []

  return [{
    label: `${props.title} (${props.actions.length})`,
    defaultOpen: true,
    slot: 'actions'
  }]
})

/**
 * Get action cost text
 */
function getActionCostText(cost: number): string {
  return cost === 1 ? 'Costs 1 Action' : `Costs ${cost} Actions`
}
</script>

<template>
  <UAccordion
    v-if="actions.length > 0"
    :items="items"
    class="[&_.ui-accordion-item]:border [&_.ui-accordion-item]:border-gray-200 dark:[&_.ui-accordion-item]:border-gray-700 [&_.ui-accordion-item]:rounded-lg [&_.ui-accordion-item]:overflow-hidden [&_.ui-accordion-item]:mb-4"
  >
    <template #actions>
      <div class="space-y-4 p-4">
        <div
          v-for="action in actions"
          :key="action.id || action.name"
          class="space-y-2"
        >
          <!-- Action name with badges -->
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-semibold text-primary-600 dark:text-primary-400">
              {{ action.name }}
            </h4>
            <UBadge
              v-if="action.recharge"
              color="warning"
              variant="soft"
              size="sm"
            >
              Recharge {{ action.recharge }}
            </UBadge>
            <UBadge
              v-if="showCost && action.action_cost"
              color="info"
              variant="soft"
              size="sm"
            >
              {{ getActionCostText(action.action_cost) }}
            </UBadge>
          </div>

          <!-- Action description -->
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ action.description }}
          </p>
        </div>
      </div>
    </template>
  </UAccordion>
</template>
