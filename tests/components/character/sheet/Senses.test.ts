// tests/components/character/sheet/Senses.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Senses from '~/components/character/sheet/Senses.vue'
import type { CharacterSense } from '~/types/character'

describe('CharacterSheetSenses', () => {
  const mockDarkvision: CharacterSense = {
    type: 'darkvision',
    name: 'Darkvision',
    range: 60,
    is_limited: false,
    notes: null
  }

  const mockBlindsight: CharacterSense = {
    type: 'blindsight',
    name: 'Blindsight',
    range: 30,
    is_limited: true,
    notes: 'blind beyond this radius'
  }

  const mockTremorsense: CharacterSense = {
    type: 'tremorsense',
    name: 'Tremorsense',
    range: 60,
    is_limited: false,
    notes: 'only while touching the ground'
  }

  it('displays a single sense with name and range', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: {
        senses: [mockDarkvision]
      }
    })

    expect(wrapper.text()).toContain('Senses')
    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).toContain('60 ft.')
  })

  it('displays multiple senses', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: {
        senses: [mockDarkvision, mockBlindsight]
      }
    })

    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).toContain('60 ft.')
    expect(wrapper.text()).toContain('Blindsight')
    expect(wrapper.text()).toContain('30 ft.')
  })

  it('shows limited indicator for limited senses', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: {
        senses: [mockBlindsight]
      }
    })

    expect(wrapper.text()).toContain('limited')
  })

  it('shows notes when provided', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: {
        senses: [mockTremorsense]
      }
    })

    expect(wrapper.text()).toContain('only while touching the ground')
  })

  it('renders nothing when senses array is empty', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: {
        senses: []
      }
    })

    // Should render nothing (no content)
    expect(wrapper.text().trim()).toBe('')
  })

  it('renders nothing when senses is undefined', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: {
        senses: undefined as unknown as CharacterSense[]
      }
    })

    expect(wrapper.text().trim()).toBe('')
  })

  it('renders eye icon for visual display', async () => {
    const wrapper = await mountSuspended(Senses, {
      props: {
        senses: [mockDarkvision]
      }
    })

    // UIcon renders with the icon name as a prop, verify it exists
    const icon = wrapper.findComponent({ name: 'UIcon' })
    expect(icon.exists()).toBe(true)
  })
})
