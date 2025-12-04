// app/composables/useDetailModal.ts
/**
 * Composable for managing detail modal state
 * Used across wizard steps to show entity details in a modal
 *
 * @example
 * const { open, item, show, close } = useDetailModal<Race>()
 * // In template: <RaceDetailModal :race="item" :open="open" @close="close" />
 * // On card click: @view-details="show(race)"
 */
export function useDetailModal<T>() {
  const open = ref(false)
  const item = ref<T | null>(null) as Ref<T | null>

  function show(newItem: T) {
    item.value = newItem
    open.value = true
  }

  function close() {
    open.value = false
    item.value = null
  }

  return {
    open,
    item,
    show,
    close
  }
}
