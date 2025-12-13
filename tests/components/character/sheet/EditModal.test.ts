// tests/components/character/sheet/EditModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EditModal from '~/components/character/sheet/EditModal.vue'

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
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts character prop', () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      expect(wrapper.props('character')).toEqual(defaultCharacter)
    })

    it('accepts loading prop', () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, loading: true }
      })
      expect(wrapper.props('loading')).toBe(true)
    })

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
  // Component Interface Tests
  // =========================================================================

  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, open: false }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
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
      // Need to open modal to trigger watch
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

      // Null alignment is valid - character just has no alignment set
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
  // canSave Computed Tests
  // =========================================================================

  describe('canSave computed', () => {
    it('returns false when no changes made', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      expect(vm.canSave).toBe(false)
    })

    it('returns true when valid changes made', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Valid Name'

      expect(vm.canSave).toBe(true)
    })

    it('returns false when loading', async () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, loading: true }
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true, loading: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Name'

      expect(vm.canSave).toBe(false)
    })

    it('returns false when name is empty', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = ''
      vm.localAlignment = 'Chaotic Good' // Make another change

      expect(vm.canSave).toBe(false)
    })
  })

  // =========================================================================
  // Event Handler Tests
  // =========================================================================

  describe('events interface', () => {
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

    it('emits update:open false when handleCancel called', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit update:open on save (parent controls close)', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Name'
      vm.handleSave()

      expect(wrapper.emitted('update:open')).toBeUndefined()
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

      // Modify state while closed
      vm.localName = 'Modified Name'
      vm.localAlignment = 'Chaotic Evil'

      // Open the modal
      await wrapper.setProps({ open: true })

      // Should reset to character values
      expect(vm.localName).toBe('Thorin Ironforge')
      expect(vm.localAlignment).toBe('Lawful Good')
    })

    it('clears selected file when modal opens', async () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, open: true }
      })
      const vm = wrapper.vm as unknown as EditModalVM

      // Select a file
      const file = new File(['fake'], 'test.jpg', { type: 'image/jpeg' })
      await vm.processFile(file)

      // Close and reopen
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      expect(vm.selectedFile).toBeNull()
    })
  })

  // =========================================================================
  // Enter Key Submission Tests
  // =========================================================================

  describe('enter key submission', () => {
    it('emits save when Enter pressed with valid changes', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Name'

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('save')).toBeTruthy()
    })

    it('does not emit save when Enter pressed with no changes', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('save')).toBeUndefined()
    })

    it('ignores other keys', async () => {
      const wrapper = mount(EditModal, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as unknown as EditModalVM
      vm.localName = 'New Name'

      const event = new KeyboardEvent('keydown', { key: 'Space' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('save')).toBeUndefined()
    })
  })

  // =========================================================================
  // Error Handling Tests
  // =========================================================================

  describe('error handling', () => {
    it('accepts error prop', () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, error: 'Name already taken' }
      })
      expect(wrapper.props('error')).toBe('Name already taken')
    })

    it('accepts null error prop', () => {
      const wrapper = mount(EditModal, {
        props: { ...defaultProps, error: null }
      })
      expect(wrapper.props('error')).toBeNull()
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
