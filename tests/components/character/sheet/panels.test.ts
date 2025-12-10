// tests/components/character/sheet/panels.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeaturesPanel from '~/components/character/sheet/FeaturesPanel.vue'
import ProficienciesPanel from '~/components/character/sheet/ProficienciesPanel.vue'
import EquipmentPanel from '~/components/character/sheet/EquipmentPanel.vue'
import SpellsPanel from '~/components/character/sheet/SpellsPanel.vue'
import LanguagesPanel from '~/components/character/sheet/LanguagesPanel.vue'
import NotesPanel from '~/components/character/sheet/NotesPanel.vue'

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

  it('displays subclass features under Subclass Features heading', async () => {
    const subclassFeatures = [
      { id: 1, source: 'subclass', feature: { name: 'Divine Domain: Life Domain', description: 'Life domain focus' } },
      { id: 2, source: 'subclass', feature: { name: 'Disciple of Life', description: 'Healing spells are more effective' } }
    ]
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: subclassFeatures }
    })
    expect(wrapper.text()).toContain('Divine Domain: Life Domain')
    expect(wrapper.text()).toContain('Disciple of Life')
    expect(wrapper.text()).toContain('Subclass Features')
  })

  it('displays feat features under Feats heading', async () => {
    const featFeatures = [
      { id: 1, source: 'feat', feature: { name: 'Actor', description: 'Skilled at mimicry' } }
    ]
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: featFeatures }
    })
    expect(wrapper.text()).toContain('Actor')
    expect(wrapper.text()).toContain('Feats')
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

  it('displays carrying capacity when provided', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: {
        equipment: mockEquipment,
        carryingCapacity: 150
      }
    })
    expect(wrapper.text()).toContain('Carrying Capacity')
    expect(wrapper.text()).toContain('150 lbs')
  })

  it('displays push/drag/lift capacity when provided', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: {
        equipment: mockEquipment,
        pushDragLift: 300
      }
    })
    expect(wrapper.text()).toContain('Push/Drag/Lift')
    expect(wrapper.text()).toContain('300 lbs')
  })

  it('displays both capacities when both provided', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: {
        equipment: mockEquipment,
        carryingCapacity: 150,
        pushDragLift: 300
      }
    })
    expect(wrapper.text()).toContain('Carrying Capacity')
    expect(wrapper.text()).toContain('150 lbs')
    expect(wrapper.text()).toContain('Push/Drag/Lift')
    expect(wrapper.text()).toContain('300 lbs')
  })

  it('hides capacity section when no capacities provided', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: { equipment: mockEquipment }
    })
    expect(wrapper.text()).not.toContain('Carrying Capacity')
    expect(wrapper.text()).not.toContain('Push/Drag/Lift')
  })

  it('hides capacity section when capacities are null', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: {
        equipment: mockEquipment,
        carryingCapacity: null,
        pushDragLift: null
      }
    })
    expect(wrapper.text()).not.toContain('Carrying Capacity')
    expect(wrapper.text()).not.toContain('Push/Drag/Lift')
  })

  it('displays only carrying capacity when push/drag/lift is null', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: {
        equipment: mockEquipment,
        carryingCapacity: 150,
        pushDragLift: null
      }
    })
    expect(wrapper.text()).toContain('Carrying Capacity')
    expect(wrapper.text()).toContain('150 lbs')
    expect(wrapper.text()).not.toContain('Push/Drag/Lift')
  })

  it('displays only push/drag/lift when carrying capacity is null', async () => {
    const wrapper = await mountSuspended(EquipmentPanel, {
      props: {
        equipment: mockEquipment,
        carryingCapacity: null,
        pushDragLift: 300
      }
    })
    expect(wrapper.text()).toContain('Push/Drag/Lift')
    expect(wrapper.text()).toContain('300 lbs')
    expect(wrapper.text()).not.toContain('Carrying Capacity')
  })
})

