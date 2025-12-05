// tests/components/character/sheet/components.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Header from '~/components/character/sheet/Header.vue'
import AbilityScoreBlock from '~/components/character/sheet/AbilityScoreBlock.vue'
import CombatStatsGrid from '~/components/character/sheet/CombatStatsGrid.vue'
import SavingThrowsList from '~/components/character/sheet/SavingThrowsList.vue'
import SkillsList from '~/components/character/sheet/SkillsList.vue'
import FeaturesPanel from '~/components/character/sheet/FeaturesPanel.vue'
import ProficienciesPanel from '~/components/character/sheet/ProficienciesPanel.vue'
import EquipmentPanel from '~/components/character/sheet/EquipmentPanel.vue'
import SpellsPanel from '~/components/character/sheet/SpellsPanel.vue'
import LanguagesPanel from '~/components/character/sheet/LanguagesPanel.vue'

// Mock data
const mockCharacter = {
  id: 1,
  name: 'Thorin Ironforge',
  level: 5,
  is_complete: true,
  has_inspiration: true,
  proficiency_bonus: 3,
  speed: 25,
  race: { id: 1, name: 'Dwarf', slug: 'dwarf' },
  class: { id: 1, name: 'Fighter', slug: 'fighter' },
  classes: [
    { class: { id: 1, name: 'Fighter', slug: 'fighter' }, level: 3, is_primary: true },
    { class: { id: 2, name: 'Cleric', slug: 'cleric' }, level: 2, is_primary: false }
  ],
  background: { id: 1, name: 'Soldier', slug: 'soldier' }
}

const mockStats = {
  ability_scores: {
    STR: { score: 16, modifier: 3 },
    DEX: { score: 14, modifier: 2 },
    CON: { score: 15, modifier: 2 },
    INT: { score: 10, modifier: 0 },
    WIS: { score: 12, modifier: 1 },
    CHA: { score: 8, modifier: -1 }
  },
  saving_throws: { STR: 5, DEX: 2, CON: 4, INT: 0, WIS: 1, CHA: -1 },
  armor_class: 16,
  hit_points: { max: 28, current: 22, temporary: 5 },
  initiative_bonus: 2,
  passive_perception: 14,
  spellcasting: { ability: 'WIS', spell_save_dc: 13, spell_attack_bonus: 5 }
}

const mockSavingThrows = [
  { ability: 'STR', modifier: 5, proficient: true },
  { ability: 'DEX', modifier: 2, proficient: false },
  { ability: 'CON', modifier: 4, proficient: true },
  { ability: 'INT', modifier: 0, proficient: false },
  { ability: 'WIS', modifier: 1, proficient: false },
  { ability: 'CHA', modifier: -1, proficient: false }
]

const mockSkills = [
  { id: 1, name: 'Acrobatics', slug: 'acrobatics', ability_code: 'DEX', modifier: 2, proficient: false, expertise: false },
  { id: 2, name: 'Athletics', slug: 'athletics', ability_code: 'STR', modifier: 6, proficient: true, expertise: false },
  { id: 3, name: 'Stealth', slug: 'stealth', ability_code: 'DEX', modifier: 8, proficient: true, expertise: true }
]

const mockFeatures = [
  { id: 1, source: 'class', feature: { id: 1, name: 'Second Wind', description: 'Heal as bonus action' } },
  { id: 2, source: 'race', feature: { id: 2, name: 'Darkvision', description: 'See in darkness' } }
]

const mockProficiencies = [
  { id: 1, proficiency_type: { name: 'Longsword', category: 'weapons' } },
  { id: 2, proficiency_type: { name: 'Heavy Armor', category: 'armor' } }
]

const mockEquipment = [
  { id: 1, item: { name: 'Longsword' }, quantity: 1, equipped: true },
  { id: 2, item: { name: 'Handaxe' }, quantity: 2, equipped: false }
]

const mockSpells = [
  { id: 1, spell: { name: 'Fire Bolt', level: 0 }, prepared: true },
  { id: 2, spell: { name: 'Magic Missile', level: 1 }, prepared: true }
]

const mockLanguages = [
  { id: 1, language: { name: 'Common' } },
  { id: 2, language: { name: 'Dwarvish' } }
]

describe('CharacterSheetHeader', () => {
  it('displays character name', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Thorin Ironforge')
  })

  it('displays race name', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Dwarf')
  })

  it('displays all classes with levels', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Fighter 3')
    expect(wrapper.text()).toContain('Cleric 2')
  })

  it('shows Complete badge when is_complete is true', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Complete')
  })

  it('shows Draft badge when is_complete is false', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: { ...mockCharacter, is_complete: false } }
    })
    expect(wrapper.text()).toContain('Draft')
  })

  it('shows Inspiration badge when has_inspiration is true', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: mockCharacter }
    })
    expect(wrapper.find('[data-test="inspiration-badge"]').exists()).toBe(true)
  })

  it('shows Edit button for incomplete characters', async () => {
    const wrapper = await mountSuspended(Header, {
      props: { character: { ...mockCharacter, is_complete: false } }
    })
    expect(wrapper.find('[data-test="edit-button"]').exists()).toBe(true)
  })
})

