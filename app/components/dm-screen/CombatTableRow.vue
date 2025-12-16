<!-- app/components/dm-screen/CombatTableRow.vue -->
<script setup lang="ts">
import type { DmScreenCharacter } from '~/types/dm-screen'

interface Props {
  character: DmScreenCharacter
  expanded?: boolean
  isCurrentTurn?: boolean
  initiative?: number | null
  inCombat?: boolean
  note?: string
  statuses?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  isCurrentTurn: false,
  initiative: null,
  inCombat: false,
  note: '',
  statuses: () => []
})

const emit = defineEmits<{
  'toggle': []
  'update:initiative': [value: number]
  'update:note': [text: string]
  'toggle:status': [status: string]
}>()

// Initiative editing using composable
// validate() runs before onSave(), so no need to re-validate
const initEdit = useInlineEdit<string>({
  getValue: () => props.initiative?.toString() ?? '',
  onSave: value => emit('update:initiative', parseInt(value, 10)),
  validate: (value) => {
    const parsed = parseInt(value, 10)
    // D&D initiative range: -10 (very low DEX) to 50 (high DEX + bonuses)
    return !isNaN(parsed) && parsed >= -10 && parsed <= 50
  }
})

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const isHighAc = computed(() => props.character.armor_class >= 17)
const hasDeathSaves = computed(() =>
  props.character.combat.death_saves.successes > 0
  || props.character.combat.death_saves.failures > 0
)
const isConcentrating = computed(() => props.character.combat.concentration.active)
const hasConditions = computed(() => props.character.conditions.length > 0)

// Concentration check helper
const concentrationDamage = ref('')
const concentrationDc = computed(() => {
  const damage = parseInt(concentrationDamage.value, 10)
  if (isNaN(damage) || damage <= 0) return 10
  // DC = 10 or half damage, whichever is higher
  return Math.max(10, Math.floor(damage / 2))
})

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

// Speed display
const speeds = computed(() => props.character.combat.speeds)
const hasFly = computed(() => speeds.value.fly !== null && speeds.value.fly > 0)
const hasSwim = computed(() => speeds.value.swim !== null && speeds.value.swim > 0)
const hasClimb = computed(() => speeds.value.climb !== null && speeds.value.climb > 0)

// Note indicator for status row - ensure note is always a string
const noteString = computed(() => typeof props.note === 'string' ? props.note : '')
const hasNote = computed(() => noteString.value.trim() !== '')

// Positional status toggles
const isProne = computed(() => props.statuses.includes('prone'))
const isFlying = computed(() => props.statuses.includes('flying'))

