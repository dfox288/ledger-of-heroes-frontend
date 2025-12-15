// tests/components/character/sheet/EditModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EditModal from '~/components/character/sheet/EditModal.vue'
import {
  testModalPropsInterface,
  testModalMountsCorrectly,
  testEnterKeySubmission,
  testCancelBehavior,
  testErrorPropHandling,
  testCanSaveComputed,
  testSaveDoesNotCloseModal
} from '../../../helpers/modalBehavior'

/**
 * Type for accessing EditModal internal state in tests
 */
interface EditModalVM {
  localName: string
  localAlignment: string | null
  selectedFile: File | null
  isDragging: boolean
  canSave: boolean
  hasChanges: boolean
  handleSave: () => void
  handleCancel: () => void
  handleKeydown: (event: KeyboardEvent) => void
  processFile: (file: File) => Promise<void>
  handleRemovePortrait: () => void
}

/**
 * EditModal Tests
 *
 * Tests for the character edit modal which allows editing:
 * - Character name (text input)
 * - Alignment (dropdown)
 * - Portrait (drag-and-drop upload)
 *
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 */
describe('EditModal', () => {
  const defaultCharacter = {
    id: 1,
    name: 'Thorin Ironforge',
    alignment: 'Lawful Good' as const,
    portrait: {
      original: 'https://example.com/portrait.jpg',
      thumb: 'https://example.com/portrait-thumb.jpg',
      medium: 'https://example.com/portrait-medium.jpg',
      is_uploaded: true
    }
  }

  const defaultProps = {
    open: true,
    character: defaultCharacter,
    loading: false
  }

  // =========================================================================
  // Shared Behavior Tests (from modalBehavior.ts)
  // =========================================================================

  testModalPropsInterface(EditModal, defaultProps, [
    { prop: 'open', value: true },
    { prop: 'character', value: defaultCharacter },
    { prop: 'loading', value: true }
  ])

  testModalMountsCorrectly(EditModal, defaultProps)

  testEnterKeySubmission(EditModal, defaultProps, {
    setupValidState: (vm) => { vm.localName = 'New Name' },
    getHandleKeydown: vm => vm.handleKeydown as (event: KeyboardEvent) => void,
    emitName: 'save'
  })

  testCancelBehavior(EditModal, defaultProps, 'save')

  testErrorPropHandling(EditModal, defaultProps)

  testCanSaveComputed(EditModal, defaultProps, {
    computedName: 'canSave',
    setupValidState: (vm) => { vm.localName = 'New Valid Name' }
  })

  describe('events interface', () => {
    testSaveDoesNotCloseModal(
      EditModal,
      defaultProps,
      'handleSave',
      (vm) => { vm.localName = 'New Name' }
    )
  })

  // =========================================================================
  // Props Edge Cases
  // =========================================================================

  describe('props edge cases', () => {
    it('handles character with null alignment', () => {
      const characterNoAlignment = { ...defaultCharacter, alignment: null }
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, character: characterNoAlignment }
      })
      expect(wrapper.props('character')?.alignment).toBeNull()
    })

    it('handles character with no portrait', () => {
      const characterNoPortrait = { ...defaultCharacter, portrait: null }
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, character: characterNoPortrait }
      })
      expect(wrapper.props('character')?.portrait).toBeNull()
    })
  })

  // =========================================================================
  // Name Editing Tests
  // =========================================================================

  describe('name editing', () => {
    it('initializes localName from character prop', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      expect(vm.localName).toBe('Thorin Ironforge')
    })

    it('tracks name changes', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Name'

      expect(vm.hasChanges).toBe(true)
    })

    it('trims name for validation', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = '   '

      expect(vm.canSave).toBe(false)
    })

    it('requires non-empty name', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = ''

      expect(vm.canSave).toBe(false)
    })
  })

  // =========================================================================
  // Alignment Selection Tests
  // =========================================================================

  describe('alignment selection', () => {
    it('initializes localAlignment from character prop', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      expect(vm.localAlignment).toBe('Lawful Good')
    })

    it('tracks alignment changes', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localAlignment = 'Chaotic Evil'

      expect(vm.hasChanges).toBe(true)
    })

    it('allows null alignment', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localAlignment = null

      expect(vm.canSave).toBe(true)
    })
  })

  // =========================================================================
  // Portrait Upload Tests
  // =========================================================================

  describe('portrait upload', () => {
    it('accepts valid image file', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      const file = new File(['fake image content'], 'portrait.jpg', { type: 'image/jpeg' })
      await vm.processFile(file)

      expect(vm.selectedFile).not.toBeNull()
      expect(vm.selectedFile?.name).toBe('portrait.jpg')
      expect(vm.hasChanges).toBe(true)
    })

    it('accepts PNG files', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      const file = new File(['fake image content'], 'portrait.png', { type: 'image/png' })
      await vm.processFile(file)

      expect(vm.selectedFile).not.toBeNull()
      expect(vm.selectedFile?.name).toBe('portrait.png')
    })

    it('accepts WebP files', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      const file = new File(['fake image content'], 'portrait.webp', { type: 'image/webp' })
      await vm.processFile(file)

      expect(vm.selectedFile).not.toBeNull()
      expect(vm.selectedFile?.name).toBe('portrait.webp')
    })

    it('tracks drag state', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })

      const vm = wrapper.vm as unknown as EditModalVM
      expect(vm.isDragging).toBe(false)
    })
  })

  // =========================================================================
  // Portrait Removal Tests
  // =========================================================================

  describe('portrait removal', () => {
    it('emits remove-portrait when remove requested', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.handleRemovePortrait()

      expect(wrapper.emitted('remove-portrait')).toBeTruthy()
    })
  })

  // =========================================================================
  // hasChanges Computed Tests
  // =========================================================================

  describe('hasChanges computed', () => {
    it('returns false when no changes made', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      expect(vm.hasChanges).toBe(false)
    })

    it('returns true when name changed', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'Different Name'

      expect(vm.hasChanges).toBe(true)
    })

    it('returns true when alignment changed', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localAlignment = 'Chaotic Neutral'

      expect(vm.hasChanges).toBe(true)
    })

    it('returns true when file selected', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' })
      await vm.processFile(file)

      expect(vm.hasChanges).toBe(true)
    })
  })

  // =========================================================================
  // canSave Edge Cases
  // =========================================================================

  describe('canSave edge cases', () => {
    it('returns false when name is empty', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = ''
      vm.localAlignment = 'Chaotic Good'

      expect(vm.canSave).toBe(false)
    })
  })

  // =========================================================================
  // Save Event Tests
  // =========================================================================

  describe('save events', () => {
    it('emits save with payload when handleSave called with valid changes', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Name'
      vm.localAlignment = 'Chaotic Good'
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')![0]).toEqual([{
        name: 'New Name',
        alignment: 'Chaotic Good',
        portraitFile: null
      }])
    })

    it('includes file in payload when portrait selected', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' })
      await vm.processFile(file)
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeTruthy()
      const emittedPayload = (wrapper.emitted('save')![0] as [{ portraitFile: File | null }])[0]
      expect(emittedPayload.portraitFile).not.toBeNull()
      expect(emittedPayload.portraitFile?.name).toBe('test.jpg')
    })

    it('does not emit save when no changes', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeUndefined()
    })

    it('does not emit save when loading', async () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, loading: true }
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true, loading: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Name'
      vm.handleSave()

      expect(wrapper.emitted('save')).toBeUndefined()
    })
  })

  // =========================================================================
  // State Reset on Open Tests
  // =========================================================================

  describe('state reset', () => {
    it('resets to character values when modal opens', async () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, open: false }
      })
      const vm = wrapper.vm as unknown as EditModalVM

      vm.localName = 'Modified Name'
      vm.localAlignment = 'Chaotic Evil'

      await wrapper.setProps({ open: true })

      expect(vm.localName).toBe('Thorin Ironforge')
      expect(vm.localAlignment).toBe('Lawful Good')
    })

    it('clears selected file when modal opens', async () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, open: true }
      })
      const vm = wrapper.vm as unknown as EditModalVM

      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' })
      await vm.processFile(file)

      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      expect(vm.selectedFile).toBeNull()
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('handles character with long name', async () => {
      const longNameChar = { ...defaultCharacter, name: 'A'.repeat(255) }
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, character: longNameChar }
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      expect(vm.localName).toBe('A'.repeat(255))
    })

    it('handles switching from alignment to null', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localAlignment = null

      expect(vm.hasChanges).toBe(true)
      expect(vm.canSave).toBe(true)
    })

    it('handles switching from null to alignment', async () => {
      const noAlignmentChar = { ...defaultCharacter, alignment: null }
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, character: noAlignmentChar }
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localAlignment = 'Neutral Good'

      expect(vm.hasChanges).toBe(true)
      expect(vm.canSave).toBe(true)
    })
  })
})
