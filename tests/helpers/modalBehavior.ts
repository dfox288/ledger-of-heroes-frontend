import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Component } from 'vue'

/**
 * Modal Behavior Test Generators
 *
 * These helpers generate repetitive test suites for modal components.
 * They encode common patterns shared across EditModal, CurrencyEditModal, etc.
 *
 * Usage:
 * ```typescript
 * import {
 *   testModalPropsInterface,
 *   testModalMountsCorrectly,
 *   testEnterKeySubmission,
 *   testCancelBehavior,
 *   testErrorPropHandling
 * } from '../../helpers/modalBehavior'
 *
 * describe('MyModal', () => {
 *   testModalPropsInterface(MyModal, defaultProps, [
 *     { prop: 'open', value: true },
 *     { prop: 'loading', value: true },
 *   ])
 *
 *   testModalMountsCorrectly(MyModal, defaultProps)
 *
 *   testEnterKeySubmission(MyModal, defaultProps, {
 *     setupValidState: (vm) => { vm.localValue = 'valid' },
 *     getHandleKeydown: (vm) => vm.handleKeydown,
 *     emitName: 'save'
 *   })
 * })
 * ```
 *
 * Benefits:
 * - Reduces ~50 lines per modal for common behavior tests
 * - Ensures consistent test coverage across all modals
 * - Documents expected modal behavior patterns
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for a prop interface test
 */
export interface PropTest {
  /** The prop name to test */
  prop: string
  /** The value to set and verify */
  value: unknown
  /** Optional description override */
  description?: string
}

/**
 * Configuration for enter key submission tests
 */
export interface EnterKeyConfig {
  /** Function to set up valid state before pressing Enter */
  setupValidState: (vm: Record<string, unknown>) => void
  /** Function to get the handleKeydown method from vm */
  getHandleKeydown: (vm: Record<string, unknown>) => (event: KeyboardEvent) => void
  /** The emit event name to check (e.g., 'save', 'apply') */
  emitName: string
  /** Optional: function to set up invalid state */
  setupInvalidState?: (vm: Record<string, unknown>) => void
}

/**
 * Configuration for canSave/canApply computed tests
 */
export interface CanSaveConfig {
  /** The computed property name (e.g., 'canSave', 'canApply') */
  computedName: string
  /** Function to set up state where save should be allowed */
  setupValidState: (vm: Record<string, unknown>) => void
  /** Function to set up state where save should be blocked */
  setupInvalidState?: (vm: Record<string, unknown>) => void
  /** Optional: test that loading blocks save */
  testLoadingBlocks?: boolean
}

/**
 * Configuration for handleSave/handleApply action tests
 */
export interface SaveActionConfig {
  /** The method name (e.g., 'handleSave', 'handleApply') */
  methodName: string
  /** The emit event name (e.g., 'save', 'apply') */
  emitName: string
  /** Function to set up valid state before save */
  setupValidState: (vm: Record<string, unknown>) => void
  /** Expected payload shape (partial match) */
  expectedPayload?: Record<string, unknown>
}

// ============================================================================
// Test Generators
// ============================================================================

/**
 * Generates props interface tests for a modal component.
 *
 * Tests that the component accepts and exposes specified props correctly.
 *
 * @param ModalComponent - The Vue component to test
 * @param defaultProps - Default props to mount with
 * @param propTests - Array of prop configurations to test
 */
export function testModalPropsInterface(
  ModalComponent: Component,
  defaultProps: Record<string, unknown>,
  propTests: PropTest[]
): void {
  describe('props interface', () => {
    for (const { prop, value, description } of propTests) {
      it(description || `accepts ${prop} prop`, () => {
        const wrapper = mount(ModalComponent, {
          props: { ...defaultProps, [prop]: value }
        })
        expect(wrapper.props(prop)).toEqual(value)
      })
    }
  })
}

/**
 * Generates basic mount tests for a modal component.
 *
 * Tests that the component mounts without error in open and closed states.
 *
 * @param ModalComponent - The Vue component to test
 * @param defaultProps - Default props to mount with
 */
export function testModalMountsCorrectly(
  ModalComponent: Component,
  defaultProps: Record<string, unknown>
): void {
  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(ModalComponent, {
        props: { ...defaultProps, open: false }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
    })
  })
}

/**
 * Generates Enter key submission tests for a modal component.
 *
 * Tests:
 * - Enter key triggers submit with valid state
 * - Enter key does not trigger submit with invalid state
 * - Other keys are ignored
 *
 * @param ModalComponent - The Vue component to test
 * @param defaultProps - Default props to mount with
 * @param config - Test configuration
 */
