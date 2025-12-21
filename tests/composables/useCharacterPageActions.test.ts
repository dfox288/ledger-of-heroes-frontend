// tests/composables/useCharacterPageActions.test.ts
/**
 * Tests for useCharacterPageActions composable
 *
 * Extracted action handlers from PageHeader for better separation of concerns.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { Character } from '~/types/character'

// Mock useApi
const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: apiFetchMock }))

// Mock useToast
const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

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

describe('useCharacterPageActions', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  describe('toggleInspiration', () => {
    it('calls API with toggled inspiration value', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter({ has_inspiration: false }))
      const { toggleInspiration, localHasInspiration } = useCharacterPageActions(character)

      const store = useCharacterPlayStateStore()
      store.setPlayMode(true)
      store.isDead = false

      apiFetchMock.mockResolvedValueOnce({})

      await toggleInspiration()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/1', {
        method: 'PATCH',
        body: { has_inspiration: true }
      })
      expect(localHasInspiration.value).toBe(true)
    })

    it('reverts on API failure', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter({ has_inspiration: false }))
      const { toggleInspiration, localHasInspiration } = useCharacterPageActions(character)

      const store = useCharacterPlayStateStore()
      store.setPlayMode(true)
      store.isDead = false

      apiFetchMock.mockRejectedValueOnce(new Error('Network error'))

      await toggleInspiration()

      expect(localHasInspiration.value).toBe(false)
      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' })
      )
    })

    it('does nothing when character is dead', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter({ has_inspiration: false }))
      const { toggleInspiration } = useCharacterPageActions(character)

      const store = useCharacterPlayStateStore()
      store.setPlayMode(true)
      store.isDead = true

      await toggleInspiration()

      expect(apiFetchMock).not.toHaveBeenCalled()
    })
  })

  describe('revive', () => {
    it('calls revive API and updates store', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter({ is_dead: true }))
      const onUpdated = vi.fn()
      const { revive } = useCharacterPageActions(character, { onUpdated })

      const store = useCharacterPlayStateStore()
      store.initialize({
        characterId: 1,
        isDead: true,
        hitPoints: { current: 0, max: 40, temporary: 0 },
        deathSaves: { successes: 0, failures: 3 },
        currency: { pp: 0, gp: 50, ep: 0, sp: 10, cp: 5 }
      })

      apiFetchMock.mockResolvedValueOnce({})

      await revive()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/1/revive', {
        method: 'POST',
        body: { hit_points: 1, clear_exhaustion: true }
      })
      expect(store.isDead).toBe(false)
      expect(store.hitPoints.current).toBe(1)
      expect(store.deathSaves.successes).toBe(0)
      expect(store.deathSaves.failures).toBe(0)
      expect(onUpdated).toHaveBeenCalled()
    })

    it('does nothing if character is not dead', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter({ is_dead: false }))
      const { revive } = useCharacterPageActions(character)

      const store = useCharacterPlayStateStore()
      store.isDead = false

      await revive()

      expect(apiFetchMock).not.toHaveBeenCalled()
    })
  })

  describe('export', () => {
    it('calls export API and creates download', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter())
      const { exportCharacter } = useCharacterPageActions(character)

      // Mock DOM APIs
      const mockLink = { href: '', download: '', click: vi.fn() }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      apiFetchMock.mockResolvedValueOnce({ data: { name: 'Test' } })

      await exportCharacter()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/test-char-abc123/export')
      expect(mockLink.click).toHaveBeenCalled()
      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'success' })
      )
    })
  })

  describe('editCharacter', () => {
    it('calls PATCH API with changed fields', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter({ name: 'Old Name', alignment: 'Neutral' }))
      const onUpdated = vi.fn()
      const { editCharacter, localName } = useCharacterPageActions(character, { onUpdated })

      apiFetchMock.mockResolvedValueOnce({})

      const result = await editCharacter({
        name: 'New Name',
        alignment: 'Lawful Good',
        age: null,
        height: null,
        weight: null,
        eye_color: null,
        hair_color: null,
        skin_color: null,
        deity: null,
        portraitFile: null
      })

      expect(result.success).toBe(true)
      expect(apiFetchMock).toHaveBeenCalledWith('/characters/1', {
        method: 'PATCH',
        body: expect.objectContaining({
          name: 'New Name',
          alignment: 'Lawful Good'
        })
      })
      expect(localName.value).toBe('New Name')
      expect(onUpdated).toHaveBeenCalled()
    })

    it('returns validation error on 422', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter())
      const { editCharacter } = useCharacterPageActions(character)

      apiFetchMock.mockRejectedValueOnce({
        statusCode: 422,
        data: { message: 'Name is required' }
      })

      const result = await editCharacter({
        name: '',
        alignment: null,
        age: null,
        height: null,
        weight: null,
        eye_color: null,
        hair_color: null,
        skin_color: null,
        deity: null,
        portraitFile: null
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Name is required')
    })
  })

  describe('removePortrait', () => {
    it('calls DELETE API for portrait', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter())
      const onUpdated = vi.fn()
      const { removePortrait } = useCharacterPageActions(character, { onUpdated })

      apiFetchMock.mockResolvedValueOnce({})

      await removePortrait()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/1/media/portrait', {
        method: 'DELETE'
      })
      expect(onUpdated).toHaveBeenCalled()
    })
  })

  describe('addCondition', () => {
    it('delegates to store.addCondition', async () => {
      const { useCharacterPageActions } = await import('~/composables/useCharacterPageActions')
      const character = ref(createMockCharacter())
      const { addCondition } = useCharacterPageActions(character)

      const store = useCharacterPlayStateStore()
      store.addCondition = vi.fn().mockResolvedValue(true)

      const payload = { condition: 'poisoned', source: 'Spider bite', duration: '1 hour' }
      await addCondition(payload)

      expect(store.addCondition).toHaveBeenCalledWith(payload)
      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'success' })
      )
    })
  })
})
