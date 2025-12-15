/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WizardChangeConfirmationModal from '~/components/character/wizard/WizardChangeConfirmationModal.vue'

/**
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 * The actual modal rendering is tested via e2e tests.
 */
describe('WizardChangeConfirmationModal', () => {
  const defaultProps = {
    open: true,
    title: 'Change Race?',
    message: 'Changing your race will clear your subrace selection.'
  }

  describe('props', () => {
    it('accepts open prop', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts title prop', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      expect(wrapper.props('title')).toBe('Change Race?')
    })

    it('accepts message prop', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      expect(wrapper.props('message')).toBe('Changing your race will clear your subrace selection.')
    })

    it('accepts confirmText prop with default', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      expect(wrapper.props('confirmText')).toBe('Continue')
    })

    it('accepts custom confirmText', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: { ...defaultProps, confirmText: 'Yes, Change' }
      })

      expect(wrapper.props('confirmText')).toBe('Yes, Change')
    })

    it('accepts cancelText prop with default', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      expect(wrapper.props('cancelText')).toBe('Cancel')
    })

    it('accepts custom cancelText', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: { ...defaultProps, cancelText: 'Go Back' }
      })

      expect(wrapper.props('cancelText')).toBe('Go Back')
    })
  })

  describe('component interface', () => {
    it('mounts without error', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts when closed', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: { ...defaultProps, open: false }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('open')).toBe(false)
    })

    it('exposes correct prop types', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: {
          open: false,
          title: 'Test Title',
          message: 'Test message',
          confirmText: 'OK',
          cancelText: 'Back'
        }
      })

      expect(wrapper.props()).toEqual({
        open: false,
        title: 'Test Title',
        message: 'Test message',
        confirmText: 'OK',
        cancelText: 'Back'
      })
    })
  })

  describe('events interface', () => {
    it('defines confirm event', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      // Manually trigger the internal handler to test event emission
      const vm = wrapper.vm as any
      vm.handleConfirm()

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('defines cancel event', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: defaultProps
      })

      // Manually trigger the internal handler
      const vm = wrapper.vm as any
      vm.handleCancel()

      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })
  })

  describe('edge cases', () => {
    it('handles long title', () => {
      const longTitle = 'Are you sure you want to change your primary class selection which will affect many things?'
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: { ...defaultProps, title: longTitle }
      })

      expect(wrapper.props('title')).toBe(longTitle)
    })

    it('handles special characters', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: {
          ...defaultProps,
          title: 'Change Druid\'s Form?',
          message: 'This will reset the character\'s wild shape.'
        }
      })

      expect(wrapper.props('title')).toBe('Change Druid\'s Form?')
      expect(wrapper.props('message')).toBe('This will reset the character\'s wild shape.')
    })

    it('handles empty confirmText gracefully', () => {
      const wrapper = mount(WizardChangeConfirmationModal, {
        props: { ...defaultProps, confirmText: '' }
      })

      expect(wrapper.props('confirmText')).toBe('')
    })
  })
})
