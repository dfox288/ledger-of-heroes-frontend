// tests/components/party/AddCharacterModal.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AddCharacterModal from '~/components/party/AddCharacterModal.vue'
import type { PartyCharacter } from '~/types'

const mockCharacters: PartyCharacter[] = [
  {
    id: 1,
    public_id: 'brave-falcon-x7Kp',
    name: 'Thorin Ironforge',
    class_name: 'Fighter',
    total_level: 5,
    portrait: null,
    parties: []
  },
  {
    id: 2,
    public_id: 'swift-hawk-y8Lq',
    name: 'Elara Moonwhisper',
    class_name: 'Wizard',
    total_level: 5,
    portrait: null,
    parties: [{ id: 99, name: 'Other Campaign' }]
  },
  {
    id: 3,
    public_id: 'bold-wolf-z9Mr',
    name: 'Grimble Thornfoot',
    class_name: 'Rogue',
    total_level: 4,
    portrait: null,
    parties: []
  }
]

interface AddCharacterModalVM {
  searchQuery: string
  selectedIds: Set<number>
  filteredCharacters: PartyCharacter[]
  canAdd: boolean
  toggleSelection: (id: number) => void
  handleAdd: () => void
}

describe('PartyAddCharacterModal', () => {
  it('filters out characters already in party', async () => {
    const wrapper = await mountSuspended(AddCharacterModal, {
      props: {
        open: true,
        characters: mockCharacters,
        existingCharacterIds: [1]
      }
    })

    const vm = wrapper.vm as unknown as AddCharacterModalVM
    // Thorin (id: 1) should be filtered out
    expect(vm.filteredCharacters.map(c => c.id)).toEqual([2, 3])
  })

  it('filters characters by search query', async () => {
    const wrapper = await mountSuspended(AddCharacterModal, {
      props: {
        open: true,
        characters: mockCharacters,
        existingCharacterIds: []
      }
    })

    const vm = wrapper.vm as unknown as AddCharacterModalVM
    vm.searchQuery = 'Elara'
    await wrapper.vm.$nextTick()

    expect(vm.filteredCharacters).toHaveLength(1)
    expect(vm.filteredCharacters[0].name).toBe('Elara Moonwhisper')
  })

  it('toggles character selection', async () => {
    const wrapper = await mountSuspended(AddCharacterModal, {
      props: {
        open: true,
        characters: mockCharacters,
        existingCharacterIds: []
      }
    })

    const vm = wrapper.vm as unknown as AddCharacterModalVM
    expect(vm.selectedIds.size).toBe(0)

    vm.toggleSelection(1)
    expect(vm.selectedIds.has(1)).toBe(true)

    vm.toggleSelection(1)
    expect(vm.selectedIds.has(1)).toBe(false)
  })

  it('disables add button when no characters selected', async () => {
    const wrapper = await mountSuspended(AddCharacterModal, {
      props: {
        open: true,
        characters: mockCharacters,
        existingCharacterIds: []
      }
    })

    const vm = wrapper.vm as unknown as AddCharacterModalVM
    expect(vm.canAdd).toBe(false)
  })

  it('enables add button when characters are selected', async () => {
    const wrapper = await mountSuspended(AddCharacterModal, {
      props: {
        open: true,
        characters: mockCharacters,
        existingCharacterIds: []
      }
    })

    const vm = wrapper.vm as unknown as AddCharacterModalVM
    vm.toggleSelection(1)
    await wrapper.vm.$nextTick()

    expect(vm.canAdd).toBe(true)
  })

  it('emits add event with selected character ids', async () => {
    const wrapper = await mountSuspended(AddCharacterModal, {
      props: {
        open: true,
        characters: mockCharacters,
        existingCharacterIds: []
      }
    })

    const vm = wrapper.vm as unknown as AddCharacterModalVM
    vm.toggleSelection(1)
    vm.toggleSelection(3)

    vm.handleAdd()

    expect(wrapper.emitted('add')).toBeTruthy()
    const emitted = wrapper.emitted('add')![0][0] as number[]
    expect(emitted).toContain(1)
    expect(emitted).toContain(3)
  })

  it('resets selection when modal opens', async () => {
    const wrapper = await mountSuspended(AddCharacterModal, {
      props: {
        open: false,
        characters: mockCharacters,
        existingCharacterIds: []
      }
    })

    const vm = wrapper.vm as unknown as AddCharacterModalVM
    vm.toggleSelection(1)

    await wrapper.setProps({ open: true })
    await wrapper.vm.$nextTick()

    expect(vm.selectedIds.size).toBe(0)
  })
})
