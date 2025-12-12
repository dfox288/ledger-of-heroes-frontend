// tests/components/character/sheet/HpEditModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HpEditModal from '~/components/character/sheet/HpEditModal.vue'

/**
 * Type for accessing HpEditModal internal state in tests
 */
interface HpEditModalVM {
  inputValue: string
  parsedDelta: number | null
  canApply: boolean
  MAX_HP_DELTA: number
  handleApply: () => void
  handleCancel: () => void
}

/**
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 * Actual modal interaction is tested via e2e tests.
 */
describe('HpEditModal', () => {
  const defaultProps = {
    open: true,
    currentHp: 43,
    maxHp: 52,
    tempHp: 0
  }

  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts currentHp prop', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('currentHp')).toBe(43)
    })

    it('accepts maxHp prop', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('maxHp')).toBe(52)
    })

    it('accepts tempHp prop', () => {
      const wrapper = mount(HpEditModal, {
        props: { ...defaultProps, tempHp: 8 }
      })
      expect(wrapper.props('tempHp')).toBe(8)
    })

    it('handles zero tempHp', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('tempHp')).toBe(0)
    })
  })

  // =========================================================================
  // Component Interface Tests
  // =========================================================================

  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(HpEditModal, {
        props: { ...defaultProps, open: false }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
    })

    it('exposes all prop types correctly', () => {
      const wrapper = mount(HpEditModal, {
        props: {
          open: true,
          currentHp: 28,
          maxHp: 35,
          tempHp: 5
        }
      })
      expect(wrapper.props()).toEqual({
        open: true,
        currentHp: 28,
        maxHp: 35,
        tempHp: 5
      })
    })
  })

  // =========================================================================
  // Input Parsing Tests (via component internals)
  // =========================================================================

  describe('input parsing', () => {
    it('parses negative input as damage', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-12'

      expect(vm.parsedDelta).toBe(-12)
    })

    it('parses positive input with + sign as healing', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '+8'

      expect(vm.parsedDelta).toBe(8)
    })

    it('parses unsigned input as "set to" (calculates delta from current)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps // currentHp: 43
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '30'

      // Setting to 30 when current is 43 = delta of -13
      expect(vm.parsedDelta).toBe(-13)
    })

    it('parses unsigned input as delta when setting higher', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps // currentHp: 43
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '50'

      // Setting to 50 when current is 43 = delta of +7
      expect(vm.parsedDelta).toBe(7)
    })

    it('parses unsigned input as 0 delta when setting to current', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps // currentHp: 43
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '43'

      // Setting to 43 when current is 43 = delta of 0
      expect(vm.parsedDelta).toBe(0)
    })

    it('parses unsigned zero as "set to 0" (delta = -currentHp)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps // currentHp: 43
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '0'

      // Setting to 0 when current is 43 = delta of -43
      expect(vm.parsedDelta).toBe(-43)
    })

    it('parses +0 as delta 0 (no change)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '+0'

      expect(vm.parsedDelta).toBe(0)
    })

    it('parses -0 as delta 0 (no change)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-0'

      expect(vm.parsedDelta).toBe(0)
    })

    it('returns null for empty input', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = ''

      expect(vm.parsedDelta).toBe(null)
    })

    it('returns null for non-numeric input', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = 'abc'

      expect(vm.parsedDelta).toBe(null)
    })

    it('returns null for whitespace only', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '   '

      expect(vm.parsedDelta).toBe(null)
    })
  })

  // =========================================================================
  // canApply Computed Tests
  // =========================================================================

  describe('canApply computed', () => {
    it('returns false when input is empty', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = ''

      expect(vm.canApply).toBe(false)
    })

    it('returns false when input is invalid', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = 'abc'

      expect(vm.canApply).toBe(false)
    })

    it('returns true when input is valid negative number', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-12'

      expect(vm.canApply).toBe(true)
    })

    it('returns true when input is valid positive number', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '+8'

      expect(vm.canApply).toBe(true)
    })

    it('returns true when input is zero', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '0'

      expect(vm.canApply).toBe(true)
    })
  })

  // =========================================================================
  // Event Handler Tests
  // =========================================================================

  describe('events interface', () => {
    it('emits apply with delta when handleApply called with valid input', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-12'
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')![0]).toEqual([-12])
    })

    it('emits update:open false when handleApply called', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-12'
      vm.handleApply()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit apply when handleApply called with invalid input', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = ''
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('emits update:open false when handleCancel called', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit apply when handleCancel called', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-12'
      vm.handleCancel()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('handles max allowed damage value (-999)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-999'

      expect(vm.parsedDelta).toBe(-999)
      expect(vm.canApply).toBe(true)
    })

    it('handles max allowed healing value (+999)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '+999'

      expect(vm.parsedDelta).toBe(999)
      expect(vm.canApply).toBe(true)
    })

    it('rejects damage value above max (-1000)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '-1000'

      // parsedDelta is still valid, but canApply blocks it
      expect(vm.parsedDelta).toBe(-1000)
      expect(vm.canApply).toBe(false)
    })

    it('rejects healing value above max (+1000)', () => {
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '+1000'

      // parsedDelta is still valid, but canApply blocks it
      expect(vm.parsedDelta).toBe(1000)
      expect(vm.canApply).toBe(false)
    })

    it('rejects "set to" value that produces delta above max', () => {
      // currentHp is 43, setting to 1500 would be delta of +1457
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM
      vm.inputValue = '1500'

      expect(vm.parsedDelta).toBe(1457)
      expect(vm.canApply).toBe(false)
    })

    it('handles character at full HP', () => {
      const wrapper = mount(HpEditModal, {
        props: { open: true, currentHp: 52, maxHp: 52, tempHp: 0 }
      })
      expect(wrapper.props('currentHp')).toBe(52)
      expect(wrapper.props('maxHp')).toBe(52)
    })

    it('handles character at 0 HP', () => {
      const wrapper = mount(HpEditModal, {
        props: { open: true, currentHp: 0, maxHp: 52, tempHp: 0 }
      })
      expect(wrapper.props('currentHp')).toBe(0)
    })
  })

  // =========================================================================
  // Max Value Constant
  // =========================================================================

  describe('MAX_HP_DELTA constant', () => {
    it('exports MAX_HP_DELTA as 999', () => {
      // The component should expose MAX_HP_DELTA for reference
      const wrapper = mount(HpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as HpEditModalVM

      expect(vm.MAX_HP_DELTA).toBe(999)
    })
  })
})
