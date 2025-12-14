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

    it('expands when clicked', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Casting Time')
      expect(wrapper.text()).toContain('1 action')
    })

    it('shows range when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Range')
      expect(wrapper.text()).toContain('150 feet')
    })

    it('shows components when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Components')
      expect(wrapper.text()).toContain('V, S, M')
    })

    it('shows duration when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Duration')
      expect(wrapper.text()).toContain('Instantaneous')
    })

    it('collapses when clicked again', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      const card = wrapper.find('[data-testid="spell-card"]')
      await card.trigger('click') // Expand
      await card.trigger('click') // Collapse

      expect(wrapper.text()).not.toContain('Casting Time')
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

    it('clicking card body toggles preparation when editable', async () => {
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

      // Click the card body (not the expand button)
      await wrapper.find('[data-testid="spell-card-body"]').trigger('click')

      expect(toggleSpy).toHaveBeenCalledWith(mockLeveledSpell.id, true)
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

      await wrapper.find('[data-testid="spell-card-body"]').trigger('click')

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

      await wrapper.find('[data-testid="spell-card-body"]').trigger('click')

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

      await wrapper.find('[data-testid="spell-card-body"]').trigger('click')

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

      await wrapper.find('[data-testid="spell-card-body"]').trigger('click')

      expect(toggleSpy).toHaveBeenCalledWith(mockLeveledSpell.id, true)
    })
  })
})
