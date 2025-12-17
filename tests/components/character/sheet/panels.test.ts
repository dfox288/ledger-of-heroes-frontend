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
  // Note: uses_remaining/max_uses removed from features in #725 (counter system refactor)
  // Limited use tracking is now in separate counters array
  const mockFeatures = [
    {
      id: 1,
      source: 'class',
      level_acquired: 1,
      feature_type: 'class_feature',
      feature: { id: 1, name: 'Second Wind', description: 'Heal as bonus action', level: '1', is_optional: 'false', category: 'class_feature' }
    },
    {
      id: 2,
      source: 'race',
      level_acquired: 1,
      feature_type: 'racial_trait',
      feature: { id: 2, name: 'Darkvision', description: 'See in darkness', level: '1', is_optional: 'false', category: 'racial_trait' }
    },
    {
      id: 3,
      source: 'background',
      level_acquired: 1,
      feature_type: 'background_feature',
      feature: { id: 3, name: 'Military Rank', description: 'Command soldiers', level: '1', is_optional: 'false', category: 'background_feature' }
    }
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
      {
        id: 1,
        source: 'subclass',
        level_acquired: 3,
        feature_type: 'subclass_feature',
        feature: { id: 1, name: 'Divine Domain: Life Domain', description: 'Life domain focus', level: '3', is_optional: 'false', category: 'subclass_feature' }
      },
      {
        id: 2,
        source: 'subclass',
        level_acquired: 3,
        feature_type: 'subclass_feature',
        feature: { id: 2, name: 'Disciple of Life', description: 'Healing spells are more effective', level: '3', is_optional: 'false', category: 'subclass_feature' }
      }
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
      {
        id: 1,
        source: 'feat',
        level_acquired: 4,
        feature_type: 'feat',
        feature: { id: 1, name: 'Actor', description: 'Skilled at mimicry', level: '4', is_optional: 'true', category: 'feat' }
      }
    ]
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: featFeatures }
    })
    expect(wrapper.text()).toContain('Actor')
    expect(wrapper.text()).toContain('Feats')
  })

  // Accordion behavior tests
  it('starts with all features collapsed', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    // Descriptions should not be visible initially
    expect(wrapper.text()).not.toContain('Heal as bonus action')
    expect(wrapper.text()).not.toContain('See in darkness')
  })

  it('expands feature when clicked', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    // Click the first feature toggle
    await wrapper.find('[data-testid="feature-toggle-1"]').trigger('click')
    // Description should now be visible
    expect(wrapper.text()).toContain('Heal as bonus action')
  })

  it('collapses expanded feature when clicked again', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    // Expand
    await wrapper.find('[data-testid="feature-toggle-1"]').trigger('click')
    expect(wrapper.text()).toContain('Heal as bonus action')
    // Collapse
    await wrapper.find('[data-testid="feature-toggle-1"]').trigger('click')
    expect(wrapper.text()).not.toContain('Heal as bonus action')
  })

  it('expand all button expands all features', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    await wrapper.find('[data-testid="expand-all-btn"]').trigger('click')
    expect(wrapper.text()).toContain('Heal as bonus action')
    expect(wrapper.text()).toContain('See in darkness')
    expect(wrapper.text()).toContain('Command soldiers')
  })

  it('collapse all button collapses all features', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    // First expand all
    await wrapper.find('[data-testid="expand-all-btn"]').trigger('click')
    expect(wrapper.text()).toContain('Heal as bonus action')
    // Then collapse all
    await wrapper.find('[data-testid="collapse-all-btn"]').trigger('click')
    expect(wrapper.text()).not.toContain('Heal as bonus action')
  })

  // Search functionality tests
  it('filters features by search query', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    const searchInput = wrapper.find('[data-testid="feature-search"]')
    await searchInput.setValue('Dark')
    // Only Darkvision should be visible
    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).not.toContain('Second Wind')
    expect(wrapper.text()).not.toContain('Military Rank')
  })

  it('shows no results message when search finds nothing', async () => {
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: mockFeatures }
    })
    const searchInput = wrapper.find('[data-testid="feature-search"]')
    await searchInput.setValue('nonexistent')
    expect(wrapper.text()).toContain('No features match')
  })

  // Level badge test
  it('shows level badge for class features', async () => {
    const classFeature = [
      {
        id: 1,
        source: 'class',
        level_acquired: 5,
        feature_type: 'class_feature',
        feature: { id: 1, name: 'Extra Attack', description: 'Attack twice', level: '5', is_optional: 'false', category: 'class_feature' }
      }
    ]
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: classFeature }
    })
    expect(wrapper.text()).toContain('Lvl 5')
  })

  // Note: Limited uses badge test removed in #725 (counter system refactor)
  // Features no longer have uses_remaining/max_uses - these are tracked in counters array

  // Chosen badge test
  it('shows Chosen badge for optional features', async () => {
    const optionalFeature = [
      {
        id: 1,
        source: 'feat',
        level_acquired: 4,
        feature_type: 'feat',
        feature: { id: 1, name: 'Lucky', description: 'Reroll dice', level: '4', is_optional: 'true', category: 'feat' }
      }
    ]
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: optionalFeature }
    })
    expect(wrapper.text()).toContain('Chosen')
  })

  it('shows prerequisite for feats that have one', async () => {
    const featWithPrerequisite = [
      {
        id: 1,
        source: 'feat',
        level_acquired: 4,
        feature_type: 'feat',
        feature: {
          id: 1,
          name: 'Heavy Armor Master',
          description: 'While wearing heavy armor...',
          level: '4',
          is_optional: 'true',
          category: 'feat',
          prerequisite: 'Proficiency with heavy armor'
        }
      }
    ]
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: featWithPrerequisite }
    })
    // Expand the feature to see description and prerequisite
    await wrapper.find('[data-testid="feature-toggle-1"]').trigger('click')
    expect(wrapper.text()).toContain('Prerequisite')
    expect(wrapper.text()).toContain('Proficiency with heavy armor')
  })

  it('does not show prerequisite when feature has none', async () => {
    const featWithoutPrerequisite = [
      {
        id: 1,
        source: 'feat',
        level_acquired: 4,
        feature_type: 'feat',
        feature: {
          id: 1,
          name: 'Sentinel',
          description: 'You have mastered techniques...',
          level: '4',
          is_optional: 'true',
          category: 'feat',
          prerequisite: null
        }
      }
    ]
    const wrapper = await mountSuspended(FeaturesPanel, {
      props: { features: featWithoutPrerequisite }
    })
    // Expand the feature
    await wrapper.find('[data-testid="feature-toggle-1"]').trigger('click')
    expect(wrapper.text()).not.toContain('Prerequisite')
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
  // Spellcasting is now keyed by class slug for multiclass support (#631)
  const mockStats = {
    spellcasting: {
      'phb:wizard': { ability: 'INT', ability_modifier: 3, spell_save_dc: 13, spell_attack_bonus: 5 }
    },
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
      spellcasting: {
        'phb:wizard': { ability: 'INT', ability_modifier: 3, spell_save_dc: 13, spell_attack_bonus: 5 }
      },
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
      spellcasting: {
        'phb:wizard': { ability: 'INT', ability_modifier: 3, spell_save_dc: 13, spell_attack_bonus: 5 }
      },
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

  // =========================================================================
  // Action Button Tests
  // =========================================================================

  it('shows Add Note button by default', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    expect(wrapper.find('[data-testid="add-note-btn"]').exists()).toBe(true)
  })

  it('hides Add Note button when readonly', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped, readonly: true }
    })
    expect(wrapper.find('[data-testid="add-note-btn"]').exists()).toBe(false)
  })

  it('emits add event when Add Note button is clicked', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    await wrapper.find('[data-testid="add-note-btn"]').trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('shows edit and delete buttons for each note', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    // Note ID 1 from backstory
    expect(wrapper.find('[data-testid="edit-note-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="delete-note-1"]').exists()).toBe(true)
    // Note ID 2 from session_notes
    expect(wrapper.find('[data-testid="edit-note-2"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="delete-note-2"]').exists()).toBe(true)
  })

  it('hides edit and delete buttons when readonly', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped, readonly: true }
    })
    expect(wrapper.find('[data-testid="edit-note-1"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="delete-note-1"]').exists()).toBe(false)
  })

  it('emits edit event with note when edit button is clicked', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    await wrapper.find('[data-testid="edit-note-1"]').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0][0]).toEqual(mockNotesGrouped.backstory[0])
  })

  it('emits delete event with note when delete button is clicked', async () => {
    const wrapper = await mountSuspended(NotesPanel, {
      props: { notes: mockNotesGrouped }
    })
    await wrapper.find('[data-testid="delete-note-1"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0][0]).toEqual(mockNotesGrouped.backstory[0])
  })
})
