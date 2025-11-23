import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiDetailDescriptionCard from '~/components/ui/detail/UiDetailDescriptionCard.vue'

describe('UiDetailDescriptionCard', () => {
  it('renders description text when provided', async () => {
    const description = 'This is a test description with details.'
    const wrapper = await mountSuspended(UiDetailDescriptionCard, {
      props: { description }
    })

    expect(wrapper.text()).toContain(description)
  })

  it('renders fallback message when description is empty string', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionCard, {
      props: { description: '' }
    })

    // Component should show fallback message
    expect(wrapper.text()).toContain('No description available')
  })

  it('renders fallback message when description is undefined', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionCard, {
      props: { description: undefined }
    })

    expect(wrapper.text()).toContain('No description available')
  })

  it('wraps description in UCard component', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionCard, {
      props: { description: 'Test description' }
    })

    // Check for UCard component (data-slot attribute from NuxtUI)
    const container = wrapper.find('[data-slot="root"]')
    expect(container.exists()).toBe(true)
  })

  it('preserves line breaks in description', async () => {
    const description = 'First line.\n\nSecond line after blank.'
    const wrapper = await mountSuspended(UiDetailDescriptionCard, {
      props: { description }
    })

    // Should have whitespace-pre-line class for preserving formatting
    const textElement = wrapper.find('[class*="whitespace-pre-line"]')
    expect(textElement.exists()).toBe(true)
  })

  it('applies proper text styling', async () => {
    const wrapper = await mountSuspended(UiDetailDescriptionCard, {
      props: { description: 'Test' }
    })

    const textElement = wrapper.find('[class*="text-gray"]')
    expect(textElement.exists()).toBe(true)
  })
})
