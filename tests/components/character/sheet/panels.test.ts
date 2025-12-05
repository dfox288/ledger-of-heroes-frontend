// tests/components/character/sheet/panels.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeaturesPanel from '~/components/character/sheet/FeaturesPanel.vue'
import ProficienciesPanel from '~/components/character/sheet/ProficienciesPanel.vue'
import EquipmentPanel from '~/components/character/sheet/EquipmentPanel.vue'
import SpellsPanel from '~/components/character/sheet/SpellsPanel.vue'
import LanguagesPanel from '~/components/character/sheet/LanguagesPanel.vue'

describe('CharacterSheetFeaturesPanel', () => {
  const mockFeatures = [
    { id: 1, source: 'class', feature: { name: 'Second Wind', description: 'Heal as bonus action' } },
    { id: 2, source: 'race', feature: { name: 'Darkvision', description: 'See in darkness' } },
    { id: 3, source: 'background', feature: { name: 'Military Rank', description: 'Command soldiers' } }
  ]

  it('displays features grouped by source', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    expect(wrapper.text()).toContain('Second Wind')
    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).toContain('Military Rank')
  })

  it('shows empty state when no features', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: [] }
    })
    expect(wrapper.text()).toContain('No features')
  })
})

describe('CharacterSheetProficienciesPanel', () => {
  const mockProficiencies = [
    { id: 1, proficiency_type: { name: 'Longsword', category: 'weapons' } },
    { id: 2, proficiency_type: { name: 'Heavy Armor', category: 'armor' } }
  ]

  it('displays proficiencies', async () => {
    const wrapper = await mountSuspended(ProficienciesPanel, {
      props: { proficiencies: mockProficiencies }
    })
    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Heavy Armor')
  })

  it('shows empty state when no proficiencies', async () => {
    const wrapper = await mountSuspended(ProficienciesPanel, {
      props: { proficiencies: [] }
    })
    expect(wrapper.text()).toContain('No proficiencies')
  })
})

describe('CharacterSheetEquipmentPanel', () => {
  const mockEquipment = [
    { id: 1, item: { name: 'Longsword' }, quantity: 1, equipped: true },
    { id: 2, item: { name: 'Handaxe' }, quantity: 2, equipped: false }
  ]

  it('displays equipment with quantities', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: { equipment: mockEquipment }
    })
    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Handaxe')
    expect(wrapper.text()).toContain('2')
  })

  it('shows empty state when no equipment', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: { equipment: [] }
    })
    expect(wrapper.text()).toContain('No equipment')
  })
})

describe('CharacterSheetSpellsPanel', () => {
  const mockSpells = [
    { id: 1, spell: { name: 'Fire Bolt', level: 0 }, prepared: true },
    { id: 2, spell: { name: 'Magic Missile', level: 1 }, prepared: true }
  ]
  const mockStats = {
    spellcasting: { ability: 'INT', spell_save_dc: 13, spell_attack_bonus: 5 }
  }

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
  const mockLanguages = [
    { id: 1, language: { name: 'Common' } },
    { id: 2, language: { name: 'Elvish' } }
  ]

  it('displays languages as tags', async () => {
    const wrapper = await mountSuspended(LanguagesPanel, {
      props: { languages: mockLanguages }
    })
    expect(wrapper.text()).toContain('Common')
    expect(wrapper.text()).toContain('Elvish')
  })

  it('shows empty state when no languages', async () => {
    const wrapper = await mountSuspended(LanguagesPanel, {
      props: { languages: [] }
    })
    expect(wrapper.text()).toContain('No languages')
  })
})
