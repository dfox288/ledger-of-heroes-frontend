/**
 * useMulticlassEligibility
 *
 * Checks if a character meets multiclass prerequisites for a class.
 * D&D 5e multiclass rules require meeting ability score minimums.
 */

export interface MulticlassRequirement {
  ability: { id: number; code: string; name: string }
  ability_name: string
  minimum_score: number
  is_alternative: boolean
}

export interface MulticlassRequirements {
  type: 'and' | 'or' | null
  requirements: MulticlassRequirement[]
}

/**
 * Ability scores in API format (STR, DEX, etc.)
 * Named differently from characterWizard.AbilityScores which uses full names
 */
export interface AbilityScoreMap {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface EligibilityResult {
  eligible: boolean
  missingRequirements: string[]
  requirementText: string
}

/**
 * Check if ability scores meet a single requirement
 */
function meetsRequirement(scores: AbilityScoreMap, req: MulticlassRequirement): boolean {
  const abilityCode = req.ability.code as keyof AbilityScoreMap
  const score = scores[abilityCode]
  return score >= req.minimum_score
}

/**
 * Format requirement as readable text
 */
function formatRequirement(req: MulticlassRequirement): string {
  return `${req.ability.name} ${req.minimum_score}`
}

/**
 * Check multiclass eligibility for a class
 */
export function checkMulticlassEligibility(
  abilityScores: AbilityScoreMap,
  requirements: MulticlassRequirements | null
): EligibilityResult {
  // No requirements = always eligible
  if (!requirements || requirements.requirements.length === 0) {
    return {
      eligible: true,
      missingRequirements: [],
      requirementText: ''
    }
  }

  const { type, requirements: reqs } = requirements

  // Single requirement or "and" type - all must pass
  if (type === null || type === 'and') {
    const missing: string[] = []

    for (const req of reqs) {
      if (!meetsRequirement(abilityScores, req)) {
        missing.push(formatRequirement(req))
      }
    }

    const eligible = missing.length === 0
    const requirementText = reqs.map(formatRequirement).join(' and ')

    return {
      eligible,
      missingRequirements: missing,
      requirementText: `Requires ${requirementText}`
    }
  }

  // "or" type - at least one must pass
  if (type === 'or') {
    const metAny = reqs.some(req => meetsRequirement(abilityScores, req))
    const requirementText = reqs.map(formatRequirement).join(' or ')

    if (metAny) {
      return {
        eligible: true,
        missingRequirements: [],
        requirementText: `Requires ${requirementText}`
      }
    }

    return {
      eligible: false,
      missingRequirements: reqs.map(formatRequirement),
      requirementText: `Requires ${requirementText}`
    }
  }

  // Fallback - shouldn't reach here
  return {
    eligible: true,
    missingRequirements: [],
    requirementText: ''
  }
}

/**
 * Composable for multiclass eligibility checking
 */
export function useMulticlassEligibility() {
  return {
    checkEligibility: checkMulticlassEligibility
  }
}
