import { describe, it, expect, beforeEach, vi } from 'vitest'
import { h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import WizardLayout from '~/components/character/wizard/WizardLayout.vue'

// Mock navigateTo for child components
vi.stubGlobal('navigateTo', vi.fn())

// Define stubs for child components
const stubs = {
  CharacterWizardWizardSidebar: {
    template: '<aside data-test="sidebar">Sidebar</aside>'
  },
  CharacterWizardWizardFooter: {
    template: '<footer data-test="footer">Footer</footer>'
  }
}

describe('WizardLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('structure', () => {
    it('renders the sidebar', async () => {
      const wrapper = await mountSuspended(WizardLayout, {
        slots: {
          default: () => h('div', { 'data-test': 'content' }, 'Test Content')
        },
        global: { stubs }
      })

      expect(wrapper.find('[data-test="sidebar"]').exists()).toBe(true)
    })

    it('renders the footer', async () => {
      const wrapper = await mountSuspended(WizardLayout, {
        slots: {
          default: () => h('div', { 'data-test': 'content' }, 'Test Content')
        },
        global: { stubs }
      })

      expect(wrapper.find('[data-test="footer"]').exists()).toBe(true)
    })

    it('renders slot content in main area', async () => {
      const wrapper = await mountSuspended(WizardLayout, {
        slots: {
          default: () => h('div', { 'data-test': 'content' }, 'Test Content')
        },
        global: { stubs }
      })

      expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Content')
    })
  })

  describe('layout', () => {
    it('uses flex layout for sidebar and content', async () => {
      const wrapper = await mountSuspended(WizardLayout, {
        slots: {
          default: () => h('div', 'Content')
        },
        global: { stubs }
      })

      // Root element should have flex
      expect(wrapper.classes()).toContain('flex')
    })

    it('has min-height to fill viewport', async () => {
      const wrapper = await mountSuspended(WizardLayout, {
        slots: {
          default: () => h('div', 'Content')
        },
        global: { stubs }
      })

      expect(wrapper.classes()).toContain('min-h-screen')
    })
  })
})
