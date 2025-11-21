import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonDebugPanel from '~/components/ui/JsonDebugPanel.vue'

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
})

describe('JsonDebugPanel', () => {
  const mockData = {
    id: 1,
    name: 'Fireball',
    level: 3,
    school: 'Evocation'
  }

  it('renders nothing when visible is false', () => {
    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: mockData,
        visible: false
      }
    })

    const panel = wrapper.find('[data-testid="json-panel"]')
    expect(panel.exists()).toBe(false)
  })

  it('renders panel when visible is true', () => {
    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: mockData,
        visible: true
      }
    })

    const panel = wrapper.find('[data-testid="json-panel"]')
    expect(panel.exists()).toBe(true)
  })

  it('displays formatted JSON data', () => {
    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: mockData,
        visible: true
      }
    })

    const jsonText = wrapper.find('[data-testid="json-content"]').text()
    expect(jsonText).toContain('"name": "Fireball"')
    expect(jsonText).toContain('"level": 3')
  })

  it('displays custom title when provided', () => {
    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: mockData,
        visible: true,
        title: 'Custom Debug Data'
      }
    })

    expect(wrapper.text()).toContain('Custom Debug Data')
  })

  it('displays default title when not provided', () => {
    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: mockData,
        visible: true
      }
    })

    expect(wrapper.text()).toContain('Raw JSON Data')
  })

  it('emits close event when close button clicked', async () => {
    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: mockData,
        visible: true
      }
    })

    const closeButton = wrapper.find('[data-testid="close-button"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('copies JSON to clipboard when copy button clicked', async () => {
    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: mockData,
        visible: true
      }
    })

    const copyButton = wrapper.find('[data-testid="copy-button"]')
    await copyButton.trigger('click')

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(mockData, null, 2)
    )
  })

  it('handles complex nested data', () => {
    const complexData = {
      spell: {
        name: 'Fireball',
        effects: [
          { type: 'damage', dice: '8d6' }
        ],
        classes: ['Wizard', 'Sorcerer']
      }
    }

    const wrapper = mount(JsonDebugPanel, {
      props: {
        data: complexData,
        visible: true
      }
    })

    const jsonText = wrapper.find('[data-testid="json-content"]').text()
    expect(jsonText).toContain('"type": "damage"')
    expect(jsonText).toContain('"Wizard"')
  })
})
