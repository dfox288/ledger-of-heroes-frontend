<!-- app/components/character/sheet/WeaponsPanel.vue -->
<script setup lang="ts">
import type { CharacterWeapon, AbilityScoreCode, BasicAttack } from '~/types/character'
import { formatModifier } from '~/utils/formatModifier'

const props = defineProps<{
  weapons: CharacterWeapon[]
  proficiencyBonus: number
  abilityModifiers: Record<AbilityScoreCode, number>
  /** Backend-calculated unarmed strike (optional, falls back to computed) */
  unarmedStrike?: BasicAttack | null
  /** Backend-calculated improvised weapon (optional) */
  improvisedWeapon?: BasicAttack | null
}>()

// Track which weapons are expanded (using Record for native Vue reactivity)
const expandedWeapons = ref<Record<number, boolean>>({})

function toggleExpand(index: number) {
  expandedWeapons.value[index] = !expandedWeapons.value[index]
}

function isExpanded(index: number): boolean {
  return !!expandedWeapons.value[index]
}

/**
 * Format damage string (e.g., "1d8+3" or "1d8-1")
 * Backend pre-computes damage_bonus with all modifiers (ability, fighting style, magic)
 */
function formatDamage(weapon: CharacterWeapon): string {
  const bonus = weapon.damage_bonus
  if (bonus === 0) return weapon.damage_dice
  if (bonus > 0) return `${weapon.damage_dice}+${bonus}`
  return `${weapon.damage_dice}${bonus}` // negative already has minus
}

/**
 * Format damage for basic attacks (unarmed/improvised)
 * Handles both dice-based (1d6+3) and flat damage (1+2)
 */
function formatBasicAttackDamage(attack: BasicAttack): string {
  const bonus = attack.damage_bonus

  // If no dice (basic unarmed strike), it's flat 1 + modifier
  if (!attack.damage_dice) {
    if (bonus === 0) return '1'
    if (bonus > 0) return `1+${bonus}`
    return `1${bonus}` // Negative already has minus
  }

  // Dice-based damage (monk, fighting style, improvised)
  if (bonus === 0) return attack.damage_dice
  if (bonus > 0) return `${attack.damage_dice}+${bonus}`
  return `${attack.damage_dice}${bonus}`
}

/**
 * Computed unarmed strike - uses backend data if available, otherwise fallback
 */
const effectiveUnarmedStrike = computed<BasicAttack>(() => {
  // Use backend data if provided
  if (props.unarmedStrike) {
    return props.unarmedStrike
  }

  // Fallback to computed values (for backwards compatibility)
  const strMod = props.abilityModifiers.STR ?? 0
  return {
    name: 'Unarmed Strike',
    attack_bonus: strMod + props.proficiencyBonus,
    damage_dice: null, // Basic unarmed is flat damage
    damage_bonus: strMod,
    damage_type: 'bludgeoning',
    ability_used: 'STR',
    source: null
  }
})
</script>

<template>
  <div
    class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
    data-testid="weapons-panel"
  >
    <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      Weapons
    </h3>

    <!-- Weapon List -->
    <div
      v-if="weapons.length > 0"
      class="space-y-2"
    >
      <div
        v-for="(weapon, index) in weapons"
        :key="index"
        class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <!-- Collapsed Row -->
        <div
          class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="toggleExpand(index)"
        >
          <span class="font-medium text-gray-900 dark:text-white">
            {{ weapon.name }}
          </span>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600 dark:text-gray-300">
              {{ formatModifier(weapon.attack_bonus) }} to hit
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-300">
              {{ formatDamage(weapon) }}
            </span>
            <UButton
              :data-testid="`expand-weapon-${index}`"
              variant="ghost"
              size="xs"
              :icon="isExpanded(index) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              @click.stop="toggleExpand(index)"
            />
          </div>
        </div>

        <!-- Expanded Details -->
        <div
          v-if="isExpanded(index)"
          class="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50"
        >
          <div class="flex flex-wrap gap-3 text-sm">
            <span class="text-gray-600 dark:text-gray-400">
              {{ weapon.ability_used }}-based
            </span>
            <UBadge
              v-if="weapon.is_proficient"
              color="success"
              variant="subtle"
              size="md"
            >
              Proficient
            </UBadge>
            <UBadge
              v-else
              color="warning"
              variant="subtle"
              size="md"
            >
              Not Proficient
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider before basic attacks -->
    <div
      v-if="weapons.length > 0"
      class="border-t border-gray-200 dark:border-gray-700 my-3"
    />

    <!-- Basic Attacks Section -->
    <div class="space-y-2">
      <!-- Unarmed Strike (always shown) -->
      <div class="flex items-center justify-between p-3 text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
        <div class="flex flex-col">
          <span class="font-medium">{{ effectiveUnarmedStrike.name }}</span>
          <span
            v-if="effectiveUnarmedStrike.damage_type"
            class="text-xs text-gray-500 dark:text-gray-500"
          >
            {{ effectiveUnarmedStrike.damage_type }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm">
            {{ formatModifier(effectiveUnarmedStrike.attack_bonus) }} to hit
          </span>
          <span class="text-sm">
            {{ formatBasicAttackDamage(effectiveUnarmedStrike) }}
          </span>
        </div>
      </div>

      <!-- Improvised Weapon (only if provided by backend) -->
      <div
        v-if="improvisedWeapon"
        class="flex items-center justify-between p-3 text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/30 rounded-lg"
      >
        <div class="flex flex-col">
          <span class="font-medium">{{ improvisedWeapon.name }}</span>
          <span
            v-if="improvisedWeapon.damage_type"
            class="text-xs text-gray-500 dark:text-gray-500"
          >
            {{ improvisedWeapon.damage_type }}
          </span>
          <span
            v-else
            class="text-xs text-gray-500 dark:text-gray-500 italic"
          >
            DM determines type
          </span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm">
            {{ formatModifier(improvisedWeapon.attack_bonus) }} to hit
          </span>
          <span class="text-sm">
            {{ formatBasicAttackDamage(improvisedWeapon) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Inventory Hint (when no equipped weapons) -->
    <div
      v-if="weapons.length === 0"
      class="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center"
    >
      <UIcon
        name="i-heroicons-light-bulb"
        class="w-4 h-4 inline mr-1"
      />
      Add weapons in the Inventory tab
    </div>
  </div>
</template>
