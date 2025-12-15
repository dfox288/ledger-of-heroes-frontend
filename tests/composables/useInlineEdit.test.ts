import { describe, it, expect, vi } from 'vitest'
import { useInlineEdit } from '~/composables/useInlineEdit'

describe('useInlineEdit', () => {
  describe('initialization', () => {
    it('starts with isEditing false', () => {
      const { isEditing } = useInlineEdit({
        getValue: () => 'test',
        onSave: vi.fn()
      })
      expect(isEditing.value).toBe(false)
    })
  })

  describe('startEdit', () => {
    it('sets isEditing to true', () => {
      const { isEditing, startEdit } = useInlineEdit({
        getValue: () => 'test',
        onSave: vi.fn()
      })

      startEdit()

      expect(isEditing.value).toBe(true)
    })

    it('populates editValue from getValue', () => {
      const { editValue, startEdit } = useInlineEdit({
        getValue: () => 'initial value',
        onSave: vi.fn()
      })

      startEdit()

      expect(editValue.value).toBe('initial value')
    })

    it('stops event propagation', () => {
      const { startEdit } = useInlineEdit({
        getValue: () => 'test',
        onSave: vi.fn()
      })

      const mockEvent = { stopPropagation: vi.fn() } as unknown as Event
      startEdit(mockEvent)

      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })
  })

  describe('save', () => {
    it('calls onSave with the edited value', () => {
      const onSave = vi.fn()
      const { editValue, startEdit, save } = useInlineEdit({
        getValue: () => 'initial',
        onSave
      })

      startEdit()
      editValue.value = 'modified'
      save()

      expect(onSave).toHaveBeenCalledWith('modified')
    })

    it('sets isEditing to false', () => {
      const { isEditing, startEdit, save } = useInlineEdit({
        getValue: () => 'test',
        onSave: vi.fn()
      })

      startEdit()
      save()

      expect(isEditing.value).toBe(false)
    })

    it('does not call onSave if validation fails', () => {
      const onSave = vi.fn()
      const { editValue, startEdit, save } = useInlineEdit({
        getValue: () => '',
        onSave,
        validate: value => value.length > 0
      })

      startEdit()
      editValue.value = ''
      save()

      expect(onSave).not.toHaveBeenCalled()
    })

    it('stays in edit mode if validation fails', () => {
      const { isEditing, editValue, startEdit, save } = useInlineEdit({
        getValue: () => '',
        onSave: vi.fn(),
        validate: value => value.length > 0
      })

      startEdit()
      editValue.value = ''
      save()

      expect(isEditing.value).toBe(true) // Stays open for correction
    })

    it('calls onSave if validation passes', () => {
      const onSave = vi.fn()
      const { editValue, startEdit, save } = useInlineEdit({
        getValue: () => '',
        onSave,
        validate: value => value.length > 0
      })

      startEdit()
      editValue.value = 'valid'
      save()

      expect(onSave).toHaveBeenCalledWith('valid')
    })
  })

  describe('cancel', () => {
    it('sets isEditing to false', () => {
      const { isEditing, startEdit, cancel } = useInlineEdit({
        getValue: () => 'test',
        onSave: vi.fn()
      })

      startEdit()
      cancel()

      expect(isEditing.value).toBe(false)
    })

    it('does not call onSave', () => {
      const onSave = vi.fn()
      const { editValue, startEdit, cancel } = useInlineEdit({
        getValue: () => 'initial',
        onSave
      })

      startEdit()
      editValue.value = 'modified'
      cancel()

      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('handleKeydown', () => {
    it('saves on Enter key', () => {
      const onSave = vi.fn()
      const { startEdit, handleKeydown } = useInlineEdit({
        getValue: () => 'test',
        onSave
      })

      startEdit()
      handleKeydown({ key: 'Enter' } as KeyboardEvent)

      expect(onSave).toHaveBeenCalled()
    })

    it('cancels on Escape key', () => {
      const onSave = vi.fn()
      const { isEditing, startEdit, handleKeydown } = useInlineEdit({
        getValue: () => 'test',
        onSave
      })

      startEdit()
      handleKeydown({ key: 'Escape' } as KeyboardEvent)

      expect(isEditing.value).toBe(false)
      expect(onSave).not.toHaveBeenCalled()
    })

    it('does nothing for other keys', () => {
      const onSave = vi.fn()
      const { isEditing, startEdit, handleKeydown } = useInlineEdit({
        getValue: () => 'test',
        onSave
      })

      startEdit()
      handleKeydown({ key: 'a' } as KeyboardEvent)

      expect(isEditing.value).toBe(true)
      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('with number type', () => {
    it('works with number values', () => {
      const onSave = vi.fn()
      const { editValue, startEdit, save } = useInlineEdit<number>({
        getValue: () => 10,
        onSave,
        validate: value => value >= 0 && value <= 100
      })

      startEdit()
      expect(editValue.value).toBe(10)

      editValue.value = 50
      save()

      expect(onSave).toHaveBeenCalledWith(50)
    })
  })
})
