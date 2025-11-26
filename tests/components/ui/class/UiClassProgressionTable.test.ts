import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiClassProgressionTable from '~/components/ui/class/UiClassProgressionTable.vue'

describe('UiClassProgressionTable', () => {
  const mountOptions = {
    global: {
      stubs: {
        UCard: {
          template: '<div class="card"><template v-if="$slots.header"><div class="card-header"><slot name="header" /></div></template><slot /></div>'
        }
      }
    }
  }

  // Mock progression table matching API response structure
  const mockProgressionTable = {
    columns: [
      { key: 'level', label: 'Level', type: 'integer' },
      { key: 'proficiency_bonus', label: 'Proficiency Bonus', type: 'bonus' },
      { key: 'features', label: 'Features', type: 'string' },
      { key: 'sneak_attack', label: 'Sneak Attack', type: 'dice' }
    ],
    rows: [
      { level: 1, proficiency_bonus: '+2', features: 'Expertise, Sneak Attack', sneak_attack: '1d6' },
      { level: 2, proficiency_bonus: '+2', features: 'Cunning Action', sneak_attack: '1d6' },
      { level: 3, proficiency_bonus: '+2', features: 'Roguish Archetype', sneak_attack: '2d6' },
      { level: 4, proficiency_bonus: '+2', features: 'Ability Score Improvement', sneak_attack: '2d6' },
      { level: 5, proficiency_bonus: '+3', features: 'Uncanny Dodge', sneak_attack: '3d6' }
    ]
  }

  const mockProgressionTableNoCounters = {
    columns: [
      { key: 'level', label: 'Level', type: 'integer' },
      { key: 'proficiency_bonus', label: 'Proficiency Bonus', type: 'bonus' },
      { key: 'features', label: 'Features', type: 'string' }
    ],
    rows: [
      { level: 1, proficiency_bonus: '+2', features: 'Starting Feature' },
      { level: 2, proficiency_bonus: '+2', features: '—' },
      { level: 3, proficiency_bonus: '+2', features: 'Archetype Feature' }
    ]
  }

  it('renders a table with headers from columns', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTable },
      ...mountOptions
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).toContain('Level')
    expect(wrapper.text()).toContain('Proficiency Bonus')
    expect(wrapper.text()).toContain('Features')
    expect(wrapper.text()).toContain('Sneak Attack')
  })

  it('renders all rows from backend data', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTable },
      ...mountOptions
    })

    // Should have 5 data rows
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(5)
  })

  it('displays features from backend data', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTable },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Expertise, Sneak Attack')
    expect(wrapper.text()).toContain('Cunning Action')
    expect(wrapper.text()).toContain('Roguish Archetype')
  })

  it('displays proficiency bonus from backend data', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTable },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('+3')
  })

  it('displays counter columns from backend data', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTable },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('1d6')
    expect(wrapper.text()).toContain('2d6')
    expect(wrapper.text()).toContain('3d6')
  })

  it('handles tables without counter columns', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTableNoCounters },
      ...mountOptions
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Sneak Attack')
  })

  it('displays dash for empty feature levels', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTableNoCounters },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('—')
  })

  it('renders card header with title', () => {
    const wrapper = mount(UiClassProgressionTable, {
      props: { progressionTable: mockProgressionTable },
      ...mountOptions
    })

    expect(wrapper.text()).toContain('Class Progression')
  })
})
