// tests/components/character/sheet/CurrencyEditModal.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CurrencyEditModal from '~/components/character/sheet/CurrencyEditModal.vue'
import {
  testModalPropsInterface,
  testModalMountsCorrectly,
  testEnterKeySubmission,
  testCancelBehavior,
  testCanSaveComputed,
  testSaveDoesNotCloseModal
} from '../../../helpers/modalBehavior'

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
  // Shared Behavior Tests (from modalBehavior.ts)
  // =========================================================================

  testModalPropsInterface(CurrencyEditModal, defaultProps, [
    { prop: 'open', value: true },
    { prop: 'currency', value: defaultCurrency },
    { prop: 'loading', value: true }
  ])

  testModalMountsCorrectly(CurrencyEditModal, defaultProps)

  testEnterKeySubmission(CurrencyEditModal, defaultProps, {
    setupValidState: (vm) => {
      (vm.inputs as CurrencyEditModalVM['inputs']).gp = '-5'
    },
    getHandleKeydown: vm => vm.handleKeydown as (event: KeyboardEvent) => void,
    emitName: 'apply'
  })

  testCancelBehavior(CurrencyEditModal, defaultProps, 'apply')

  testCanSaveComputed(CurrencyEditModal, defaultProps, {
    computedName: 'canApply',
    setupValidState: (vm) => {
      (vm.inputs as CurrencyEditModalVM['inputs']).gp = '-5'
    }
  })

  describe('events interface', () => {
    testSaveDoesNotCloseModal(
      CurrencyEditModal,
      defaultProps,
      'handleApply',
      (vm) => {
        (vm.inputs as CurrencyEditModalVM['inputs']).gp = '-5'
      }
    )
  })

  // =========================================================================
  // Props Edge Cases
  // =========================================================================

  describe('props edge cases', () => {
    it('handles null currency gracefully', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, currency: null }
      })
      expect(wrapper.props('currency')).toBe(null)
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
  // canApply Edge Cases
  // =========================================================================

  describe('canApply edge cases', () => {
    it('returns true when multiple inputs have valid values', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.inputs.sp = '+10'

      expect(vm.canApply).toBe(true)
    })

    it('returns false when any input is invalid (even if others valid)', () => {
      const wrapper = mount(CurrencyEditModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as CurrencyEditModalVM
      vm.inputs.gp = '-5'
      vm.inputs.sp = 'invalid'

      expect(vm.canApply).toBe(false)
    })
  })

  // =========================================================================
  // Apply Event Tests
  // =========================================================================

  describe('apply events', () => {
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

      vm.inputs.gp = '-5'
      vm.inputs.sp = '+10'

      await wrapper.setProps({ open: true })

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

      vm.inputs.gp = '-5'

      await wrapper.setProps({ open: false })

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
  // Enter Key Edge Cases (invalid input)
  // =========================================================================

  describe('enter key edge cases', () => {
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

      await wrapper.setProps({ open: true })

      expect(wrapper.emitted('clear-error')).toBeTruthy()
    })

    it('does not emit clear-error when modal closes', async () => {
      const wrapper = mount(CurrencyEditModal, {
        props: { ...defaultProps, error: 'Some error' }
      })

      await wrapper.setProps({ open: false })

      expect(wrapper.emitted('clear-error')).toBeUndefined()
    })
  })
})
