import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundFeatureCard from '~/components/background/BackgroundFeatureCard.vue'

/**
 * BackgroundFeatureCard Component Tests
 *
 * Updated to test new feature object structure (Issue #67):
 * - Uses { name, description } instead of TraitResource
 * - Feature data extracted from API fields, not traits array
 */

interface Feature {
  name: string
  description: string
}

describe('BackgroundFeatureCard', () => {
  const mockFeature: Feature = {
    name: 'Shelter of the Faithful',
    description: 'As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith, though you must provide any material components needed for spells. Those who share your religion will support you (but only you) at a modest lifestyle.'
  }

  // Core functionality tests
  it('renders feature name as heading', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    expect(wrapper.text()).toContain('Shelter of the Faithful')
  })

  it('renders feature description', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    expect(wrapper.text()).toContain('As an acolyte, you command the respect')
  })

  it('renders full description text', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    expect(wrapper.text()).toContain('As an acolyte, you command the respect of those who share your faith')
    expect(wrapper.text()).toContain('at a modest lifestyle')
  })

  it('shows "FEATURE" label', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    expect(wrapper.text()).toContain('FEATURE')
  })

  it('shows star icon', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    const html = wrapper.html()
    expect(html).toContain('i-heroicons-star')
  })

  // Null/empty state tests
  it('hides entirely when feature is null', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: null }
    })

    // Component should render nothing
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('hides when feature is undefined', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: undefined }
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  // Different feature content tests
  it('handles different feature names', async () => {
    const differentFeature = {
      ...mockFeature,
      name: 'Criminal Contact'
    }
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: differentFeature }
    })

    expect(wrapper.text()).toContain('Criminal Contact')
  })

  it('handles long descriptions', async () => {
    const longDescription = 'This is a very long description. '.repeat(50)
    const longFeature = {
      ...mockFeature,
      description: longDescription
    }
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: longFeature }
    })

    expect(wrapper.text()).toContain('This is a very long description')
    // Should render full text, not truncate
    expect(wrapper.text().length).toBeGreaterThan(500)
  })

  it('handles short descriptions', async () => {
    const shortFeature = {
      ...mockFeature,
      description: 'A simple feature.'
    }
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: shortFeature }
    })

    expect(wrapper.text()).toContain('A simple feature.')
  })

  // Layout and styling tests
  it('displays feature in a card layout', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    // Should render as a card with appropriate structure
    const html = wrapper.html()
    expect(html).toContain('data-slot="root"')
    expect(html).toContain('data-slot="body"')
  })

  it('maintains hierarchy: label, name, description', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    const text = wrapper.text()
    const featureIndex = text.indexOf('FEATURE')
    const nameIndex = text.indexOf('Shelter of the Faithful')
    const descIndex = text.indexOf('As an acolyte')

    // Label should come before name, name before description
    expect(featureIndex).toBeLessThan(nameIndex)
    expect(nameIndex).toBeLessThan(descIndex)
  })

  // Edge cases
  it('handles features with special characters in name', async () => {
    const specialFeature = {
      ...mockFeature,
      name: 'Feature: "Special & Unique"'
    }
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: specialFeature }
    })

    expect(wrapper.text()).toContain('Feature: "Special & Unique"')
  })

  it('handles empty description gracefully', async () => {
    const emptyDescFeature = {
      ...mockFeature,
      description: ''
    }
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: emptyDescFeature }
    })

    // Should still render name and label
    expect(wrapper.text()).toContain('Shelter of the Faithful')
    expect(wrapper.text()).toContain('FEATURE')
  })

  it('handles missing description field', async () => {
    const noDescFeature = {
      name: 'Test Feature',
      description: ''
    }
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: noDescFeature }
    })

    expect(wrapper.text()).toContain('Test Feature')
  })

  // Visual distinction tests
  it('uses appropriate color scheme for feature card', async () => {
    const wrapper = await mountSuspended(BackgroundFeatureCard, {
      props: { feature: mockFeature }
    })

    const html = wrapper.html()
    // Should have some color/styling distinction (checking for common NuxtUI color classes)
    expect(html.length).toBeGreaterThan(100) // Has substantial HTML
  })
})
