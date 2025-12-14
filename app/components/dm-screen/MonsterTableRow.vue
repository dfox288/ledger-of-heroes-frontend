<!-- app/components/dm-screen/MonsterTableRow.vue -->
<script setup lang="ts">
import type { EncounterMonster } from '~/types/dm-screen'

interface Props {
  monster: EncounterMonster
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
  toggle: []
  'update:hp': [value: number]
  'update:label': [value: string]
  'update:initiative': [value: number]
  remove: []
}>()

// Initiative editing state
const isEditingInit = ref(false)
const editValue = ref('')
const initInput = ref<HTMLInputElement | null>(null)

// HP editing state
const isEditingHp = ref(false)
const hpValue = ref('')
const hpInput = ref<HTMLInputElement | null>(null)

const initiativeDisplay = computed(() => {
  if (props.initiative !== null) return props.initiative.toString()
  return '—'
})

// HP percentage for bar
const hpPercent = computed(() => {
  if (props.monster.max_hp === 0) return 0
  return Math.max(0, Math.min(100, (props.monster.current_hp / props.monster.max_hp) * 100))
})

const hpColor = computed(() => {
  if (hpPercent.value > 50) return 'bg-green-500'
  if (hpPercent.value > 25) return 'bg-yellow-500'
  return 'bg-red-500'
})

function startEditInit(event: Event) {
  event.stopPropagation()
  isEditingInit.value = true
  editValue.value = props.initiative?.toString() ?? ''
  nextTick(() => {
    initInput.value?.focus()
    initInput.value?.select()
  })
}

function saveInit() {
  const value = parseInt(editValue.value, 10)
  if (!isNaN(value) && value >= -10 && value <= 50) {
    emit('update:initiative', value)
  }
  isEditingInit.value = false
}

function cancelEditInit() {
  isEditingInit.value = false
}

function handleInitKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    saveInit()
  } else if (event.key === 'Escape') {
    cancelEditInit()
  }
}

function startEditHp(event: Event) {
  event.stopPropagation()
  isEditingHp.value = true
  hpValue.value = props.monster.current_hp.toString()
  nextTick(() => {
    hpInput.value?.focus()
    hpInput.value?.select()
  })
}

function saveHp() {
  const value = parseInt(hpValue.value, 10)
  // Allow HP up to 2x max for temp HP scenarios
  if (!isNaN(value) && value >= 0 && value <= props.monster.max_hp * 2) {
    emit('update:hp', value)
  }
  isEditingHp.value = false
}

function cancelEditHp() {
  isEditingHp.value = false
}

function handleHpKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    saveHp()
  } else if (event.key === 'Escape') {
    cancelEditHp()
  }
}

function handleRemove(event: Event) {
  event.stopPropagation()
  emit('remove')
}

// Quick HP adjustment functions
function decreaseHp(event: Event) {
  event.stopPropagation()
  if (props.monster.current_hp > 0) {
    emit('update:hp', props.monster.current_hp - 1)
  }
}

function increaseHp(event: Event) {
  event.stopPropagation()
  if (props.monster.current_hp < props.monster.max_hp) {
    emit('update:hp', props.monster.current_hp + 1)
  }
}
</script>

