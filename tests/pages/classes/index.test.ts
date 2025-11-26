import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ClassesIndexPage from '~/pages/classes/index.vue'
import { useClassFiltersStore } from '~/stores/classFilters'

/**
 * Classes Page - Basic Rendering Tests
 *
 * Note: Implementation details are tested via composable and component tests.
 * These tests only verify basic page mounting and rendering.
 */
describe('Classes Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useClassFiltersStore()
    store.clearAll()
  })

  it('should mount without errors', async () => {
    const wrapper = await mountSuspended(ClassesIndexPage, {
      route: '/classes'
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should render page with content', async () => {
    const wrapper = await mountSuspended(ClassesIndexPage, {
      route: '/classes'
    })

    const html = wrapper.html()
    expect(html.length).toBeGreaterThan(0)
  })
})
