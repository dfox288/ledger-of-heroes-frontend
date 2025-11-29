import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SourceCard from '~/components/source/SourceCard.vue'

describe('SourceCard', () => {
  const mockSource = {
    id: 1,
    code: 'PHB',
    name: 'Player\'s Handbook',
    publisher: 'Wizards of the Coast',
    publication_year: 2014,
    edition: '5e'
  }

  it('renders source name', async () => {
    const wrapper = await mountSuspended(SourceCard, {
      props: { source: mockSource }
    })

    expect(wrapper.text()).toContain('Player\'s Handbook')
  })

  it('renders source code badge', async () => {
    const wrapper = await mountSuspended(SourceCard, {
      props: { source: mockSource }
    })

    expect(wrapper.text()).toContain('PHB')
  })

  it('renders publication year', async () => {
    const wrapper = await mountSuspended(SourceCard, {
      props: { source: mockSource }
    })

    expect(wrapper.text()).toContain('2014')
  })

  it('renders publisher', async () => {
    const wrapper = await mountSuspended(SourceCard, {
      props: { source: mockSource }
    })

    expect(wrapper.text()).toContain('Wizards of the Coast')
  })

  it('renders edition badge', async () => {
    const wrapper = await mountSuspended(SourceCard, {
      props: { source: mockSource }
    })

    expect(wrapper.text()).toContain('5e')
  })

  it('handles long source names gracefully', async () => {
    const longSource = {
      ...mockSource,
      name: 'Eberron: Rising from the Last War - A Campaign Setting for Dungeons & Dragons'
    }

    const wrapper = await mountSuspended(SourceCard, {
      props: { source: longSource }
    })

    expect(wrapper.text()).toContain('Eberron')
  })

  describe('background images', () => {
    it('computes background image URL correctly', async () => {
      const wrapper = await mountSuspended(SourceCard, {
        props: {
          source: {
            id: 1,
            code: 'PHB',
            name: 'Player\'s Handbook',
            publisher: 'Wizards of the Coast',
            publication_year: 2014,
            edition: '5e'
          }
        }
      })

      const url = wrapper.vm.backgroundImageUrl
      expect(url).toBe('/images/generated/conversions/256/sources/stability-ai/phb.png')
    })
  })
})
