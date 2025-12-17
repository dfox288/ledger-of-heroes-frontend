// tests/components/character/sheet/XpEditModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import XpEditModal from '~/components/character/sheet/XpEditModal.vue'

/**
 * Type for accessing XpEditModal internal state in tests
 */
interface XpEditModalVM {
  inputValue: string
  parsedNewXp: number | null
  canApply: boolean
  MAX_XP: number
  handleApply: () => void
  handleCancel: () => void
}

/**
 * XpEditModal Tests
 *
 * Modal for editing character XP. Supports three input modes:
 * - "+500" → Add 500 XP to current
 * - "-200" → Remove 200 XP from current
 * - "6500" → Set XP to 6500
 *
 * Similar pattern to HpEditModal but emits the NEW total XP value
 * (not a delta) since the backend expects absolute XP values.
 */
describe('XpEditModal', () => {
  const defaultProps = {
    open: true,
    currentXp: 6500,
    nextLevelXp: 14000
  }

  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts currentXp prop', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('currentXp')).toBe(6500)
    })

    it('accepts nextLevelXp prop', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('nextLevelXp')).toBe(14000)
    })

    it('handles null nextLevelXp (max level)', () => {
      const wrapper = mount(XpEditModal, {
        props: { ...defaultProps, nextLevelXp: null }
      })
      expect(wrapper.props('nextLevelXp')).toBe(null)
    })
  })

  // =========================================================================
  // Component Interface Tests
  // =========================================================================

  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(XpEditModal, {
        props: { ...defaultProps, open: false }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
    })

    it('exposes all prop types correctly', () => {
      const wrapper = mount(XpEditModal, {
        props: {
          open: true,
          currentXp: 2500,
          nextLevelXp: 6500
        }
      })
      expect(wrapper.props()).toEqual({
        open: true,
        currentXp: 2500,
        nextLevelXp: 6500
      })
    })
  })

  // =========================================================================
  // Input Parsing Tests (via component internals)
  // =========================================================================

  describe('input parsing', () => {
    it('parses positive input with + sign as XP gain', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps // currentXp: 6500
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+500'

      // Adding 500 to 6500 = 7000
      expect(vm.parsedNewXp).toBe(7000)
    })

    it('parses negative input as XP loss', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps // currentXp: 6500
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '-200'

      // Subtracting 200 from 6500 = 6300
      expect(vm.parsedNewXp).toBe(6300)
    })

    it('parses unsigned input as "set to" (absolute value)', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps // currentXp: 6500
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '8000'

      // Set to 8000
      expect(vm.parsedNewXp).toBe(8000)
    })

    it('parses unsigned zero as "set to 0"', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '0'

      expect(vm.parsedNewXp).toBe(0)
    })

    it('parses +0 as no change (current XP)', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps // currentXp: 6500
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+0'

      expect(vm.parsedNewXp).toBe(6500)
    })

    it('parses -0 as no change (current XP)', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps // currentXp: 6500
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '-0'

      expect(vm.parsedNewXp).toBe(6500)
    })

    it('returns null for empty input', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = ''

      expect(vm.parsedNewXp).toBe(null)
    })

    it('returns null for non-numeric input', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = 'abc'

      expect(vm.parsedNewXp).toBe(null)
    })

    it('returns null for whitespace only', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '   '

      expect(vm.parsedNewXp).toBe(null)
    })

    it('floors negative results to 0', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps // currentXp: 6500
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '-10000'

      // 6500 - 10000 would be -3500, but XP can't go negative
      expect(vm.parsedNewXp).toBe(0)
    })
  })

  // =========================================================================
  // canApply Computed Tests
  // =========================================================================

  describe('canApply computed', () => {
    it('returns false when input is empty', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = ''

      expect(vm.canApply).toBe(false)
    })

    it('returns false when input is invalid', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = 'abc'

      expect(vm.canApply).toBe(false)
    })

    it('returns true when input is valid positive gain', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+500'

      expect(vm.canApply).toBe(true)
    })

    it('returns true when input is valid loss', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '-200'

      expect(vm.canApply).toBe(true)
    })

    it('returns true when input is valid set-to value', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '8000'

      expect(vm.canApply).toBe(true)
    })

    it('returns true when input is zero (reset XP)', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '0'

      expect(vm.canApply).toBe(true)
    })

    it('returns false when result exceeds MAX_XP', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      // MAX_XP is 999999 (reasonable cap for D&D 5e)
      vm.inputValue = '9999999'

      expect(vm.canApply).toBe(false)
    })
  })

  // =========================================================================
  // Event Handler Tests
  // =========================================================================

  describe('events interface', () => {
    it('emits apply with new XP when handleApply called with valid input', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps // currentXp: 6500
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+500'
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')![0]).toEqual([7000])
    })

    it('emits apply with absolute value when using set-to mode', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '14000'
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')![0]).toEqual([14000])
    })

    it('emits update:open false when handleApply called', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+500'
      vm.handleApply()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit apply when handleApply called with invalid input', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = ''
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('emits update:open false when handleCancel called', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit apply when handleCancel called', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+500'
      vm.handleCancel()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('handles character at 0 XP', () => {
      const wrapper = mount(XpEditModal, {
        props: { open: true, currentXp: 0, nextLevelXp: 300 }
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+300'

      expect(vm.parsedNewXp).toBe(300)
      expect(vm.canApply).toBe(true)
    })

    it('handles large XP values', () => {
      const wrapper = mount(XpEditModal, {
        props: { open: true, currentXp: 355000, nextLevelXp: null } // Level 20
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '+10000'

      expect(vm.parsedNewXp).toBe(365000)
      expect(vm.canApply).toBe(true)
    })

    it('handles max allowed XP value (999999)', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '999999'

      expect(vm.parsedNewXp).toBe(999999)
      expect(vm.canApply).toBe(true)
    })

    it('rejects XP value above max (1000000)', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '1000000'

      expect(vm.parsedNewXp).toBe(1000000)
      expect(vm.canApply).toBe(false)
    })

    it('handles loss that results in 0 XP', () => {
      const wrapper = mount(XpEditModal, {
        props: { open: true, currentXp: 100, nextLevelXp: 300 }
      })
      const vm = wrapper.vm as unknown as XpEditModalVM
      vm.inputValue = '-100'

      expect(vm.parsedNewXp).toBe(0)
      expect(vm.canApply).toBe(true)
    })
  })

  // =========================================================================
  // Max Value Constant
  // =========================================================================

  describe('MAX_XP constant', () => {
    it('exports MAX_XP as 999999', () => {
      const wrapper = mount(XpEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as XpEditModalVM

      // Reasonable cap for D&D 5e (level 20 requires 355000 XP)
      expect(vm.MAX_XP).toBe(999999)
    })
  })
})
