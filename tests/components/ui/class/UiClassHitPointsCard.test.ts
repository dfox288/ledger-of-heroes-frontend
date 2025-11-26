import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiClassHitPointsCard from '~/components/ui/class/UiClassHitPointsCard.vue'

describe('UiClassHitPointsCard', () => {
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

  // Mock data matching API response structure
  const createHitPoints = (hitDie: number, className: string) => ({
    hit_die: `d${hitDie}`,
    hit_die_numeric: hitDie,
    first_level: {
      value: hitDie,
      description: `${hitDie} + your Constitution modifier`
    },
    higher_levels: {
      roll: `1d${hitDie}`,
      average: Math.floor(hitDie / 2) + 1,
      description: `1d${hitDie} (or ${Math.floor(hitDie / 2) + 1}) + your Constitution modifier per ${className} level after 1st`
    }
  })

  it('renders hit die value from backend data', () => {
    const wrapper = mount(UiClassHitPointsCard, {
      props: {
        hitPoints: createHitPoints(8, 'rogue')
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('d8')
  })

  it('renders HP at 1st level from backend description', () => {
    const wrapper = mount(UiClassHitPointsCard, {
      props: {
        hitPoints: createHitPoints(10, 'fighter')
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('10 + your Constitution modifier')
  })

  it('renders HP at higher levels from backend description', () => {
    const wrapper = mount(UiClassHitPointsCard, {
      props: {
        hitPoints: createHitPoints(12, 'barbarian')
      },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('1d12 (or 7) + your Constitution modifier per barbarian level after 1st')
  })

  it('displays different hit dice correctly', () => {
    // d6 wizard
    const d6Wrapper = mount(UiClassHitPointsCard, {
      props: { hitPoints: createHitPoints(6, 'wizard') },
      ...mountOptions
    })
    expect(d6Wrapper.text()).toContain('d6')
    expect(d6Wrapper.text()).toContain('(or 4)')

    // d8 rogue
    const d8Wrapper = mount(UiClassHitPointsCard, {
      props: { hitPoints: createHitPoints(8, 'rogue') },
      ...mountOptions
    })
    expect(d8Wrapper.text()).toContain('d8')
    expect(d8Wrapper.text()).toContain('(or 5)')

    // d10 fighter
    const d10Wrapper = mount(UiClassHitPointsCard, {
      props: { hitPoints: createHitPoints(10, 'fighter') },
      ...mountOptions
    })
    expect(d10Wrapper.text()).toContain('d10')
    expect(d10Wrapper.text()).toContain('(or 6)')

    // d12 barbarian
    const d12Wrapper = mount(UiClassHitPointsCard, {
      props: { hitPoints: createHitPoints(12, 'barbarian') },
      ...mountOptions
    })
    expect(d12Wrapper.text()).toContain('d12')
    expect(d12Wrapper.text()).toContain('(or 7)')
  })

  it('displays heart icon', () => {
    const wrapper = mount(UiClassHitPointsCard, {
      props: {
        hitPoints: createHitPoints(8, 'rogue')
      },
      ...mountOptions
    })

    expect(wrapper.find('.icon').exists()).toBe(true)
  })
})
