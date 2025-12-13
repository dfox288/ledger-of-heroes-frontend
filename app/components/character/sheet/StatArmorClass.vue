<!-- app/components/character/sheet/StatArmorClass.vue -->
<script setup lang="ts">
/**
 * Armor Class Stat Display
 *
 * Displays AC with a tooltip explaining the calculation.
 * Handles armored, unarmored, and Unarmored Defense (Barbarian/Monk).
 *
 * @see Issue #547 - AC tooltip implementation
 */

interface CharacterEquipped {
  armor?: { name: string, armor_class?: string } | null
  shield?: { name: string, armor_class?: string } | null
}

interface CharacterClass {
  class?: { slug?: string } | null
}

interface CharacterModifiers {
  STR?: number | null
  DEX?: number | null
  CON?: number | null
  INT?: number | null
  WIS?: number | null
  CHA?: number | null
}

interface CharacterData {
  classes?: CharacterClass[] | null
  equipped?: CharacterEquipped | null
  modifiers?: CharacterModifiers | null
}

const props = defineProps<{
  armorClass: number | null
  character: CharacterData
}>()

/**
 * Format a modifier for display (+2 or -1)
 */
function formatMod(value: number | null | undefined): string {
  if (value === null || value === undefined) return '+0'
  return value >= 0 ? `+${value}` : `${value}`
}

/**
 * Check if character has a class with Unarmored Defense
 * Returns the class type: 'barbarian' | 'monk' | null
 */
const unarmoredDefenseClass = computed(() => {
  const classes = props.character.classes
  if (!classes) return null

  for (const entry of classes) {
    const slug = entry.class?.slug?.toLowerCase() ?? ''
    if (slug.includes('barbarian')) return 'barbarian'
    if (slug.includes('monk')) return 'monk'
  }
  return null
})

/**
 * Check if character is wearing armor
 */
const isWearingArmor = computed(() => {
  return props.character.equipped?.armor != null
})

/**
 * Check if character has a shield equipped
 */
const hasShield = computed(() => {
  return props.character.equipped?.shield != null
})

/**
 * Get the AC tooltip text based on equipment and class
 *
 * Shows different information based on:
 * - Wearing armor: "Chain Mail (AC 16)" or "Chain Mail + Shield"
 * - Unarmored with Barbarian: "Unarmored Defense: 10 + DEX + CON"
 * - Unarmored with Monk: "Unarmored Defense: 10 + DEX + WIS"
 * - Unarmored without special class: "Unarmored: 10 + DEX"
 */
const tooltipText = computed(() => {
  const ac = props.armorClass
  const mods = props.character.modifiers
  const dexMod = formatMod(mods?.DEX)

  // Shield suffix - used for both armored and unarmored cases
  const shieldSuffix = hasShield.value
    ? ` + ${props.character.equipped!.shield!.name} (+2)`
    : ''

  if (isWearingArmor.value) {
    const armor = props.character.equipped!.armor!
    return `${armor.name}${shieldSuffix}`
  }

  // Unarmored - check for special class features
  if (unarmoredDefenseClass.value === 'barbarian') {
    const conMod = formatMod(mods?.CON)
    return `Unarmored Defense: 10 + DEX (${dexMod}) + CON (${conMod})${shieldSuffix} = ${ac}`
  }

  if (unarmoredDefenseClass.value === 'monk') {
    const wisMod = formatMod(mods?.WIS)
    return `Unarmored Defense: 10 + DEX (${dexMod}) + WIS (${wisMod})${shieldSuffix} = ${ac}`
  }

  // Basic unarmored AC (potentially with shield)
  return `Unarmored: 10 + DEX (${dexMod})${shieldSuffix} = ${ac}`
})
</script>

<template>
  <UTooltip :text="tooltipText">
    <div
      data-testid="ac-cell"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center cursor-help"
    >
      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        AC
      </div>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ armorClass ?? '—' }}
      </div>
    </div>
  </UTooltip>
</template>
