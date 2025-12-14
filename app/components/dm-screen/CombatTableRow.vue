<!-- app/components/dm-screen/CombatTableRow.vue -->
<script setup lang="ts">
import type { DmScreenCharacter } from '~/types/dm-screen'

interface Props {
  character: DmScreenCharacter
  expanded?: boolean
  isCurrentTurn?: boolean
  initiative?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  isCurrentTurn: false,
  initiative: null
})

const emit = defineEmits<{
  'toggle': []
  'update:initiative': [value: number]
}>()

// Initiative editing state
const isEditingInit = ref(false)
const editValue = ref('')

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

function startEditInit(event: Event) {
  event.stopPropagation() // Don't trigger row toggle
  isEditingInit.value = true
  editValue.value = props.initiative?.toString() ?? ''
  nextTick(() => {
    const input = document.querySelector('[data-testid="init-input"]') as HTMLInputElement
    input?.focus()
    input?.select()
  })
}

function saveInit() {
  const value = parseInt(editValue.value, 10)
  if (!isNaN(value)) {
    emit('update:initiative', value)
  }
  isEditingInit.value = false
}

function cancelEdit() {
  isEditingInit.value = false
}

function handleInitKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    saveInit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

const isHighAc = computed(() => props.character.armor_class >= 17)
const hasDeathSaves = computed(() =>
  props.character.combat.death_saves.successes > 0
  || props.character.combat.death_saves.failures > 0
)
const isConcentrating = computed(() => props.character.combat.concentration.active)
const hasConditions = computed(() => props.character.conditions.length > 0)

// Display initiative: show rolled value or just modifier if not rolled
const initiativeDisplay = computed(() => {
  if (props.initiative !== null) {
    return props.initiative.toString()
  }
  return '—'
})

const modifierHint = computed(() => {
  return formatModifier(props.character.combat.initiative_modifier)
})
</script>

<template>
  <tr
    data-testid="combat-row"
    class="cursor-pointer transition-colors"
    :class="{
      'bg-neutral-50 dark:bg-neutral-800': expanded && !isCurrentTurn,
      'bg-emerald-50 dark:bg-emerald-950 border-l-4 border-l-emerald-500': isCurrentTurn,
      'hover:bg-neutral-50 dark:hover:bg-neutral-800': !isCurrentTurn
    }"
    @click="emit('toggle')"
  >
    <!-- Name + Class -->
    <td class="py-3 px-4">
      <div class="flex items-center gap-2">
        <!-- Current turn indicator -->
        <span
          v-if="isCurrentTurn"
          class="text-emerald-500 font-bold"
          data-testid="turn-indicator"
        >▶</span>
        <div>
          <div class="font-medium text-neutral-900 dark:text-white">
            {{ character.name }}
          </div>
          <div class="text-xs text-neutral-500">
            {{ character.class_name }} {{ character.level }}
          </div>
        </div>
      </div>
      <!-- Status indicators -->
      <div
        v-if="hasDeathSaves || isConcentrating || hasConditions"
        class="mt-1 flex flex-wrap gap-1"
        :class="{ 'ml-6': isCurrentTurn }"
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

    <!-- Initiative (editable) -->
    <td
      class="py-3 px-4 text-center"
      @click.stop
    >
      <!-- Edit mode -->
      <input
        v-if="isEditingInit"
        v-model="editValue"
        data-testid="init-input"
        type="number"
        class="w-14 px-2 py-1 text-center font-mono text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        @blur="saveInit"
        @keydown="handleInitKeydown"
      >
      <!-- Display mode -->
      <button
        v-else
        data-testid="init-display"
        class="inline-flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        :class="{ 'bg-neutral-100 dark:bg-neutral-700': initiative !== null }"
        @click="startEditInit"
      >
        <span class="font-mono font-medium">{{ initiativeDisplay }}</span>
        <span class="text-xs text-neutral-400">{{ modifierHint }}</span>
      </button>
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
