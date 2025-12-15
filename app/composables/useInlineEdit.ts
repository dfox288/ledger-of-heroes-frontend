/**
 * Composable for inline field editing
 *
 * Handles the common pattern of start/save/cancel/keydown for inline editable fields.
 */

interface UseInlineEditOptions<T> {
  /** Get the initial value when editing starts */
  getValue: () => T
  /** Called when save is confirmed with the edited value */
  onSave: (value: T) => void
  /** Validate the value before saving (optional) */
  validate?: (value: T) => boolean
}

export function useInlineEdit<T = string>(options: UseInlineEditOptions<T>) {
  const isEditing = ref(false)
  const editValue = ref<T>('' as unknown as T)
  const inputRef = ref<HTMLInputElement | null>(null)

  function startEdit(event?: Event) {
    event?.stopPropagation()
    isEditing.value = true
    editValue.value = options.getValue() as T
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }

  function save() {
    const value = editValue.value
    const isValid = options.validate ? options.validate(value) : true
    if (isValid) {
      options.onSave(value)
      isEditing.value = false
    }
    // Stay in edit mode if validation fails for better UX
  }

  function cancel() {
    isEditing.value = false
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      save()
    } else if (event.key === 'Escape') {
      cancel()
    }
  }

  return {
    isEditing: readonly(isEditing),
    editValue,
    inputRef,
    startEdit,
    save,
    cancel,
    handleKeydown
  }
}