function handleStatusToggle(status: string, event: Event) {
  event.stopPropagation()
  emit('toggle:status', status)
}
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
        v-if="hasDeathSaves || isConcentrating || hasConditions || hasNote"
        class="mt-1 flex flex-wrap gap-1"
        :class="{ 'ml-6': isCurrentTurn }"
      >
        <DmScreenDeathSavesCompact
          v-if="hasDeathSaves"
          :successes="character.combat.death_saves.successes"
          :failures="character.combat.death_saves.failures"
        />
        <UPopover
          v-if="isConcentrating"
          :ui="{ content: 'p-3' }"
        >
          <UBadge
            color="spell"
            variant="subtle"
            size="md"
            class="cursor-pointer hover:ring-2 hover:ring-spell-500/50"
            data-testid="concentration-badge"
          >
            ◉ {{ character.combat.concentration.spell }}
          </UBadge>
          <template #content>
            <div class="space-y-2 min-w-[200px]">
              <div class="text-sm font-medium">
                Concentration Check
              </div>
              <div class="text-xs text-neutral-500">
                Enter damage to calculate DC
              </div>
              <UInput
                v-model="concentrationDamage"
                type="number"
                placeholder="Damage taken"
                size="sm"
                class="w-full"
                data-testid="concentration-damage-input"
              />
              <div
                v-if="concentrationDamage"
                class="text-sm"
              >
                <span class="font-medium">DC {{ concentrationDc }}</span>
                <span class="text-neutral-500">
                  (CON {{ formatModifier(character.saving_throws.CON) }})
                </span>
              </div>
            </div>
          </template>
        </UPopover>
        <UBadge
          v-for="condition in character.conditions"
          :key="condition.slug"
          color="warning"
          variant="subtle"
          size="md"
        >
          {{ condition.name }}
        </UBadge>
        <!-- Note indicator -->
        <DmScreenNotePopover
          v-if="hasNote"
          :note="note"
          @update:note="emit('update:note', $event)"
        />
      </div>
      <!-- Add note button (when no note exists) -->
      <div
        v-if="!hasNote"
        class="mt-1"
        :class="{ 'ml-6': isCurrentTurn }"
      >
        <DmScreenNotePopover
          :note="note"
          @update:note="emit('update:note', $event)"
        />
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
        v-if="initEdit.isEditing.value"
        :ref="el => initEdit.inputRef.value = el as HTMLInputElement"
        v-model="initEdit.editValue.value"
        data-testid="init-input"
        type="number"
        class="w-16 px-2 py-1 text-center font-mono text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        @blur="initEdit.save"
        @keydown="initEdit.handleKeydown"
      >
      <!-- Display mode -->
      <button
        v-else
        data-testid="init-display"
        class="inline-flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        :class="{ 'bg-neutral-100 dark:bg-neutral-700': initiative !== null }"
        :aria-label="`Edit initiative for ${character.name}`"
        @click="initEdit.startEdit"
      >
        <span class="font-mono font-medium">{{ initiativeDisplay }}</span>
        <span class="text-xs text-neutral-400">{{ modifierHint }}</span>
      </button>
    </td>

    <!-- Speed -->
    <td class="py-3 px-4 text-center">
      <div class="flex items-center justify-center gap-1">
        <span class="font-mono">{{ speeds.walk }} ft</span>
        <UIcon
          v-if="hasFly"
          data-testid="speed-fly"
          name="i-heroicons-paper-airplane"
          class="w-3.5 h-3.5 text-sky-500"
          title="Can fly"
        />
        <UIcon
          v-if="hasSwim"
          data-testid="speed-swim"
          name="i-heroicons-beaker"
          class="w-3.5 h-3.5 text-blue-500"
          title="Can swim"
        />
        <UIcon
          v-if="hasClimb"
          data-testid="speed-climb"
          name="i-heroicons-arrow-trending-up"
          class="w-3.5 h-3.5 text-amber-500"
          title="Can climb"
        />
      </div>
      <!-- Show fly speed when actively flying -->
      <div
        v-if="isFlying && hasFly"
        class="text-xs text-sky-500 font-mono"
      >
        {{ speeds.fly }} ft fly
      </div>
      <!-- Status toggles -->
      <div class="flex items-center justify-center gap-1 mt-1">
        <button
          data-testid="status-prone"
          class="p-1 rounded transition-colors"
          :class="isProne
            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
            : 'opacity-40 hover:opacity-70 text-neutral-400'"
          :title="isProne ? 'Prone (click to remove)' : 'Mark as prone'"
          @click="handleStatusToggle('prone', $event)"
        >
          <UIcon
            name="i-heroicons-arrow-down"
            class="w-4 h-4"
          />
        </button>
        <button
          data-testid="status-flying"
          class="p-1 rounded transition-colors"
          :class="isFlying
            ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'
            : 'opacity-40 hover:opacity-70 text-neutral-400'"
          :title="isFlying ? 'Flying (click to remove)' : 'Mark as flying'"
          @click="handleStatusToggle('flying', $event)"
        >
          <UIcon
            name="i-heroicons-paper-airplane"
            class="w-4 h-4"
          />
        </button>
      </div>
    </td>

    <!-- In Combat: Show Weapons | Not in Combat: Show Passives -->
    <template v-if="inCombat">
      <!-- Weapons (spans 3 columns) -->
      <td
        colspan="3"
        class="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 text-left"
      >
        <div
          v-for="weapon in character.equipment.weapons.slice(0, 2)"
          :key="weapon.name"
          class="truncate"
        >
          {{ weapon.name }}: {{ weapon.damage }}
          <span
            v-if="weapon.range"
            class="text-neutral-400"
          >({{ weapon.range }})</span>
        </div>
        <div
          v-if="character.equipment.weapons.length > 2"
          class="text-xs text-neutral-400"
        >
          +{{ character.equipment.weapons.length - 2 }} more
        </div>
        <div
          v-if="character.equipment.weapons.length === 0"
          class="text-neutral-400 italic text-left"
        >
          No weapons
        </div>
      </td>
    </template>
    <template v-else>
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
    </template>
  </tr>
</template>