describe('CharacterSheetAbilityScoreBlock', () => {
  it('displays all 6 ability scores', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('CON')
    expect(wrapper.text()).toContain('INT')
    expect(wrapper.text()).toContain('WIS')
    expect(wrapper.text()).toContain('CHA')
  })

  it('displays score values', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('16')
    expect(wrapper.text()).toContain('14')
  })

  it('displays modifiers with sign', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('+3')
    expect(wrapper.text()).toContain('-1')
  })
})

describe('CharacterSheetCombatStatsGrid', () => {
  it('displays HP', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('22')
    expect(wrapper.text()).toContain('28')
  })

  it('displays AC', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('16')
  })

  it('displays initiative', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+2')
  })

  it('displays speed', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('25')
    expect(wrapper.text()).toContain('ft')
  })
})

describe('CharacterSheetSavingThrowsList', () => {
  it('displays all saving throws', async () => {
    const wrapper = await mountSuspended(SavingThrowsList, {
      props: { savingThrows: mockSavingThrows }
    })
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('+5')
    expect(wrapper.text()).toContain('-1')
  })

  it('shows proficiency indicators', async () => {
    const wrapper = await mountSuspended(SavingThrowsList, {
      props: { savingThrows: mockSavingThrows }
    })
    const profIndicators = wrapper.findAll('[data-test="proficient"]')
    expect(profIndicators.length).toBe(2) // STR and CON
  })
})

describe('CharacterSheetSkillsList', () => {
  it('displays skills with modifiers', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    expect(wrapper.text()).toContain('Acrobatics')
    expect(wrapper.text()).toContain('Athletics')
    expect(wrapper.text()).toContain('+6')
  })

  it('shows proficiency and expertise indicators', async () => {
    const wrapper = await mountSuspended(SkillsList, {
      props: { skills: mockSkills }
    })
    expect(wrapper.findAll('[data-test="proficient"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="expertise"]').length).toBe(1)
  })
})

describe('CharacterSheetFeaturesPanel', () => {
  it('displays features', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    expect(wrapper.text()).toContain('Second Wind')
    expect(wrapper.text()).toContain('Darkvision')
  })

  it('shows empty state', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: [] }
    })
    expect(wrapper.text()).toContain('No features')
  })
})

describe('CharacterSheetProficienciesPanel', () => {
  it('displays proficiencies', async () => {
    const wrapper = await mountSuspended(ProficienciesPanel, {
      props: { proficiencies: mockProficiencies }
    })
    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Heavy Armor')
  })

  it('shows empty state', async () => {
    const wrapper = await mountSuspended(ProficienciesPanel, {
      props: { proficiencies: [] }
    })
    expect(wrapper.text()).toContain('No proficiencies')
  })
})

describe('CharacterSheetEquipmentPanel', () => {
  it('displays equipment with quantities', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: { equipment: mockEquipment }
    })
    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Handaxe')
    expect(wrapper.text()).toContain('×2')
  })

  it('shows empty state', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: { equipment: [] }
    })
    expect(wrapper.text()).toContain('No equipment')
  })
})

describe('CharacterSheetSpellsPanel', () => {
  it('displays spells', async () => {
    const wrapper = await mountSuspended(SpellsPanel, {
      props: { spells: mockSpells, stats: mockStats }
    })
    expect(wrapper.text()).toContain('Fire Bolt')
    expect(wrapper.text()).toContain('Magic Missile')
  })

  it('displays spellcasting stats', async () => {
    const wrapper = await mountSuspended(SpellsPanel, {
      props: { spells: mockSpells, stats: mockStats }
    })
    expect(wrapper.text()).toContain('13') // DC
    expect(wrapper.text()).toContain('+5') // Attack bonus
  })
})

describe('CharacterSheetLanguagesPanel', () => {
  it('displays languages', async () => {
    const wrapper = await mountSuspended(LanguagesPanel, {
      props: { languages: mockLanguages }
    })
    expect(wrapper.text()).toContain('Common')
    expect(wrapper.text()).toContain('Dwarvish')
  })

  it('shows empty state', async () => {
    const wrapper = await mountSuspended(LanguagesPanel, {
      props: { languages: [] }
    })
    expect(wrapper.text()).toContain('No languages')
  })
})
