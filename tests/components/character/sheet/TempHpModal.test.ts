// tests/components/character/sheet/TempHpModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TempHpModal from '~/components/character/sheet/TempHpModal.vue'

/**
 * Type for accessing TempHpModal internal state in tests
 */
interface TempHpModalVM {
  inputValue: string
  parsedValue: number | null
  wouldHaveEffect: boolean
  canApply: boolean
  MAX_TEMP_HP: number
  handleApply: () => void
  handleClear: () => void
  handleCancel: () => void
}

/**
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 * Actual modal interaction is tested via e2e tests.
 */
describe('TempHpModal', () => {
  const defaultProps = {
    open: true,
    currentTempHp: 0
  }

  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts currentTempHp prop', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 8 }
      })
      expect(wrapper.props('currentTempHp')).toBe(8)
    })

    it('handles zero currentTempHp', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      expect(wrapper.props('currentTempHp')).toBe(0)
    })
  })

  // =========================================================================
  // Component Interface Tests
  // =========================================================================

  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, open: false }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
    })

    it('exposes all prop types correctly', () => {
      const wrapper = mount(TempHpModal, {
        props: {
          open: true,
          currentTempHp: 12
        }
      })
      expect(wrapper.props()).toEqual({
        open: true,
        currentTempHp: 12
      })
    })
  })

  // =========================================================================
  // Input Parsing Tests
  // =========================================================================

  describe('input parsing', () => {
    it('parses positive integer', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '12'

      expect(vm.parsedValue).toBe(12)
    })

    it('parses zero', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '0'

      expect(vm.parsedValue).toBe(0)
    })

    it('returns null for empty input', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = ''

      expect(vm.parsedValue).toBe(null)
    })

    it('returns null for non-numeric input', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = 'abc'

      expect(vm.parsedValue).toBe(null)
    })

    it('returns null for negative values (temp HP cannot be negative)', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '-5'

      expect(vm.parsedValue).toBe(null)
    })
  })

  // =========================================================================
  // Would Have Effect Logic Tests
  // =========================================================================

  describe('wouldHaveEffect computed', () => {
    it('returns true when input is greater than current', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 5 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '10'

      expect(vm.wouldHaveEffect).toBe(true)
    })

    it('returns false when input is less than current', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 10 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '5'

      expect(vm.wouldHaveEffect).toBe(false)
    })

    it('returns false when input equals current', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 8 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '8'

      expect(vm.wouldHaveEffect).toBe(false)
    })

    it('returns true when setting temp HP from 0', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 0 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '10'

      expect(vm.wouldHaveEffect).toBe(true)
    })

    it('returns false when input is empty', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 5 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = ''

      expect(vm.wouldHaveEffect).toBe(false)
    })
  })

  // =========================================================================
  // canApply Computed Tests
  // =========================================================================

  describe('canApply computed', () => {
    it('returns false when input is empty', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = ''

      expect(vm.canApply).toBe(false)
    })

    it('returns false when input is invalid', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = 'abc'

      expect(vm.canApply).toBe(false)
    })

    it('returns true when input is valid positive number', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '10'

      expect(vm.canApply).toBe(true)
    })

    it('returns true when input would have no effect (user can still confirm)', () => {
      // Note: We allow applying even if it has no effect - show warning instead
      // This lets users confirm they understand the D&D rules
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 10 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '5'

      expect(vm.canApply).toBe(true)
    })

    it('returns false when input equals current temp HP (true no-op)', () => {
      // Setting to same value is pointless - block the button
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 8 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '8'

      expect(vm.canApply).toBe(false)
    })

    it('returns false when setting 0 while current is already 0', () => {
      // Edge case: 0 -> 0 is a no-op
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 0 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '0'

      expect(vm.canApply).toBe(false)
    })

    it('returns false when input exceeds max allowed value', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '1000'

      expect(vm.canApply).toBe(false)
    })
  })

  // =========================================================================
  // Event Handler Tests
  // =========================================================================

  describe('events interface', () => {
    it('emits apply with value when handleApply called', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '12'
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')![0]).toEqual([12])
    })

    it('emits update:open false when handleApply called', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '12'
      vm.handleApply()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit apply when handleApply called with invalid input', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = ''
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('emits clear when handleClear called', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 8 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.handleClear()

      expect(wrapper.emitted('clear')).toBeTruthy()
    })

    it('emits update:open false when handleClear called', () => {
      const wrapper = mount(TempHpModal, {
        props: { ...defaultProps, currentTempHp: 8 }
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.handleClear()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('emits update:open false when handleCancel called', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit apply or clear when handleCancel called', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '10'
      vm.handleCancel()

      expect(wrapper.emitted('apply')).toBeUndefined()
      expect(wrapper.emitted('clear')).toBeUndefined()
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('handles max allowed temp HP value (999)', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '999'

      expect(vm.parsedValue).toBe(999)
      expect(vm.canApply).toBe(true)
    })

    it('rejects temp HP value above max (1000+)', () => {
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM
      vm.inputValue = '1000'

      // parsedValue is still valid, but canApply blocks it
      expect(vm.parsedValue).toBe(1000)
      expect(vm.canApply).toBe(false)
    })

    it('handles existing high temp HP', () => {
      const wrapper = mount(TempHpModal, {
        props: { open: true, currentTempHp: 50 }
      })
      expect(wrapper.props('currentTempHp')).toBe(50)
    })
  })

  // =========================================================================
  // Max Value Constant
  // =========================================================================

  describe('MAX_TEMP_HP constant', () => {
    it('exports MAX_TEMP_HP as 999', () => {
      // The component should expose MAX_TEMP_HP for reference
      const wrapper = mount(TempHpModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as TempHpModalVM

      expect(vm.MAX_TEMP_HP).toBe(999)
    })
  })
})
