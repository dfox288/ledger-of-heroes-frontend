// tests/components/character/sheet/NoteEditModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteEditModal from '~/components/character/sheet/NoteEditModal.vue'
import type { CharacterNote } from '~/types/character'

/**
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 */

const mockNote: CharacterNote = {
  id: 1,
  category: 'session',
  category_label: 'Session',
  title: 'Session Notes',
  content: 'We met the dragon and survived!',
  sort_order: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

/** Note with a custom category (not in predefined list) */
const mockCustomCategoryNote: CharacterNote = {
  id: 3,
  category: 'party_members',
  category_label: 'Party Members',
  title: 'The Adventurers',
  content: 'List of party members...',
  sort_order: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

const mockNoteWithoutTitle: CharacterNote = {
  id: 2,
  category: 'personality_trait',
  category_label: 'Personality Trait',
  title: null,
  content: 'I always help those in need.',
  sort_order: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

describe('NoteEditModal', () => {
  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts note prop for edit mode', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, note: mockNote }
      })
      expect(wrapper.props('note')).toEqual(mockNote)
    })

    it('works without note prop (create mode)', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      expect(wrapper.props('note')).toBeUndefined()
    })

    it('accepts loading prop', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, loading: true }
      })
      expect(wrapper.props('loading')).toBe(true)
    })

    it('accepts error prop', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, error: 'Something went wrong' }
      })
      expect(wrapper.props('error')).toBe('Something went wrong')
    })
  })

  // =========================================================================
  // Mode Detection Tests
  // =========================================================================

  describe('mode detection', () => {
    it('detects create mode when no note is provided', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as { isEditMode: boolean }
      expect(vm.isEditMode).toBe(false)
    })

    it('detects edit mode when note is provided', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, note: mockNote }
      })
      const vm = wrapper.vm as unknown as { isEditMode: boolean }
      expect(vm.isEditMode).toBe(true)
    })
  })

  // =========================================================================
  // State Management Tests
  // =========================================================================

  describe('state management', () => {
    it('initializes with session category in create mode', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        customCategoryName: string
      }
      expect(vm.localCategory).toBe('session')
      expect(vm.localTitle).toBe('')
      expect(vm.localContent).toBe('')
      expect(vm.customCategoryName).toBe('')
    })

    it('initializes with note data in edit mode (predefined category)', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, note: mockNote }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        customCategoryName: string
      }
      expect(vm.localCategory).toBe('session')
      expect(vm.localTitle).toBe('Session Notes')
      expect(vm.localContent).toBe('We met the dragon and survived!')
      expect(vm.customCategoryName).toBe('')
    })

    it('initializes with __custom__ for non-predefined category in edit mode', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, note: mockCustomCategoryNote }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        customCategoryName: string
      }
      expect(vm.localCategory).toBe('__custom__')
      expect(vm.customCategoryName).toBe('Party Members')
      expect(vm.localTitle).toBe('The Adventurers')
      expect(vm.localContent).toBe('List of party members...')
    })

    it('handles note without title in edit mode', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, note: mockNoteWithoutTitle }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
      }
      expect(vm.localCategory).toBe('personality_trait')
      expect(vm.localTitle).toBe('')
      expect(vm.localContent).toBe('I always help those in need.')
    })
  })

  // =========================================================================
  // Validation Tests
  // =========================================================================

  describe('validation', () => {
    it('requires title for __custom__ category', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        customCategoryName: string
        requiresTitle: boolean
        canSave: boolean
      }
      vm.localCategory = '__custom__'
      vm.customCategoryName = 'My Custom Category'
      vm.localTitle = ''
      vm.localContent = 'Some content'
      expect(vm.requiresTitle).toBe(true)
      expect(vm.canSave).toBe(false)
    })

    it('requires custom category name when __custom__ is selected', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        customCategoryName: string
        canSave: boolean
      }
      vm.localCategory = '__custom__'
      vm.customCategoryName = '' // Empty category name
      vm.localTitle = 'My Title'
      vm.localContent = 'Some content'
      expect(vm.canSave).toBe(false)
    })

    it('allows save with valid custom category', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        customCategoryName: string
        effectiveCategory: string
        canSave: boolean
      }
      vm.localCategory = '__custom__'
      vm.customCategoryName = 'Party Members'
      vm.localTitle = 'My Title'
      vm.localContent = 'Some content'
      expect(vm.effectiveCategory).toBe('party_members')
      expect(vm.canSave).toBe(true)
    })

    it('requires title for backstory category', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        requiresTitle: boolean
        canSave: boolean
      }
      vm.localCategory = 'backstory'
      vm.localTitle = ''
      vm.localContent = 'Some content'
      expect(vm.requiresTitle).toBe(true)
      expect(vm.canSave).toBe(false)
    })

    it('does not require title for personality_trait category', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        requiresTitle: boolean
      }
      vm.localCategory = 'personality_trait'
      expect(vm.requiresTitle).toBe(false)
    })

    it('requires content', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        canSave: boolean
      }
      vm.localCategory = 'personality_trait'
      vm.localContent = ''
      expect(vm.canSave).toBe(false)
    })

    it('allows save when all requirements met (predefined category)', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        canSave: boolean
      }
      vm.localCategory = 'session'
      vm.localTitle = 'My Title'
      vm.localContent = 'My content'
      expect(vm.canSave).toBe(true)
    })

    it('disables save when loading', () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, loading: true }
      })
      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        canSave: boolean
      }
      vm.localCategory = 'session'
      vm.localTitle = 'My Title'
      vm.localContent = 'My content'
      expect(vm.canSave).toBe(false)
    })
  })

  // =========================================================================
  // Events Interface Tests
  // =========================================================================

  describe('events', () => {
    it('emits update:open when cancel is called', async () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('emits save with payload when save is called in create mode (predefined)', async () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        handleSave: () => void
      }
      vm.localCategory = 'session'
      vm.localTitle = 'Test Title'
      vm.localContent = 'Test content'
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')![0]).toEqual([{
        category: 'session',
        title: 'Test Title',
        content: 'Test content'
      }])
    })

    it('emits save with snake_case category when using custom category', async () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        customCategoryName: string
        handleSave: () => void
      }
      vm.localCategory = '__custom__'
      vm.customCategoryName = 'Party Members'
      vm.localTitle = 'Test Title'
      vm.localContent = 'Test content'
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')![0]).toEqual([{
        category: 'party_members',
        title: 'Test Title',
        content: 'Test content'
      }])
    })

    it('emits save with payload when save is called in edit mode', async () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true, note: mockNote }
      })

      const vm = wrapper.vm as unknown as {
        localTitle: string
        localContent: string
        handleSave: () => void
      }
      vm.localTitle = 'Updated Title'
      vm.localContent = 'Updated content'
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeTruthy()
      // In edit mode, category is not included (can't change)
      expect(wrapper.emitted('save')![0]).toEqual([{
        title: 'Updated Title',
        content: 'Updated content'
      }])
    })

    it('omits title from payload when empty and not required', async () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as {
        localCategory: string
        localTitle: string
        localContent: string
        handleSave: () => void
      }
      vm.localCategory = 'personality_trait'
      vm.localTitle = ''
      vm.localContent = 'Test content'
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeTruthy()
      const payload = wrapper.emitted('save')![0][0] as Record<string, unknown>
      expect(payload.title).toBeUndefined()
    })
  })

  // =========================================================================
  // Component Behavior Tests
  // =========================================================================

  describe('behavior', () => {
    it('closes without saving on cancel', async () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('save')).toBeFalsy()
    })

    it('does not emit save when canSave is false', async () => {
      const wrapper = mount(NoteEditModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as {
        localContent: string
        handleSave: () => void
      }
      vm.localContent = '' // Empty content, can't save
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })
})
