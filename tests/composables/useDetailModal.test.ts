// tests/composables/useDetailModal.test.ts
import { describe, it, expect } from 'vitest'
import { useDetailModal } from '~/composables/useDetailModal'

interface TestItem {
  id: number
  name: string
}

describe('useDetailModal', () => {
  it('initializes with closed state and null item', () => {
    const { open, item } = useDetailModal<TestItem>()

    expect(open.value).toBe(false)
    expect(item.value).toBeNull()
  })

  it('shows modal with item when show() called', () => {
    const { open, item, show } = useDetailModal<TestItem>()
    const testItem: TestItem = { id: 1, name: 'Test' }

    show(testItem)

    expect(open.value).toBe(true)
    expect(item.value).toEqual(testItem)
  })

  it('closes modal and clears item when close() called', () => {
    const { open, item, show, close } = useDetailModal<TestItem>()
    const testItem: TestItem = { id: 1, name: 'Test' }

    show(testItem)
    close()

    expect(open.value).toBe(false)
    expect(item.value).toBeNull()
  })

  it('replaces item when show() called with different item', () => {
    const { item, show } = useDetailModal<TestItem>()
    const item1: TestItem = { id: 1, name: 'First' }
    const item2: TestItem = { id: 2, name: 'Second' }

    show(item1)
    show(item2)

    expect(item.value).toEqual(item2)
  })
})
