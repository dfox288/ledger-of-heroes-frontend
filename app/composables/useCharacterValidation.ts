// app/composables/useCharacterValidation.ts
import { ref, type Ref } from 'vue'

/**
 * A single dangling reference where the referenced entity no longer exists
 */
export interface DanglingReference {
  field: string
  slug: string
  message: string
}

/**
 * Summary of validation results
 */
export interface ValidationSummary {
  total_references: number
  valid_references: number
  dangling_count: number
}

/**
 * Full validation result from the API
 */
export interface ValidationResult {
  valid: boolean
  dangling_references: DanglingReference[]
  summary: ValidationSummary
}

/**
 * Composable for validating character references
 *
 * Checks whether all entity references in a character (race, class, background,
 * spells, equipment, etc.) still exist in the database. References become
 * "dangling" when a sourcebook is removed after a character was created.
 *
 * @param characterId - Reactive reference to the character ID
 * @returns Object with validation state and methods
 *
 * @example
 * const { validationResult, isValidating, validateReferences } = useCharacterValidation(characterId)
 *
 * await validateReferences()
 *
 * if (!validationResult.value?.valid) {
 *   // Show warning about dangling references
 * }
 */
export function useCharacterValidation(characterId: Ref<number | string | null>) {
  const { apiFetch } = useApi()

  const validationResult = ref<ValidationResult | null>(null)
  const isValidating = ref(false)

  /**
   * Fetch validation status from the API
   */
  async function validateReferences(): Promise<ValidationResult | null> {
    if (!characterId.value) return null

    isValidating.value = true
    try {
      const response = await apiFetch<{ data: ValidationResult }>(
        `/characters/${characterId.value}/validate`
      )
      validationResult.value = response.data
      return response.data
    } finally {
      isValidating.value = false
    }
  }

  return {
    validationResult,
    isValidating,
    validateReferences
  }
}
