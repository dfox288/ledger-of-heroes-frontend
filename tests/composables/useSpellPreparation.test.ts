import { describe, it, expect, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useSpellPreparation } from '~/composables/useSpellPreparation'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { CharacterStats, CharacterSpell, SpellSlotsResponse, ClassSpellcastingInfo, Character } from '~/types/character'
import type { SpellcastingClass } from '~/composables/useSpellcastingTabs'

// Helper to create mock spellcasting info
function createSpellcastingInfo(overrides: Partial<ClassSpellcastingInfo> = {}): ClassSpellcastingInfo {
  return {
    ability: 'INT',
    ability_modifier: 3,
    spell_save_dc: 15,
    spell_attack_bonus: 7,
    preparation_method: 'prepared',
    ...overrides
  }
}

// Helper to create mock stats
function createMockStats(spellcasting: Record<string, ClassSpellcastingInfo> | null, preparationMethod?: string): CharacterStats {
  return {
    level: 5,
    proficiency_bonus: 3,
    hit_points: { max: 35, current: 35, temporary: 0 },
    armor_class: 16,
    initiative_bonus: 2,
    passive_perception: 12,
    ability_scores: {
      STR: { score: 10, modifier: 0 },
      DEX: { score: 14, modifier: 2 },
      CON: { score: 14, modifier: 2 },
      INT: { score: 16, modifier: 3 },
      WIS: { score: 12, modifier: 1 },
      CHA: { score: 8, modifier: -1 }
    },
    saving_throws: {
      STR: { total: 0, proficient: false },
      DEX: { total: 2, proficient: false },
      CON: { total: 2, proficient: false },
      INT: { total: 6, proficient: true },
      WIS: { total: 4, proficient: true },
      CHA: { total: -1, proficient: false }
    },
    skills: [],
    spellcasting,
    damage_resistances: [],
    damage_immunities: [],
    damage_vulnerabilities: [],
    condition_advantages: [],
    condition_disadvantages: [],
    speeds: { walk: 30 },
    spell_slots: null,
    unarmed_strike: null,
    senses: [],
    preparation_method: preparationMethod
  } as CharacterStats
}

// Helper to create mock spell slots response
function createMockSpellSlots(overrides: Partial<SpellSlotsResponse> = {}): SpellSlotsResponse {
  return {
    slots: { '1': { total: 4, spent: 0 }, '2': { total: 3, spent: 0 }, '3': { total: 2, spent: 0 } },
    pact_magic: null,
    preparation_limit: 8,
    prepared_count: 3,
    preparation_limits: null,
    ...overrides
  }
}

// Helper to create mock spellcasting class
function createSpellcastingClass(slug: string, prepMethod: string = 'prepared'): SpellcastingClass {
  const name = slug.split(':')[1] ?? slug
  return {
    slug,
    slotName: slug.replace(':', '-'),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    color: 'primary',
    info: createSpellcastingInfo({ preparation_method: prepMethod as 'prepared' | 'known' | 'spellbook' })
  }
}

// Helper to create mock character spell
function createMockSpell(id: number, overrides: Partial<CharacterSpell> = {}): CharacterSpell {
  return {
    id,
    spell_slug: `phb:spell-${id}`,
    class_slug: 'phb:wizard',
    is_prepared: false,
    is_always_prepared: false,
    spell: {
      id,
      name: `Spell ${id}`,
      slug: `phb:spell-${id}`,
      level: 1,
      school: 'evocation',
      casting_time: '1 action',
      range: '30 feet',
      components: 'V, S',
      duration: 'Instantaneous',
      description: 'Test spell',
      source_slug: 'phb'
    },
    ...overrides
  } as CharacterSpell
}

// Helper to create mock character
function createMockCharacter(classes: Array<{ class_slug: string, level: number }>): Character {
  return {
    id: 1,
    name: 'Test Character',
    public_id: 'test-character',
    classes
  } as Character
}

