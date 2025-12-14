// tests/components/character/sheet/SpellSlotsManager.test.ts
/**
 * SpellSlotsManager Component Tests
 *
 * Tests the interactive spell slot manager that:
 * - Reads spell slot state from characterPlayStateStore
 * - Renders crystals (filled = available, empty = spent)
 * - Handles click interactions to use/restore slots
 * - Respects editable prop for read-only mode
 *
 * @see Issue #616 - Spell slot tracking
 */
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellSlotsManager from '~/components/character/sheet/SpellSlotsManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'

// =============================================================================
// HELPERS
// =============================================================================

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

// =============================================================================
// TESTS
// =============================================================================

describe('SpellSlotsManager', () => {
  describe('rendering', () => {
    it('renders filled crystals for available slots', async () => {
      const store = setupStore()
      store.initializeSpellSlots([{ level: 1, total: 4 }])

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      const crystals = wrapper.findAll('[data-testid="slot-1-available"]')
      expect(crystals).toHaveLength(4)
    })

    it('renders empty crystals for spent slots', async () => {
      const store = setupStore()
      store.initializeSpellSlots([{ level: 1, total: 4 }])
      store.spellSlots.set(1, { total: 4, spent: 2, slotType: 'standard' })

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      const available = wrapper.findAll('[data-testid="slot-1-available"]')
      const spent = wrapper.findAll('[data-testid="slot-1-spent"]')
      expect(available).toHaveLength(2)
      expect(spent).toHaveLength(2)
    })

    it('displays level labels with ordinals', async () => {
      const store = setupStore()
      store.initializeSpellSlots([
        { level: 1, total: 4 },
        { level: 2, total: 3 },
        { level: 3, total: 2 }
      ])

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      expect(wrapper.text()).toContain('1st')
      expect(wrapper.text()).toContain('2nd')
      expect(wrapper.text()).toContain('3rd')
    })

    it('renders nothing when no spell slots', async () => {
      setupStore()
      // Don't initialize any slots

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      expect(wrapper.text()).not.toContain('Spell Slots')
    })
  })

  describe('interactions', () => {
    it('clicking available crystal calls useSpellSlot', async () => {
      const store = setupStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellSlots([{ level: 1, total: 4 }])

      const useSlotSpy = vi.spyOn(store, 'useSpellSlot').mockResolvedValue()

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      const crystal = wrapper.find('[data-testid="slot-1-available"]')
      await crystal.trigger('click')

      expect(useSlotSpy).toHaveBeenCalledWith(1)
    })

    it('clicking spent crystal calls restoreSpellSlot', async () => {
      const store = setupStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellSlots([{ level: 1, total: 4 }])
      store.spellSlots.set(1, { total: 4, spent: 2, slotType: 'standard' })

      const restoreSpy = vi.spyOn(store, 'restoreSpellSlot').mockResolvedValue()

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      const crystal = wrapper.find('[data-testid="slot-1-spent"]')
      await crystal.trigger('click')

      expect(restoreSpy).toHaveBeenCalledWith(1)
    })

    it('crystals are not clickable when editable is false', async () => {
      const store = setupStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellSlots([{ level: 1, total: 4 }])

      const useSlotSpy = vi.spyOn(store, 'useSpellSlot')

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: false
        },
        ...getMountOptions()
      })

      const crystal = wrapper.find('[data-testid="slot-1-available"]')
      await crystal.trigger('click')

      expect(useSlotSpy).not.toHaveBeenCalled()
    })
  })

  describe('multiple spell levels', () => {
    it('handles multiple spell levels correctly', async () => {
      const store = setupStore()
      store.initializeSpellSlots([
        { level: 1, total: 4 },
        { level: 2, total: 3 },
        { level: 3, total: 2 }
      ])
      // Use some slots
      store.spellSlots.set(1, { total: 4, spent: 1, slotType: 'standard' })
      store.spellSlots.set(2, { total: 3, spent: 2, slotType: 'standard' })

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      // Level 1: 3 available, 1 spent
      expect(wrapper.findAll('[data-testid="slot-1-available"]')).toHaveLength(3)
      expect(wrapper.findAll('[data-testid="slot-1-spent"]')).toHaveLength(1)

      // Level 2: 1 available, 2 spent
      expect(wrapper.findAll('[data-testid="slot-2-available"]')).toHaveLength(1)
      expect(wrapper.findAll('[data-testid="slot-2-spent"]')).toHaveLength(2)

      // Level 3: 2 available, 0 spent
      expect(wrapper.findAll('[data-testid="slot-3-available"]')).toHaveLength(2)
      expect(wrapper.findAll('[data-testid="slot-3-spent"]')).toHaveLength(0)
    })

    it('clicking different level slots calls store with correct level', async () => {
      const store = setupStore()
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 10, max: 10, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      })
      store.initializeSpellSlots([
        { level: 1, total: 4 },
        { level: 2, total: 3 }
      ])

      const useSlotSpy = vi.spyOn(store, 'useSpellSlot').mockResolvedValue()

      const wrapper = await mountSuspended(SpellSlotsManager, {
        props: {
          characterId: 1,
          editable: true
        },
        ...getMountOptions()
      })

      // Click level 2 slot
      const level2Crystal = wrapper.find('[data-testid="slot-2-available"]')
      await level2Crystal.trigger('click')

      expect(useSlotSpy).toHaveBeenCalledWith(2)
    })
  })
})
