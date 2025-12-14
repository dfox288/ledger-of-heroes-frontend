// tests/components/character/inventory/DropConfirmModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DropConfirmModal from '~/components/character/inventory/DropConfirmModal.vue'

/**
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 * Actual modal interaction is tested via e2e tests.
 */
describe('DropConfirmModal', () => {
  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Longsword' }
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts itemName prop', () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Ring of Protection' }
      })
      expect(wrapper.props('itemName')).toBe('Ring of Protection')
    })

    it('accepts loading prop', () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Longsword', loading: true }
      })
      expect(wrapper.props('loading')).toBe(true)
    })
  })

  // =========================================================================
  // Events Interface Tests
  // =========================================================================

  describe('events', () => {
    it('emits update:open when cancel is called', async () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Longsword' }
      })

      // Access the component's internal handleCancel method
      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('emits confirm when confirm is called', async () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Longsword' }
      })

      // Access the component's internal handleConfirm method
      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('does not emit update:open when confirm is called', async () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Longsword' }
      })

      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      // Confirm should NOT auto-close - let parent handle close after API call
      expect(wrapper.emitted('update:open')).toBeFalsy()
    })
  })

  // =========================================================================
  // Component Behavior Tests
  // =========================================================================

  describe('behavior', () => {
    it('closes without confirming on cancel', async () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Longsword' }
      })

      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      // Should close but NOT emit confirm
      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('confirm')).toBeFalsy()
    })

    it('only emits confirm on handleConfirm (loading handled by parent)', async () => {
      const wrapper = mount(DropConfirmModal, {
        props: { open: true, itemName: 'Longsword', loading: false }
      })

      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      // Should emit confirm only - modal stays open until parent closes it
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })
  })
})
