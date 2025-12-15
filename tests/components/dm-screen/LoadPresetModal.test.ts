// tests/components/dm-screen/LoadPresetModal.test.ts
/**
 * LoadPresetModal component tests
 *
 * Note: UModal content is teleported to body in the actual DOM,
 * so we can only test component instantiation and props handling here.
 */
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LoadPresetModal from '~/components/dm-screen/LoadPresetModal.vue'
import type { EncounterPreset } from '~/types/dm-screen'

const mockPresets: EncounterPreset[] = [
  {
    id: 'preset-1',
    name: 'Goblin Patrol',
    monsters: [
      { monster_id: 1, monster_name: 'Goblin', quantity: 4 },
      { monster_id: 2, monster_name: 'Hobgoblin', quantity: 1 }
    ],
    created_at: Date.now()
  }
]

describe('DmScreenLoadPresetModal', () => {
  describe('component mounting', () => {
    it('mounts without error when closed', async () => {
      const wrapper = await mountSuspended(LoadPresetModal, {
        props: { open: false, presets: [] }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('mounts without error when open', async () => {
      const wrapper = await mountSuspended(LoadPresetModal, {
        props: { open: true, presets: [] }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('accepts presets prop', async () => {
      const wrapper = await mountSuspended(LoadPresetModal, {
        props: { open: true, presets: mockPresets }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('emits', () => {
    it('defines update:open emit', async () => {
      const wrapper = await mountSuspended(LoadPresetModal, {
        props: { open: true, presets: [] }
      })

      expect(wrapper.vm.$options.emits).toContain('update:open')
    })

    it('defines load emit', async () => {
      const wrapper = await mountSuspended(LoadPresetModal, {
        props: { open: true, presets: [] }
      })

      expect(wrapper.vm.$options.emits).toContain('load')
    })

    it('defines delete emit', async () => {
      const wrapper = await mountSuspended(LoadPresetModal, {
        props: { open: true, presets: [] }
      })

      expect(wrapper.vm.$options.emits).toContain('delete')
    })
  })
})
