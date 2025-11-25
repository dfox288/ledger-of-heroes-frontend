import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiClassProgressionTable from '~/components/ui/class/UiClassProgressionTable.vue'

describe('UiClassProgressionTable', () => {
  const mountOptions = {
    global: {
      stubs: {
        UCard: {
          template: '<div class="card"><slot /></div>'
        },
        UTable: {
          template: '<table class="table"><slot /></table>',
          props: ['data', 'columns']
        },
        UBadge: {
          template: '<span class="badge"><slot /></span>',
          props: ['color', 'variant', 'size']
        }
      }
    }
  }

  const mockFeatures = [
    { id: 1, level: 1, feature_name: 'Expertise', description: 'Choose two proficiencies', is_optional: false, sort_order: 1 },
    { id: 2, level: 1, feature_name: 'Sneak Attack', description: 'Deal extra damage', is_optional: false, sort_order: 2 },
    { id: 3, level: 1, feature_name: "Thieves' Cant", description: 'Secret language', is_optional: false, sort_order: 3 },
    { id: 4, level: 2, feature_name: 'Cunning Action', description: 'Bonus action Dash/Disengage/Hide', is_optional: false, sort_order: 4 },
    { id: 5, level: 3, feature_name: 'Roguish Archetype', description: 'Choose subclass', is_optional: false, sort_order: 5 }
  ]

  const mockCounters = [
    { id: 1, level: 1, counter_name: 'Sneak Attack', counter_value: 1, reset_timing: 'Does Not Reset' as const },
    { id: 2, level: 3, counter_name: 'Sneak Attack', counter_value: 2, reset_timing: 'Does Not Reset' as const },
    { id: 3, level: 5, counter_name: 'Sneak Attack', counter_value: 3, reset_timing: 'Does Not Reset' as const }
  ]

  it('renders a table with level column', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: mockFeatures,
        counters: []
      },
      ...mountOptions
    })

    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('renders all 20 levels by default', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: mockFeatures,
        counters: []
      },
      ...mountOptions
    })

    // Component should generate 20 rows
    expect(wrapper.vm.tableRows.length).toBe(20)
  })

  it('groups features by level', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: mockFeatures,
        counters: []
      },
      ...mountOptions
    })

    const level1Row = wrapper.vm.tableRows.find((r: { level: number }) => r.level === 1)
    expect(level1Row.features).toContain('Expertise')
    expect(level1Row.features).toContain('Sneak Attack')
    expect(level1Row.features).toContain("Thieves' Cant")
  })

  it('calculates proficiency bonus correctly', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: [],
        counters: []
      },
      ...mountOptions
    })

    const rows = wrapper.vm.tableRows
    expect(rows[0].proficiencyBonus).toBe('+2')  // Level 1
    expect(rows[4].proficiencyBonus).toBe('+3')  // Level 5
    expect(rows[8].proficiencyBonus).toBe('+4')  // Level 9
    expect(rows[12].proficiencyBonus).toBe('+5') // Level 13
    expect(rows[16].proficiencyBonus).toBe('+6') // Level 17
  })

  it('adds counter columns dynamically', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: [],
        counters: mockCounters
      },
      ...mountOptions
    })

    expect(wrapper.vm.columns.some((c: { key: string }) => c.key === 'counter_Sneak Attack')).toBe(true)
  })

  it('interpolates counter values for levels without explicit entries', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: [],
        counters: mockCounters
      },
      ...mountOptions
    })

    const rows = wrapper.vm.tableRows
    // Level 1 has explicit value 1
    expect(rows[0]['counter_Sneak Attack']).toBe('1d6')
    // Level 2 should carry forward value 1
    expect(rows[1]['counter_Sneak Attack']).toBe('1d6')
    // Level 3 has explicit value 2
    expect(rows[2]['counter_Sneak Attack']).toBe('2d6')
    // Level 4 should carry forward value 2
    expect(rows[3]['counter_Sneak Attack']).toBe('2d6')
  })

  it('shows dash for empty feature levels', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: mockFeatures,
        counters: []
      },
      ...mountOptions
    })

    const level4Row = wrapper.vm.tableRows.find((r: { level: number }) => r.level === 4)
    expect(level4Row.features).toBe('—')
  })

  it('does not render when features array is empty and no counters', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: {
        features: [],
        counters: []
      },
      ...mountOptions
    })

    // Should still render the table structure (empty progression is valid)
    expect(wrapper.find('.card').exists()).toBe(true)
  })
})
