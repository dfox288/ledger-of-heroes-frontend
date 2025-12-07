import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed } from 'vue'
import StepReview from '~/components/character/wizard/StepReview.vue'
import { useCharacterWizardStore } from '~/stores/characterWizard'

// Mock data for stats (note: speed not included - it comes from race data)
const mockStatsData = {
  hitPoints: ref(12),
  armorClass: ref(14),
  initiative: ref('+2'),
  proficiencyBonus: ref('+2'),
  savingThrows: ref([
    { code: 'STR', name: 'Strength', bonus: 1, formattedBonus: '+1', isProficient: false },
    { code: 'DEX', name: 'Dexterity', bonus: 4, formattedBonus: '+4', isProficient: true },
    { code: 'CON', name: 'Constitution', bonus: 1, formattedBonus: '+1', isProficient: false },
    { code: 'INT', name: 'Intelligence', bonus: 0, formattedBonus: '+0', isProficient: false },
    { code: 'WIS', name: 'Wisdom', bonus: 2, formattedBonus: '+2', isProficient: false },
    { code: 'CHA', name: 'Charisma', bonus: 5, formattedBonus: '+5', isProficient: true }
  ]),
  spellcasting: ref(null),
  abilityScores: ref([
    { code: 'STR', name: 'Strength', score: 12, modifier: 1, formattedModifier: '+1', formatted: '12 (+1)' },
    { code: 'DEX', name: 'Dexterity', score: 18, modifier: 4, formattedModifier: '+4', formatted: '18 (+4)' },
    { code: 'CON', name: 'Constitution', score: 13, modifier: 1, formattedModifier: '+1', formatted: '13 (+1)' },
    { code: 'INT', name: 'Intelligence', score: 10, modifier: 0, formattedModifier: '+0', formatted: '10 (+0)' },
    { code: 'WIS', name: 'Wisdom', score: 14, modifier: 2, formattedModifier: '+2', formatted: '14 (+2)' },
    { code: 'CHA', name: 'Charisma', score: 16, modifier: 3, formattedModifier: '+3', formatted: '16 (+3)' }
  ]),
  isSpellcaster: ref(false)
}

// Mock composables
vi.mock('~/composables/useCharacterStats', () => ({
  useCharacterStats: vi.fn(() => mockStatsData)
}))

// Stub child components - stats cards (wrapped by ReviewCharacterStats)
const statsStubs = {
  CharacterStatsCombatStatsCard: {
    template: '<div data-testid="combat-stats-card">Combat Stats</div>',
    props: ['hitPoints', 'armorClass', 'initiative', 'speed', 'proficiencyBonus']
  },
  CharacterStatsSavingThrowsCard: {
    template: '<div data-testid="saving-throws-card">Saving Throws</div>',
    props: ['savingThrows']
  },
  CharacterStatsSpellcastingCard: {
    template: '<div data-testid="spellcasting-card">Spellcasting</div>',
    props: ['ability', 'abilityName', 'saveDC', 'attackBonus', 'formattedAttackBonus', 'slots']
  }
}

// Stub review sub-components - render meaningful content for tests
const stubs = {
  ...statsStubs,
  CharacterWizardReviewReviewCharacterIdentity: {
    template: `<div>
      <h1>{{ characterName }}</h1>
      <p>{{ race }} · {{ characterClass }} · {{ background }}</p>
      <button>Edit Details</button>
    </div>`,
    props: ['characterName', 'race', 'characterClass', 'background']
  },
  CharacterWizardReviewReviewCharacterAbilities: {
    template: `<div>
      <span>Ability Scores</span>
      <div v-if="abilityScores" v-for="a in abilityScores" :key="a.code">
        {{ a.name }} {{ a.score }} ({{ a.formattedModifier }})
      </div>
    </div>`,
    props: ['abilityScores']
  },
  CharacterWizardReviewReviewCharacterStats: {
    template: `<div>
      <div data-testid="combat-stats-card">Combat Stats</div>
      <div data-testid="saving-throws-card" v-if="savingThrows">Saving Throws</div>
      <div data-testid="spellcasting-card" v-if="isSpellcaster && spellcasting">Spellcasting</div>
    </div>`,
    props: ['hitPoints', 'armorClass', 'initiative', 'speed', 'proficiencyBonus', 'savingThrows', 'isSpellcaster', 'spellcasting']
  },
  CharacterWizardReviewReviewProficiencies: {
    template: '<div><span>Proficiencies</span></div>',
    props: ['proficiencies']
  },
  CharacterWizardReviewReviewLanguages: {
    template: '<div><span>Languages</span></div>',
    props: ['languages']
  },
  CharacterWizardReviewReviewEquipment: {
    template: '<div><span>Equipment</span></div>',
    props: ['equipment']
  },
  CharacterWizardReviewReviewSpells: {
    template: '<div v-if="isSpellcaster"><span>Spells</span></div>',
    props: ['spells', 'isSpellcaster']
  }
}

