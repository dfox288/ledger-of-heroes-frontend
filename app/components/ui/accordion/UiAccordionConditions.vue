<script setup lang="ts">
import type { EntityConditionResource } from '~/types/api/entities'
import { getConditionEffectColor } from '~/utils/badgeColors'

interface Props {
  conditions: EntityConditionResource[]
  entityType?: 'race' | 'feat' | 'monster'
}

defineProps<Props>()

/**
 * Format effect type for display
 */
const formatEffectType = (effectType: string): string => {
  return effectType.charAt(0).toUpperCase() + effectType.slice(1)
}
</script>

<template>
  <div
    v-if="conditions && conditions.length > 0"
    class="p-4 space-y-3"
  >
    <div
      v-for="conditionRelation in conditions"
      :key="conditionRelation.id"
      class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
    >
      <div class="flex items-start gap-3">
        <!-- Condition Name Badge -->
        <UBadge
          :color="getConditionEffectColor(conditionRelation.effect_type)"
          variant="soft"
        >
          {{ conditionRelation.condition?.name || 'Unknown' }}
        </UBadge>

        <!-- Content -->
        <div class="flex-1">
          <!-- Effect Type -->
          <div
            v-if="conditionRelation.effect_type"
            class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
          >
            Effect: {{ formatEffectType(conditionRelation.effect_type) }}
          </div>

          <!-- Condition Description -->
          <div
            v-if="conditionRelation.condition?.description"
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            {{ conditionRelation.condition.description }}
          </div>

          <!-- Entity-Specific Description -->
          <div
            v-if="conditionRelation.description"
            class="text-sm text-gray-600 dark:text-gray-400 mt-2 italic"
          >
            {{ conditionRelation.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