describe('CharacterSheetSpellsPanel', () => {
  const mockSpells = [
    { id: 1, spell: { name: 'Fire Bolt', level: 0 }, is_prepared: true },
    { id: 2, spell: { name: 'Magic Missile', level: 1 }, is_prepared: true }
  ]
  const mockStats = {
    spellcasting: { ability: 'INT', spell_save_dc: 13, spell_attack_bonus: 5 },
    preparation_limit: null,
    prepared_spell_count: 0
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

  it('displays preparation count when preparation_limit is set', async () => {
    const statsWithPreparation = {
      spellcasting: { ability: 'INT', spell_save_dc: 13, spell_attack_bonus: 5 },
      preparation_limit: 11,
      prepared_spell_count: 8
    }
    const wrapper = await mountSuspended(SpellsPanel, {
      props: { spells: mockSpells, stats: statsWithPreparation }
    })
    expect(wrapper.text()).toContain('Prepared: 8 / 11')
  })

  it('hides preparation count when preparation_limit is null', async () => {
    const statsWithoutPreparation = {
      spellcasting: { ability: 'INT', spell_save_dc: 13, spell_attack_bonus: 5 },
      preparation_limit: null,
      prepared_spell_count: 0
    }
    const wrapper = await mountSuspended(SpellsPanel, {
      props: { spells: mockSpells, stats: statsWithoutPreparation }
    })
    expect(wrapper.text()).not.toContain('Prepared:')
  })

  it('displays zero preparation count correctly', async () => {
    const statsWithZeroPreparation = {
      spellcasting: { ability: 'INT', spell_save_dc: 13, spell_attack_bonus: 5 },
      preparation_limit: 5,
      prepared_spell_count: 0
    }
    const wrapper = await mountSuspended(SpellsPanel, {
      props: { spells: mockSpells, stats: statsWithZeroPreparation }
    })
    expect(wrapper.text()).toContain('Prepared: 0 / 5')
  })

  it('displays full preparation count correctly', async () => {
    const statsWithFullPreparation = {
      spellcasting: { ability: 'INT', spell_save_dc: 13, spell_attack_bonus: 5 },
      preparation_limit: 10,
      prepared_spell_count: 10
    }
    const wrapper = await mountSuspended(SpellsPanel, {
      props: { spells: mockSpells, stats: statsWithFullPreparation }
    })
    expect(wrapper.text()).toContain('Prepared: 10 / 10')
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

describe('CharacterSheetNotesPanel', () => {
  // Notes are grouped by category - structure matches CharacterNotesGroupedResource
  const mockNotesGrouped = {
    backstory: [
      {
        id: 1,
        category: 'backstory',
        category_label: 'Backstory',
        title: 'Origins',
        content: 'Born in the village of Oakhurst...',
        sort_order: 0,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    ],
    session_notes: [
      {
        id: 2,
        category: 'session_notes',
        category_label: 'Session Notes',
        title: 'Session 1',
        content: 'Met the party at the tavern...',
        sort_order: 0,
        created_at: '2024-01-16T00:00:00Z',
        updated_at: '2024-01-16T00:00:00Z'
      },
      {
        id: 3,
        category: 'session_notes',
        category_label: 'Session Notes',
        title: 'Session 2',
        content: 'Explored the dungeon...',
        sort_order: 1,
        created_at: '2024-01-17T00:00:00Z',
        updated_at: '2024-01-17T00:00:00Z'
      }
    ]
  }

  it('displays notes grouped by category', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    expect(wrapper.text()).toContain('Backstory')
    expect(wrapper.text()).toContain('Session Notes')
    expect(wrapper.text()).toContain('Born in the village of Oakhurst')
    expect(wrapper.text()).toContain('Met the party at the tavern')
  })

  it('displays note titles when present', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    expect(wrapper.text()).toContain('Origins')
    expect(wrapper.text()).toContain('Session 1')
    expect(wrapper.text()).toContain('Session 2')
  })

  it('shows empty state when no notes', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: {} }
    })
    expect(wrapper.text()).toContain('No notes')
  })

  it('handles notes without titles', async () => {
    const notesWithoutTitle = {
      goals: [
        {
          id: 4,
          category: 'goals',
          category_label: 'Goals',
          title: null,
          content: 'Find the lost artifact',
          sort_order: 0,
          created_at: '2024-01-18T00:00:00Z',
          updated_at: '2024-01-18T00:00:00Z'
        }
      ]
    }
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: notesWithoutTitle }
    })
    expect(wrapper.text()).toContain('Goals')
    expect(wrapper.text()).toContain('Find the lost artifact')
  })

  it('renders multiple notes within a category', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    // Session notes has 2 entries
    expect(wrapper.text()).toContain('Session 1')
    expect(wrapper.text()).toContain('Session 2')
    expect(wrapper.text()).toContain('Met the party at the tavern')
    expect(wrapper.text()).toContain('Explored the dungeon')
  })
})