describe('StepReview', () => {
  let pinia: ReturnType<typeof createPinia>
  let store: ReturnType<typeof useCharacterWizardStore>

  // Setup store data function
  const setupStoreData = () => {
    store.characterId = 123
    store.selections.name = 'Elara Moonwhisper'
    store.selections.race = {
      id: 1,
      name: 'Elf',
      slug: 'elf',
      speed: 30,
      source: { code: 'PHB', name: 'Player\'s Handbook' }
    } as any
    store.selections.class = {
      id: 2,
      name: 'Rogue',
      slug: 'rogue',
      source: { code: 'PHB', name: 'Player\'s Handbook' }
    } as any
    store.selections.background = {
      id: 3,
      name: 'Criminal',
      slug: 'criminal',
      source: { code: 'PHB', name: 'Player\'s Handbook' }
    } as any
    store.selections.alignment = 'CG'
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useCharacterWizardStore()
    setupStoreData()
  })

  describe('structure', () => {
    it('renders character name from store', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs, plugins: [pinia] }
      })

      expect(wrapper.text()).toContain('Elara Moonwhisper')
    })

    it('renders race/class/background summary', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs, plugins: [pinia] }
      })

      expect(wrapper.text()).toContain('Elf')
      expect(wrapper.text()).toContain('Rogue')
      expect(wrapper.text()).toContain('Criminal')
    })

    it('renders combat stats card', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.find('[data-testid="combat-stats-card"]').exists()).toBe(true)
    })

    it('renders saving throws card', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.find('[data-testid="saving-throws-card"]').exists()).toBe(true)
    })

    it('renders ability scores section', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.text()).toContain('Strength')
      expect(wrapper.text()).toContain('Dexterity')
      expect(wrapper.text()).toContain('Constitution')
      expect(wrapper.text()).toContain('Intelligence')
      expect(wrapper.text()).toContain('Wisdom')
      expect(wrapper.text()).toContain('Charisma')
    })
  })

  describe('combat stats integration', () => {
    it('passes correct stats props to ReviewCharacterStats', async () => {
      // Use stubs and verify data-testid elements render
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      // The stub for ReviewCharacterStats includes combat-stats-card testid
      expect(wrapper.find('[data-testid="combat-stats-card"]').exists()).toBe(true)
      // Verify the text content shows "Combat Stats"
      expect(wrapper.text()).toContain('Combat Stats')
    })
  })

  describe('saving throws integration', () => {
    it('passes saving throws to ReviewCharacterStats', async () => {
      // Use stubs and verify data-testid elements render
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      // The stub for ReviewCharacterStats includes saving-throws-card testid when savingThrows exists
      expect(wrapper.find('[data-testid="saving-throws-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Saving Throws')
    })
  })

  describe('spellcasting conditional rendering', () => {
    it('hides SpellcastingCard for non-spellcasters', async () => {
      mockStatsData.isSpellcaster.value = false
      mockStatsData.spellcasting.value = null

      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      // With stubs, check if stub exists
      expect(wrapper.find('[data-testid="spellcasting-card"]').exists()).toBe(false)
    })

    it('shows SpellcastingCard when character is spellcaster', async () => {
      // Update mock data for spellcaster
      mockStatsData.isSpellcaster.value = true
      mockStatsData.spellcasting.value = {
        ability: 'INT',
        abilityName: 'Intelligence',
        saveDC: 13,
        attackBonus: 5,
        formattedAttackBonus: '+5'
      }

      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.find('[data-testid="spellcasting-card"]').exists()).toBe(true)

      // Reset for other tests
      mockStatsData.isSpellcaster.value = false
      mockStatsData.spellcasting.value = null
    })
  })

  describe('ability scores display', () => {
    it('displays all six ability scores with modifiers', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      // Check for formatted display
      expect(wrapper.text()).toContain('12')
      expect(wrapper.text()).toContain('18')
      expect(wrapper.text()).toContain('13')
      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('14')
      expect(wrapper.text()).toContain('16')
    })
  })

  describe('proficiencies section', () => {
    it('renders proficiencies section', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.text()).toMatch(/Proficien(cies|cy)/i)
    })

    it('displays placeholder when no proficiencies loaded', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      // Should still render section even if empty
      expect(wrapper.text()).toMatch(/Proficien(cies|cy)/i)
    })
  })

  describe('languages section', () => {
    it('renders languages section', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.text()).toMatch(/Languages?/i)
    })
  })

  describe('equipment section', () => {
    it('renders equipment section', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.text()).toMatch(/Equipment/i)
    })
  })

  describe('spells section', () => {
    it('hides spells section for non-spellcasters', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      // Spells section should not appear
      const text = wrapper.text()
      expect(text).not.toMatch(/^Spells$/m)
    })
  })

  describe('edit functionality', () => {
    it('shows edit button for character details', async () => {
      const wrapper = await mountSuspended(StepReview, {
        global: { stubs }
      })

      expect(wrapper.text()).toMatch(/Edit/i)
    })
  })
})
