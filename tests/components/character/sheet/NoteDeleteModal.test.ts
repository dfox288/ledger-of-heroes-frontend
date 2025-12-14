// tests/components/character/sheet/NoteDeleteModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteDeleteModal from '~/components/character/sheet/NoteDeleteModal.vue'
import type { CharacterNote } from '~/types/character'

/**
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 */

const mockNote: CharacterNote = {
  id: 1,
  category: 'custom',
  category_label: 'Custom Note',
  title: 'Session Notes',
  content: 'We met the dragon and survived!',
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

describe('NoteDeleteModal', () => {
  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote }
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts note prop', () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote }
      })
      expect(wrapper.props('note')).toEqual(mockNote)
    })

    it('accepts loading prop', () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote, loading: true }
      })
      expect(wrapper.props('loading')).toBe(true)
    })

    it('handles note without title', () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNoteWithoutTitle }
      })
      expect(wrapper.props('note')).toEqual(mockNoteWithoutTitle)
    })
  })

  // =========================================================================
  // Events Interface Tests
  // =========================================================================

  describe('events', () => {
    it('emits update:open when cancel is called', async () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote }
      })

      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('emits confirm when confirm is called', async () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote }
      })

      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('does not emit update:open when confirm is called', async () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote }
      })

      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      // Confirm should NOT auto-close - let parent handle close after API call
      expect(wrapper.emitted('update:open')).toBeFalsy()
    })
  })

  // =========================================================================
  // Component Behavior Tests
  // =========================================================================

  describe('behavior', () => {
    it('closes without confirming on cancel', async () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote }
      })

      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      // Should close but NOT emit confirm
      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('confirm')).toBeFalsy()
    })

    it('only emits confirm on handleConfirm', async () => {
      const wrapper = mount(NoteDeleteModal, {
        props: { open: true, note: mockNote, loading: false }
      })

      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      // Should emit confirm only - modal stays open until parent closes it
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })
  })
})
