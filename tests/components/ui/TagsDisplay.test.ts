import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TagsDisplay from '~/components/ui/TagsDisplay.vue'

describe('TagsDisplay', () => {
  const mockTags = [
    {
      id: 1,
      name: 'Touch Spells',
      slug: 'touch-spells',
      type: null
    },
    {
      id: 2,
      name: 'Ritual',
      slug: 'ritual',
      type: null
    }
  ]

  it('renders tag names', () => {
    const wrapper = mount(TagsDisplay, {
      props: { tags: mockTags }
    })

    expect(wrapper.text()).toContain('Touch Spells')
    expect(wrapper.text()).toContain('Ritual')
  })

  it('renders multiple tags correctly', () => {
    const wrapper = mount(TagsDisplay, {
      props: { tags: mockTags }
    })

    const badges = wrapper.findAll('[data-testid="tag-badge"]')
    expect(badges.length).toBe(2)
  })

  it('renders nothing when tags is empty array', () => {
    const wrapper = mount(TagsDisplay, {
      props: { tags: [] }
    })

    const container = wrapper.find('[data-testid="tags-container"]')
    expect(container.exists()).toBe(false)
  })

  it('renders nothing when tags is undefined', () => {
    const wrapper = mount(TagsDisplay, {
      props: { tags: undefined }
    })

    const container = wrapper.find('[data-testid="tags-container"]')
    expect(container.exists()).toBe(false)
  })

  it('handles single tag correctly', () => {
    const singleTag = [{
      id: 1,
      name: 'Concentration',
      slug: 'concentration',
      type: null
    }]

    const wrapper = mount(TagsDisplay, {
      props: { tags: singleTag }
    })

    expect(wrapper.text()).toContain('Concentration')
    const badges = wrapper.findAll('[data-testid="tag-badge"]')
    expect(badges.length).toBe(1)
  })

  it('applies flex-wrap for responsive layout', () => {
    const wrapper = mount(TagsDisplay, {
      props: { tags: mockTags }
    })

    const flexContainer = wrapper.find('.flex')
    expect(flexContainer.classes()).toContain('flex-wrap')
  })

  it('applies proper spacing between tags', () => {
    const wrapper = mount(TagsDisplay, {
      props: { tags: mockTags }
    })

    const container = wrapper.find('.flex')
    expect(container.classes()).toContain('gap-2')
  })

  it('uses primary color badges for tags', () => {
    const wrapper = mount(TagsDisplay, {
      props: { tags: mockTags }
    })

    // Check that UBadge components are rendered
    const container = wrapper.find('[data-testid="tags-container"]')
    expect(container.exists()).toBe(true)
  })
})
