// tests/components/character/sheet/StatSpeed.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatSpeed from '~/components/character/sheet/StatSpeed.vue'

describe('StatSpeed', () => {
  describe('basic display', () => {
    it('displays "Speed" label', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: { speed: 30 }
      })
      expect(wrapper.text()).toContain('Speed')
    })

    it('displays walking speed with "ft" unit', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: { speed: 30 }
      })
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('ft')
    })

    it('displays different speed values', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: { speed: 25 }
      })
      expect(wrapper.text()).toContain('25')
    })

    it('displays placeholder when speed is null', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: { speed: null }
      })
      expect(wrapper.text()).toContain('—')
    })

    it('has expected visual structure (rounded card)', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: { speed: 30 }
      })
      expect(wrapper.find('.rounded-lg').exists()).toBe(true)
    })
  })

  describe('alternate movement speeds', () => {
    it('shows fly speed when present', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: {
          speed: 30,
          speeds: { walk: 30, fly: 50, swim: null, climb: null }
        }
      })
      expect(wrapper.text()).toContain('fly 50')
    })

    it('shows swim speed when present', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: {
          speed: 30,
          speeds: { walk: 30, fly: null, swim: 30, climb: null }
        }
      })
      expect(wrapper.text()).toContain('swim 30')
    })

    it('shows climb speed when present', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: {
          speed: 30,
          speeds: { walk: 30, fly: null, swim: null, climb: 30 }
        }
      })
      expect(wrapper.text()).toContain('climb 30')
    })

    it('shows multiple alternate speeds', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: {
          speed: 25,
          speeds: { walk: 25, fly: 50, swim: 30, climb: null }
        }
      })
      expect(wrapper.text()).toContain('fly 50')
      expect(wrapper.text()).toContain('swim 30')
    })

    it('hides alternate speeds when all are null', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: {
          speed: 30,
          speeds: { walk: 30, fly: null, swim: null, climb: null }
        }
      })
      expect(wrapper.text()).not.toContain('fly')
      expect(wrapper.text()).not.toContain('swim')
      expect(wrapper.text()).not.toContain('climb')
    })

    it('handles missing speeds prop gracefully', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: { speed: 30 }
      })
      // Should show walking speed without crashing
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('ft')
    })

    it('handles null speeds prop gracefully', async () => {
      const wrapper = await mountSuspended(StatSpeed, {
        props: { speed: 30, speeds: null }
      })
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).not.toContain('fly')
    })
  })
})
