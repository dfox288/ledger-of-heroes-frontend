// tests/pages/level-up-resume.test.ts
/**
 * Level-Up Resume Logic Tests
 *
 * Verifies that the resume logic correctly identifies pending choice types
 * based on actual API response structures.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import { halflingRogueL4 } from '../msw/fixtures/characters'
import { highElfWizardL2 } from '../msw/fixtures/characters'
import { humanFighterL3 } from '../msw/fixtures/characters'

// ════════════════════════════════════════════════════════════════
// HELPER: Resume Step Detection
// ════════════════════════════════════════════════════════════════

/**
 * Determines the first step to resume based on pending choices
 * This mirrors the logic that should be in index.vue
 */
function determineFirstStep(store: ReturnType<typeof useCharacterLevelUpStore>): string {
  const hasSubclass = store.pendingChoices.some(c => c.type === 'subclass')
  // Bug #5 Fix: ASI uses type='ability_score' with subtype='asi_or_feat'
  const hasAsi = store.pendingChoices.some(
    c => c.type === 'ability_score' && c.subtype === 'asi_or_feat'
  )
  const hasFeature = store.pendingChoices.some(c =>
    ['fighting_style', 'expertise', 'optional_feature'].includes(c.type)
  )
  const hasSpell = store.pendingChoices.some(c => c.type === 'spell')
  const hasLanguage = store.pendingChoices.some(c => c.type === 'language')
  const hasProficiency = store.pendingChoices.some(c => c.type === 'proficiency')

  // Note: HP is tracked via levelUpResult.hp_choice_pending, not in pendingChoices
  // If hp_choice_pending is true, start at hit-points step

  if (hasSubclass) return 'subclass'
  if (hasAsi) return 'asi-feat'
  if (hasFeature) return 'feature-choices'
  if (hasSpell) return 'spells'
  if (hasLanguage) return 'languages'
  if (hasProficiency) return 'proficiencies'
  return 'summary'
}

// ════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════

describe('Level-Up Resume Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('ASI/Feat Detection (Bug #5)', () => {
    it('correctly identifies ASI choice from ability_score type with asi_or_feat subtype', () => {
      const store = useCharacterLevelUpStore()

      // Load fixture data that has ASI pending
      store.pendingChoices = halflingRogueL4.pendingChoices.choices

      // Verify the fixture has the expected structure
      const asiChoice = store.pendingChoices[0]
      expect(asiChoice.type).toBe('ability_score')
      expect(asiChoice.subtype).toBe('asi_or_feat')

      // Verify correct detection
      const hasAsi = store.pendingChoices.some(
        c => c.type === 'ability_score' && c.subtype === 'asi_or_feat'
      )
      expect(hasAsi).toBe(true)
    })

    it('does NOT detect ASI when using wrong type check', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = halflingRogueL4.pendingChoices.choices

      // This is the BUG - checking type === 'asi_or_feat' directly
      const hasAsiBuggy = store.pendingChoices.some(c => c.type === 'asi_or_feat')
      expect(hasAsiBuggy).toBe(false) // Wrong! Would miss the ASI choice
    })

    it('resumes to asi-feat step when ASI choice is pending', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = halflingRogueL4.pendingChoices.choices

      const firstStep = determineFirstStep(store)
      expect(firstStep).toBe('asi-feat')
    })
  })

  describe('Subclass Detection', () => {
    it('correctly identifies subclass choice', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = highElfWizardL2.pendingChoices.choices

      const hasSubclass = store.pendingChoices.some(c => c.type === 'subclass')
      expect(hasSubclass).toBe(true)
    })

    it('resumes to subclass step when subclass choice is pending', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = highElfWizardL2.pendingChoices.choices

      const firstStep = determineFirstStep(store)
      expect(firstStep).toBe('subclass')
    })
  })

  describe('Fighter L3 Subclass Detection', () => {
    it('correctly identifies Fighter martial archetype choice', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = humanFighterL3.pendingChoices.choices

      const hasSubclass = store.pendingChoices.some(c => c.type === 'subclass')
      expect(hasSubclass).toBe(true)
    })

    it('subclass choice has correct ID format', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = humanFighterL3.pendingChoices.choices

      const subclassChoice = store.pendingChoices.find(c => c.type === 'subclass')
      expect(subclassChoice?.id).toBe('subclass|class|phb:fighter|3|martial_archetype')
    })
  })

  describe('Resume Priority Order', () => {
    it('prioritizes subclass over ASI', () => {
      const store = useCharacterLevelUpStore()
      // Combine both subclass and ASI choices
      store.pendingChoices = [
        ...highElfWizardL2.pendingChoices.choices, // subclass
        ...halflingRogueL4.pendingChoices.choices  // ASI
      ]

      const firstStep = determineFirstStep(store)
      expect(firstStep).toBe('subclass') // Subclass first
    })

    it('goes to summary when no pending choices', () => {
      const store = useCharacterLevelUpStore()
      store.pendingChoices = []

      const firstStep = determineFirstStep(store)
      expect(firstStep).toBe('summary')
    })
  })
})
