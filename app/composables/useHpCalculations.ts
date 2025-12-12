// app/composables/useHpCalculations.ts
/**
 * HP Calculation Utilities
 *
 * Pure functions for D&D 5e HP math. These implement the rules:
 * - Temp HP absorbs damage first
 * - Healing caps at max HP
 * - HP cannot go below 0
 * - Temp HP doesn't stack (keep higher)
 */

interface HpDeltaInput {
  delta: number // Negative = damage, positive = healing
  currentHp: number
  maxHp: number
  tempHp: number
}

interface HpDeltaResult {
  newCurrentHp: number
  newTempHp: number
}

/**
 * Apply damage or healing to HP, following D&D 5e rules.
 *
 * For damage (negative delta):
 * - Temp HP absorbs damage first
 * - Remaining damage hits current HP
 * - HP floors at 0
 *
 * For healing (positive delta):
 * - Adds to current HP
 * - Caps at max HP
 * - Does not affect temp HP
 */
export function applyHpDelta(input: HpDeltaInput): HpDeltaResult {
  const { delta, currentHp, maxHp, tempHp } = input

  // Zero delta - no change
  if (delta === 0) {
    return { newCurrentHp: currentHp, newTempHp: tempHp }
  }

  // Healing (positive delta)
  if (delta > 0) {
    const newCurrentHp = Math.min(maxHp, currentHp + delta)
    return { newCurrentHp, newTempHp: tempHp }
  }

  // Damage (negative delta)
  const damage = Math.abs(delta)

  // Temp HP absorbs damage first
  const tempAbsorbed = Math.min(tempHp, damage)
  const newTempHp = tempHp - tempAbsorbed

  // Remaining damage hits current HP
  const remainingDamage = damage - tempAbsorbed
  const newCurrentHp = Math.max(0, currentHp - remainingDamage)

  return { newCurrentHp, newTempHp }
}

interface TempHpInput {
  newTempHp: number
  currentTempHp: number
}

/**
 * Apply temp HP, following D&D 5e rules.
 *
 * Temp HP doesn't stack - you keep the higher value.
 * Returns the effective temp HP value.
 */
export function applyTempHp(input: TempHpInput): number {
  const { newTempHp, currentTempHp } = input
  return Math.max(newTempHp, currentTempHp)
}
