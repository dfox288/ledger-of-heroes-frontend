// tests/components/character/inventory/EquipSlotPickerModal.test.ts
/**
 * EquipSlotPickerModal component tests
 *
 * Note: UModal content is teleported to body in the actual DOM,
 * so we can only test component instantiation and props handling here.
 * Full modal interaction tests require E2E testing.
 */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EquipSlotPickerModal from '~/components/character/inventory/EquipSlotPickerModal.vue'

describe('EquipSlotPickerModal', () => {
  describe('component mounting', () => {
    it('mounts without error when closed', async () => {
      const wrapper = await mountSuspended(EquipSlotPickerModal, {
        props: {
          open: false,
          itemName: 'Cloak of Elvenkind',
          validSlots: ['head', 'neck', 'cloak', 'belt', 'hands', 'feet'] as const,
          suggestedSlot: 'cloak' as const
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when open', async () => {
      const wrapper = await mountSuspended(EquipSlotPickerModal, {
        props: {
          open: true,
          itemName: 'Cloak of Elvenkind',
          validSlots: ['head', 'neck', 'cloak', 'belt', 'hands', 'feet'] as const,
          suggestedSlot: 'cloak' as const
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error with ring slots', async () => {
      const wrapper = await mountSuspended(EquipSlotPickerModal, {
        props: {
          open: true,
          itemName: 'Ring of Protection',
          validSlots: ['ring_1', 'ring_2'] as const,
          suggestedSlot: 'ring_1' as const
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error with no suggested slot', async () => {
      const wrapper = await mountSuspended(EquipSlotPickerModal, {
        props: {
          open: true,
          itemName: 'Cloak of Elvenkind',
          validSlots: ['head', 'neck', 'cloak', 'belt', 'hands', 'feet'] as const
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts loading prop', async () => {
      const wrapper = await mountSuspended(EquipSlotPickerModal, {
        props: {
          open: true,
          itemName: 'Cloak of Elvenkind',
          validSlots: ['head', 'neck', 'cloak', 'belt', 'hands', 'feet'] as const,
          suggestedSlot: 'cloak' as const,
          loading: true
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('accepts all valid equipment slots', async () => {
      const wrapper = await mountSuspended(EquipSlotPickerModal, {
        props: {
          open: true,
          itemName: 'Test Item',
          validSlots: ['head', 'neck', 'cloak', 'armor', 'belt', 'hands', 'ring_1', 'ring_2', 'feet', 'main_hand', 'off_hand'] as const,
          suggestedSlot: 'head' as const
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
