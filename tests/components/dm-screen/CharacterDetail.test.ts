// tests/components/dm-screen/CharacterDetail.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CharacterDetail from '~/components/dm-screen/CharacterDetail.vue'
import type { DmScreenCharacter } from '~/types/dm-screen'
import type { Counter } from '~/types/character'

// Counter format updated in #725 - uses source_slug instead of source, slug removed
const mockRageCounter: Counter = {
  id: 1,
  name: 'Rage',
  current: 2,
  max: 3,
  reset_on: 'long_rest',
  source_slug: 'phb:barbarian',
  source_type: 'class',
  unlimited: false
}

const mockCharacter: DmScreenCharacter = {
  id: 1,
  public_id: 'brave-mage-3aBc',
  name: 'Gandalf',
  total_level: 5,
  class_name: 'Wizard',
  hit_points: { current: 28, max: 35, temp: 0 },
  armor_class: 15,
  proficiency_bonus: 3,
  combat: {
    initiative_modifier: 2,
    speeds: { walk: 30, fly: 60, swim: null, climb: null },
    death_saves: { successes: 0, failures: 0 },
    concentration: { active: true, spell: 'Haste' }
  },
  senses: {
    passive_perception: 14,
    passive_investigation: 12,
    passive_insight: 14,
    darkvision: 60
  },
  capabilities: {
    languages: ['Common', 'Elvish', 'Dwarvish'],
    size: 'Medium',
    tool_proficiencies: ['Thieves\' Tools', 'Alchemist\'s Supplies']
  },
  equipment: {
    armor: { name: 'Studded Leather', type: 'light', stealth_disadvantage: false },
    weapons: [
      { name: 'Staff', damage: '1d6 bludgeoning', range: null },
      { name: 'Dagger', damage: '1d4 piercing', range: '20/60' }
    ],
    shield: true
  },
  saving_throws: { STR: 0, DEX: 2, CON: 1, INT: 6, WIS: 4, CHA: -1 },
  conditions: [{ name: 'Blessed', slug: 'blessed', level: null }],
  spell_slots: {
    1: { current: 4, max: 4 },
    2: { current: 2, max: 3 },
    3: { current: 1, max: 2 }
  },
  counters: []
}

describe('DmScreenCharacterDetail', () => {
  describe('Combat Section', () => {
    it('displays speeds', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).toContain('30 ft')
      expect(wrapper.text()).toContain('60 ft')
    })

    it('displays saving throws', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).toContain('STR')
      expect(wrapper.text()).toContain('+6') // INT saving throw
    })

    it('highlights weak saves (modifier <= 0) with warning color', async () => {
      // mockCharacter has STR: 0 and CHA: -1 (both weak)
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      const strSave = wrapper.find('[data-testid="save-STR"]')
      const chaSave = wrapper.find('[data-testid="save-CHA"]')
      expect(strSave.classes().join(' ')).toMatch(/rose|red|warning/)
      expect(chaSave.classes().join(' ')).toMatch(/rose|red|warning/)
    })

    it('highlights strong saves (modifier >= 5) with success color', async () => {
      // mockCharacter has INT: 6 (strong)
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      const intSave = wrapper.find('[data-testid="save-INT"]')
      expect(intSave.classes().join(' ')).toMatch(/emerald|green|success/)
    })

    it('shows neutral color for normal saves', async () => {
      // mockCharacter has DEX: 2 and CON: 1 (normal range)
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      const dexSave = wrapper.find('[data-testid="save-DEX"]')
      // Should NOT have warning or success colors
      expect(dexSave.classes().join(' ')).not.toMatch(/rose|red|warning/)
      expect(dexSave.classes().join(' ')).not.toMatch(/emerald|green|success/)
    })

    it('displays concentration status', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).toContain('Concentration')
      expect(wrapper.text()).toContain('Haste')
    })
  })

  describe('Equipment Section', () => {
    it('displays weapons with damage', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).toContain('Staff')
      expect(wrapper.text()).toContain('1d6 bludgeoning')
    })

    it('shows shield indicator', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).toContain('Shield')
    })

    it('does not display armor details (AC shown in main row)', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      // Armor name/type removed - AC is shown in the combat table row
      expect(wrapper.text()).not.toContain('Studded Leather')
    })
  })

  describe('Removed redundant sections', () => {
    it('does not display languages (shown in Party Summary)', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      // Languages are shown in Party Summary, not per-character
      expect(wrapper.text()).not.toContain('Languages')
    })

    it('does not display size (rarely combat-relevant)', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).not.toContain('Size:')
    })

    it('does not display tool proficiencies (not combat-relevant)', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).not.toContain('Tools')
      expect(wrapper.text()).not.toContain('Thieves\' Tools')
    })
  })

  describe('Spell Slots Section', () => {
    it('displays spell slots for spellcasters', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.find('[data-testid="spell-slots-container"]').exists()).toBe(true)
    })

    it('hides spell slots for non-spellcasters', async () => {
      const nonCaster = { ...mockCharacter, spell_slots: {} }
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: nonCaster }
      })
      expect(wrapper.find('[data-testid="spell-slots-container"]').exists()).toBe(false)
    })
  })

  describe('Conditions Section', () => {
    it('displays active conditions', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).toContain('Blessed')
    })

    it('shows no conditions message when empty', async () => {
      const noConditions = { ...mockCharacter, conditions: [] }
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: noConditions }
      })
      expect(wrapper.text()).toMatch(/no.*condition|none/i)
    })
  })

  describe('Counters Section', () => {
    it('displays counters for characters with class resources', async () => {
      const withCounters = { ...mockCharacter, counters: [mockRageCounter] }
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: withCounters }
      })
      expect(wrapper.find('[data-testid="counters-container"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Rage')
    })

    it('hides counters section for characters without class resources', async () => {
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: mockCharacter }
      })
      expect(wrapper.find('[data-testid="counters-container"]').exists()).toBe(false)
    })

    it('shows counters header when counters exist', async () => {
      const withCounters = { ...mockCharacter, counters: [mockRageCounter] }
      const wrapper = await mountSuspended(CharacterDetail, {
        props: { character: withCounters }
      })
      expect(wrapper.text()).toContain('Class Resources')
    })
  })
})
