/**
 * StepClassSelection Component Tests
 *
 * Tests for the level-up class selection step, which allows:
 * 1. Level 1→2 characters to continue current class or multiclass
 * 2. Already multiclassed characters to choose which class to advance
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import StepClassSelection from '~/components/character/levelup/StepClassSelection.vue'
import { useCharacterLevelUpStore } from '~/stores/characterLevelUp'
import type { CharacterClassEntry } from '~/stores/characterLevelUp'
import { baseClasses } from '../../../msw/fixtures/classes'

// Mock the useApi composable
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: vi.fn()
  })
}))

describe('StepClassSelection', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  /**
   * Helper to mount component with pre-configured store
   */
  async function mountWithStore(
    storeSetup: (store: ReturnType<typeof useCharacterLevelUpStore>) => void,
    props: Record<string, unknown> = {}
  ) {
    // Get store from active pinia
    const store = useCharacterLevelUpStore()
    storeSetup(store)

    return mountSuspended(StepClassSelection, {
      props: {
        characterId: 1,
        publicId: 'iron-phoenix-X7k2',
        ...props
      },
      global: {
        plugins: [pinia]
      }
    })
  }

  // ════════════════════════════════════════════════════════════════
  // FIRST MULTICLASS OPPORTUNITY (Level 1 → 2)
  // ════════════════════════════════════════════════════════════════

  describe('first multiclass opportunity (level 1 → 2)', () => {
    const fighterL1: CharacterClassEntry = {
      class: {
        id: 5,
        name: 'Fighter',
        slug: 'phb:fighter',
        hit_die: 10
      },
      level: 1,
      subclass: null,
      is_primary: true
    }

    it('shows "Continue as Fighter" option for current class', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1)
      )

      expect(wrapper.text()).toContain('Continue as Fighter')
    })

    it('shows current class highlighted as recommended option', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1)
      )

      // Current class should have a "recommended" or "current" indicator
      const currentClassCard = wrapper.find('[data-testid="class-option-phb:fighter"]')
      expect(currentClassCard.exists()).toBe(true)
      expect(currentClassCard.classes()).toContain('ring-2') // Highlighted
    })

    it('shows multiclass section with available classes', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1),
        { availableClasses: baseClasses }
      )

      expect(wrapper.text()).toContain('Or Multiclass Into')
    })

    it('disables classes that do not meet prerequisites', async () => {
      // Character with low Charisma (9) - can't multiclass into Bard (CHA 13 required)
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      const bardOption = wrapper.find('[data-testid="class-option-phb:bard"]')
      expect(bardOption.exists()).toBe(true)
      expect(bardOption.attributes('aria-disabled')).toBe('true')
    })

    it('shows prerequisite tooltip on disabled classes', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      // Bard requires CHA 13
      const bardOption = wrapper.find('[data-testid="class-option-phb:bard"]')
      expect(bardOption.text()).toContain('Requires Charisma 13')
    })

    it('enables classes that meet prerequisites', async () => {
      // Character with high STR (16) - can multiclass into Barbarian (STR 13 required)
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      const barbarianOption = wrapper.find('[data-testid="class-option-phb:barbarian"]')
      expect(barbarianOption.exists()).toBe(true)
      expect(barbarianOption.attributes('aria-disabled')).toBeUndefined()
    })

    it('handles OR prerequisites correctly (Fighter: STR 13 OR DEX 13)', async () => {
      // Character with DEX 14 but STR 10 - should qualify for Fighter (DEX meets OR requirement)
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 10, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      // Fighter has already been selected (current class), but Rogue also needs DEX 13
      const rogueOption = wrapper.find('[data-testid="class-option-phb:rogue"]')
      expect(rogueOption.attributes('aria-disabled')).toBeUndefined()
    })

    it('handles AND prerequisites correctly (Paladin: STR 13 AND CHA 13)', async () => {
      // Character with STR 16 but CHA 9 - should NOT qualify for Paladin
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      const paladinOption = wrapper.find('[data-testid="class-option-phb:paladin"]')
      expect(paladinOption.attributes('aria-disabled')).toBe('true')
      expect(paladinOption.text()).toContain('Requires Strength 13 and Charisma 13')
    })
  })

  // ════════════════════════════════════════════════════════════════
  // ALREADY MULTICLASSED CHARACTERS
  // ════════════════════════════════════════════════════════════════

  describe('already multiclassed characters', () => {
    const multiclassCharacter: CharacterClassEntry[] = [
      {
        class: { id: 5, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
        level: 3,
        subclass: { name: 'Champion', slug: 'phb:fighter-champion' },
        is_primary: true
      },
      {
        class: { id: 9, name: 'Rogue', slug: 'phb:rogue', hit_die: 8 },
        level: 2,
        subclass: null,
        is_primary: false
      }
    ]

    it('shows all current classes as options', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', multiclassCharacter, 5)
      )

      expect(wrapper.text()).toContain('Fighter')
      expect(wrapper.text()).toContain('Rogue')
    })

    it('shows current level for each class', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', multiclassCharacter, 5)
      )

      expect(wrapper.text()).toContain('Level 3')
      expect(wrapper.text()).toContain('Level 2')
    })

    it('shows subclass name when present', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', multiclassCharacter, 5)
      )

      expect(wrapper.text()).toContain('Champion')
    })

    it('shows "Add another class" section for further multiclassing', async () => {
      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', multiclassCharacter, 5),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 16, DEX: 16, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      expect(wrapper.text()).toContain('Add Another Class')
    })
  })

  // ════════════════════════════════════════════════════════════════
  // CLASS SELECTION INTERACTION
  // ════════════════════════════════════════════════════════════════

  describe('class selection interaction', () => {
    const fighterL1: CharacterClassEntry = {
      class: { id: 5, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
      level: 1,
      subclass: null,
      is_primary: true
    }

    it('calls store levelUp when class is selected', async () => {
      const store = useCharacterLevelUpStore()

      // Mock the levelUp function BEFORE mounting
      const levelUpSpy = vi.spyOn(store, 'levelUp').mockResolvedValue({
        previous_level: 1,
        new_level: 2,
        class_slug: 'phb:fighter',
        class_name: 'Fighter',
        hit_die: 'd10',
        features_gained: [],
        hp_choice_pending: true,
        asi_pending: false
      })

      const wrapper = await mountWithStore(
        s => s.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1)
      )

      // Click continue as Fighter
      const fighterOption = wrapper.find('[data-testid="class-option-phb:fighter"]')
      await fighterOption.trigger('click')

      expect(levelUpSpy).toHaveBeenCalledWith('phb:fighter')
    })

    it('shows loading state while level-up is processing', async () => {
      const wrapper = await mountWithStore(store => {
        store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1)
        store.isLoading = true
      })

      expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
    })

    it('shows error message when level-up fails', async () => {
      const wrapper = await mountWithStore(store => {
        store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1)
        store.error = 'Failed to level up character'
      })

      expect(wrapper.text()).toContain('Failed to level up character')
    })

    it('disables class options during loading', async () => {
      const wrapper = await mountWithStore(store => {
        store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1)
        store.isLoading = true
      })

      const fighterOption = wrapper.find('[data-testid="class-option-phb:fighter"]')
      expect(fighterOption.attributes('aria-disabled')).toBe('true')
    })
  })

  // ════════════════════════════════════════════════════════════════
  // EDGE CASES
  // ════════════════════════════════════════════════════════════════

  describe('edge cases', () => {
    it('handles character at level 19 (can still multiclass)', async () => {
      const highLevelCharacter: CharacterClassEntry = {
        class: { id: 5, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
        level: 19,
        subclass: { name: 'Champion', slug: 'phb:fighter-champion' },
        is_primary: true
      }

      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [highLevelCharacter], 19),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      // Should still show multiclass options at level 19
      expect(wrapper.text()).toContain('Or Multiclass Into')
    })

    it('hides multiclass section at level 20 (max level)', async () => {
      const maxLevelCharacter: CharacterClassEntry = {
        class: { id: 5, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
        level: 20,
        subclass: { name: 'Champion', slug: 'phb:fighter-champion' },
        is_primary: true
      }

      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [maxLevelCharacter], 20)
      )

      // At max level, no level-up should be possible
      expect(wrapper.text()).toContain('Maximum Level Reached')
    })

    it('excludes current classes from multiclass options', async () => {
      const fighterL1: CharacterClassEntry = {
        class: { id: 5, name: 'Fighter', slug: 'phb:fighter', hit_die: 10 },
        level: 1,
        subclass: null,
        is_primary: true
      }

      const wrapper = await mountWithStore(
        store => store.openWizard(1, 'iron-phoenix-X7k2', [fighterL1], 1),
        {
          availableClasses: baseClasses,
          abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 9 }
        }
      )

      // Fighter should only appear in "Continue as" section, not in multiclass options
      const multiclassSection = wrapper.find('[data-testid="multiclass-options"]')
      expect(multiclassSection.text()).not.toContain('Fighter')
    })
  })
})
