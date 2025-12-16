import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EntityDetailModal from '~/components/character/picker/EntityDetailModal.vue'

/**
 * Type for accessing EntityDetailModal internal state in tests
 */
interface EntityDetailModalVM {
  open: boolean
  title: string
}

/**
 * EntityDetailModal Tests
 *
 * Tests for the generic entity detail modal wrapper.
 * Note: UModal uses teleportation which makes DOM testing complex.
 * These tests focus on component interface (props/events) rather than rendered output.
 */
describe('EntityDetailModal', () => {
  const mockEntity = {
    name: 'Test Entity',
    description: 'A test entity description'
  }

  const defaultProps = {
    entity: mockEntity,
    open: true
  }

  describe('props interface', () => {
    it('accepts entity prop', () => {
      const wrapper = mount(EntityDetailModal, {
        props: defaultProps
      })
      expect(wrapper.props('entity')).toEqual(mockEntity)
    })

    it('accepts open prop', () => {
      const wrapper = mount(EntityDetailModal, {
        props: defaultProps
      })
      expect(wrapper.props('open')).toBe(true)
    })

    it('accepts fallbackTitle prop', () => {
      const wrapper = mount(EntityDetailModal, {
        props: {
          ...defaultProps,
          fallbackTitle: 'Custom Title'
        }
      })
      expect(wrapper.props('fallbackTitle')).toBe('Custom Title')
    })
  })

  describe('title computed', () => {
    it('uses entity name when entity provided', () => {
      const wrapper = mount(EntityDetailModal, {
        props: defaultProps
      })
      const vm = wrapper.vm as unknown as EntityDetailModalVM
      expect(vm.title).toBe('Test Entity')
    })

    it('uses fallback title when entity is null', () => {
      const wrapper = mount(EntityDetailModal, {
        props: {
          entity: null,
          open: true,
          fallbackTitle: 'Race Details'
        }
      })
      const vm = wrapper.vm as unknown as EntityDetailModalVM
      expect(vm.title).toBe('Race Details')
    })

    it('uses default fallback when entity null and no fallback provided', () => {
      const wrapper = mount(EntityDetailModal, {
        props: {
          entity: null,
          open: true
        }
      })
      const vm = wrapper.vm as unknown as EntityDetailModalVM
      expect(vm.title).toBe('Details')
    })
  })

  describe('open model', () => {
    it('reflects open prop value', () => {
      const wrapper = mount(EntityDetailModal, {
        props: { ...defaultProps, open: true }
      })
      const vm = wrapper.vm as unknown as EntityDetailModalVM
      expect(vm.open).toBe(true)
    })

    it('emits update:open when set to false', async () => {
      const wrapper = mount(EntityDetailModal, {
        props: { ...defaultProps, open: true }
      })
      const vm = wrapper.vm as unknown as EntityDetailModalVM

      // Simulate modal closing by setting open
      vm.open = false

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('emits update:open when set to true', () => {
      const wrapper = mount(EntityDetailModal, {
        props: { ...defaultProps, open: false }
      })
      const vm = wrapper.vm as unknown as EntityDetailModalVM

      vm.open = true

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([true])
    })
  })

  describe('slots', () => {
    it('exposes default slot', () => {
      const wrapper = mount(EntityDetailModal, {
        props: defaultProps,
        slots: {
          default: '<div>Slot content</div>'
        }
      })

      // Verify component accepts slot (slot rendering is handled by UModal)
      expect(wrapper.vm.$slots.default).toBeDefined()
    })
  })
})
