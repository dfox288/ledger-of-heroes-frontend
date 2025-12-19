// tests/components/character/sheet/SpellCard.test.ts
/**
 * SpellCard Component Tests
 *
 * Tests the expandable spell card component including:
 * - Collapsed/expanded states
 * - Preparation toggle (click card body to prepare/unprepare)
 * - Greyed out states when at prep limit
 *
 * @see Issue #556 - Spells Tab
 * @see Issue #616 - Spell preparation toggle
 */
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellCard from '~/components/character/sheet/SpellCard.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { CharacterSpell } from '~/types/character'

// Mock spell data
const mockCantrip: CharacterSpell = {
  id: 1,
  spell: {
    id: 101,
    name: 'Fire Bolt',
    slug: 'phb:fire-bolt',
    level: 0,
    school: 'Evocation',
    casting_time: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:fire-bolt',
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: false,
  is_always_prepared: false
}

// Cantrip with scaled damage (level 5+ character)
const mockDamageCantrip: CharacterSpell = {
  id: 10,
  spell: {
    id: 110,
    name: 'Fire Bolt',
    slug: 'phb:fire-bolt',
    level: 0,
    school: 'Evocation',
    casting_time: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:fire-bolt',
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: false,
  is_always_prepared: false,
  scaled_effects: [
    { effect_type: 'damage', dice_formula: '2d10', damage_type: 'Fire' }
  ]
}

// Utility cantrip without damage
const mockUtilityCantrip: CharacterSpell = {
  id: 11,
  spell: {
    id: 111,
    name: 'Mage Hand',
    slug: 'phb:mage-hand',
    level: 0,
    school: 'Conjuration',
    casting_time: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: '1 minute',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:mage-hand',
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: false,
  is_always_prepared: false,
  scaled_effects: []
}

// Ranged attack cantrip with combat fields (Issue #808)
const mockRangedAttackCantrip: CharacterSpell = {
  id: 12,
  spell: {
    id: 112,
    name: 'Fire Bolt',
    slug: 'phb:fire-bolt',
    level: 0,
    school: 'Evocation',
    casting_time: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    attack_type: 'ranged',
    saving_throw: '',
    damage_types: ['Fire']
  },
  spell_slug: 'phb:fire-bolt',
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: false,
  is_always_prepared: false,
  scaled_effects: [
    { effect_type: 'damage', dice_formula: '2d10', damage_type: 'Fire' }
  ]
}

// Saving throw spell with combat fields (Issue #808)
const mockSaveSpell: CharacterSpell = {
  id: 13,
  spell: {
    id: 113,
    name: 'Fireball',
    slug: 'phb:fireball',
    level: 3,
    school: 'Evocation',
    casting_time: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    attack_type: 'none',
    saving_throw: 'DEX',
    damage_types: ['Fire']
  },
  spell_slug: 'phb:fireball',
  is_dangling: false,
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 5,
  is_prepared: true,
  is_always_prepared: false
}

// Multiple damage types spell (Issue #808)
const mockMultiDamageSpell: CharacterSpell = {
  id: 14,
  spell: {
    id: 114,
    name: 'Chromatic Orb',
    slug: 'phb:chromatic-orb',
    level: 1,
    school: 'Evocation',
    casting_time: '1 action',
    range: '90 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    attack_type: 'ranged',
    saving_throw: '',
    damage_types: ['Acid', 'Cold', 'Fire', 'Lightning', 'Poison', 'Thunder']
  },
  spell_slug: 'phb:chromatic-orb',
  is_dangling: false,
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 1,
  is_prepared: true,
  is_always_prepared: false
}

// Melee attack spell (Issue #808)
const mockMeleeAttackSpell: CharacterSpell = {
  id: 15,
  spell: {
    id: 115,
    name: 'Shocking Grasp',
    slug: 'phb:shocking-grasp',
    level: 0,
    school: 'Evocation',
    casting_time: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    attack_type: 'melee',
    saving_throw: '',
    damage_types: ['Lightning']
  },
  spell_slug: 'phb:shocking-grasp',
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: false,
  is_always_prepared: false,
  scaled_effects: [
    { effect_type: 'damage', dice_formula: '2d8', damage_type: 'Lightning' }
  ]
}

const mockLeveledSpell: CharacterSpell = {
  id: 2,
  spell: {
    id: 102,
    name: 'Fireball',
    slug: 'phb:fireball',
    level: 3,
    school: 'Evocation',
    casting_time: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:fireball',
  class_slug: 'phb:wizard',
  is_dangling: false,
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 5,
  is_prepared: true,
  is_always_prepared: false
}

const mockConcentrationSpell: CharacterSpell = {
  id: 3,
  spell: {
    id: 103,
    name: 'Hold Person',
    slug: 'phb:hold-person',
    level: 2,
    school: 'Enchantment',
    casting_time: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    ritual: false
  },
  spell_slug: 'phb:hold-person',
  is_dangling: false,
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 3,
  is_prepared: true,
  is_always_prepared: false
}

const mockRitualSpell: CharacterSpell = {
  id: 4,
  spell: {
    id: 104,
    name: 'Detect Magic',
    slug: 'phb:detect-magic',
    level: 1,
    school: 'Divination',
    casting_time: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    ritual: true
  },
  spell_slug: 'phb:detect-magic',
  is_dangling: false,
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 1,
  is_prepared: true,
  is_always_prepared: false
}

const mockAlwaysPreparedSpell: CharacterSpell = {
  id: 5,
  spell: {
    id: 105,
    name: 'Cure Wounds',
    slug: 'phb:cure-wounds',
    level: 1,
    school: 'Evocation',
    casting_time: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:cure-wounds',
  is_dangling: false,
  preparation_status: 'always_prepared',
  source: 'class',
  level_acquired: 1,
  is_prepared: true,
  is_always_prepared: true
}

describe('SpellCard', () => {
  describe('collapsed state', () => {
    it('displays spell name', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).toContain('Fireball')
    })

    it('displays spell level for leveled spells', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).toContain('3rd')
    })

    it('displays "Cantrip" for level 0 spells', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockCantrip }
      })
      expect(wrapper.text()).toContain('Cantrip')
    })

    it('shows Concentration badge when applicable', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockConcentrationSpell }
      })
      expect(wrapper.text()).toContain('Concentration')
    })

    it('shows Ritual badge when applicable', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockRitualSpell }
      })
      expect(wrapper.text()).toContain('Ritual')
    })

    it('shows prepared indicator for prepared spells', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      const preparedIcon = wrapper.find('[data-testid="prepared-icon"]')
      expect(preparedIcon.exists()).toBe(true)
    })

    it('shows always-prepared indicator', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockAlwaysPreparedSpell }
      })
      expect(wrapper.text()).toContain('Always')
    })

    it('dims unprepared spells', async () => {
      const unpreparedSpell = { ...mockLeveledSpell, is_prepared: false, preparation_status: 'known' }
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: unpreparedSpell }
      })
      const card = wrapper.find('[data-testid="spell-card"]')
      expect(card.classes().join(' ')).toMatch(/opacity/)
    })
  })

  describe('expanded state', () => {
    it('starts collapsed by default', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).not.toContain('Casting Time')
    })

    it('expands when expand toggle is clicked', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

      expect(wrapper.text()).toContain('Casting Time')
      expect(wrapper.text()).toContain('1 action')
    })

    it('shows range when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

      expect(wrapper.text()).toContain('Range')
      expect(wrapper.text()).toContain('150 feet')
    })

    it('shows components when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

      expect(wrapper.text()).toContain('Components')
      expect(wrapper.text()).toContain('V, S, M')
    })

    it('shows duration when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

      expect(wrapper.text()).toContain('Duration')
      expect(wrapper.text()).toContain('Instantaneous')
    })

    it('collapses when clicked again', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      const toggle = wrapper.find('[data-testid="expand-toggle"]')
      await toggle.trigger('click') // Expand
      await toggle.trigger('click') // Collapse

      expect(wrapper.text()).not.toContain('Casting Time')
    })

    it('expands when clicking the header area (#719)', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      // Click on the header area (not the chevron button)
      await wrapper.find('[data-testid="spell-card-header"]').trigger('click')

      // Should expand to show details
      expect(wrapper.find('[data-testid="spell-details"]').exists()).toBe(true)
    })

    it('collapses when clicking header area again (#719)', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      const header = wrapper.find('[data-testid="spell-card-header"]')
      await header.trigger('click') // Expand
      await header.trigger('click') // Collapse

      expect(wrapper.find('[data-testid="spell-details"]').exists()).toBe(false)
    })
  })

  describe('school display', () => {
    it('shows spell school', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).toContain('Evocation')
    })
  })

  // ==========================================================================
  // PREPARATION TOGGLE TESTS (Issue #616)
  // ==========================================================================

  describe('preparation toggle', () => {
    let pinia: ReturnType<typeof createPinia>

    function setupStore() {
      pinia = createPinia()
      setActivePinia(pinia)
      return useCharacterPlayStateStore()
    }

    function getMountOptions() {
      return {
        global: {
          plugins: [pinia]
        }
      }
    }

    it('clicking preparation toggle toggles preparation when editable', async () => {
      const store = setupStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellPreparation({
        spells: [{ id: mockLeveledSpell.id, is_prepared: true, is_always_prepared: false }],
        preparationLimit: 5
      })

      const toggleSpy = vi.spyOn(store, 'toggleSpellPreparation').mockResolvedValue()

      const wrapper = await mountSuspended(SpellCard, {
        props: {
          spell: mockLeveledSpell,
          characterId: 1,
          editable: true,
          atPrepLimit: false
        },
        ...getMountOptions()
      })

      // Click the preparation toggle button
      await wrapper.find('[data-testid="preparation-toggle"]').trigger('click')

      expect(toggleSpy).toHaveBeenCalledWith(
        mockLeveledSpell.id,
        true,
        mockLeveledSpell.spell_slug,
        mockLeveledSpell.class_slug
      )
    })

    it('clicking expand chevron expands details without toggling preparation', async () => {
      const store = setupStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      const toggleSpy = vi.spyOn(store, 'toggleSpellPreparation')

      const wrapper = await mountSuspended(SpellCard, {
        props: {
          spell: mockLeveledSpell,
          characterId: 1,
          editable: true,
          atPrepLimit: false
        },
        ...getMountOptions()
      })

      await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

      expect(toggleSpy).not.toHaveBeenCalled()
      expect(wrapper.find('[data-testid="spell-details"]').exists()).toBe(true)
    })

    it('card is greyed out and not clickable when at prep limit and unprepared', async () => {
      const store = setupStore()
      const toggleSpy = vi.spyOn(store, 'toggleSpellPreparation')

      const unpreparedSpell = { ...mockLeveledSpell, is_prepared: false, preparation_status: 'known' as const }

      const wrapper = await mountSuspended(SpellCard, {
        props: {
          spell: unpreparedSpell,
          characterId: 1,
          editable: true,
          atPrepLimit: true
        },
        ...getMountOptions()
      })

      await wrapper.find('[data-testid="preparation-toggle"]').trigger('click')

      expect(toggleSpy).not.toHaveBeenCalled()
      // Check for greyed out state (opacity-40)
      const card = wrapper.find('[data-testid="spell-card"]')
      expect(card.classes().join(' ')).toMatch(/opacity-40/)
    })

    it('always-prepared spells cannot be toggled', async () => {
      const store = setupStore()
      const toggleSpy = vi.spyOn(store, 'toggleSpellPreparation')

      const wrapper = await mountSuspended(SpellCard, {
        props: {
          spell: mockAlwaysPreparedSpell,
          characterId: 1,
          editable: true,
          atPrepLimit: false
        },
        ...getMountOptions()
      })

      await wrapper.find('[data-testid="preparation-toggle"]').trigger('click')

      expect(toggleSpy).not.toHaveBeenCalled()
    })

    it('does not toggle when editable is false', async () => {
      const store = setupStore()
      const toggleSpy = vi.spyOn(store, 'toggleSpellPreparation')

      const wrapper = await mountSuspended(SpellCard, {
        props: {
          spell: mockLeveledSpell,
          characterId: 1,
          editable: false,
          atPrepLimit: false
        },
        ...getMountOptions()
      })

      await wrapper.find('[data-testid="preparation-toggle"]').trigger('click')

      expect(toggleSpy).not.toHaveBeenCalled()
    })

    it('prepared spells can be unprepared even at prep limit', async () => {
      const store = setupStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellPreparation({
        spells: [{ id: mockLeveledSpell.id, is_prepared: true, is_always_prepared: false }],
        preparationLimit: 1
      })

      const toggleSpy = vi.spyOn(store, 'toggleSpellPreparation').mockResolvedValue()

      const wrapper = await mountSuspended(SpellCard, {
        props: {
          spell: mockLeveledSpell,
          characterId: 1,
          editable: true,
          atPrepLimit: true
        },
        ...getMountOptions()
      })

      await wrapper.find('[data-testid="preparation-toggle"]').trigger('click')

      expect(toggleSpy).toHaveBeenCalledWith(
        mockLeveledSpell.id,
        true,
        mockLeveledSpell.spell_slug,
        mockLeveledSpell.class_slug
      )
    })
  })

  // ==========================================================================
  // PREPARATION METHOD UI TESTS (Issue #676)
  // ==========================================================================

  describe('preparation method UI differentiation', () => {
    describe('known casters (Bard, Sorcerer, Warlock, Ranger)', () => {
      it('hides prepared indicator for known casters', async () => {
        const preparedSpell = { ...mockLeveledSpell, is_prepared: true }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: preparedSpell,
            preparationMethod: 'known'
          }
        })

        expect(wrapper.find('[data-testid="prepared-icon"]').exists()).toBe(false)
      })

      it('hides unprepared indicator for known casters', async () => {
        const unpreparedSpell = { ...mockLeveledSpell, is_prepared: false }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: unpreparedSpell,
            preparationMethod: 'known'
          }
        })

        // The empty circle indicator should not exist
        expect(wrapper.find('[data-testid="unprepared-indicator"]').exists()).toBe(false)
      })

      it('does not dim unprepared spells for known casters', async () => {
        const unpreparedSpell = { ...mockLeveledSpell, is_prepared: false, preparation_status: 'known' as const }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: unpreparedSpell,
            preparationMethod: 'known'
          }
        })

        const card = wrapper.find('[data-testid="spell-card"]')
        // Should NOT have opacity class for known casters
        expect(card.classes().join(' ')).not.toMatch(/opacity-60/)
      })

      it('does not show preparation toggle for known casters', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockLeveledSpell,
            characterId: 1,
            editable: true,
            atPrepLimit: false,
            preparationMethod: 'known'
          }
        })

        // Known casters should not have a preparation toggle button at all
        expect(wrapper.find('[data-testid="preparation-toggle"]').exists()).toBe(false)
      })

      it('still allows expand/collapse for known casters', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockLeveledSpell,
            preparationMethod: 'known'
          }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.find('[data-testid="spell-details"]').exists()).toBe(true)
      })
    })

    describe('prepared casters (Cleric, Druid, Paladin)', () => {
      it('shows prepared indicator for prepared casters', async () => {
        const preparedSpell = { ...mockLeveledSpell, is_prepared: true }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: preparedSpell,
            preparationMethod: 'prepared'
          }
        })

        expect(wrapper.find('[data-testid="prepared-icon"]').exists()).toBe(true)
      })

      it('shows unprepared indicator for unprepared spells', async () => {
        const unpreparedSpell = { ...mockLeveledSpell, is_prepared: false }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: unpreparedSpell,
            preparationMethod: 'prepared'
          }
        })

        expect(wrapper.find('[data-testid="unprepared-indicator"]').exists()).toBe(true)
      })

      it('dims unprepared spells for prepared casters', async () => {
        const unpreparedSpell = { ...mockLeveledSpell, is_prepared: false, preparation_status: 'known' as const }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: unpreparedSpell,
            preparationMethod: 'prepared'
          }
        })

        const card = wrapper.find('[data-testid="spell-card"]')
        expect(card.classes().join(' ')).toMatch(/opacity-60/)
      })
    })

    describe('spellbook casters (Wizard)', () => {
      it('shows prepared indicator for spellbook casters', async () => {
        const preparedSpell = { ...mockLeveledSpell, is_prepared: true }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: preparedSpell,
            preparationMethod: 'spellbook'
          }
        })

        expect(wrapper.find('[data-testid="prepared-icon"]').exists()).toBe(true)
      })
    })

    describe('fallback behavior (null/undefined)', () => {
      it('shows prepared indicator when preparationMethod is null', async () => {
        const preparedSpell = { ...mockLeveledSpell, is_prepared: true }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: preparedSpell,
            preparationMethod: null
          }
        })

        expect(wrapper.find('[data-testid="prepared-icon"]').exists()).toBe(true)
      })

      it('shows prepared indicator when preparationMethod is undefined', async () => {
        const preparedSpell = { ...mockLeveledSpell, is_prepared: true }
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: preparedSpell
            // preparationMethod not provided
          }
        })

        expect(wrapper.find('[data-testid="prepared-icon"]').exists()).toBe(true)
      })
    })
  })

  // ==========================================================================
  // SPELL DESCRIPTION TESTS (Issue #782)
  // ==========================================================================

  describe('spell description display', () => {
    // Mock spell with description field (will be added to CharacterSpellResource)
    const mockSpellWithDescription: CharacterSpell = {
      ...mockLeveledSpell,
      spell: {
        ...mockLeveledSpell.spell!,
        description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.'
      }
    }

    const mockSpellWithHigherLevels: CharacterSpell = {
      ...mockLeveledSpell,
      spell: {
        ...mockLeveledSpell.spell!,
        description: 'A bright streak flashes from your pointing finger.',
        higher_levels: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.'
      }
    }

    describe('description section', () => {
      it('does not show description when collapsed', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockSpellWithDescription }
        })

        expect(wrapper.text()).not.toContain('A bright streak flashes')
      })

      it('shows description when expanded and description is available', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockSpellWithDescription }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('A bright streak flashes')
      })

      it('does not show description section when description is not available', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockLeveledSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        // Should not have description section when no description
        expect(wrapper.find('[data-testid="spell-description"]').exists()).toBe(false)
      })

      it('shows "At Higher Levels" when available', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockSpellWithHigherLevels }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('At Higher Levels')
        expect(wrapper.text()).toContain('damage increases by 1d6')
      })

      it('does not show "At Higher Levels" when not available', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockSpellWithDescription }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).not.toContain('At Higher Levels')
      })
    })

    describe('view full details link', () => {
      it('shows link to compendium spell page when expanded', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockLeveledSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        const link = wrapper.find('[data-testid="spell-compendium-link"]')
        expect(link.exists()).toBe(true)
        expect(link.attributes('href')).toBe('/spells/phb:fireball')
      })

      it('shows "View Full Details" text', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockLeveledSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('View Full Details')
      })
    })

    // =========================================================================
    // CONCENTRATION BUTTON
    // @see Issue #783, #792
    // =========================================================================

    describe('concentration button', () => {
      it('shows concentrate button for concentration spells when editable and expanded', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockConcentrationSpell,
            editable: true
          }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        const btn = wrapper.find('[data-testid="concentrate-btn"]')
        expect(btn.exists()).toBe(true)
      })

      it('hides concentrate button for non-concentration spells', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockLeveledSpell, // Not a concentration spell
            editable: true
          }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        const btn = wrapper.find('[data-testid="concentrate-btn"]')
        expect(btn.exists()).toBe(false)
      })

      it('hides concentrate button when not editable', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockConcentrationSpell,
            editable: false
          }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        const btn = wrapper.find('[data-testid="concentrate-btn"]')
        expect(btn.exists()).toBe(false)
      })

      it('hides concentrate button when collapsed', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockConcentrationSpell,
            editable: true
          }
        })

        // Don't expand
        const btn = wrapper.find('[data-testid="concentrate-btn"]')
        expect(btn.exists()).toBe(false)
      })

      it('emits concentrate event when button clicked', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockConcentrationSpell,
            editable: true
          }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')
        await wrapper.find('[data-testid="concentrate-btn"]').trigger('click')

        expect(wrapper.emitted('concentrate')).toBeTruthy()
        expect(wrapper.emitted('concentrate')![0]).toEqual([{
          spellId: mockConcentrationSpell.id,
          spellName: mockConcentrationSpell.spell!.name,
          spellSlug: mockConcentrationSpell.spell!.slug
        }])
      })

      it('shows "End Concentration" when already concentrating on this spell', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockConcentrationSpell,
            editable: true,
            activeConcentration: {
              spellId: mockConcentrationSpell.id,
              spellName: 'Hold Person',
              spellSlug: 'phb:hold-person'
            }
          }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        const btn = wrapper.find('[data-testid="concentrate-btn"]')
        expect(btn.text()).toMatch(/end/i)
      })

      it('shows warning when concentrating on different spell', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: {
            spell: mockConcentrationSpell,
            editable: true,
            activeConcentration: {
              spellId: 999, // Different spell
              spellName: 'Bless',
              spellSlug: 'phb:bless'
            }
          }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        const warning = wrapper.find('[data-testid="concentration-warning"]')
        expect(warning.exists()).toBe(true)
        expect(warning.text()).toContain('Bless')
      })
    })
  })

  // ==========================================================================
  // CANTRIP DAMAGE SCALING TESTS (Issue #809)
  // ==========================================================================

  describe('cantrip damage scaling', () => {
    describe('collapsed view', () => {
      it('shows scaled damage before school for damage cantrips', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockDamageCantrip }
        })

        // Should show "2d10 fire • Cantrip Evocation"
        expect(wrapper.text()).toContain('2d10 fire')
        expect(wrapper.text()).toContain('Cantrip')
        expect(wrapper.text()).toContain('Evocation')
      })

      it('shows "Utility" for cantrips without damage', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockUtilityCantrip }
        })

        // Should show "Utility • Cantrip Conjuration"
        expect(wrapper.text()).toContain('Utility')
        expect(wrapper.text()).toContain('Cantrip')
        expect(wrapper.text()).toContain('Conjuration')
      })

      it('does not change leveled spell display', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockLeveledSpell }
        })

        // Should still show "Level 3 Evocation" (not damage info)
        expect(wrapper.text()).toContain('3rd')
        expect(wrapper.text()).toContain('Evocation')
        expect(wrapper.text()).not.toContain('Utility')
      })
    })

    describe('expanded view', () => {
      it('shows Damage row with scaled damage for damage cantrips', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockDamageCantrip }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('Damage')
        expect(wrapper.text()).toContain('2d10 fire')
      })

      it('shows Damage row with "Utility" for utility cantrips', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockUtilityCantrip }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('Damage')
        expect(wrapper.text()).toContain('Utility')
      })

      it('does not show scaled dice Damage for leveled spells without damage_types', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockLeveledSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        // Should have other stats but not scaled dice damage
        expect(wrapper.text()).toContain('Casting Time')
        expect(wrapper.text()).not.toMatch(/\d+d\d+/)
      })
    })
  })

  // ==========================================================================
  // SPELL COMBAT FIELDS TESTS (Issue #808)
  // ==========================================================================

  describe('spell combat fields', () => {
    describe('mechanic display', () => {
      it('shows "Ranged Attack" for ranged attack spells', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockRangedAttackCantrip }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('Mechanic')
        expect(wrapper.text()).toContain('Ranged Attack')
      })

      it('shows "Melee Attack" for melee attack spells', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockMeleeAttackSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('Mechanic')
        expect(wrapper.text()).toContain('Melee Attack')
      })

      it('shows "DEX Save" for saving throw spells', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockSaveSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('Mechanic')
        expect(wrapper.text()).toContain('DEX Save')
      })

      it('does not show Mechanic row for utility spells', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockUtilityCantrip }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).not.toContain('Mechanic')
      })
    })

    describe('damage types display', () => {
      it('shows single damage type for leveled spells', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockSaveSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('Damage')
        expect(wrapper.text()).toContain('Fire')
      })

      it('shows multiple damage types comma-separated', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockMultiDamageSpell }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        expect(wrapper.text()).toContain('Damage')
        expect(wrapper.text()).toContain('Acid, Cold, Fire, Lightning, Poison, Thunder')
      })

      it('shows scaled dice for cantrips instead of damage_types', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockRangedAttackCantrip }
        })

        await wrapper.find('[data-testid="expand-toggle"]').trigger('click')

        // Should show scaled dice "2d10 fire", not just "Fire" from damage_types
        expect(wrapper.text()).toContain('Damage')
        expect(wrapper.text()).toContain('2d10 fire')
      })
    })

    describe('collapsed view', () => {
      it('does not show Mechanic in collapsed view', async () => {
        const wrapper = await mountSuspended(SpellCard, {
          props: { spell: mockSaveSpell }
        })

        // Don't expand
        expect(wrapper.text()).not.toContain('Mechanic')
        expect(wrapper.text()).not.toContain('DEX Save')
      })
    })
  })
})
