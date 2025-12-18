// tests/components/character/sheet/XpBar.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import XpBar from '~/components/character/sheet/XpBar.vue'
import type { CharacterXpData } from '~/types/character'

const mockXpData: CharacterXpData = {
  experience_points: 6500,
  level: 5,
  next_level_xp: 14000,
  xp_to_next_level: 7500,
  xp_progress_percent: 46.67,
  is_max_level: false
}

const mockMaxLevelXpData: CharacterXpData = {
  experience_points: 355000,
  level: 20,
  next_level_xp: null,
  xp_to_next_level: 0,
  xp_progress_percent: 100,
  is_max_level: true
}

describe('CharacterSheetXpBar', () => {
  describe('rendering', () => {
    it('displays formatted XP text with current and next level', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      expect(wrapper.text()).toContain('6,500')
      expect(wrapper.text()).toContain('14,000')
      expect(wrapper.text()).toContain('XP')
    })

    it('renders progress bar with correct percentage', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      const progressBar = wrapper.find('[data-testid="xp-progress-bar"]')
      expect(progressBar.exists()).toBe(true)
    })

    it('shows 100% progress at max level', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockMaxLevelXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      // At max level, should be hidden entirely
      expect(wrapper.find('[data-testid="xp-bar-container"]').exists()).toBe(false)
    })
  })

  describe('max level behavior', () => {
    it('is hidden when is_max_level is true', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockMaxLevelXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      expect(wrapper.find('[data-testid="xp-bar-container"]').exists()).toBe(false)
    })

    it('is visible when is_max_level is false', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      expect(wrapper.find('[data-testid="xp-bar-container"]').exists()).toBe(true)
    })
  })

  describe('play mode interaction', () => {
    it('is clickable in play mode', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: true,
          characterId: 'test-char'
        }
      })

      const container = wrapper.find('[data-testid="xp-bar-container"]')
      expect(container.classes()).toContain('cursor-pointer')
    })

    it('is not clickable outside play mode', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      const container = wrapper.find('[data-testid="xp-bar-container"]')
      expect(container.classes()).not.toContain('cursor-pointer')
    })

    it('emits edit event when clicked in play mode', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: true,
          characterId: 'test-char'
        }
      })

      const container = wrapper.find('[data-testid="xp-bar-container"]')
      await container.trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')).toHaveLength(1)
    })

    it('does not emit edit event when clicked outside play mode', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      const container = wrapper.find('[data-testid="xp-bar-container"]')
      await container.trigger('click')

      expect(wrapper.emitted('edit')).toBeFalsy()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA label in play mode', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: true,
          characterId: 'test-char'
        }
      })

      const container = wrapper.find('[data-testid="xp-bar-container"]')
      expect(container.attributes('aria-label')).toContain('Edit experience points')
    })

    it('responds to Enter key in play mode', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: mockXpData,
          isPlayMode: true,
          characterId: 'test-char'
        }
      })

      const container = wrapper.find('[data-testid="xp-bar-container"]')
      await container.trigger('keydown', { key: 'Enter' })

      expect(wrapper.emitted('edit')).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('handles null xpData gracefully', async () => {
      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: null as unknown as CharacterXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      expect(wrapper.find('[data-testid="xp-bar-container"]').exists()).toBe(false)
    })

    it('formats zero XP correctly', async () => {
      const zeroXpData: CharacterXpData = {
        experience_points: 0,
        level: 1,
        next_level_xp: 300,
        xp_to_next_level: 300,
        xp_progress_percent: 0,
        is_max_level: false
      }

      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: zeroXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      expect(wrapper.text()).toContain('0')
      expect(wrapper.text()).toContain('300')
    })

    it('formats large XP numbers with commas', async () => {
      const largeXpData: CharacterXpData = {
        experience_points: 225000,
        level: 17,
        next_level_xp: 265000,
        xp_to_next_level: 40000,
        xp_progress_percent: 84.91,
        is_max_level: false
      }

      const wrapper = await mountSuspended(XpBar, {
        props: {
          xpData: largeXpData,
          isPlayMode: false,
          characterId: 'test-char'
        }
      })

      // Match with any locale separator (comma, period, space, or none)
      expect(wrapper.text()).toMatch(/225[,.\s]?000/)
      expect(wrapper.text()).toMatch(/265[,.\s]?000/)
    })
  })
})
