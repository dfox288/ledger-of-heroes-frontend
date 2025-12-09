// tests/composables/useWizardEntitySelection.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useWizardEntitySelection } from '~/composables/useWizardEntitySelection'

// Mock entity type for testing
interface MockEntity {
  id: number
  name: string
  slug: string
  description?: string
}

// Sample test data
const mockEntities: MockEntity[] = [
  { id: 1, name: 'Elf', slug: 'elf', description: 'Graceful beings' },
  { id: 2, name: 'Dwarf', slug: 'dwarf', description: 'Stout folk' },
  { id: 3, name: 'Human', slug: 'human', description: 'Versatile' },
  { id: 4, name: 'Half-Elf', slug: 'half-elf', description: 'Mixed heritage' }
]

describe('useWizardEntitySelection', () => {
  let storeAction: ReturnType<typeof vi.fn>

  beforeEach(() => {
    storeAction = vi.fn().mockResolvedValue(undefined)
  })

  describe('initialization', () => {
    it('initializes with null selection when no existing selection', () => {
      const entities = ref(mockEntities)

      const { localSelected } = useWizardEntitySelection(entities, {
        storeAction
      })

      expect(localSelected.value).toBeNull()
    })

    it('initializes with existing selection from store', async () => {
      const entities = ref(mockEntities)
      const existingSelection = computed(() => mockEntities[0])

      const { localSelected } = useWizardEntitySelection(entities, {
        storeAction,
        existingSelection
      })

      // Need to wait for onMounted equivalent
      await nextTick()

      expect(localSelected.value).toEqual(mockEntities[0])
    })

    it('finds matching entity by ID when initializing from store', async () => {
      const entities = ref(mockEntities)
      // Simulate store having a different object reference but same ID
      const storeEntity = { ...mockEntities[1], description: 'Updated description' }
      const existingSelection = computed(() => storeEntity)

      const { localSelected } = useWizardEntitySelection(entities, {
        storeAction,
        existingSelection
      })

      await nextTick()

      // Should find the matching entity from the entities list (by ID)
      expect(localSelected.value?.id).toBe(mockEntities[1].id)
    })

    it('handles null/undefined entities gracefully', () => {
      const entities = ref<MockEntity[] | null>(null)

      const { localSelected, filtered } = useWizardEntitySelection(entities, {
        storeAction
      })

      expect(localSelected.value).toBeNull()
      expect(filtered.value).toEqual([])
    })
  })

  describe('selection', () => {
    it('handleSelect updates localSelected', () => {
      const entities = ref(mockEntities)

      const { localSelected, handleSelect } = useWizardEntitySelection(entities, {
        storeAction
      })

      handleSelect(mockEntities[2])

      expect(localSelected.value).toEqual(mockEntities[2])
    })

    it('allows changing selection to different entity', () => {
      const entities = ref(mockEntities)

      const { localSelected, handleSelect } = useWizardEntitySelection(entities, {
        storeAction
      })

      handleSelect(mockEntities[0])
      expect(localSelected.value?.id).toBe(1)

      handleSelect(mockEntities[1])
      expect(localSelected.value?.id).toBe(2)
    })

    it('allows selecting same entity again (no-op)', () => {
      const entities = ref(mockEntities)

      const { localSelected, handleSelect } = useWizardEntitySelection(entities, {
        storeAction
      })

      handleSelect(mockEntities[0])
      handleSelect(mockEntities[0])

      expect(localSelected.value?.id).toBe(1)
    })
  })

  describe('canProceed', () => {
    it('returns false when no selection', () => {
      const entities = ref(mockEntities)

      const { canProceed } = useWizardEntitySelection(entities, {
        storeAction
      })

      expect(canProceed.value).toBe(false)
    })

    it('returns true when entity is selected', () => {
      const entities = ref(mockEntities)

      const { canProceed, handleSelect } = useWizardEntitySelection(entities, {
        storeAction
      })

      handleSelect(mockEntities[0])

      expect(canProceed.value).toBe(true)
    })
  })

  describe('confirmSelection', () => {
    it('calls storeAction with selected entity', async () => {
      const entities = ref(mockEntities)

      const { handleSelect, confirmSelection } = useWizardEntitySelection(entities, {
        storeAction
      })

      handleSelect(mockEntities[1])
      await confirmSelection()

      expect(storeAction).toHaveBeenCalledWith(mockEntities[1])
    })

    it('does nothing when no selection', async () => {
      const entities = ref(mockEntities)

      const { confirmSelection } = useWizardEntitySelection(entities, {
        storeAction
      })

      await confirmSelection()

      expect(storeAction).not.toHaveBeenCalled()
    })

    it('propagates errors from storeAction', async () => {
      const entities = ref(mockEntities)
      const error = new Error('Save failed')
      storeAction.mockRejectedValue(error)

      const { handleSelect, confirmSelection } = useWizardEntitySelection(entities, {
        storeAction
      })

      handleSelect(mockEntities[0])

      await expect(confirmSelection()).rejects.toThrow('Save failed')
    })
  })

  describe('search functionality', () => {
    it('returns all entities when search query is empty', () => {
      const entities = ref(mockEntities)

      const { filtered, searchQuery } = useWizardEntitySelection(entities, {
        storeAction
      })

      expect(searchQuery.value).toBe('')
      expect(filtered.value).toHaveLength(4)
    })

    it('filters entities by name (case insensitive)', async () => {
      const entities = ref(mockEntities)

      const { filtered, searchQuery } = useWizardEntitySelection(entities, {
        storeAction
      })

      searchQuery.value = 'elf'
      await nextTick()

      expect(filtered.value).toHaveLength(2) // 'Elf' and 'Half-Elf'
      expect(filtered.value.map(e => e.name)).toContain('Elf')
      expect(filtered.value.map(e => e.name)).toContain('Half-Elf')
    })

    it('filters by custom searchableFields', async () => {
      const entities = ref(mockEntities)

      const { filtered, searchQuery } = useWizardEntitySelection(entities, {
        storeAction,
        searchableFields: ['name', 'description']
      })

      searchQuery.value = 'graceful'
      await nextTick()

      expect(filtered.value).toHaveLength(1)
      expect(filtered.value[0].name).toBe('Elf')
    })

    it('returns empty array when no matches', async () => {
      const entities = ref(mockEntities)

      const { filtered, searchQuery } = useWizardEntitySelection(entities, {
        storeAction
      })

      searchQuery.value = 'nonexistent'
      await nextTick()

      expect(filtered.value).toHaveLength(0)
    })

    it('treats whitespace-only query as empty (returns all)', async () => {
      const entities = ref(mockEntities)

      const { filtered, searchQuery } = useWizardEntitySelection(entities, {
        storeAction
      })

      searchQuery.value = '   '
      await nextTick()

      // Whitespace-only is treated as empty - returns all entities
      expect(filtered.value).toHaveLength(4)
    })
  })

  describe('detail modal', () => {
    it('initializes with modal closed', () => {
      const entities = ref(mockEntities)

      const { detailModal } = useWizardEntitySelection(entities, {
        storeAction
      })

      expect(detailModal.open.value).toBe(false)
      expect(detailModal.item.value).toBeNull()
    })

    it('show() opens modal with entity', () => {
      const entities = ref(mockEntities)

      const { detailModal } = useWizardEntitySelection(entities, {
        storeAction
      })

      detailModal.show(mockEntities[2])

      expect(detailModal.open.value).toBe(true)
      expect(detailModal.item.value).toEqual(mockEntities[2])
    })

    it('close() closes modal and clears item', () => {
      const entities = ref(mockEntities)

      const { detailModal } = useWizardEntitySelection(entities, {
        storeAction
      })

      detailModal.show(mockEntities[0])
      detailModal.close()

      expect(detailModal.open.value).toBe(false)
      expect(detailModal.item.value).toBeNull()
    })

    it('can show different entities sequentially', () => {
      const entities = ref(mockEntities)

      const { detailModal } = useWizardEntitySelection(entities, {
        storeAction
      })

      detailModal.show(mockEntities[0])
      expect(detailModal.item.value?.id).toBe(1)

      detailModal.show(mockEntities[1])
      expect(detailModal.item.value?.id).toBe(2)
    })
  })

  describe('reactivity', () => {
    it('updates filtered when entities change', async () => {
      const entities = ref<MockEntity[]>([mockEntities[0]])

      const { filtered } = useWizardEntitySelection(entities, {
        storeAction
      })

      expect(filtered.value).toHaveLength(1)

      entities.value = [...mockEntities]
      await nextTick()

      expect(filtered.value).toHaveLength(4)
    })

    it('updates filtered when search query changes', async () => {
      const entities = ref(mockEntities)

      const { filtered, searchQuery } = useWizardEntitySelection(entities, {
        storeAction
      })

      expect(filtered.value).toHaveLength(4)

      searchQuery.value = 'dwarf'
      await nextTick()

      expect(filtered.value).toHaveLength(1)
    })

    it('updates localSelected when existingSelection changes', async () => {
      const entities = ref(mockEntities)
      const existingSelection = ref<MockEntity | null>(null)

      const { localSelected } = useWizardEntitySelection(entities, {
        storeAction,
        existingSelection: computed(() => existingSelection.value)
      })

      expect(localSelected.value).toBeNull()

      existingSelection.value = mockEntities[2]
      await nextTick()

      expect(localSelected.value?.id).toBe(3)
    })
  })
})
