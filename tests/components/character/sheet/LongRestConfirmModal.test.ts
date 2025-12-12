// tests/components/character/sheet/LongRestConfirmModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LongRestConfirmModal from '~/components/character/sheet/LongRestConfirmModal.vue'

/**
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 * Actual modal interaction is tested via e2e tests.
 */
describe('LongRestConfirmModal', () => {
  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(LongRestConfirmModal, {
        props: { open: true }
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts open=false', () => {
      const wrapper = mount(LongRestConfirmModal, {
        props: { open: false }
      })
      expect(wrapper.props('open')).toBe(false)
    })
  })

  // =========================================================================
  // Events Interface Tests
  // =========================================================================

  describe('events', () => {
    it('emits update:open when opening/closing', async () => {
      const wrapper = mount(LongRestConfirmModal, {
        props: { open: true }
      })

      // Access the component's internal handleCancel method
      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('emits confirm and closes on confirm', async () => {
      const wrapper = mount(LongRestConfirmModal, {
        props: { open: true }
      })

      // Access the component's internal handleConfirm method
      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      // Should emit both confirm and update:open
      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })
  })

  // =========================================================================
  // Component Behavior Tests
  // =========================================================================

  describe('behavior', () => {
    it('closes without confirming on cancel', async () => {
      const wrapper = mount(LongRestConfirmModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as { handleCancel: () => void }
      vm.handleCancel()

      // Should close but NOT emit confirm
      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('confirm')).toBeFalsy()
    })

    it('confirms and closes on confirm', async () => {
      const wrapper = mount(LongRestConfirmModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as { handleConfirm: () => void }
      vm.handleConfirm()

      // Should emit confirm AND close
      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('update:open')).toBeTruthy()
    })
  })
})
