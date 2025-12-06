import { uniqueNamesGenerator } from 'unique-names-generator'
import { customAlphabet } from 'nanoid'
import { dndAdjectives, dndNouns } from '~/utils/dndDictionaries'

// Custom nanoid with alphanumeric-only alphabet (no _ or -)
// Backend requires: /^[a-z]+-[a-z]+-[A-Za-z0-9]{4}$/
const alphanumericId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 4)

/**
 * Generates D&D-themed memorable slugs for character URLs (public_id).
 *
 * @example
 * const { generateSlug } = useCharacterSlug()
 * const slug = generateSlug() // → "arcane-phoenix-M7k2"
 *
 * URL usage: /characters/arcane-phoenix-M7k2/edit/race
 */
export function useCharacterSlug() {
  /**
   * Generates a unique, memorable public_id for a new character.
   *
   * Format: {adjective}-{noun}-{suffix}
   * Example: "shadow-warden-q3x9"
   *
   * Collision probability with 48×45 words + 4-char alphanumeric:
   * 2,160 word combos × 14.7M suffix combos = ~31.8 billion possibilities
   */
  function generateSlug(): string {
    const wordPart = uniqueNamesGenerator({
      dictionaries: [dndAdjectives, dndNouns],
      separator: '-',
      length: 2
    })

    // 4-char alphanumeric suffix (A-Za-z0-9 only, no _ or -)
    const suffix = alphanumericId()

    return `${wordPart}-${suffix}`
  }

  /**
   * Validates that a string matches the expected public_id format.
   * Useful for route guards and validation.
   *
   * Backend regex: /^[a-z]+-[a-z]+-[A-Za-z0-9]{4}$/
   */
  function isValidSlug(slug: string): boolean {
    // Pattern: word-word-XXXX (where X is alphanumeric only)
    const pattern = /^[a-z]+-[a-z]+-[A-Za-z0-9]{4}$/
    return pattern.test(slug)
  }

  return {
    generateSlug,
    isValidSlug
  }
}