export function testEnterKeySubmission(
  ModalComponent: Component,
  defaultProps: Record<string, unknown>,
  config: EnterKeyConfig
): void {
  describe('enter key submission', () => {
    it(`emits ${config.emitName} when Enter pressed with valid state`, async () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as Record<string, unknown>
      config.setupValidState(vm)

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      config.getHandleKeydown(vm)(event)

      expect(wrapper.emitted(config.emitName)).toBeTruthy()
    })

    it(`does not emit ${config.emitName} when Enter pressed with no changes`, async () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as Record<string, unknown>
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      config.getHandleKeydown(vm)(event)

      expect(wrapper.emitted(config.emitName)).toBeUndefined()
    })

    it('ignores other keys', async () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as Record<string, unknown>
      config.setupValidState(vm)

      const event = new KeyboardEvent('keydown', { key: 'Space' })
      config.getHandleKeydown(vm)(event)

      expect(wrapper.emitted(config.emitName)).toBeUndefined()
    })

    it(`does not emit ${config.emitName} when Enter pressed while loading`, async () => {
      const wrapper = mount(ModalComponent, {
        props: { ...defaultProps, loading: true }
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true, loading: true })

      const vm = wrapper.vm as Record<string, unknown>
      config.setupValidState(vm)

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      config.getHandleKeydown(vm)(event)

      expect(wrapper.emitted(config.emitName)).toBeUndefined()
    })
  })
}

/**
 * Generates cancel behavior tests for a modal component.
 *
 * Tests:
 * - handleCancel emits update:open with false
 * - handleCancel does not emit the save/apply event
 *
 * @param ModalComponent - The Vue component to test
 * @param defaultProps - Default props to mount with
 * @param emitName - The save/apply event name that should NOT be emitted
 */
export function testCancelBehavior(
  ModalComponent: Component,
  defaultProps: Record<string, unknown>,
  emitName: string
): void {
  describe('cancel behavior', () => {
    it('emits update:open false when handleCancel called', () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })

      const vm = wrapper.vm as Record<string, unknown>
      const handleCancel = vm.handleCancel as () => void
      handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it(`does not emit ${emitName} when handleCancel called`, async () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as Record<string, unknown>
      const handleCancel = vm.handleCancel as () => void
      handleCancel()

      expect(wrapper.emitted(emitName)).toBeUndefined()
    })
  })
}

/**
 * Generates error prop handling tests for a modal component.
 *
 * @param ModalComponent - The Vue component to test
 * @param defaultProps - Default props to mount with
 */
export function testErrorPropHandling(
  ModalComponent: Component,
  defaultProps: Record<string, unknown>
): void {
  describe('error handling', () => {
    it('accepts error prop', () => {
      const wrapper = mount(ModalComponent, {
        props: { ...defaultProps, error: 'Some error message' }
      })
      expect(wrapper.props('error')).toBe('Some error message')
    })

    it('accepts null error prop', () => {
      const wrapper = mount(ModalComponent, {
        props: { ...defaultProps, error: null }
      })
      expect(wrapper.props('error')).toBeNull()
    })
  })
}

/**
 * Generates canSave/canApply computed property tests.
 *
 * @param ModalComponent - The Vue component to test
 * @param defaultProps - Default props to mount with
 * @param config - Test configuration
 */
export function testCanSaveComputed(
  ModalComponent: Component,
  defaultProps: Record<string, unknown>,
  config: CanSaveConfig
): void {
  describe(`${config.computedName} computed`, () => {
    it('returns false when no changes made', async () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as Record<string, unknown>
      expect(vm[config.computedName]).toBe(false)
    })

    it('returns true when valid changes made', async () => {
      const wrapper = mount(ModalComponent, {
        props: defaultProps
      })
      await wrapper.setProps({ open: false })
      await wrapper.setProps({ open: true })

      const vm = wrapper.vm as Record<string, unknown>
      config.setupValidState(vm)

      expect(vm[config.computedName]).toBe(true)
    })

    if (config.testLoadingBlocks !== false) {
      it('returns false when loading', async () => {
        const wrapper = mount(ModalComponent, {
          props: { ...defaultProps, loading: true }
        })
        await wrapper.setProps({ open: false })
        await wrapper.setProps({ open: true, loading: true })

        const vm = wrapper.vm as Record<string, unknown>
        config.setupValidState(vm)

        expect(vm[config.computedName]).toBe(false)
      })
    }
  })
}

/**
 * Generates tests for save action not emitting update:open
 * (parent controls close after save succeeds)
 *
 * @param ModalComponent - The Vue component to test
 * @param defaultProps - Default props to mount with
 * @param methodName - The save method name (e.g., 'handleSave')
 * @param setupValidState - Function to set up valid state
 */
export function testSaveDoesNotCloseModal(
  ModalComponent: Component,
  defaultProps: Record<string, unknown>,
  methodName: string,
  setupValidState: (vm: Record<string, unknown>) => void
): void {
  it('does not emit update:open on save (parent controls close)', async () => {
    const wrapper = mount(ModalComponent, {
      props: defaultProps
    })
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })

    const vm = wrapper.vm as Record<string, unknown>
    setupValidState(vm)
    const saveMethod = vm[methodName] as () => void
    saveMethod()

    expect(wrapper.emitted('update:open')).toBeUndefined()
  })
}
