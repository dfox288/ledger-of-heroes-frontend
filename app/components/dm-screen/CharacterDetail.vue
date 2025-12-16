<!-- app/components/dm-screen/CharacterDetail.vue -->
<script setup lang="ts">
import type { DmScreenCharacter } from '~/types/dm-screen'

interface Props {
  character: DmScreenCharacter
}

const props = defineProps<Props>()

type SavingThrowKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const hasSpellSlots = computed(() => {
  const slots = props.character.spell_slots
  if (!slots || typeof slots !== 'object') return false
  return Object.values(slots).some(s => s.max > 0)
})

const hasCounters = computed(() => {
  return props.character.counters && props.character.counters.length > 0
})

const speeds = computed(() => {
  const s = props.character.combat.speeds
  const result: { label: string, value: number }[] = []
  if (s.walk) result.push({ label: 'Walk', value: s.walk })
  if (s.fly) result.push({ label: 'Fly', value: s.fly })
  if (s.swim) result.push({ label: 'Swim', value: s.swim })
  if (s.climb) result.push({ label: 'Climb', value: s.climb })
  return result
})

const savingThrowEntries = computed(() => {
  const order: SavingThrowKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
  return order.map(key => ({
    ability: key,
    modifier: props.character.saving_throws[key]
  }))
})

// Determine color class for saving throw based on modifier
// Weak (≤ 0): red/rose - easy to target
// Strong (≥ 5): green/emerald - likely proficient
// Normal (1-4): neutral
function getSaveColorClass(modifier: number): string {
  if (modifier <= 0) return 'text-rose-600 dark:text-rose-400'
  if (modifier >= 5) return 'text-emerald-600 dark:text-emerald-400'
  return ''
}
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Combat Section -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-2">
          Combat
        </h4>

        <!-- Speeds -->
        <div class="mb-3">
          <div class="text-xs text-neutral-400 mb-1">
            Speeds
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="speed in speeds"
              :key="speed.label"
              class="text-sm"
            >
              {{ speed.label }}: {{ speed.value }} ft
            </span>
          </div>
        </div>

        <!-- Concentration -->
        <div
          v-if="character.combat.concentration.active"
          class="mb-3"
        >
          <div class="text-xs text-neutral-400 mb-1">
            Concentration
          </div>
          <UBadge
            color="spell"
            variant="subtle"
            size="md"
          >
            {{ character.combat.concentration.spell }}
          </UBadge>
        </div>

        <!-- Saving Throws -->
        <div>
          <div class="text-xs text-neutral-400 mb-1">
            Saving Throws
          </div>
          <div class="grid grid-cols-3 gap-1 text-sm">
            <div
              v-for="st in savingThrowEntries"
              :key="st.ability"
              :data-testid="`save-${st.ability}`"
              class="flex justify-between"
              :class="getSaveColorClass(st.modifier)"
            >
              <span :class="getSaveColorClass(st.modifier) ? '' : 'text-neutral-500'">{{ st.ability }}</span>
              <span class="font-mono font-medium">{{ formatModifier(st.modifier) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment Section (simplified - AC shown in main row) -->
      <div>
        <h4 class="text-xs font-medium text-neutral-500 uppercase mb-2">
          Equipment
        </h4>

        <!-- Shield -->
        <div
          v-if="character.equipment.shield"
          class="mb-2"
        >
          <UBadge
            color="neutral"
            variant="subtle"
            size="md"
          >
            🛡️ Shield
          </UBadge>
        </div>

        <!-- Weapons -->
        <div v-if="character.equipment.weapons.length > 0">
          <div class="text-xs text-neutral-400 mb-1">
            Weapons
          </div>
          <div class="space-y-1">
            <div
              v-for="weapon in character.equipment.weapons"
              :key="weapon.name"
              class="text-sm"
            >
              <span class="font-medium">{{ weapon.name }}</span>
              <span class="text-neutral-500 ml-1">{{ weapon.damage }}</span>
              <span
                v-if="weapon.range"
                class="text-neutral-400 ml-1"
              >
                ({{ weapon.range }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Spell Slots + Class Resources + Conditions -->
      <div>
        <!-- Spell Slots -->
        <div
          v-if="hasSpellSlots"
          class="mb-4"
        >
          <h4 class="text-xs font-medium text-neutral-500 uppercase mb-2">
            Spell Slots
          </h4>
          <DmScreenSpellSlotsCompact :slots="character.spell_slots" />
        </div>

        <!-- Class Resources (Counters) -->
        <div
          v-if="hasCounters"
          class="mb-4"
        >
          <h4 class="text-xs font-medium text-neutral-500 uppercase mb-2">
            Class Resources
          </h4>
          <DmScreenCountersCompact :counters="character.counters" />
        </div>

        <!-- Conditions -->
        <div>
          <h4 class="text-xs font-medium text-neutral-500 uppercase mb-2">
            Conditions
          </h4>
          <div
            v-if="character.conditions.length > 0"
            class="flex flex-wrap gap-1"
          >
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
          <div
            v-else
            class="text-sm text-neutral-400"
          >
            No active conditions
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
