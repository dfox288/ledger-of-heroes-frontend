// tests/components/character/inventory/SellModal.test.ts
/**
 * SellModal component tests
 *
 * Note: UModal content is teleported to body in the actual DOM,
 * so we can only test component instantiation and props handling here.
 * Full modal interaction tests require E2E testing.
 */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SellModal from '~/components/character/inventory/SellModal.vue'
import type { CharacterEquipment, CharacterCurrency } from '~/types/character'

const mockItem: CharacterEquipment = {
  id: 1,
  item: { name: 'Longsword', item_type: 'Melee Weapon', cost_cp: 1500 },
  item_slug: 'phb:longsword',
  is_dangling: 'false',
  custom_name: null,
  custom_description: null,
  quantity: 3,
  equipped: false,
  location: 'backpack'
}

const mockCurrency: CharacterCurrency = {
  pp: 0,
  gp: 50,
  ep: 0,
  sp: 5,
  cp: 10
}

describe('SellModal', () => {
  describe('component mounting', () => {
    it('mounts without error when closed', async () => {
      const wrapper = await mountSuspended(SellModal, {
        props: { open: false, item: mockItem, currency: mockCurrency }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when open', async () => {
      const wrapper = await mountSuspended(SellModal, {
        props: { open: true, item: mockItem, currency: mockCurrency }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when item is null', async () => {
      const wrapper = await mountSuspended(SellModal, {
        props: { open: true, item: null, currency: mockCurrency }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when currency is null', async () => {
      const wrapper = await mountSuspended(SellModal, {
        props: { open: true, item: mockItem, currency: null }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts loading prop', async () => {
      const wrapper = await mountSuspended(SellModal, {
        props: { open: true, item: mockItem, currency: mockCurrency, loading: true }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
