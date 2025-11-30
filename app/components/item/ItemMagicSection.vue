<script setup lang="ts">
interface Modifier {
  modifier_category: string
  value: string
  condition?: string | null
}

interface Props {
  chargesMax: string | null
  rechargeFormula: string | null
  rechargeTiming: string | null
  attunementText: string | null
  modifiers: Modifier[]
}

const props = defineProps<Props>()

/**
 * Check if value is numeric
 */
const isNumeric = (value: string | number): boolean => {
  if (typeof value === 'number') return true
  const parsed = parseInt(value)
  return !isNaN(parsed)
}

/**
 * Format modifier value with + or - sign (for numeric values only)
 */
const formatValue = (value: string | number): string => {
  if (!isNumeric(value)) {
    return String(value)
  }
  const numValue = typeof value === 'string' ? parseInt(value) : value
  return numValue > 0 ? `+${numValue}` : `${numValue}`
}

/**
 * Format modifier category to human-readable text
 */
const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    melee_attack: 'melee attack',
    melee_damage: 'melee damage',
    ranged_attack: 'ranged attack',
    ranged_damage: 'ranged damage',
    spell_attack: 'spell attack',
    spell_dc: 'spell save DC',
    ac_bonus: 'AC'
  }

  return categoryMap[category] || category.replace(/_/g, ' ')
}

/**
 * Compute charges display text
 */
const chargesText = computed(() => {
  if (!props.chargesMax) return null

  let text = `${props.chargesMax} charges`

  // Add recharge info if both formula and timing are present
  if (props.rechargeFormula && props.rechargeTiming) {
    text += ` (recharges ${props.rechargeFormula} ${props.rechargeTiming})`
  }

  return text
})

/**
 * Compute formatted modifiers
 */
const formattedModifiers = computed(() => {
  if (!props.modifiers || props.modifiers.length === 0) return []

  return props.modifiers.map(mod => ({
    text: `${formatValue(mod.value)} ${formatCategory(mod.modifier_category)}`,
    original: mod
  }))
})

/**
 * Check if component has any content to display
 */
const hasContent = computed(() => {
  return !!(chargesText.value || props.attunementText || formattedModifiers.value.length > 0)
})
</script>

<template>
  <div
    v-if="hasContent"
    class="space-y-3"
  >
    <!-- Charges line -->
    <div
      v-if="chargesText"
      class="flex items-start gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div
        class="text-xl flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        ⚡
      </div>
      <div class="text-sm">
        {{ chargesText }}
      </div>
    </div>

    <!-- Attunement line -->
    <div
      v-if="attunementText"
      class="flex items-start gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div
        class="text-xl flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        🔮
      </div>
      <div class="text-sm">
        {{ attunementText }}
      </div>
    </div>

    <!-- Modifiers section -->
    <div
      v-if="formattedModifiers.length > 0"
      class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <div class="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
        Bonuses
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(modifier, index) in formattedModifiers"
          :key="index"
          color="item"
          variant="subtle"
          size="md"
        >
          {{ modifier.text }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