<template>
  <tr
    data-testid="monster-row"
    class="cursor-pointer transition-colors border-l-4 border-l-red-500"
    :class="{
      'bg-neutral-50 dark:bg-neutral-800': expanded && !isCurrentTurn,
      'bg-red-50 dark:bg-red-950 !border-l-red-600': isCurrentTurn,
      'hover:bg-neutral-50 dark:hover:bg-neutral-800': !isCurrentTurn
    }"
    @click="emit('toggle')"
  >
    <!-- Label + CR -->
    <td class="py-3 px-4">
      <div class="flex items-center gap-2">
        <span
          v-if="isCurrentTurn"
          class="text-red-500 font-bold"
          data-testid="turn-indicator"
        >▶</span>
        <div>
          <div class="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
            {{ monster.label }}
            <UBadge color="monster" variant="subtle" size="md">
              CR {{ monster.monster.challenge_rating }}
            </UBadge>
          </div>
          <div class="text-xs text-neutral-500">
            {{ monster.monster.name }}
          </div>
        </div>
      </div>
    </td>

    <!-- HP Bar (editable) -->
    <td
      class="py-3 px-4 min-w-[180px]"
      @click.stop
    >
      <!-- Edit mode -->
      <div
        v-if="isEditingHp"
        class="flex items-center gap-2"
      >
        <input
          ref="hpInput"
          v-model="hpValue"
          data-testid="hp-input"
          type="number"
          class="w-16 px-2 py-1 text-center font-mono text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          @blur="saveHp"
          @keydown="handleHpKeydown"
        >
        <span class="text-neutral-500">/ {{ monster.max_hp }}</span>
      </div>
      <!-- Display mode -->
      <div
        v-else
        class="flex items-center gap-1"
      >
        <!-- Minus button -->
        <UButton
          data-testid="hp-minus-btn"
          icon="i-heroicons-minus"
          size="xs"
          variant="ghost"
          color="error"
          :disabled="monster.current_hp <= 0"
          @click="decreaseHp"
        />
        <!-- HP bar (clickable to edit) -->
        <button
          data-testid="hp-bar"
          class="flex-1 text-left"
          @click="startEditHp"
        >
          <div class="flex items-center gap-2">
            <div class="flex-1 h-4 bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden">
              <div
                class="h-full transition-all"
                :class="hpColor"
                :style="{ width: `${hpPercent}%` }"
              />
            </div>
            <span class="text-sm font-mono w-14 text-right">
              {{ monster.current_hp }}/{{ monster.max_hp }}
            </span>
          </div>
        </button>
        <!-- Plus button -->
        <UButton
          data-testid="hp-plus-btn"
          icon="i-heroicons-plus"
          size="xs"
          variant="ghost"
          color="success"
          :disabled="monster.current_hp >= monster.max_hp"
          @click="increaseHp"
        />
      </div>
    </td>

    <!-- AC -->
    <td class="py-3 px-4 text-center">
      <UBadge color="monster" variant="subtle" size="lg" class="font-mono font-bold">
        {{ monster.monster.armor_class }}
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
        ref="initInput"
        v-model="editValue"
        data-testid="init-input"
        type="number"
        class="w-16 px-2 py-1 text-center font-mono text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        @blur="saveInit"
        @keydown="handleInitKeydown"
      >
      <!-- Display mode -->
      <button
        v-else
        data-testid="init-display"
        class="inline-flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        :class="{ 'bg-neutral-100 dark:bg-neutral-700': initiative !== null }"
        :aria-label="`Edit initiative for ${monster.label}`"
        @click="startEditInit"
      >
        <span class="font-mono font-medium">{{ initiativeDisplay }}</span>
      </button>
    </td>

    <!-- Actions (condensed) - spans 2 columns to match character Perc/Inv -->
    <td
      colspan="2"
      class="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400"
    >
      <div
        v-for="action in monster.monster.actions.slice(0, 2)"
        :key="action.name"
        class="truncate"
      >
        {{ action.name }}: +{{ action.attack_bonus }} ({{ action.damage }})
      </div>
      <div
        v-if="monster.monster.actions.length > 2"
        class="text-xs text-neutral-400"
      >
        +{{ monster.monster.actions.length - 2 }} more
      </div>
    </td>

    <!-- Remove button - matches character Ins column -->
    <td
      class="py-3 px-4 text-center"
      @click.stop
    >
      <UButton
        data-testid="remove-btn"
        icon="i-heroicons-trash"
        color="error"
        variant="ghost"
        size="xs"
        @click="handleRemove"
      />
    </td>
  </tr>
</template>
