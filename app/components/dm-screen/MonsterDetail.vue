<!-- app/components/dm-screen/MonsterDetail.vue -->
<script setup lang="ts">
import type { EncounterMonster } from '~/types/dm-screen'

interface Props {
  monster: EncounterMonster
}

const props = defineProps<Props>()

function formatModifier(mod: number | null): string {
  if (mod === null) return '—'
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const speeds = computed(() => {
  const s = props.monster.monster.speed
  const result: { label: string, value: number }[] = []
  if (s.walk) result.push({ label: 'Walk', value: s.walk })
  if (s.fly) result.push({ label: 'Fly', value: s.fly })
  if (s.swim) result.push({ label: 'Swim', value: s.swim })
  if (s.climb) result.push({ label: 'Climb', value: s.climb })
  return result
})

const hasActions = computed(() => {
  return props.monster.monster.actions.length > 0
})
</script>

<template>
  <div class="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Stats Section -->
      <div>
        <h4 class="text-xs font-medium text-red-600 dark:text-red-400 uppercase mb-2">
          Stats
        </h4>

        <!-- Monster Name & CR -->
        <div class="mb-3">
          <div class="font-medium text-neutral-900 dark:text-white">
            {{ monster.monster.name }}
          </div>
          <div class="text-sm text-neutral-600 dark:text-neutral-400">
            CR {{ monster.monster.challenge_rating }}
          </div>
        </div>

        <!-- HP Formula -->
        <div class="mb-3">
          <div class="text-xs text-neutral-400 mb-1">
            Hit Dice
          </div>
          <div class="text-sm font-mono">
            {{ monster.monster.hit_points.formula }}
            <span class="text-neutral-500">(avg {{ monster.monster.hit_points.average }})</span>
          </div>
        </div>

        <!-- AC -->
        <div class="mb-3">
          <div class="text-xs text-neutral-400 mb-1">
            Armor Class
          </div>
          <UBadge
            color="monster"
            variant="subtle"
            size="lg"
            class="font-mono font-bold"
          >
            {{ monster.monster.armor_class }}
          </UBadge>
        </div>
      </div>

      <!-- Combat Section -->
      <div>
        <h4 class="text-xs font-medium text-red-600 dark:text-red-400 uppercase mb-2">
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

        <!-- Current HP Status -->
        <div class="mb-3">
          <div class="text-xs text-neutral-400 mb-1">
            Current HP
          </div>
          <div class="flex items-center gap-2">
            <span class="text-lg font-mono font-bold">
              {{ monster.current_hp }} / {{ monster.max_hp }}
            </span>
            <span
              v-if="monster.current_hp <= 0"
              class="text-red-500 font-medium"
            >
              (Dead)
            </span>
            <span
              v-else-if="monster.current_hp <= monster.max_hp / 2"
              class="text-yellow-500 font-medium"
            >
              (Bloodied)
            </span>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="md:col-span-2 lg:col-span-1">
        <h4 class="text-xs font-medium text-red-600 dark:text-red-400 uppercase mb-2">
          Actions
        </h4>

        <div
          v-if="hasActions"
          class="space-y-2"
        >
          <div
            v-for="action in monster.monster.actions"
            :key="action.name"
            class="bg-white dark:bg-neutral-800 rounded p-2 text-sm"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium text-neutral-900 dark:text-white">
                {{ action.name }}
              </span>
              <span
                v-if="action.attack_bonus !== null"
                class="font-mono text-red-600 dark:text-red-400"
              >
                {{ formatModifier(action.attack_bonus) }} to hit
              </span>
            </div>
            <div class="text-neutral-600 dark:text-neutral-400">
              <span v-if="action.damage">
                {{ action.damage }}
              </span>
              <span
                v-if="action.reach"
                class="ml-2 text-neutral-500"
              >
                Reach {{ action.reach }}
              </span>
              <span
                v-if="action.range"
                class="ml-2 text-neutral-500"
              >
                Range {{ action.range }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-else
          class="text-sm text-neutral-500"
        >
          No actions available
        </div>
      </div>
    </div>
  </div>
</template>
