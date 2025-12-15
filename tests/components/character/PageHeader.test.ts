// tests/components/character/PageHeader.test.ts
/**
 * CharacterPageHeader Component Tests
 *
 * Tests store integration for death state reactivity.
 * The component should use playStateStore.isDead instead of props.character.is_dead
 * to ensure immediate UI updates when death state changes.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import CharacterPageHeader from '~/components/character/PageHeader.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { Character } from '~/types/character'

// Mock useApi
const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: apiFetchMock }))

// Mock useToast
const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

// Mock useReferenceData (for conditions)
mockNuxtImport('useReferenceData', () => () => ({ data: ref([]) }))

// Create a complete character mock
function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 1,
    public_id: 'test-char-abc123',
    name: 'Test Character',
    is_complete: true,
    is_dead: false,
    has_inspiration: false,
    death_save_successes: 0,
    death_save_failures: 0,
    race: { id: 1, name: 'Human', slug: 'phb:human' },
    classes: [{ class: { id: 1, name: 'Fighter', slug: 'phb:fighter' }, level: 5, subclass: null }],
    background: { id: 1, name: 'Soldier', slug: 'phb:soldier' },
    alignment: 'Neutral Good',
    proficiency_bonus: 3,
    speed: 30,
    speeds: { walk: 30 },
    currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 },
    portrait: null,
    size: 'Medium',
    ...overrides
  } as Character
}

describe('CharacterPageHeader - Store Integration', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Death State from Store', () => {
    it('uses store.isDead for canToggleInspiration check', async () => {
      const store = useCharacterPlayStateStore()
      const character = createMockCharacter({ is_dead: false })

      // Initialize store with alive character
      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 20, max: 40, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      const wrapper = await mountSuspended(CharacterPageHeader, {
        props: { character },
        global: { plugins: [pinia] }
      })

      // Enable play mode via store
      store.setPlayMode(true)
      await wrapper.vm.$nextTick()

      // Portrait should be clickable (can toggle inspiration)
      const portrait = wrapper.find('[data-testid="portrait-container"]')
      expect(portrait.attributes('role')).toBe('button')

      // Now update store to dead (simulating death from HP reaching 0)
      store.isDead = true
      await wrapper.vm.$nextTick()

      // Portrait should no longer be clickable
      expect(portrait.attributes('role')).toBeUndefined()
    })

    it('uses store.isDead for action menu items', async () => {
      const store = useCharacterPlayStateStore()
      const character = createMockCharacter({ is_dead: false })

      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 20, max: 40, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      const wrapper = await mountSuspended(CharacterPageHeader, {
        props: { character },
        global: { plugins: [pinia] }
      })

      // Enable play mode via store
      store.setPlayMode(true)
      await wrapper.vm.$nextTick()

      // Access the computed actionMenuItems via component internals
      // The menu items are in a computed property that we can check
      const vm = wrapper.vm as unknown as { actionMenuItems: Array<Array<{ label: string }>> }

      // Should have "Add Condition" in play mode actions (first group)
      const playModeActions = vm.actionMenuItems[0]
      expect(playModeActions.some(item => item.label === 'Add Condition')).toBe(true)
      expect(playModeActions.some(item => item.label === 'Revive Character')).toBe(false)

      // Update store to dead
      store.isDead = true
      await wrapper.vm.$nextTick()

      // Should now have "Revive" instead of "Add Condition"
      const updatedPlayModeActions = vm.actionMenuItems[0]
      expect(updatedPlayModeActions.some(item => item.label === 'Revive Character')).toBe(true)
      expect(updatedPlayModeActions.some(item => item.label === 'Add Condition')).toBe(false)
    })
  })

  describe('Revive Action', () => {
    it('updates store.isDead to false after successful revive', async () => {
      const store = useCharacterPlayStateStore()
      const character = createMockCharacter({ is_dead: true })

      store.initialize({
        characterId: 1,
        isDead: true,
        hitPoints: { current: 0, max: 40, temporary: 0 },
        deathSaves: { successes: 0, failures: 3 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      // Mock successful revive
      apiFetchMock.mockResolvedValueOnce({ data: { is_dead: false } })

      const wrapper = await mountSuspended(CharacterPageHeader, {
        props: { character },
        global: { plugins: [pinia] }
      })

      // Enable play mode via store
      store.setPlayMode(true)
      await wrapper.vm.$nextTick()

      // Verify store is dead before revive
      expect(store.isDead).toBe(true)

      // Trigger revive via component method
      const vm = wrapper.vm as unknown as { handleRevive: () => Promise<void> }
      await vm.handleRevive?.()

      // Store should be updated immediately
      expect(store.isDead).toBe(false)
    })

    it('resets death saves in store after successful revive', async () => {
      const store = useCharacterPlayStateStore()
      const character = createMockCharacter({ is_dead: true })

      store.initialize({
        characterId: 1,
        isDead: true,
        hitPoints: { current: 0, max: 40, temporary: 0 },
        deathSaves: { successes: 2, failures: 3 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      // Mock successful revive
      apiFetchMock.mockResolvedValueOnce({ data: { is_dead: false } })

      const wrapper = await mountSuspended(CharacterPageHeader, {
        props: { character },
        global: { plugins: [pinia] }
      })

      // Enable play mode via store
      store.setPlayMode(true)
      await wrapper.vm.$nextTick()

      // Verify death saves before revive
      expect(store.deathSaves.successes).toBe(2)
      expect(store.deathSaves.failures).toBe(3)

      // Trigger revive
      const vm = wrapper.vm as unknown as { handleRevive: () => Promise<void> }
      await vm.handleRevive?.()

      // Death saves should be reset
      expect(store.deathSaves.successes).toBe(0)
      expect(store.deathSaves.failures).toBe(0)
    })

    it('updates store hitPoints after successful revive', async () => {
      const store = useCharacterPlayStateStore()
      const character = createMockCharacter({ is_dead: true })

      store.initialize({
        characterId: 1,
        isDead: true,
        hitPoints: { current: 0, max: 40, temporary: 0 },
        deathSaves: { successes: 0, failures: 3 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      // Mock successful revive
      apiFetchMock.mockResolvedValueOnce({ data: { is_dead: false } })

      const wrapper = await mountSuspended(CharacterPageHeader, {
        props: { character },
        global: { plugins: [pinia] }
      })

      // Enable play mode via store
      store.setPlayMode(true)
      await wrapper.vm.$nextTick()

      // Verify HP before revive
      expect(store.hitPoints.current).toBe(0)

      // Trigger revive
      const vm = wrapper.vm as unknown as { handleRevive: () => Promise<void> }
      await vm.handleRevive?.()

      // HP should be set to 1 (revive gives 1 HP)
      expect(store.hitPoints.current).toBe(1)
    })
  })

  describe('Edit Character Name', () => {
    it('updates displayed name immediately after successful edit', async () => {
      const store = useCharacterPlayStateStore()
      const character = createMockCharacter({ name: 'Original Name' })

      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 20, max: 40, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      // Mock successful PATCH
      apiFetchMock.mockResolvedValueOnce({ data: { name: 'New Name' } })

      const wrapper = await mountSuspended(CharacterPageHeader, {
        props: { character },
        global: { plugins: [pinia] }
      })

      // Verify initial name is displayed
      expect(wrapper.find('h1').text()).toBe('Original Name')

      // Trigger edit save via component method
      const vm = wrapper.vm as unknown as {
        handleEditSave: (payload: { name: string, alignment: string | null, portraitFile: File | null }) => Promise<void>
      }
      await vm.handleEditSave({
        name: 'New Name',
        alignment: character.alignment,
        portraitFile: null
      })

      // Name should be updated immediately in the UI
      expect(wrapper.find('h1').text()).toBe('New Name')
    })

    it('syncs localName from props when not editing', async () => {
      const store = useCharacterPlayStateStore()
      const character = createMockCharacter({ name: 'Initial Name' })

      store.initialize({
        characterId: 1,
        isDead: false,
        hitPoints: { current: 20, max: 40, temporary: 0 },
        deathSaves: { successes: 0, failures: 0 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      const wrapper = await mountSuspended(CharacterPageHeader, {
        props: { character },
        global: { plugins: [pinia] }
      })

      // Initial name should be displayed
      expect(wrapper.find('h1').text()).toBe('Initial Name')

      // Update props (simulating parent refresh)
      await wrapper.setProps({
        character: createMockCharacter({ name: 'Updated From Props' })
      })

      // Name should sync from props
      expect(wrapper.find('h1').text()).toBe('Updated From Props')
    })
  })
})