describe('useSpellPreparation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('preparationMethod', () => {
    it('returns null for non-spellcaster', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { preparationMethod } = useSpellPreparation({
        stats: ref(createMockStats(null)),
        spellSlots: ref(null),
        spellcastingClasses: computed(() => []),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(null)
      })

      expect(preparationMethod.value).toBeNull()
    })

    it('returns "prepared" for cleric', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { preparationMethod } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo({ preparation_method: 'prepared' }) }, 'prepared')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric', 'prepared')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 5 }]))
      })

      expect(preparationMethod.value).toBe('prepared')
    })

    it('returns "known" for sorcerer', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { preparationMethod } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:sorcerer': createSpellcastingInfo({ preparation_method: 'known' }) }, 'known')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:sorcerer', 'known')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:sorcerer', level: 5 }]))
      })

      expect(preparationMethod.value).toBe('known')
    })

    it('returns "spellbook" for wizard', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { preparationMethod } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo({ preparation_method: 'spellbook' }) }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard', 'spellbook')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      expect(preparationMethod.value).toBe('spellbook')
    })
  })

  describe('isSpellbookCaster / isPreparedCaster / showPreparationUI', () => {
    it('isSpellbookCaster is true for wizard', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { isSpellbookCaster } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo({ preparation_method: 'spellbook' }) }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard', 'spellbook')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      expect(isSpellbookCaster.value).toBe(true)
    })

    it('isPreparedCaster is true for cleric', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { isPreparedCaster } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo({ preparation_method: 'prepared' }) }, 'prepared')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric', 'prepared')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 5 }]))
      })

      expect(isPreparedCaster.value).toBe(true)
    })

    it('isPreparedCaster is true for wizard (spellbook casters also prepare)', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { isPreparedCaster } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo({ preparation_method: 'spellbook' }) }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard', 'spellbook')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      expect(isPreparedCaster.value).toBe(true)
    })

    it('showPreparationUI is false for known casters', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { showPreparationUI } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:sorcerer': createSpellcastingInfo({ preparation_method: 'known' }) }, 'known')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:sorcerer', 'known')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:sorcerer', level: 5 }]))
      })

      expect(showPreparationUI.value).toBe(false)
    })

    it('showPreparationUI is true for prepared casters', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { showPreparationUI } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo({ preparation_method: 'prepared' }) }, 'prepared')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric', 'prepared')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 5 }]))
      })

      expect(showPreparationUI.value).toBe(true)
    })
  })

  describe('prepareSpellsMode', () => {
    it('starts as null', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { prepareSpellsMode } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      expect(prepareSpellsMode.value).toBeNull()
    })

    it('enterPrepareSpellsMode sets the class slug', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { prepareSpellsMode, enterPrepareSpellsMode } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      enterPrepareSpellsMode('phb:wizard')
      expect(prepareSpellsMode.value).toBe('phb:wizard')
    })

    it('exitPrepareSpellsMode clears the mode', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { prepareSpellsMode, enterPrepareSpellsMode, exitPrepareSpellsMode } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      enterPrepareSpellsMode('phb:wizard')
      exitPrepareSpellsMode()
      expect(prepareSpellsMode.value).toBeNull()
    })

    it('isPrepareSpellsModeFor checks specific class', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { enterPrepareSpellsMode, isPrepareSpellsModeFor } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo(), 'phb:cleric': createSpellcastingInfo() })),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard'), createSpellcastingClass('phb:cleric')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 3 }, { class_slug: 'phb:cleric', level: 2 }]))
      })

      enterPrepareSpellsMode('phb:wizard')
      expect(isPrepareSpellsModeFor('phb:wizard')).toBe(true)
      expect(isPrepareSpellsModeFor('phb:cleric')).toBe(false)
    })
  })

  describe('maxCastableLevel', () => {
    it('returns 1 when no spell slots', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { maxCastableLevel } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(null),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      expect(maxCastableLevel.value).toBe(1)
    })

    it('returns highest slot level', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { maxCastableLevel } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots({
          slots: { '1': { total: 4, spent: 0 }, '2': { total: 3, spent: 0 }, '5': { total: 1, spent: 0 } }
        })),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 9 }]))
      })

      expect(maxCastableLevel.value).toBe(5)
    })
  })

  describe('getClassMaxSpellLevel', () => {
    it('calculates max spell level based on class level', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { getClassMaxSpellLevel } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      // Level 5 wizard: ceil(5/2) = 3
      expect(getClassMaxSpellLevel('phb:wizard')).toBe(3)
    })

    it('returns 1 for level 1-2 casters', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { getClassMaxSpellLevel } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 2 }]))
      })

      expect(getClassMaxSpellLevel('phb:wizard')).toBe(1)
    })

    it('caps at 9 for high level casters', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { getClassMaxSpellLevel } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 20 }]))
      })

      expect(getClassMaxSpellLevel('phb:wizard')).toBe(9)
    })
  })

  describe('preparation limits', () => {
    it('hasPerClassLimits returns true when per-class limits exist', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { hasPerClassLimits } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo(), 'phb:wizard': createSpellcastingInfo() })),
        spellSlots: ref(createMockSpellSlots({
          preparation_limits: {
            'phb:cleric': { limit: 5, prepared: 3 },
            'phb:wizard': { limit: 4, prepared: 2 }
          }
        })),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric'), createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 3 }, { class_slug: 'phb:wizard', level: 3 }]))
      })

      expect(hasPerClassLimits.value).toBe(true)
    })

    it('getClassPreparationLimit returns limit for class', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { getClassPreparationLimit } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo() })),
        spellSlots: ref(createMockSpellSlots({
          preparation_limits: { 'phb:cleric': { limit: 5, prepared: 3 } }
        })),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 5 }]))
      })

      const limit = getClassPreparationLimit('phb:cleric')
      expect(limit).toEqual({ limit: 5, prepared: 3 })
    })
  })

  describe('reactive prepared counts', () => {
    it('getReactivePreparedCount counts from store preparedSpellIds', () => {
      const playStateStore = useCharacterPlayStateStore()
      const spells = [
        createMockSpell(1, { class_slug: 'phb:wizard', is_prepared: true }),
        createMockSpell(2, { class_slug: 'phb:wizard', is_prepared: true }),
        createMockSpell(3, { class_slug: 'phb:wizard', is_prepared: false })
      ]

      // Initialize store with prepared spells
      playStateStore.initializeSpellPreparation({
        spells: spells.map(s => ({ id: s.id, is_prepared: s.is_prepared, is_always_prepared: s.is_always_prepared })),
        preparationLimit: 5
      })

      const { getReactivePreparedCount } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:wizard': createSpellcastingInfo() }, 'spellbook')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => spells),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:wizard', level: 5 }]))
      })

      expect(getReactivePreparedCount('phb:wizard')).toBe(2)
    })

    it('excludes always-prepared spells from count', () => {
      const playStateStore = useCharacterPlayStateStore()
      const spells = [
        createMockSpell(1, { class_slug: 'phb:cleric', is_prepared: true, is_always_prepared: true }),
        createMockSpell(2, { class_slug: 'phb:cleric', is_prepared: true, is_always_prepared: false })
      ]

      playStateStore.initializeSpellPreparation({
        spells: spells.map(s => ({ id: s.id, is_prepared: s.is_prepared, is_always_prepared: s.is_always_prepared })),
        preparationLimit: 5
      })

      const { getReactivePreparedCount } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo() }, 'prepared')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric')]),
        validSpells: computed(() => spells),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 5 }]))
      })

      // Only spell 2 counts (spell 1 is always-prepared)
      expect(getReactivePreparedCount('phb:cleric')).toBe(1)
    })

    it('reactiveTotalPreparedCount sums all classes', () => {
      const playStateStore = useCharacterPlayStateStore()
      const spells = [
        createMockSpell(1, { class_slug: 'phb:cleric', is_prepared: true }),
        createMockSpell(2, { class_slug: 'phb:wizard', is_prepared: true }),
        createMockSpell(3, { class_slug: 'phb:wizard', is_prepared: true })
      ]

      playStateStore.initializeSpellPreparation({
        spells: spells.map(s => ({ id: s.id, is_prepared: s.is_prepared, is_always_prepared: s.is_always_prepared })),
        preparationLimit: 10
      })

      const { reactiveTotalPreparedCount } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo(), 'phb:wizard': createSpellcastingInfo() })),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric'), createSpellcastingClass('phb:wizard')]),
        validSpells: computed(() => spells),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 3 }, { class_slug: 'phb:wizard', level: 3 }]))
      })

      expect(reactiveTotalPreparedCount.value).toBe(3)
    })
  })

  describe('getClassPreparationMethod', () => {
    it('returns preparation method for specific class', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { getClassPreparationMethod } = useSpellPreparation({
        stats: ref(createMockStats({
          'phb:cleric': createSpellcastingInfo({ preparation_method: 'prepared' }),
          'phb:sorcerer': createSpellcastingInfo({ preparation_method: 'known' })
        })),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [
          createSpellcastingClass('phb:cleric', 'prepared'),
          createSpellcastingClass('phb:sorcerer', 'known')
        ]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 3 }, { class_slug: 'phb:sorcerer', level: 3 }]))
      })

      expect(getClassPreparationMethod('phb:cleric')).toBe('prepared')
      expect(getClassPreparationMethod('phb:sorcerer')).toBe('known')
    })
  })

  describe('cross-class tracking', () => {
    it('getOtherClassPrepared returns null when spell not prepared by other class', () => {
      const playStateStore = useCharacterPlayStateStore()
      const spells = [
        createMockSpell(1, { spell_slug: 'phb:bless', class_slug: 'phb:cleric', is_prepared: true })
      ]

      playStateStore.initializeSpellPreparation({
        spells: spells.map(s => ({ id: s.id, is_prepared: s.is_prepared, is_always_prepared: s.is_always_prepared })),
        preparationLimit: 5
      })

      const { getOtherClassPrepared } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo() })),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric')]),
        validSpells: computed(() => spells),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 5 }]))
      })

      // Bless is prepared by cleric, viewing as cleric - should return null
      expect(getOtherClassPrepared('phb:bless', 'phb:cleric')).toBeNull()
    })

    it('getOtherClassPrepared returns class name when spell prepared by different class', () => {
      const playStateStore = useCharacterPlayStateStore()
      const spells = [
        createMockSpell(1, { spell_slug: 'phb:cure-wounds', class_slug: 'phb:cleric', is_prepared: true })
      ]

      playStateStore.initializeSpellPreparation({
        spells: spells.map(s => ({ id: s.id, is_prepared: s.is_prepared, is_always_prepared: s.is_always_prepared })),
        preparationLimit: 5
      })

      const { getOtherClassPrepared } = useSpellPreparation({
        stats: ref(createMockStats({
          'phb:cleric': createSpellcastingInfo(),
          'phb:druid': createSpellcastingInfo()
        })),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric'), createSpellcastingClass('phb:druid')]),
        validSpells: computed(() => spells),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 3 }, { class_slug: 'phb:druid', level: 3 }]))
      })

      // Cure Wounds is prepared by cleric, viewing as druid - should return "Cleric"
      expect(getOtherClassPrepared('phb:cure-wounds', 'phb:druid')).toBe('Cleric')
    })
  })

  describe('spellbook class detection', () => {
    it('spellbookClass returns wizard class for multiclass', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { spellbookClass } = useSpellPreparation({
        stats: ref(createMockStats({
          'phb:cleric': createSpellcastingInfo({ preparation_method: 'prepared' }),
          'phb:wizard': createSpellcastingInfo({ preparation_method: 'spellbook' })
        })),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [
          createSpellcastingClass('phb:cleric', 'prepared'),
          createSpellcastingClass('phb:wizard', 'spellbook')
        ]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 3 }, { class_slug: 'phb:wizard', level: 3 }]))
      })

      expect(spellbookClass.value).not.toBeNull()
      expect(spellbookClass.value?.slug).toBe('phb:wizard')
    })

    it('spellbookClass returns null when no wizard', () => {
      const playStateStore = useCharacterPlayStateStore()
      const { spellbookClass } = useSpellPreparation({
        stats: ref(createMockStats({ 'phb:cleric': createSpellcastingInfo({ preparation_method: 'prepared' }) }, 'prepared')),
        spellSlots: ref(createMockSpellSlots()),
        spellcastingClasses: computed(() => [createSpellcastingClass('phb:cleric', 'prepared')]),
        validSpells: computed(() => []),
        playStateStore,
        character: ref(createMockCharacter([{ class_slug: 'phb:cleric', level: 5 }]))
      })

      expect(spellbookClass.value).toBeNull()
    })
  })
})
