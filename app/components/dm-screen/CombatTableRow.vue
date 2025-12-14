<!-- app/components/dm-screen/CombatTableRow.vue -->
<script setup lang="ts">
import type { DmScreenCharacter } from '~/types/dm-screen'

interface Props {
  character: DmScreenCharacter
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false
})

const emit = defineEmits<{
  click: []
}>()

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const isHighAc = computed(() => props.character.armor_class >= 17)
const hasDeathSaves = computed(() =>
  props.character.combat.death_saves.successes > 0 ||
  props.character.combat.death_saves.failures > 0
)
const isConcentrating = computed(() => props.character.combat.concentration.active)
const hasConditions = computed(() => props.character.conditions.length > 0)
</script>

<template>
  <tr
    data-testid="combat-row"
    class="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
    :class="{ 'bg-neutral-50 dark:bg-neutral-800': expanded }"
    @click="emit('click')"
  >
    <!-- Name + Class -->
    <td class="py-3 px-4">
      <div class="font-medium text-neutral-900 dark:text-white">
        {{ character.name }}
      </div>
      <div class="text-xs text-neutral-500">
        {{ character.class_name }} {{ character.level }}
      </div>
      <!-- Status indicators -->
      <div
        v-if="hasDeathSaves || isConcentrating || hasConditions"
        class="mt-1 flex flex-wrap gap-1"
      >
        <DmScreenDeathSavesCompact
          v-if="hasDeathSaves"
          :successes="character.combat.death_saves.successes"
          :failures="character.combat.death_saves.failures"
        />
        <UBadge
          v-if="isConcentrating"
          color="spell"
          variant="subtle"
          size="md"
        >
          ◉ {{ character.combat.concentration.spell }}
        </UBadge>
        <UBadge
          v-for="condition in character.conditions"
          :key="condition.slug"
          color="warning"
          variant="subtle"
          size="md"
        >
          {{ condition.name }}
        </UBadge>
      </div>
    </td>

    <!-- HP Bar -->
    <td class="py-3 px-4 min-w-[180px]">
      <DmScreenHpBar
        :current="character.hit_points.current"
        :max="character.hit_points.max"
        :temp="character.hit_points.temp"
      />
    </td>

    <!-- AC -->
    <td class="py-3 px-4 text-center">
      <UBadge
        data-testid="ac-badge"
        :color="isHighAc ? 'primary' : 'neutral'"
        :variant="isHighAc ? 'solid' : 'subtle'"
        size="lg"
        class="font-mono font-bold"
      >
        {{ character.armor_class }}
      </UBadge>
    </td>

    <!-- Initiative -->
    <td class="py-3 px-4 text-center font-mono">
      {{ formatModifier(character.combat.initiative_modifier) }}
    </td>

    <!-- Passive Perception -->
    <td class="py-3 px-4 text-center">
      {{ character.senses.passive_perception }}
    </td>

    <!-- Passive Investigation -->
    <td class="py-3 px-4 text-center">
      {{ character.senses.passive_investigation }}
    </td>

    <!-- Passive Insight -->
    <td class="py-3 px-4 text-center">
      {{ character.senses.passive_insight }}
    </td>
  </tr>
</template>
