import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiCardUiEntityCard from '~/components/ui/card/UiEntityCard.vue'

describe('UiEntityCard', () => {
  it('renders with required props', async () => {
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/spells/fireball',
        entityType: 'spells',
        slug: 'fireball',
        color: 'spell'
      }
    })
    expect(wrapper.find('a').attributes('href')).toBe('/spells/fireball')
  })

  it('truncates long descriptions', async () => {
    const longDesc = 'A'.repeat(200)
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/test',
        entityType: 'spells',
        slug: 'test',
        color: 'spell',
        description: longDesc
      }
    })
    const text = wrapper.text()
    expect(text).toContain('...')
    expect(text.length).toBeLessThan(200)
  })

  it('does not truncate short descriptions', async () => {
    const shortDesc = 'Short description'
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/test',
        entityType: 'spells',
        slug: 'test',
        color: 'spell',
        description: shortDesc
      }
    })
    const text = wrapper.text()
    expect(text).toContain(shortDesc)
    expect(text).not.toContain('...')
  })

  it('renders slot content', async () => {
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/test',
        entityType: 'spells',
        slug: 'test',
        color: 'spell'
      },
      slots: {
        badges: '<span data-testid="badge">Test Badge</span>',
        title: '<h3 data-testid="title">Test Title</h3>'
      }
    })
    expect(wrapper.find('[data-testid="badge"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="title"]').exists()).toBe(true)
  })

  it('renders background image when provided', async () => {
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/spells/fireball',
        entityType: 'spells',
        slug: 'fireball',
        color: 'spell'
      }
    })
    const bgElement = wrapper.find('[data-testid="card-background"]')
    expect(bgElement.exists()).toBe(true)
  })

  it('renders source footer when sources provided', async () => {
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/test',
        entityType: 'spells',
        slug: 'test',
        color: 'spell',
        sources: [
          { code: 'PHB', name: 'Player\'s Handbook' }
        ]
      }
    })
    expect(wrapper.findComponent({ name: 'UiCardSourceFooter' }).exists()).toBe(true)
  })

  it('does not render source footer when no sources', async () => {
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/test',
        entityType: 'spells',
        slug: 'test',
        color: 'spell'
      }
    })
    expect(wrapper.findComponent({ name: 'UiCardSourceFooter' }).exists()).toBe(false)
  })

  it('does not render description when empty', async () => {
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/test',
        entityType: 'spells',
        slug: 'test',
        color: 'spell',
        description: ''
      }
    })
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('renders all slot content areas', async () => {
    const wrapper = await mountSuspended(UiCardUiEntityCard, {
      props: {
        to: '/test',
        entityType: 'spells',
        slug: 'test',
        color: 'spell'
      },
      slots: {
        badges: '<div data-testid="badges-slot">Badges</div>',
        title: '<div data-testid="title-slot">Title</div>',
        stats: '<div data-testid="stats-slot">Stats</div>',
        extra: '<div data-testid="extra-slot">Extra</div>'
      }
    })
    expect(wrapper.find('[data-testid="badges-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="title-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="stats-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="extra-slot"]').exists()).toBe(true)
  })
})
