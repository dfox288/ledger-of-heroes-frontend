// tests/components/character/sheet/NotesManager.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotesManager from '~/components/character/sheet/NotesManager.vue'
import type { CharacterNote } from '~/types/character'

/**
 * NotesManager orchestrates NotesPanel + modals and handles API calls.
 * These tests focus on component interface and state management.
 */

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

describe('NotesManager', () => {
  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts notes prop', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: mockNotes, characterId: 1 }
      })
      expect(wrapper.props('notes')).toEqual(mockNotes)
    })

    it('accepts characterId prop', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: mockNotes, characterId: 42 }
      })
      expect(wrapper.props('characterId')).toBe(42)
    })

    it('accepts empty notes', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: {}, characterId: 1 }
      })
      expect(wrapper.props('notes')).toEqual({})
    })
  })

  // =========================================================================
  // Modal State Tests
  // =========================================================================

  describe('modal state', () => {
    it('initializes with modals closed', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: mockNotes, characterId: 1 }
      })
      const vm = wrapper.vm as unknown as {
        showEditModal: boolean
        showDeleteModal: boolean
      }
      expect(vm.showEditModal).toBe(false)
      expect(vm.showDeleteModal).toBe(false)
    })

    it('opens edit modal on handleAdd', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: mockNotes, characterId: 1 }
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

    it('opens edit modal with note on handleEdit', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: mockNotes, characterId: 1 }
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

    it('opens delete modal on handleDelete', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: mockNotes, characterId: 1 }
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

  // =========================================================================
  // Loading State Tests
  // =========================================================================

  describe('loading state', () => {
    it('initializes with isLoading false', () => {
      const wrapper = mount(NotesManager, {
        props: { notes: mockNotes, characterId: 1 }
      })
      const vm = wrapper.vm as unknown as { isLoading: boolean }
      expect(vm.isLoading).toBe(false)
    })
  })
})
