import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellHigherLevels from '~/components/spell/SpellHigherLevels.vue'

describe('SpellHigherLevels', () => {
  const mockHigherLevelsText = 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.'

  // Basic rendering

  it('renders the higher levels text', async () => {
    const wrapper = await mountSuspended(SpellHigherLevels, {
      props: {
        higherLevels: mockHigherLevelsText
      }
    })

    expect(wrapper.text()).toContain('When you cast this spell using a spell slot of 4th level or higher')
    expect(wrapper.text()).toContain('the damage increases by 1d6')
  })

  it('renders the "AT HIGHER LEVELS" header', async () => {
    const wrapper = await mountSuspended(SpellHigherLevels, {
      props: {
        higherLevels: mockHigherLevelsText
      }
    })

    expect(wrapper.text()).toContain('📈')
    expect(wrapper.text()).toContain('AT HIGHER LEVELS')
  })

  // Card structure tests

  it('renders content in a card structure', async () => {
    const wrapper = await mountSuspended(SpellHigherLevels, {
      props: {
        higherLevels: mockHigherLevelsText
      }
    })

    // Should have card-like structure with proper spacing
    const card = wrapper.find('[class*="bg-"]')
    expect(card.exists()).toBe(true)
  })

  // Different text content tests

  it('handles short higher levels text', async () => {
    const shortText = 'Add 1d8 damage per level.'
    const wrapper = await mountSuspended(SpellHigherLevels, {
      props: {
        higherLevels: shortText
      }
    })

    expect(wrapper.text()).toContain(shortText)
  })

  it('handles long higher levels text', async () => {
    const longText = 'When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them.'
    const wrapper = await mountSuspended(SpellHigherLevels, {
      props: {
        higherLevels: longText
      }
    })

    expect(wrapper.text()).toContain('When you cast this spell using a spell slot')
    expect(wrapper.text()).toContain('within 30 feet of each other')
  })

  // Formatting tests

  it('displays text in readable format', async () => {
    const wrapper = await mountSuspended(SpellHigherLevels, {
      props: {
        higherLevels: mockHigherLevelsText
      }
    })

    // Text should be present and not truncated
    const fullText = wrapper.text()
    expect(fullText).toContain(mockHigherLevelsText)
  })

  // Integration test

  it('renders complete component with header and text', async () => {
    const wrapper = await mountSuspended(SpellHigherLevels, {
      props: {
        higherLevels: mockHigherLevelsText
      }
    })

    const text = wrapper.text()
    expect(text).toContain('📈')
    expect(text).toContain('AT HIGHER LEVELS')
    expect(text).toContain('When you cast this spell')
    expect(text).toContain('damage increases by 1d6')
  })
})
