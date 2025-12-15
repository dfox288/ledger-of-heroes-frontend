// tests/components/dm-screen/SavePresetModal.test.ts
/**
 * SavePresetModal component tests
 *
 * Note: UModal content is teleported to body in the actual DOM,
 * so we can only test component instantiation and props handling here.
 */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SavePresetModal from '~/components/dm-screen/SavePresetModal.vue'
import type { PresetMonster } from '~/types/dm-screen'

const mockMonsters: PresetMonster[] = [
  { monster_id: 1, monster_name: 'Goblin', quantity: 4 },
  { monster_id: 2, monster_name: 'Hobgoblin', quantity: 1 }
]

describe('DmScreenSavePresetModal', () => {
  describe('component mounting', () => {
    it('mounts without error when closed', async () => {
      const wrapper = await mountSuspended(SavePresetModal, {
        props: { open: false, monsters: [] }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when open', async () => {
      const wrapper = await mountSuspended(SavePresetModal, {
        props: { open: true, monsters: [] }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('accepts monsters prop', async () => {
      const wrapper = await mountSuspended(SavePresetModal, {
        props: { open: true, monsters: mockMonsters }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('emits', () => {
    it('defines update:open emit', async () => {
      const wrapper = await mountSuspended(SavePresetModal, {
        props: { open: true, monsters: [] }
      })

      expect(wrapper.vm.$options.emits).toContain('update:open')
    })

    it('defines save emit', async () => {
      const wrapper = await mountSuspended(SavePresetModal, {
        props: { open: true, monsters: [] }
      })

      expect(wrapper.vm.$options.emits).toContain('save')
    })
  })
})
