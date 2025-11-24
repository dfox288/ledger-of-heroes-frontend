import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ListGeneratorPage from '~/pages/spells/list-generator.vue'

describe('Spell List Generator Page', () => {
  it('renders the page with heading', async () => {
    const wrapper = await mountSuspended(ListGeneratorPage)

    expect(wrapper.find('h1').text()).toBe('Spell List Generator')
  })

  it('displays class and level dropdowns', async () => {
    const wrapper = await mountSuspended(ListGeneratorPage)

    // Check for USelectMenu components (class and level dropdowns)
    const selectMenus = wrapper.findAllComponents({ name: 'USelectMenu' })
    expect(selectMenus.length).toBeGreaterThanOrEqual(2)
  })
})
