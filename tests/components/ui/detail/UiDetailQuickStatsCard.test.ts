import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiDetailQuickStatsCard from '~/components/ui/detail/UiDetailQuickStatsCard.vue'

describe('UiDetailQuickStatsCard', () => {
  const mountOptions = {
    global: {
      stubs: {
        UCard: {
          template: '<div class="card"><slot /></div>'
        },
        UIcon: {
          template: '<i class="icon" />',
          props: ['name']
        }
      }
    }
  }

  it('renders stat labels', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-clock', label: 'Casting Time', value: '1 action' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Casting Time')
  })

  it('renders stat values', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-bolt', label: 'Range', value: '150 feet' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('150 feet')
  })

  it('renders subtext when provided', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-sparkles', label: 'Components', value: 'V, S, M', subtext: 'A tiny ball of bat guano' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('V, S, M')
    expect(wrapper.text()).toContain('A tiny ball of bat guano')
  })

  it('does not render subtext when omitted', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-clock', label: 'Duration', value: 'Instantaneous' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Instantaneous')
    // Should only have one text div (no subtext)
    const textDivs = wrapper.findAll('.text-sm')
    expect(textDivs.length).toBeLessThanOrEqual(1) // Label is also text-sm
  })

  it('renders multiple stats', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-clock', label: 'Casting Time', value: '1 action' },
          { icon: 'i-heroicons-bolt', label: 'Range', value: '150 feet' },
          { icon: 'i-heroicons-sparkles', label: 'Duration', value: 'Instantaneous' }
        ]
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Casting Time')
    expect(wrapper.text()).toContain('Range')
    expect(wrapper.text()).toContain('Duration')
  })

  it('uses default 2-column grid', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-clock', label: 'Test', value: '1' }
        ]
      },
      ...mountOptions
    })

    const grid = wrapper.find('.grid')
    expect(grid.exists()).toBe(true)
    expect(grid.classes()).toContain('md:grid-cols-2')
  })

  it('uses custom column count when provided', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-clock', label: 'Test 1', value: '1' },
          { icon: 'i-heroicons-bolt', label: 'Test 2', value: '2' },
          { icon: 'i-heroicons-sparkles', label: 'Test 3', value: '3' }
        ],
        columns: 3
      },
      ...mountOptions
    })

    const grid = wrapper.find('.grid')
    expect(grid.exists()).toBe(true)
    expect(grid.classes()).toContain('md:grid-cols-3')
  })

  it('applies dark mode support', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: [
          { icon: 'i-heroicons-clock', label: 'Test', value: 'Value' }
        ]
      },
      ...mountOptions
    })

    // Label should have dark mode classes
    const label = wrapper.find('.text-sm.font-semibold')
    expect(label.classes()).toContain('text-gray-500')
    expect(label.classes()).toContain('dark:text-gray-400')

    // Value should have dark mode classes
    const value = wrapper.find('.text-lg')
    expect(value.classes()).toContain('text-gray-900')
    expect(value.classes()).toContain('dark:text-gray-100')
  })

  it('does not render when stats array is empty', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: []
      },
      ...mountOptions
    })

    // Card should not exist
    expect(wrapper.find('.card').exists()).toBe(false)
  })

  it('does not render any content when no stats provided', () => {
    const wrapper = mount(UiDetailQuickStatsCard, {
      props: {
        stats: []
      },
      ...mountOptions
    })

    // Component HTML should be empty (or just comment nodes)
    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
