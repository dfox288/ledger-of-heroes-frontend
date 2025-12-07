import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RaceOverviewInheritedDataSection from '~/components/race/overview/InheritedDataSection.vue'

describe('RaceOverviewInheritedDataSection', () => {
  const baseProps = {
    parentRaceName: 'Elf',
    parentRaceSlug: 'elf',
    inheritedData: {}
  }

  describe('Header Section', () => {
    it('displays parent race name in header', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: baseProps
      })

      expect(wrapper.text()).toContain('Inherited from Elf')
    })

    it('displays link to parent race', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: baseProps
      })

      const link = wrapper.find('a[href="/races/elf"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('View Elf')
    })

    it('handles different parent race names correctly', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: {
          ...baseProps,
          parentRaceName: 'Dwarf',
          parentRaceSlug: 'dwarf'
        }
      })

      expect(wrapper.text()).toContain('Inherited from Dwarf')
      const link = wrapper.find('a[href="/races/dwarf"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('View Dwarf')
    })
  })

  describe('Inherited Traits', () => {
    it('displays inherited species traits with descriptions', async () => {
      const inheritedData = {
        traits: [
          { id: '1', name: 'Keen Senses', category: 'species', description: 'You have proficiency in the Perception skill.', sort_order: '1' },
          { id: '2', name: 'Fey Ancestry', category: 'species', description: 'You have advantage on saving throws against being charmed, and magic cannot put you to sleep.', sort_order: '2' }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Traits')
      expect(text).toContain('Keen Senses')
      expect(text).toContain('Fey Ancestry')
      expect(text).toContain('proficiency in the Perception skill')
    })

    it('does not display traits section when empty', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData: { traits: [] } }
      })

      expect(wrapper.find('[data-testid="inherited-traits"]').exists()).toBe(false)
    })

    it('displays inherited lore traits in collapsible accordion', async () => {
      const inheritedData = {
        traits: [
          { id: '1', name: 'Elf History', category: 'description', description: 'Elves have existed for millennia, dwelling in harmony with nature.', sort_order: '1' },
          { id: '2', name: 'Fey Origins', category: 'description', description: 'Elves trace their ancestry to the mystical Feywild.', sort_order: '2' }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Lore')
      expect(text).toContain('2 lore entries')
      // Lore is in accordion, so names should be visible when expanded
      expect(wrapper.find('[data-testid="inherited-lore"]').exists()).toBe(true)
    })

    it('displays both lore and species traits when both present', async () => {
      const inheritedData = {
        traits: [
          { id: '1', name: 'Elf History', category: 'description', description: 'Elves have existed for millennia.', sort_order: '1' },
          { id: '2', name: 'Keen Senses', category: 'species', description: 'You have proficiency in the Perception skill.', sort_order: '2' }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Lore')
      expect(text).toContain('Traits')
      expect(text).toContain('1 lore entry')
      expect(text).toContain('Keen Senses')
    })

    it('truncates long trait descriptions', async () => {
      const longDescription = 'This is a very long description that exceeds the maximum character limit and should be truncated. It goes on and on with lots of text that would be too much to display in a compact format. The truncation function should cut this off at an appropriate point.'
      const inheritedData = {
        traits: [
          { id: '1', name: 'Test Trait', category: 'species', description: longDescription, sort_order: '1' }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      // The full description should not be present
      expect(text).not.toContain(longDescription)
      // But the trait name should be
      expect(text).toContain('Test Trait')
    })
  })

  describe('Inherited Modifiers', () => {
    it('displays ability score modifiers', async () => {
      const inheritedData = {
        modifiers: [
          {
            id: 1,
            name: 'Dexterity',
            value: 2,
            modifier_category: 'ability_score',
            ability_score: { name: 'Dexterity' }
          }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Modifiers')
      expect(text).toContain('+2 Dexterity')
    })

    it('displays damage resistance modifiers', async () => {
      const inheritedData = {
        modifiers: [
          {
            id: 1,
            name: 'Poison Resistance',
            value: 'resistance',
            modifier_category: 'damage_resistance',
            damage_type: { name: 'Poison' }
          }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Poison resistance')
    })

    it('displays multiple modifiers', async () => {
      const inheritedData = {
        modifiers: [
          {
            id: 1,
            name: 'Dexterity',
            value: 2,
            modifier_category: 'ability_score',
            ability_score: { name: 'Dexterity' }
          },
          {
            id: 2,
            name: 'Constitution',
            value: 1,
            modifier_category: 'ability_score',
            ability_score: { name: 'Constitution' }
          }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('+2 Dexterity')
      expect(text).toContain('+1 Constitution')
    })

    it('does not display modifiers section when empty', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData: { modifiers: [] } }
      })

      expect(wrapper.find('[data-testid="inherited-modifiers"]').exists()).toBe(false)
    })
  })

  describe('Inherited Languages', () => {
    it('displays inherited languages', async () => {
      const inheritedData = {
        languages: [
          { language: { name: 'Common' }, is_choice: false },
          { language: { name: 'Elvish' }, is_choice: false }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Languages')
      expect(text).toContain('Common')
      expect(text).toContain('Elvish')
    })

    it('does not display languages section when empty', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData: { languages: [] } }
      })

      expect(wrapper.find('[data-testid="inherited-languages"]').exists()).toBe(false)
    })

    it('displays single language correctly', async () => {
      const inheritedData = {
        languages: [{ language: { name: 'Draconic' }, is_choice: false }]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      expect(wrapper.text()).toContain('Draconic')
    })
  })

  describe('Inherited Senses', () => {
    it('displays inherited senses with range', async () => {
      const inheritedData = {
        senses: [
          {
            type: 'darkvision',
            name: 'Darkvision',
            range: 60,
            is_limited: false
          }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Senses')
      expect(text).toContain('Darkvision 60 ft.')
    })

    it('displays limited senses correctly', async () => {
      const inheritedData = {
        senses: [
          {
            type: 'blindsight',
            name: 'Blindsight',
            range: 30,
            is_limited: true
          }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      expect(wrapper.text()).toContain('Blindsight 30 ft. (limited)')
    })

    it('displays multiple senses', async () => {
      const inheritedData = {
        senses: [
          {
            type: 'darkvision',
            name: 'Darkvision',
            range: 60,
            is_limited: false
          },
          {
            type: 'tremorsense',
            name: 'Tremorsense',
            range: 15,
            is_limited: false
          }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Darkvision 60 ft.')
      expect(text).toContain('Tremorsense 15 ft.')
    })

    it('does not display senses section when empty', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData: { senses: [] } }
      })

      expect(wrapper.find('[data-testid="inherited-senses"]').exists()).toBe(false)
    })
  })

  describe('Inherited Proficiencies', () => {
    it('displays inherited proficiencies', async () => {
      const inheritedData = {
        proficiencies: [
          { id: 1, proficiency_name: 'Longsword', proficiency_type: 'weapon', proficiency_subcategory: null },
          { id: 2, proficiency_name: 'Shortsword', proficiency_type: 'weapon', proficiency_subcategory: null }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Proficiencies')
      expect(text).toContain('Longsword')
      expect(text).toContain('Shortsword')
    })

    it('does not display proficiencies section when empty', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData: { proficiencies: [] } }
      })

      expect(wrapper.find('[data-testid="inherited-proficiencies"]').exists()).toBe(false)
    })
  })

  describe('Inherited Conditions', () => {
    it('displays inherited conditions', async () => {
      const inheritedData = {
        conditions: [
          { id: 1, condition: { name: 'Charmed' }, effect_type: 'immunity', description: null },
          { id: 2, condition: { name: 'Frightened' }, effect_type: 'immunity', description: null }
        ]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Condition Defenses')
      expect(text).toContain('Charmed')
      expect(text).toContain('Frightened')
    })

    it('does not display conditions section when empty', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData: { conditions: [] } }
      })

      expect(wrapper.find('[data-testid="inherited-conditions"]').exists()).toBe(false)
    })
  })

  describe('Combined Data Display', () => {
    it('displays all sections when all data is present', async () => {
      const inheritedData = {
        traits: [
          { id: '1', name: 'Keen Senses', category: 'species', description: 'You have proficiency in Perception.', sort_order: '1' },
          { id: '2', name: 'Elf Lore', category: 'description', description: 'Ancient history of the elves.', sort_order: '2' }
        ],
        modifiers: [{
          id: 1,
          name: 'Dexterity',
          value: 2,
          modifier_category: 'ability_score',
          ability_score: { name: 'Dexterity' }
        }],
        languages: [{ language: { name: 'Common' }, is_choice: false }],
        senses: [{
          type: 'darkvision',
          name: 'Darkvision',
          range: 60,
          is_limited: false
        }],
        proficiencies: [{ id: 1, proficiency_name: 'Perception', proficiency_type: 'skill', proficiency_subcategory: null }],
        conditions: [{ id: 1, condition: { name: 'Charmed' }, effect_type: 'immunity', description: null }]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      const text = wrapper.text()
      expect(text).toContain('Lore')
      expect(text).toContain('Traits')
      expect(text).toContain('Modifiers')
      expect(text).toContain('Languages')
      expect(text).toContain('Senses')
      expect(text).toContain('Proficiencies')
      expect(text).toContain('Condition Defenses')
    })

    it('only displays sections with data', async () => {
      const inheritedData = {
        traits: [{ id: '1', name: 'Fey Ancestry', category: 'species', description: 'You have advantage on saving throws.', sort_order: '1' }],
        languages: [{ language: { name: 'Common' }, is_choice: false }]
        // No modifiers, senses, proficiencies, or conditions
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      // Check for presence of sections with data
      expect(wrapper.find('[data-testid="inherited-traits"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="inherited-languages"]').exists()).toBe(true)

      // Check for absence of sections without data
      expect(wrapper.find('[data-testid="inherited-modifiers"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="inherited-senses"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="inherited-proficiencies"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="inherited-conditions"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="inherited-lore"]').exists()).toBe(false)
    })

    it('handles completely empty inherited data', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData: {} }
      })

      // Should still render header
      expect(wrapper.text()).toContain('Inherited from Elf')
      // But no data sections
      expect(wrapper.find('[data-testid="inherited-traits"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="inherited-modifiers"]').exists()).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles parent race with special characters in name', async () => {
      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: {
          ...baseProps,
          parentRaceName: 'Elf (Drow)',
          parentRaceSlug: 'elf-drow'
        }
      })

      expect(wrapper.text()).toContain('Inherited from Elf (Drow)')
    })

    it('handles modifier without ability_score object', async () => {
      const inheritedData = {
        modifiers: [{
          id: 1,
          value: '2',
          modifier_category: 'ability_score',
          is_choice: false,
          choice_count: null,
          choice_constraint: null,
          condition: null,
          level: null
          // No ability_score object
        }]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      // Should still render modifier with fallback format
      expect(wrapper.text()).toContain('Modifiers')
      expect(wrapper.text()).toContain('ability_score: 2')
    })

    it('handles sense without range', async () => {
      const inheritedData = {
        senses: [{
          type: 'special',
          name: 'Special Vision',
          is_limited: false
          // No range property
        }]
      }

      const wrapper = await mountSuspended(RaceOverviewInheritedDataSection, {
        props: { ...baseProps, inheritedData }
      })

      // Should still display the sense name
      expect(wrapper.text()).toContain('Special Vision')
    })
  })
})
