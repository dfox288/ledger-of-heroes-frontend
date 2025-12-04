// tests/composables/useEntitySearch.test.ts
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useEntitySearch } from '~/composables/useEntitySearch'

interface TestItem {
  id: number
  name: string
  description?: string
}

describe('useEntitySearch', () => {
  const mockItems: TestItem[] = [
    { id: 1, name: 'Fireball', description: 'A bright streak of fire' },
    { id: 2, name: 'Ice Storm', description: 'Hail pounds an area' },
    { id: 3, name: 'Fire Bolt', description: 'A mote of fire' }
  ]

  it('returns all items when search query is empty', () => {
    const items = ref(mockItems)
    const { filtered, searchQuery } = useEntitySearch(items)

    expect(searchQuery.value).toBe('')
    expect(filtered.value).toEqual(mockItems)
  })

  it('filters items by name (case-insensitive)', () => {
    const items = ref(mockItems)
    const { filtered, searchQuery } = useEntitySearch(items)

    searchQuery.value = 'fire'

    expect(filtered.value).toHaveLength(2)
    expect(filtered.value.map(i => i.name)).toEqual(['Fireball', 'Fire Bolt'])
  })

  it('returns empty array when items is null', () => {
    const items = ref<TestItem[] | null>(null)
    const { filtered } = useEntitySearch(items)

    expect(filtered.value).toEqual([])
  })

  it('uses custom predicate when provided', () => {
    const items = ref(mockItems)
    const { filtered, searchQuery } = useEntitySearch(items, (item, query) => {
      return item.description?.toLowerCase().includes(query) ?? false
    })

    searchQuery.value = 'hail'

    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0].name).toBe('Ice Storm')
  })

  it('searches multiple fields with searchableFields option', () => {
    const items = ref(mockItems)
    const { filtered, searchQuery } = useEntitySearch(items, {
      searchableFields: ['name', 'description']
    })

    searchQuery.value = 'mote'

    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0].name).toBe('Fire Bolt')
  })
})
