import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceDisplay from '~/components/ui/SourceDisplay.vue'

describe('SourceDisplay', () => {
  const mockSources = [
    {
      code: 'PHB',
      name: "Player's Handbook",
      pages: '32'
    },
    {
      code: 'XGE',
      name: "Xanathar's Guide to Everything",
      pages: '154-155'
    }
  ]

  it('renders source names', () => {
    const wrapper = mount(SourceDisplay, {
      props: { sources: mockSources }
    })

    expect(wrapper.text()).toContain("Player's Handbook")
    expect(wrapper.text()).toContain("Xanathar's Guide to Everything")
  })

  it('displays page numbers next to source names', () => {
    const wrapper = mount(SourceDisplay, {
      props: { sources: mockSources }
    })

    expect(wrapper.text()).toContain('p. 32')
    expect(wrapper.text()).toContain('p. 154-155')
  })

  it('renders multiple sources correctly', () => {
    const wrapper = mount(SourceDisplay, {
      props: { sources: mockSources }
    })

    const badges = wrapper.findAll('[data-testid="source-badge"]')
    expect(badges.length).toBe(2)
  })

  it('renders nothing when sources is empty array', () => {
    const wrapper = mount(SourceDisplay, {
      props: { sources: [] }
    })

    const container = wrapper.find('[data-testid="source-container"]')
    expect(container.exists()).toBe(false)
  })

  it('renders nothing when sources is undefined', () => {
    const wrapper = mount(SourceDisplay, {
      props: { sources: undefined }
    })

    const container = wrapper.find('[data-testid="source-container"]')
    expect(container.exists()).toBe(false)
  })

  it('handles single source correctly', () => {
    const singleSource = [{
      code: 'DMG',
      name: "Dungeon Master's Guide",
      pages: '42'
    }]

    const wrapper = mount(SourceDisplay, {
      props: { sources: singleSource }
    })

    expect(wrapper.text()).toContain("Dungeon Master's Guide")
    expect(wrapper.text()).toContain('p. 42')
  })
})
