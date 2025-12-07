import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiClassProgressionTable from '~/components/ui/class/UiClassProgressionTable.vue'

describe('UiClassProgressionTable', () => {
  const baseProgressionTable = {
    columns: [
      { key: 'level', label: 'Level', type: 'integer' },
      { key: 'proficiency_bonus', label: 'Proficiency Bonus', type: 'bonus' },
      { key: 'features', label: 'Features', type: 'string' }
    ],
    rows: [
      { level: 1, proficiency_bonus: '+2', features: 'Second Wind, Fighting Style' },
      { level: 2, proficiency_bonus: '+2', features: 'Action Surge' },
      { level: 3, proficiency_bonus: '+2', features: 'Martial Archetype' }
    ]
  }

  it('renders table with columns', async () => {
    const wrapper = await mountSuspended(UiClassProgressionTable, {
      props: { progressionTable: baseProgressionTable }
    })

    expect(wrapper.text()).toContain('Level')
    expect(wrapper.text()).toContain('Proficiency Bonus')
    expect(wrapper.text()).toContain('Features')
  })

  it('renders progression rows', async () => {
    const wrapper = await mountSuspended(UiClassProgressionTable, {
      props: { progressionTable: baseProgressionTable }
    })

    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('Second Wind')
  })

  describe('level highlighting', () => {
    it('highlights ASI levels with primary color', async () => {
      const tableWithASI = {
        ...baseProgressionTable,
        rows: [
          { level: 3, proficiency_bonus: '+2', features: 'Martial Archetype' },
          { level: 4, proficiency_bonus: '+2', features: 'Ability Score Improvement' },
          { level: 5, proficiency_bonus: '+3', features: 'Extra Attack' }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithASI }
      })

      // Find the table rows
      const rows = wrapper.findAll('tbody tr')

      // Level 3 should not have ASI highlight
      expect(rows[0].classes()).not.toContain('bg-primary-50')

      // Level 4 should have ASI highlight
      expect(rows[1].classes()).toContain('bg-primary-50')
      expect(rows[1].classes()).toContain('dark:bg-primary-900/20')

      // Level 5 should not have ASI highlight
      expect(rows[2].classes()).not.toContain('bg-primary-50')
    })

    it('highlights subclass feature levels with class color', async () => {
      const tableWithSubclass = {
        ...baseProgressionTable,
        rows: [
          { level: 2, proficiency_bonus: '+2', features: 'Action Surge' },
          { level: 3, proficiency_bonus: '+2', features: 'Martial Archetype' },
          { level: 4, proficiency_bonus: '+2', features: 'Ability Score Improvement' }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithSubclass }
      })

      const rows = wrapper.findAll('tbody tr')

      // Level 2 should not have subclass highlight
      expect(rows[0].classes()).not.toContain('bg-class-50')

      // Level 3 with "Archetype" should have subclass highlight
      expect(rows[1].classes()).toContain('bg-class-50')
      expect(rows[1].classes()).toContain('dark:bg-class-900/20')

      // Level 4 (ASI) should not have subclass highlight
      expect(rows[2].classes()).not.toContain('bg-class-50')
    })

    it('detects subclass keywords like Circle, Path, Tradition', async () => {
      const tableWithVariousSubclass = {
        ...baseProgressionTable,
        rows: [
          { level: 2, proficiency_bonus: '+2', features: 'Wild Shape, Druid Circle' },
          { level: 3, proficiency_bonus: '+2', features: 'Primal Path' },
          { level: 2, proficiency_bonus: '+2', features: 'Arcane Tradition' }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithVariousSubclass }
      })

      const rows = wrapper.findAll('tbody tr')

      // All should have subclass highlight
      expect(rows[0].classes()).toContain('bg-class-50')
      expect(rows[1].classes()).toContain('bg-class-50')
      expect(rows[2].classes()).toContain('bg-class-50')
    })
  })

  describe('mobile card view', () => {
    it('renders mobile card view with level information', async () => {
      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: baseProgressionTable }
      })

      // Check for mobile cards container
      const mobileCards = wrapper.find('.block.sm\\:hidden')
      expect(mobileCards.exists()).toBe(true)

      // Check for level cards
      const levelCards = wrapper.findAll('[data-testid="level-card"]')
      expect(levelCards.length).toBe(3)

      // Check first card contains level info
      expect(levelCards[0].text()).toContain('Level 1')
      expect(levelCards[0].text()).toContain('+2')
      expect(levelCards[0].text()).toContain('Second Wind')
    })

    it('hides mobile cards on larger screens', async () => {
      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: baseProgressionTable }
      })

      // Mobile view should have 'block sm:hidden' classes
      const mobileCards = wrapper.find('.block.sm\\:hidden')
      expect(mobileCards.classes()).toContain('block')
      expect(mobileCards.classes()).toContain('sm:hidden')
    })

    it('hides table on small screens', async () => {
      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: baseProgressionTable }
      })

      // Table wrapper should have 'hidden sm:block' classes
      const tableWrapper = wrapper.find('.hidden.sm\\:block')
      expect(tableWrapper.exists()).toBe(true)
      expect(tableWrapper.classes()).toContain('hidden')
      expect(tableWrapper.classes()).toContain('sm:block')
    })

    it('mobile cards show same filtered features as table', async () => {
      const tableWithFiltering = {
        ...baseProgressionTable,
        rows: [
          {
            level: 1,
            proficiency_bonus: '+2',
            features: 'Starting Fighter, Multiclass Fighter, Second Wind, Fighting Style'
          }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithFiltering }
      })

      const mobileCard = wrapper.find('[data-testid="level-card"]')

      // Should show filtered features
      expect(mobileCard.text()).toContain('Second Wind')
      expect(mobileCard.text()).toContain('Fighting Style')

      // Should NOT show filtered features
      expect(mobileCard.text()).not.toContain('Starting Fighter')
      expect(mobileCard.text()).not.toContain('Multiclass Fighter')
    })
  })

  describe('feature filtering', () => {
    it('filters out multiclass features from display', async () => {
      const tableWithMulticlass = {
        ...baseProgressionTable,
        rows: [
          {
            level: 1,
            proficiency_bonus: '+2',
            features: 'Starting Fighter, Multiclass Fighter, Multiclass Features, Second Wind, Fighting Style'
          }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithMulticlass }
      })

      // Should show core features
      expect(wrapper.text()).toContain('Second Wind')
      expect(wrapper.text()).toContain('Fighting Style')

      // Should NOT show multiclass features
      expect(wrapper.text()).not.toContain('Multiclass Fighter')
      expect(wrapper.text()).not.toContain('Multiclass Features')
    })

    it('filters out Starting class feature from display', async () => {
      const tableWithStarting = {
        ...baseProgressionTable,
        rows: [
          {
            level: 1,
            proficiency_bonus: '+2',
            features: 'Starting Wizard, Spellcasting, Arcane Recovery'
          }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithStarting }
      })

      expect(wrapper.text()).toContain('Spellcasting')
      expect(wrapper.text()).toContain('Arcane Recovery')
      expect(wrapper.text()).not.toContain('Starting Wizard')
    })

    it('collapses Fighting Style options into single entry', async () => {
      const tableWithFightingStyles = {
        ...baseProgressionTable,
        rows: [
          {
            level: 1,
            proficiency_bonus: '+2',
            features: 'Second Wind, Fighting Style, Fighting Style: Archery, Fighting Style: Defense, Fighting Style: Dueling, Fighting Style: Great Weapon Fighting, Fighting Style: Protection, Fighting Style: Two-Weapon Fighting'
          }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithFightingStyles }
      })

      // Should show parent feature
      expect(wrapper.text()).toContain('Fighting Style')
      expect(wrapper.text()).toContain('Second Wind')

      // Should NOT show individual options
      expect(wrapper.text()).not.toContain('Fighting Style: Archery')
      expect(wrapper.text()).not.toContain('Fighting Style: Defense')
      expect(wrapper.text()).not.toContain('Fighting Style: Dueling')
    })

    it('filters out Totem Warrior animal options', async () => {
      const tableWithTotemOptions = {
        ...baseProgressionTable,
        rows: [
          {
            level: 3,
            proficiency_bonus: '+2',
            features: 'Primal Path, Spirit Seeker, Totem Spirit, Bear (Path of the Totem Warrior), Eagle (Path of the Totem Warrior), Wolf (Path of the Totem Warrior)'
          }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithTotemOptions }
      })

      expect(wrapper.text()).toContain('Primal Path')
      expect(wrapper.text()).toContain('Spirit Seeker')
      expect(wrapper.text()).toContain('Totem Spirit')

      // Should NOT show individual animal options
      expect(wrapper.text()).not.toContain('Bear (Path')
      expect(wrapper.text()).not.toContain('Eagle (Path')
      expect(wrapper.text()).not.toContain('Wolf (Path')
    })

    it('handles empty features gracefully', async () => {
      const tableWithEmpty = {
        ...baseProgressionTable,
        rows: [
          { level: 5, proficiency_bonus: '+3', features: '—' }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableWithEmpty }
      })

      expect(wrapper.text()).toContain('—')
    })

    it('returns dash when all features are filtered out', async () => {
      const tableAllFiltered = {
        ...baseProgressionTable,
        rows: [
          {
            level: 1,
            proficiency_bonus: '+2',
            features: 'Starting Fighter, Multiclass Fighter, Multiclass Features'
          }
        ]
      }

      const wrapper = await mountSuspended(UiClassProgressionTable, {
        props: { progressionTable: tableAllFiltered }
      })

      // Should show dash when all features filtered
      expect(wrapper.text()).toContain('—')
    })
  })
})
