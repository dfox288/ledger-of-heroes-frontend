<!-- app/components/character/sheet/WeaponsPanel.vue -->
<script setup lang="ts">
import type { CharacterWeapon, AbilityScoreCode } from '~/types/character'

const props = defineProps<{
  weapons: CharacterWeapon[]
  proficiencyBonus: number
  abilityModifiers: Record<AbilityScoreCode, number>
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
 * Calculate total attack bonus for a weapon
 * Formula: ability_modifier + (proficient ? proficiency_bonus : 0) + weapon_attack_bonus
 */
function calculateAttackBonus(weapon: CharacterWeapon): number {
  const abilityMod = props.abilityModifiers[weapon.ability_used] ?? 0
  const profBonus = weapon.is_proficient ? props.proficiencyBonus : 0
  return abilityMod + profBonus + weapon.attack_bonus
}

/**
 * Calculate total damage bonus for a weapon
 * Formula: ability_modifier + weapon_damage_bonus
 */
function calculateDamageBonus(weapon: CharacterWeapon): number {
  const abilityMod = props.abilityModifiers[weapon.ability_used] ?? 0
  return abilityMod + weapon.damage_bonus
}

/**
 * Format damage string (e.g., "1d8+3" or "1d8-1")
 */
function formatDamage(weapon: CharacterWeapon): string {
  const bonus = calculateDamageBonus(weapon)
  if (bonus === 0) return weapon.damage_dice
  if (bonus > 0) return `${weapon.damage_dice}+${bonus}`
  return `${weapon.damage_dice}${bonus}` // negative already has minus
}

/**
 * Format modifier with + sign
 */
function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

/**
 * Calculate unarmed strike damage (1 + STR modifier)
 * Follows same formatting as weapon damage (formatDamage)
 */
const unarmedDamage = computed(() => {
  const strMod = props.abilityModifiers.STR ?? 0
  if (strMod === 0) return '1'
  if (strMod > 0) return `1+${strMod}`
  return `1${strMod}` // Negative mod already includes minus sign (e.g., "1-2")
})

/**
 * Calculate unarmed strike attack bonus (STR + proficiency)
 */
const unarmedAttackBonus = computed(() => {
  const strMod = props.abilityModifiers.STR ?? 0
  return strMod + props.proficiencyBonus
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
              {{ formatModifier(calculateAttackBonus(weapon)) }} to hit
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

    <!-- Divider before unarmed -->
    <div
      v-if="weapons.length > 0"
      class="border-t border-gray-200 dark:border-gray-700 my-3"
    />

    <!-- Unarmed Strike (always shown) -->
    <div class="flex items-center justify-between p-3 text-gray-600 dark:text-gray-400">
      <span class="font-medium">Unarmed Strike</span>
      <div class="flex items-center gap-4">
        <span class="text-sm">
          {{ formatModifier(unarmedAttackBonus) }} to hit
        </span>
        <span class="text-sm">
          {{ unarmedDamage }}
        </span>
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
