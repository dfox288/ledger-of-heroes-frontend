// tests/components/character/sheet/CurrencyEditModal.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CurrencyEditModal from '~/components/character/sheet/CurrencyEditModal.vue'

/**
 * Type for accessing CurrencyEditModal internal state in tests
 */
interface CurrencyEditModalVM {
  inputs: {
    pp: string
    gp: string
    ep: string
    sp: string
    cp: string
  }
  payload: Record<string, string>
  canApply: boolean
  handleApply: () => void
  handleCancel: () => void
  handleKeydown: (event: KeyboardEvent) => void
}

/**
 * CurrencyEditModal Tests
 *
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 * Actual modal interaction is tested via e2e tests.
 *
 * @see Design doc: docs/frontend/plans/2025-12-13-currency-management-design.md
 */
describe('CurrencyEditModal', () => {
  const defaultCurrency = {
    pp: 5,
    gp: 150,
    ep: 0,
    sp: 30,
    cp: 75
  }

  const defaultProps = {
    open: true,
    currency: defaultCurrency,
    loading: false
  }

  // =========================================================================
  // Props Interface Tests
  // =========================================================================

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts currency prop', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      expect(wrapper.props('currency')).toEqual(defaultCurrency)
    })

    it('accepts loading prop', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, loading: true }
      })
      expect(wrapper.props('loading')).toBe(true)
    })

    it('handles null currency gracefully', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, currency: null }
      })
      expect(wrapper.props('currency')).toBe(null)
    })
  })

  // =========================================================================
  // Component Interface Tests
  // =========================================================================

  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, open: false }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
    })

    it('exposes all prop types correctly', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: {
          open: true,
          currency: defaultCurrency,
          loading: false
        }
      })
      expect(wrapper.props()).toEqual({
        open: true,
        currency: defaultCurrency,
        loading: false
      })
    })
  })

  // =========================================================================
  // Input Parsing Tests
  // =========================================================================

  describe('input parsing', () => {
    it('parses negative input as subtract', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'

      expect(vm.payload).toEqual({ gp: '-5' })
    })

    it('parses positive input with + sign as add', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.sp = '+10'

      expect(vm.payload).toEqual({ sp: '+10' })
    })

    it('parses plain number as set value', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.cp = '25'

      expect(vm.payload).toEqual({ cp: '25' })
    })

    it('excludes empty inputs from payload', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.inputs.pp = ''
      vm.inputs.ep = ''
      vm.inputs.sp = ''
      vm.inputs.cp = ''

      expect(vm.payload).toEqual({ gp: '-5' })
    })

    it('handles multiple inputs', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.inputs.sp = '+10'
      vm.inputs.cp = '25'

      expect(vm.payload).toEqual({ gp: '-5', sp: '+10', cp: '25' })
    })

    it('trims whitespace from inputs', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '  -5  '

      expect(vm.payload).toEqual({ gp: '-5' })
    })

    it('excludes whitespace-only inputs', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '   '

      expect(vm.payload).toEqual({})
    })
  })

  // =========================================================================
  // Input Validation Tests
  // =========================================================================

  describe('input validation', () => {
    it('accepts valid subtract format (-5)', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'

      expect(vm.canApply).toBe(true)
    })

    it('accepts valid add format (+10)', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.sp = '+10'

      expect(vm.canApply).toBe(true)
    })

    it('accepts valid set format (25)', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.cp = '25'

      expect(vm.canApply).toBe(true)
    })

    it('accepts zero value (0)', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.pp = '0'

      expect(vm.canApply).toBe(true)
    })

    it('rejects non-numeric input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = 'abc'

      expect(vm.canApply).toBe(false)
    })

    it('rejects mixed alphanumeric input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '5gold'

      expect(vm.canApply).toBe(false)
    })

    it('rejects decimal input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '5.5'

      expect(vm.canApply).toBe(false)
    })

    it('rejects double sign input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '++5'

      expect(vm.canApply).toBe(false)
    })

    it('rejects negative sign after number', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '5-'

      expect(vm.canApply).toBe(false)
    })
  })

  // =========================================================================
  // canApply Computed Tests
  // =========================================================================

  describe('canApply computed', () => {
    it('returns false when all inputs are empty', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      // All inputs default to empty

      expect(vm.canApply).toBe(false)
    })

    it('returns true when at least one input has valid value', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'

      expect(vm.canApply).toBe(true)
    })

    it('returns true when multiple inputs have valid values', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.inputs.sp = '+10'

      expect(vm.canApply).toBe(true)
    })

    it('returns false when loading is true', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, loading: true }
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'

      expect(vm.canApply).toBe(false)
    })

    it('returns false when any input is invalid (even if others valid)', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5' // valid
      vm.inputs.sp = 'invalid' // invalid

      expect(vm.canApply).toBe(false)
    })
  })

  // =========================================================================
  // Event Handler Tests
  // =========================================================================

  describe('events interface', () => {
    it('emits apply with payload when handleApply called with valid input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.inputs.sp = '+10'
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')![0]).toEqual([{ gp: '-5', sp: '+10' }])
    })

    it('does not emit apply when handleApply called with invalid input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = 'invalid'
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('does not emit apply when handleApply called with empty input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      // All inputs empty
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('does not emit apply when loading', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, loading: true }
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.handleApply()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('emits update:open false when handleCancel called', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does not emit apply when handleCancel called', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.handleCancel()

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('does not emit update:open on apply (parent controls close)', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.handleApply()

      // Modal stays open - parent closes on success
      expect(wrapper.emitted('update:open')).toBeUndefined()
    })
  })

  // =========================================================================
  // Input Clear on Open Tests
  // =========================================================================

  describe('input clearing', () => {
    it('clears inputs when modal opens', async () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, open: false }
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM

      // Set some values while closed
      vm.inputs.gp = '-5'
      vm.inputs.sp = '+10'

      // Open the modal
      await wrapper.setProps({ open: true })

      // Inputs should be cleared
      expect(vm.inputs.pp).toBe('')
      expect(vm.inputs.gp).toBe('')
      expect(vm.inputs.ep).toBe('')
      expect(vm.inputs.sp).toBe('')
      expect(vm.inputs.cp).toBe('')
    })

    it('does not clear inputs when modal closes', async () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM

      // Set some values
      vm.inputs.gp = '-5'

      // Close the modal
      await wrapper.setProps({ open: false })

      // Value should remain (allows parent to read last input if needed)
      expect(vm.inputs.gp).toBe('-5')
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('handles all five currencies at once', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.pp = '+1'
      vm.inputs.gp = '-5'
      vm.inputs.ep = '10'
      vm.inputs.sp = '+25'
      vm.inputs.cp = '-50'

      expect(vm.payload).toEqual({
        pp: '+1',
        gp: '-5',
        ep: '10',
        sp: '+25',
        cp: '-50'
      })
      expect(vm.canApply).toBe(true)
    })

    it('handles large numbers', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '+99999'

      expect(vm.payload).toEqual({ gp: '+99999' })
      expect(vm.canApply).toBe(true)
    })

    it('handles +0 as valid input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '+0'

      expect(vm.payload).toEqual({ gp: '+0' })
      expect(vm.canApply).toBe(true)
    })

    it('handles -0 as valid input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-0'

      expect(vm.payload).toEqual({ gp: '-0' })
      expect(vm.canApply).toBe(true)
    })

    it('handles currency prop with zero values', () => {
      const zeroCurrency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, currency: zeroCurrency }
      })
      expect(wrapper.props('currency')).toEqual(zeroCurrency)
    })
  })

  // =========================================================================
  // Enter Key Submission Tests
  // =========================================================================

  describe('enter key submission', () => {
    it('emits apply when Enter is pressed with valid input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'

      // Simulate Enter keydown
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')![0]).toEqual([{ gp: '-5' }])
    })

    it('does not emit apply when Enter pressed with empty input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      // All inputs empty

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('does not emit apply when Enter pressed with invalid input', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = 'invalid'

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('does not emit apply when Enter pressed while loading', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, loading: true }
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('apply')).toBeUndefined()
    })

    it('ignores other keys', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'

      const event = new KeyboardEvent('keydown', { key: 'Space' })
      vm.handleKeydown(event)

      expect(wrapper.emitted('apply')).toBeUndefined()
    })
  })

  // =========================================================================
  // Error Display Tests
  // =========================================================================

  describe('error display', () => {
    it('accepts error prop', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, error: 'Insufficient funds' }
      })
      expect(wrapper.props('error')).toBe('Insufficient funds')
    })

    it('accepts null/undefined error prop', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, error: null }
      })
      expect(wrapper.props('error')).toBe(null)
    })

    it('clears error when modal opens', async () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, open: false, error: 'Previous error' }
      })

      // Open the modal - should emit clear-error event
      await wrapper.setProps({ open: true })

      expect(wrapper.emitted('clear-error')).toBeTruthy()
    })

    it('does not emit clear-error when modal closes', async () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, error: 'Some error' }
      })

      // Close the modal
      await wrapper.setProps({ open: false })

      // Should not emit clear-error on close (only on open)
      expect(wrapper.emitted('clear-error')).toBeUndefined()
    })
  })
})
