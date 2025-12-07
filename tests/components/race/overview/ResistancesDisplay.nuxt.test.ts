import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RaceOverviewResistancesDisplay from '~/components/race/overview/ResistancesDisplay.vue'
import type { Modifier } from '~/types'

describe('RaceOverviewResistancesDisplay', () => {
  const createResistanceModifier = (
    damageTypeName: string,
    value: string,
    condition: string | null = null,
    damageTypeCode?: string
  ): Modifier => ({
    id: Math.random(),
    modifier_category: 'damage_resistance',
    damage_type: {
      id: Math.random(),
      code: damageTypeCode || damageTypeName.substring(0, 3).toUpperCase(),
      name: damageTypeName
    },
    value,
    condition,
    is_choice: false,
    choice_count: null,
    choice_constraint: null,
    level: null
  })

  it('renders nothing when resistances array is empty', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: { resistances: [] }
    })

    expect(wrapper.text()).toBe('')
  })

  it('displays single resistance', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Fire', 'resistance')]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Fire')
    expect(text).toContain('Resistance')
  })

  it('displays multiple resistances', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [
          createResistanceModifier('Fire', 'resistance'),
          createResistanceModifier('Poison', 'resistance')
        ]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Fire')
    expect(text).toContain('Poison')
    expect(text).toContain('Resistance')
  })

  it('displays immunity instead of resistance', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Poison', 'immunity')]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Poison')
    expect(text).toContain('Immunity')
  })

  it('handles mixed resistance and immunity', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [
          createResistanceModifier('Fire', 'resistance'),
          createResistanceModifier('Poison', 'immunity')
        ]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Fire')
    expect(text).toContain('Resistance')
    expect(text).toContain('Poison')
    expect(text).toContain('Immunity')
  })

  it('displays condition when provided', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Poison', 'resistance', 'while raging')]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Poison')
    expect(text).toContain('while raging')
  })

  it('renders badges with proper structure', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [
          createResistanceModifier('Fire', 'resistance'),
          createResistanceModifier('Cold', 'resistance')
        ]
      }
    })

    // Should have data-test attributes for each badge
    const badges = wrapper.findAll('[data-testid="resistance-badge"]')
    expect(badges.length).toBe(2)
  })

  it('displays shield check icon', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Fire', 'resistance')]
      }
    })

    // Should have shield-check icon
    expect(wrapper.html()).toContain('i-heroicons-shield-check')
  })

  it('handles resistance without damage_type gracefully', async () => {
    const invalidResistance: Modifier = {
      id: 1,
      modifier_category: 'damage_resistance',
      damage_type: undefined,
      value: 'resistance',
      is_choice: false,
      condition: null,
      choice_count: null,
      choice_constraint: null,
      level: null
    }

    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [invalidResistance]
      }
    })

    // Should render but not crash
    expect(wrapper.exists()).toBe(true)
  })

  it('handles advantage value type', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Poison', 'advantage', 'saving throws')]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Poison')
    expect(text).toContain('Advantage')
    expect(text).toContain('saving throws')
  })

  it('formats badge text correctly', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Fire', 'resistance')]
      }
    })

    // Should show "Fire Resistance" not "fire resistance"
    expect(wrapper.text()).toContain('Fire Resistance')
  })

  it('displays all common damage types correctly', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [
          createResistanceModifier('Fire', 'resistance'),
          createResistanceModifier('Cold', 'resistance'),
          createResistanceModifier('Lightning', 'resistance'),
          createResistanceModifier('Poison', 'resistance'),
          createResistanceModifier('Acid', 'resistance')
        ]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Fire')
    expect(text).toContain('Cold')
    expect(text).toContain('Lightning')
    expect(text).toContain('Poison')
    expect(text).toContain('Acid')
  })

  it('uses neutral color for badges', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Fire', 'resistance')]
      }
    })

    const html = wrapper.html()
    // Should use neutral color scheme
    expect(html).toContain('neutral')
  })

  it('renders badges for display', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Fire', 'resistance')]
      }
    })

    // Should have badge rendered (size prop is set but not in HTML)
    const badges = wrapper.findAll('[data-testid="resistance-badge"]')
    expect(badges.length).toBe(1)
  })

  it('displays condition in parentheses when provided', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Poison', 'resistance', 'against spells')]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Poison Resistance')
    expect(text).toContain('(against spells)')
  })

  it('handles Tiefling fire resistance scenario', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Fire', 'resistance', null)]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Fire')
    expect(text).toContain('Resistance')
  })

  it('handles Dwarf poison advantage scenario', async () => {
    const wrapper = await mountSuspended(RaceOverviewResistancesDisplay, {
      props: {
        resistances: [createResistanceModifier('Poison', 'advantage', 'saving throws')]
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Poison')
    expect(text).toContain('Advantage')
    expect(text).toContain('saving throws')
  })
})
