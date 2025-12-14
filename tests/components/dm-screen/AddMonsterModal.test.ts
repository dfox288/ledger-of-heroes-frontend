// tests/components/dm-screen/AddMonsterModal.test.ts
/**
 * AddMonsterModal component tests
 *
 * Note: UModal content is teleported to body in the actual DOM,
 * so we can only test component instantiation and props handling here.
 * Full modal interaction tests require E2E testing.
 */
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import AddMonsterModal from '~/components/dm-screen/AddMonsterModal.vue'

// Mock apiFetch
const mockApiFetch = vi.fn()
mockNuxtImport('useApi', () => () => ({ apiFetch: mockApiFetch }))

describe('DmScreenAddMonsterModal', () => {
  describe('component mounting', () => {
    it('mounts without error when closed', async () => {
      const wrapper = await mountSuspended(AddMonsterModal, {
        props: { open: false }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when open', async () => {
      const wrapper = await mountSuspended(AddMonsterModal, {
        props: { open: true }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('accepts loading prop', async () => {
      const wrapper = await mountSuspended(AddMonsterModal, {
        props: { open: true, loading: true }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('emits', () => {
    it('defines update:open emit', async () => {
      const wrapper = await mountSuspended(AddMonsterModal, {
        props: { open: true }
      })

      // Verify component has the emit defined
      expect(wrapper.vm.$options.emits).toContain('update:open')
    })

    it('defines add emit', async () => {
      const wrapper = await mountSuspended(AddMonsterModal, {
        props: { open: true }
      })

      // Verify component has the emit defined
      expect(wrapper.vm.$options.emits).toContain('add')
    })
  })
})
