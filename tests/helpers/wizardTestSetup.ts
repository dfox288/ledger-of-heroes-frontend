/**
 * Wizard Test Setup Helpers
 *
 * Consolidates common mock patterns used across wizard component tests.
 * Reduces boilerplate and ensures consistency when composable APIs change.
 *
 * Usage patterns:
 * 1. Choice-based steps (StepSize, StepLanguages, etc.) → mockUnifiedChoices()
 * 2. Review step (StepReview) → mockCharacterSheet()
 * 3. Simple steps (StepDetails) → just use usePiniaSetup()
 */
import { ref, computed } from 'vue'
import { vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { components } from '~/types/api/generated'

type PendingChoice = components['schemas']['PendingChoiceResource']

// =============================================================================
// Mock Data Factories
// =============================================================================

/**
 * Creates mock character data for useCharacterSheet
 */
export function createMockCharacter(overrides: Partial<{
  id: number
  publicId: string
  name: string
  raceName: string
  className: string
  backgroundName: string
  level: number
  speed: number
  alignment: string
}> = {}) {
  return ref({
    id: overrides.id ?? 123,
    public_id: overrides.publicId ?? 'shadow-rogue-x7k3',
    name: overrides.name ?? 'Test Character',
    race: { id: 1, name: overrides.raceName ?? 'Human', slug: 'human' },
    classes: [{
      class: { id: 2, name: overrides.className ?? 'Fighter', slug: 'fighter' },
      level: overrides.level ?? 1
    }],
    background: { id: 3, name: overrides.backgroundName ?? 'Soldier', slug: 'soldier' },
    alignment: overrides.alignment ?? 'Neutral',
    speed: overrides.speed ?? 30,
    proficiency_bonus: 2,
    is_complete: false,
    has_inspiration: false,
    death_save_successes: 0,
    death_save_failures: 0,
    portrait: null,
    conditions: []
  })
}

/**
 * Creates mock stats data for useCharacterSheet
 */
export function createMockStats(overrides: Partial<{
  hp: number
  ac: number
  abilityScores: Record<string, { score: number, modifier: number }>
  hasSpellcasting: boolean
}> = {}) {
  const defaultAbilityScores = {
    STR: { score: 10, modifier: 0 },
    DEX: { score: 10, modifier: 0 },
    CON: { score: 10, modifier: 0 },
    INT: { score: 10, modifier: 0 },
    WIS: { score: 10, modifier: 0 },
    CHA: { score: 10, modifier: 0 }
  }

  return ref({
    hit_points: { current: overrides.hp ?? 10, max: overrides.hp ?? 10, temporary: 0 },
    armor_class: overrides.ac ?? 10,
    initiative_bonus: 0,
    proficiency_bonus: 2,
    passive_perception: 10,
    passive_investigation: 10,
    passive_insight: 10,
    ability_scores: overrides.abilityScores ?? defaultAbilityScores,
    saving_throws: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    spellcasting: overrides.hasSpellcasting
      ? {
          ability: 'INT',
          ability_modifier: 0,
          spell_save_dc: 10,
          spell_attack_bonus: 2
        }
      : null,
    hit_dice: [{ die: 'd10', total: 1, used: 0 }],
    carrying_capacity: 150,
    push_drag_lift: 300
  })
}

/**
 * Creates mock pending choice for unified choices
 */
export function createMockPendingChoice(overrides: Partial<{
  id: string
  type: string
  source: string
  sourceName: string
  quantity: number
  remaining: number
  options: Array<{ id: number, name: string, slug?: string, code?: string }>
  selected: string[]
  metadata: Record<string, unknown>
}> = {}): PendingChoice {
  return {
    id: overrides.id ?? 'test-choice-1',
    type: overrides.type ?? 'language',
    subtype: null,
    source: overrides.source ?? 'race',
    source_name: overrides.sourceName ?? 'Human',
    level_granted: 1,
    required: true,
    quantity: overrides.quantity ?? 1,
    remaining: overrides.remaining ?? overrides.quantity ?? 1,
    selected: overrides.selected ?? [],
    options: overrides.options ?? [
      { id: 1, name: 'Option A', slug: 'option-a' },
      { id: 2, name: 'Option B', slug: 'option-b' }
    ],
    options_endpoint: null,
    metadata: overrides.metadata ? [overrides.metadata] : []
  }
}

// =============================================================================
// Mock Composable State (shared across tests)
// =============================================================================

// useUnifiedChoices mock state
export const mockChoicesState = {
  choices: ref<PendingChoice[]>([]),
  pending: ref(false),
  error: ref<string | null>(null)
}

// useCharacterSheet mock state
export const mockCharacterSheetState = {
  character: createMockCharacter(),
  stats: createMockStats(),
  proficiencies: ref<Array<{ id: number, name: string, type: string }>>([]),
  features: ref<Array<{ id: number, name: string, description: string }>>([]),
  equipment: ref<Array<{ id: number, item: { name: string }, quantity: number }>>([]),
  spells: ref<Array<{ id: number, name: string }>>([]),
  languages: ref<Array<{ id: number, language: { name: string } }>>([]),
  skills: ref<Array<{ id: number, name: string, slug: string, modifier: number }>>([]),
  savingThrows: ref<Array<{ ability: string, modifier: number, proficient: boolean }>>([]),
  hitDice: ref<Array<{ die: string, total: number, current: number }>>([]),
  notes: ref({}),
  loading: ref(false),
  error: ref<string | null>(null)
}

// =============================================================================
// Mock Setup Functions
// =============================================================================

/**
 * Resets all mock state to defaults.
 * Call in beforeEach() to ensure clean state between tests.
 */
export function resetWizardMockState() {
  // Reset unified choices state
  mockChoicesState.choices.value = []
  mockChoicesState.pending.value = false
  mockChoicesState.error.value = null

  // Reset character sheet state
  mockCharacterSheetState.character.value = createMockCharacter().value
  mockCharacterSheetState.stats.value = createMockStats().value
  mockCharacterSheetState.proficiencies.value = []
  mockCharacterSheetState.features.value = []
  mockCharacterSheetState.equipment.value = []
  mockCharacterSheetState.spells.value = []
  mockCharacterSheetState.languages.value = []
  mockCharacterSheetState.skills.value = []
  mockCharacterSheetState.savingThrows.value = []
  mockCharacterSheetState.hitDice.value = []
  mockCharacterSheetState.loading.value = false
  mockCharacterSheetState.error.value = null
}

/**
 * Creates useUnifiedChoices mock return value.
 * Use with mockNuxtImport() for choice-based wizard steps.
 */
export function createUnifiedChoicesMock(customChoices?: PendingChoice[]) {
  if (customChoices) {
    mockChoicesState.choices.value = customChoices
  }

  return {
    choices: mockChoicesState.choices,
    choicesByType: computed(() => {
      const choices = mockChoicesState.choices.value
      return {
        languages: choices.filter(c => c.type === 'language'),
        proficiencies: choices.filter(c => c.type === 'proficiency'),
        equipment: choices.filter(c => c.type === 'equipment'),
        spells: choices.filter(c => c.type === 'spell'),
        sizes: choices.filter(c => c.type === 'size'),
        subclass: choices.find(c => c.type === 'subclass') ?? null,
        asiOrFeat: choices.filter(c => c.type === 'asi_or_feat'),
        optionalFeatures: choices.filter(c => c.type === 'optional_feature')
      }
    }),
    summary: ref(null),
    pending: mockChoicesState.pending,
    error: mockChoicesState.error,
    allRequiredComplete: computed(() =>
      mockChoicesState.choices.value.every(c => c.remaining === 0)
    ),
    fetchChoices: vi.fn().mockResolvedValue(undefined),
    resolveChoice: vi.fn().mockResolvedValue(undefined),
    undoChoice: vi.fn().mockResolvedValue(undefined)
  }
}

/**
 * Creates useCharacterSheet mock return value.
 * Use with vi.mock() for the review step.
 */
export function createCharacterSheetMock() {
  return {
    character: mockCharacterSheetState.character,
    stats: mockCharacterSheetState.stats,
    proficiencies: mockCharacterSheetState.proficiencies,
    features: mockCharacterSheetState.features,
    equipment: mockCharacterSheetState.equipment,
    spells: mockCharacterSheetState.spells,
    languages: mockCharacterSheetState.languages,
    skills: mockCharacterSheetState.skills,
    savingThrows: mockCharacterSheetState.savingThrows,
    hitDice: mockCharacterSheetState.hitDice,
    notes: mockCharacterSheetState.notes,
    loading: mockCharacterSheetState.loading,
    error: mockCharacterSheetState.error,
    refresh: vi.fn()
  }
}

/**
 * Creates useToast mock return value.
 */
export function createToastMock() {
  return {
    add: vi.fn()
  }
}

// =============================================================================
// Store Setup Helpers
// =============================================================================

/**
 * Sets up character wizard store with common test data.
 * Returns the store instance for further customization.
 */
export function setupWizardStore(options: {
  characterId?: number
  publicId?: string
  name?: string
  race?: { id: number, name: string, slug: string, speed?: number }
  class?: { id: number, name: string, slug: string }
  background?: { id: number, name: string, slug: string }
  alignment?: string
} = {}) {
  setActivePinia(createPinia())
  const store = useCharacterWizardStore()

  store.characterId = options.characterId ?? 1
  store.publicId = options.publicId ?? 'test-char-abc123'

  if (options.name) store.selections.name = options.name
  if (options.alignment) store.selections.alignment = options.alignment

  if (options.race) {
    store.selections.race = {
      ...options.race,
      speed: options.race.speed ?? 30,
      source: { code: 'PHB', name: 'Player\'s Handbook' }
    } as typeof store.selections.race
  }

  if (options.class) {
    store.selections.class = {
      ...options.class,
      source: { code: 'PHB', name: 'Player\'s Handbook' }
    } as typeof store.selections.class
  }

  if (options.background) {
    store.selections.background = {
      ...options.background,
      source: { code: 'PHB', name: 'Player\'s Handbook' }
    } as typeof store.selections.background
  }

  return store
}
