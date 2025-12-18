// tests/components/character/sheet/NotesManager.test.ts
/**
 * NotesManager Component Tests
 *
 * Tests the Manager component that delegates to characterPlayState store
 * for managing character notes with optimistic updates.
 *
 * @see Issue #696 - Store consolidation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import NotesManager from '~/components/character/sheet/NotesManager.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { CharacterNote } from '~/types/character'

// =============================================================================
// MOCK SETUP
// =============================================================================

const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: apiFetchMock }))

// =============================================================================
// FIXTURES
// =============================================================================

const mockNotes: Record<string, CharacterNote[]> = {
  custom: [
    {
      id: 1,
      category: 'custom',
      category_label: 'Custom Note',
      title: 'Session Notes',
      content: 'We met the dragon.',
      sort_order: 0,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ],
  personality_trait: [
    {
      id: 2,
      category: 'personality_trait',
      category_label: 'Personality Trait',
      title: null,
      content: 'I help those in need.',
      sort_order: 0,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ]
}

// =============================================================================
// HELPERS
// =============================================================================

let pinia: ReturnType<typeof createPinia>

function setupPinia() {
  pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

function getMountOptions() {
  return { global: { plugins: [pinia] } }
}

function setupStore(characterId = 42) {
  const store = useCharacterPlayStateStore()
  store.initialize({
    characterId,
    isDead: false,
    hitPoints: { current: 10, max: 10, temporary: 0 },
    deathSaves: { successes: 0, failures: 0 },
    currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
  })
  return store
}

// =============================================================================
// TESTS
// =============================================================================

describe('NotesManager', () => {
  beforeEach(() => {
    setupPinia()
    toastMock.add.mockClear()
    apiFetchMock.mockClear()
  })

  // ===========================================================================
  // Props Interface Tests
  // ===========================================================================

  describe('props', () => {
    it('accepts notes prop', async () => {
      setupStore()
      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })
      expect(wrapper.props('notes')).toEqual(mockNotes)
    })

    it('accepts characterId prop', async () => {
      setupStore()
      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 42 },
        ...getMountOptions()
      })
      expect(wrapper.props('characterId')).toBe(42)
    })

    it('accepts empty notes', async () => {
      setupStore()
      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: {}, characterId: 1 },
        ...getMountOptions()
      })
      expect(wrapper.props('notes')).toEqual({})
    })
  })

  // ===========================================================================
  // Store Initialization Tests
  // ===========================================================================

  describe('store initialization', () => {
    it('initializes store with notes prop', async () => {
      const store = setupStore()

      await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })

      expect(store.notes).toEqual(mockNotes)
    })

    it('updates store when notes prop changes', async () => {
      const store = setupStore()

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })

      const newNotes = {
        session: [{ id: 99, category: 'session', category_label: 'Session', title: 'New', content: 'New content', sort_order: 0, created_at: '', updated_at: '' }]
      }

      await wrapper.setProps({ notes: newNotes })

      expect(store.notes.session).toBeDefined()
      expect(store.notes.custom).toBeUndefined()
    })
  })

  // ===========================================================================
  // Modal State Tests
  // ===========================================================================

  describe('modal state', () => {
    it('initializes with modals closed', async () => {
      setupStore()
      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })
      const vm = wrapper.vm as unknown as {
        showEditModal: boolean
        showDeleteModal: boolean
      }
      expect(vm.showEditModal).toBe(false)
      expect(vm.showDeleteModal).toBe(false)
    })

    it('opens edit modal on handleAdd', async () => {
      setupStore()
      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })
      const vm = wrapper.vm as unknown as {
        showEditModal: boolean
        noteToEdit: CharacterNote | null
        handleAdd: () => void
      }
      vm.handleAdd()
      expect(vm.showEditModal).toBe(true)
      expect(vm.noteToEdit).toBeNull()
    })

    it('opens edit modal with note on handleEdit', async () => {
      setupStore()
      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })
      const vm = wrapper.vm as unknown as {
        showEditModal: boolean
        noteToEdit: CharacterNote | null
        handleEdit: (note: CharacterNote) => void
      }
      vm.handleEdit(mockNotes.custom[0])
      expect(vm.showEditModal).toBe(true)
      expect(vm.noteToEdit).toEqual(mockNotes.custom[0])
    })

    it('opens delete modal on handleDelete', async () => {
      setupStore()
      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })
      const vm = wrapper.vm as unknown as {
        showDeleteModal: boolean
        noteToDelete: CharacterNote | null
        handleDelete: (note: CharacterNote) => void
      }
      vm.handleDelete(mockNotes.custom[0])
      expect(vm.showDeleteModal).toBe(true)
      expect(vm.noteToDelete).toEqual(mockNotes.custom[0])
    })
  })

  // ===========================================================================
  // Store Delegation Tests
  // ===========================================================================

  describe('store delegation', () => {
    it('delegates addNote to store', async () => {
      setupStore()
      apiFetchMock.mockResolvedValueOnce({ data: { id: 100, category: 'session', category_label: 'Session', title: null, content: 'Test', sort_order: 0, created_at: '', updated_at: '' } })

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: {}, characterId: 42 },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as {
        handleSave: (payload: { category: string, content: string }) => Promise<void>
      }

      await vm.handleSave({ category: 'session', content: 'Test content' })

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/characters/42/notes',
        { method: 'POST', body: { category: 'session', content: 'Test content' } }
      )
    })

    it('delegates editNote to store', async () => {
      setupStore()
      apiFetchMock.mockResolvedValueOnce({ data: { ...mockNotes.custom[0], content: 'Updated' } })

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 42 },
        ...getMountOptions()
      })

      // Set up the edit state
      const vm = wrapper.vm as unknown as {
        noteToEdit: CharacterNote
        handleSave: (payload: { content: string }) => Promise<void>
      }
      vm.noteToEdit = mockNotes.custom[0]

      await vm.handleSave({ content: 'Updated content' })

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/characters/42/notes/1',
        { method: 'PATCH', body: { content: 'Updated content' } }
      )
    })

    it('delegates deleteNote to store', async () => {
      setupStore()
      apiFetchMock.mockResolvedValueOnce({})

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 42 },
        ...getMountOptions()
      })

      // Set up the delete state
      const vm = wrapper.vm as unknown as {
        noteToDelete: CharacterNote
        handleDeleteConfirm: () => Promise<void>
      }
      vm.noteToDelete = mockNotes.custom[0]

      await vm.handleDeleteConfirm()

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/characters/42/notes/1',
        { method: 'DELETE' }
      )
    })

    it('shows success toast on successful add', async () => {
      setupStore()
      apiFetchMock.mockResolvedValueOnce({ data: { id: 100, category: 'session', category_label: 'Session', title: null, content: 'Test', sort_order: 0, created_at: '', updated_at: '' } })

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: {}, characterId: 42 },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as {
        handleSave: (payload: { category: string, content: string }) => Promise<void>
      }

      await vm.handleSave({ category: 'session', content: 'Test' })

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Note added', color: 'success' })
      )
    })

    it('shows error toast on failed add', async () => {
      setupStore()
      apiFetchMock.mockRejectedValueOnce(new Error('Network error'))

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: {}, characterId: 42 },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as {
        handleSave: (payload: { category: string, content: string }) => Promise<void>
      }

      await vm.handleSave({ category: 'session', content: 'Test' })

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Failed to add note', color: 'error' })
      )
    })

    it('does not emit refresh after successful operation (#802)', async () => {
      setupStore()
      apiFetchMock.mockResolvedValueOnce({ data: { id: 100, category: 'session', category_label: 'Session', title: null, content: 'Test', sort_order: 0, created_at: '', updated_at: '' } })

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: {}, characterId: 42 },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as {
        handleSave: (payload: { category: string, content: string }) => Promise<void>
      }

      await vm.handleSave({ category: 'session', content: 'Test' })

      // Refresh should NOT be emitted on success - optimistic updates are source of truth
      expect(wrapper.emitted('refresh')).toBeFalsy()
    })

    it('emits refresh after failed operation (for rollback) (#802)', async () => {
      setupStore()
      apiFetchMock.mockRejectedValueOnce(new Error('Network error'))

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: {}, characterId: 42 },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as {
        handleSave: (payload: { category: string, content: string }) => Promise<void>
      }

      await vm.handleSave({ category: 'session', content: 'Test' })

      // Refresh SHOULD be emitted on failure to resync with server state
      expect(wrapper.emitted('refresh')).toBeTruthy()
    })

    it('does not emit refresh after successful delete (#802)', async () => {
      setupStore()
      apiFetchMock.mockResolvedValueOnce({})

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 42 },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as {
        noteToDelete: CharacterNote
        handleDeleteConfirm: () => Promise<void>
      }
      vm.noteToDelete = mockNotes.custom[0]

      await vm.handleDeleteConfirm()

      // Refresh should NOT be emitted on success
      expect(wrapper.emitted('refresh')).toBeFalsy()
    })

    it('emits refresh after failed delete (#802)', async () => {
      setupStore()
      apiFetchMock.mockRejectedValueOnce(new Error('Network error'))

      const wrapper = await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 42 },
        ...getMountOptions()
      })

      const vm = wrapper.vm as unknown as {
        noteToDelete: CharacterNote
        handleDeleteConfirm: () => Promise<void>
      }
      vm.noteToDelete = mockNotes.custom[0]

      await vm.handleDeleteConfirm()

      // Refresh SHOULD be emitted on failure to resync with server state
      expect(wrapper.emitted('refresh')).toBeTruthy()
    })
  })

  // ===========================================================================
  // Display Notes Tests
  // ===========================================================================

  describe('display notes', () => {
    it('uses displayNotes from store', async () => {
      const store = setupStore()
      store.initializeNotes(mockNotes)

      await mountSuspended(NotesManager, {
        props: { notes: mockNotes, characterId: 1 },
        ...getMountOptions()
      })

      // The component should pass displayNotes to NotesPanel
      // displayNotes should equal notes when no pending changes
      expect(store.displayNotes).toEqual(mockNotes)
    })
  })
})
