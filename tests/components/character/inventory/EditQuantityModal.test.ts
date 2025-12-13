// tests/components/character/inventory/EditQuantityModal.test.ts
/**
 * EditQuantityModal component tests
 *
 * Note: UModal content is teleported to body in the actual DOM,
 * so we can only test component instantiation and props handling here.
 * Full modal interaction tests require E2E testing.
 */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EditQuantityModal from '~/components/character/inventory/EditQuantityModal.vue'
import type { CharacterEquipment } from '~/types/character'

const mockItem: CharacterEquipment = {
  id: 1,
  item: { name: 'Potion of Healing', item_type: 'Potion' },
  item_slug: 'phb:potion-of-healing',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 5,
  equipped: false,
  location: 'backpack'
}

describe('EditQuantityModal', () => {
  describe('component mounting', () => {
    it('mounts without error when closed', async () => {
      const wrapper = await mountSuspended(EditQuantityModal, {
        props: { open: false, item: mockItem }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when open', async () => {
      const wrapper = await mountSuspended(EditQuantityModal, {
        props: { open: true, item: mockItem }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when item is null', async () => {
      const wrapper = await mountSuspended(EditQuantityModal, {
        props: { open: true, item: null }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts loading prop', async () => {
      const wrapper = await mountSuspended(EditQuantityModal, {
        props: { open: true, item: mockItem, loading: true }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
