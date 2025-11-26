import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import UiClassSubclassCards from '~/components/ui/class/UiClassSubclassCards.vue'

describe('UiClassSubclassCards', () => {
  const mountOptions = {
    global: {
      stubs: {
        UCard: {
          template: '<div class="card"><slot /><slot name="footer" /></div>'
        },
        UBadge: {
          template: '<span class="badge"><slot /></span>',
          props: ['color', 'variant', 'size']
        },
        UIcon: {
          template: '<i class="icon" />',
          props: ['name']
        },
        NuxtLink: RouterLinkStub
      }
    }
  }

  const mockSubclasses = [
    {
      id: 86,
      slug: 'rogue-arcane-trickster',
      name: 'Arcane Trickster',
      description: 'Subclass of Rogue',
      features: [
        { id: 1, level: 3, feature_name: 'Spellcasting' },
        { id: 2, level: 9, feature_name: 'Magical Ambush' },
        { id: 3, level: 13, feature_name: 'Versatile Trickster' },
        { id: 4, level: 17, feature_name: 'Spell Thief' }
      ],
      sources: [{ id: 1, name: 'Player\'s Handbook', abbreviation: 'PHB', page_number: 97 }]
    },
    {
      id: 87,
      slug: 'rogue-assassin',
      name: 'Assassin',
      description: 'Subclass of Rogue',
      features: [
        { id: 5, level: 3, feature_name: 'Assassinate' },
        { id: 6, level: 9, feature_name: 'Infiltration Expertise' }
      ],
      sources: [{ id: 1, name: 'Player\'s Handbook', abbreviation: 'PHB', page_number: 97 }]
    }
  ]

  it('renders subclass names', () => {
    const wrapper = mount(UiClassSubclassCards, {
      props: {
        subclasses: mockSubclasses,
        basePath: '/classes'
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Arcane Trickster')
    expect(wrapper.text()).toContain('Assassin')
  })

  it('renders correct number of cards', () => {
    const wrapper = mount(UiClassSubclassCards, {
      props: {
        subclasses: mockSubclasses,
        basePath: '/classes'
      },
      ...mountOptions
    })

    const cards = wrapper.findAll('.card')
    expect(cards.length).toBe(2)
  })

  it('links to subclass detail page', () => {
    const wrapper = mount(UiClassSubclassCards, {
      props: {
        subclasses: mockSubclasses,
        basePath: '/classes'
      },
      ...mountOptions
    })

    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links[0].props('to')).toBe('/classes/rogue-arcane-trickster')
    expect(links[1].props('to')).toBe('/classes/rogue-assassin')
  })

  it('shows feature count', () => {
    const wrapper = mount(UiClassSubclassCards, {
      props: {
        subclasses: mockSubclasses,
        basePath: '/classes'
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('4 features')
    expect(wrapper.text()).toContain('2 features')
  })

  it('shows source abbreviation when available', () => {
    const wrapper = mount(UiClassSubclassCards, {
      props: {
        subclasses: mockSubclasses,
        basePath: '/classes'
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('PHB')
  })

  it('handles subclasses without sources gracefully', () => {
    const noSourceSubclasses = [
      {
        id: 88,
        slug: 'rogue-thief',
        name: 'Thief',
        description: 'Subclass of Rogue',
        features: [],
        sources: []
      }
    ]

    const wrapper = mount(UiClassSubclassCards, {
      props: {
        subclasses: noSourceSubclasses,
        basePath: '/classes'
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Thief')
    // Should not throw error
  })

  it('uses grid layout for cards', () => {
    const wrapper = mount(UiClassSubclassCards, {
      props: {
        subclasses: mockSubclasses,
        basePath: '/classes'
      },
      ...mountOptions
    })

    const grid = wrapper.find('.grid')
    expect(grid.exists()).toBe(true)
  })
})
