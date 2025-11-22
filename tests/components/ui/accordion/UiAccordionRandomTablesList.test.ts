import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordionRandomTablesList from '~/components/ui/accordion/UiAccordionRandomTablesList.vue'

describe('UiAccordionRandomTablesList', () => {
  const mockTables = [
    {
      id: 1,
      table_name: 'Entertainer Routines',
      dice_type: 'd10',
      description: 'Choose your performance style',
      entries: [
        {
          id: 1,
          roll_min: 1,
          roll_max: 1,
          result_text: 'Actor',
          sort_order: 0
        },
        {
          id: 2,
          roll_min: 2,
          roll_max: 2,
          result_text: 'Dancer',
          sort_order: 1
        },
        {
          id: 3,
          roll_min: 3,
          roll_max: 5,
          result_text: 'Fire-eater',
          sort_order: 2
        }
      ]
    }
  ]

  const mockMultipleTables = [
    mockTables[0],
    {
      id: 2,
      table_name: 'Personality Trait',
      dice_type: 'd8',
      description: null,
      entries: [
        {
          id: 4,
          roll_min: 1,
          roll_max: 1,
          result_text: 'I know a story relevant to almost every situation.',
          sort_order: 0
        }
      ]
    }
  ]

  it('renders table name and dice type', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    expect(wrapper.text()).toContain('Entertainer Routines')
    expect(wrapper.text()).toContain('(d10)')
  })

  it('displays table description when present', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    expect(wrapper.text()).toContain('Choose your performance style')
  })

  it('hides description when null', () => {
    const tableWithoutDescription = [{
      ...mockTables[0],
      description: null
    }]

    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: tableWithoutDescription }
    })

    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('renders table header correctly', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(2)
    expect(headers[0].text()).toContain('Roll')
    expect(headers[1].text()).toContain('Result')
  })

  it('renders all table entries', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('formats single roll correctly', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    const firstRow = wrapper.findAll('tbody tr')[0]
    const rollCell = firstRow.findAll('td')[0]
    expect(rollCell.text()).toBe('1')
  })

  it('formats roll range correctly', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    const thirdRow = wrapper.findAll('tbody tr')[2]
    const rollCell = thirdRow.findAll('td')[0]
    expect(rollCell.text()).toBe('3-5')
  })

  it('renders result text correctly', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    const firstRow = wrapper.findAll('tbody tr')[0]
    const resultCell = firstRow.findAll('td')[1]
    expect(resultCell.text()).toBe('Actor')
  })

  it('handles multiple tables with proper spacing', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockMultipleTables }
    })

    const tables = wrapper.findAll('table')
    expect(tables).toHaveLength(2)

    // Verify both table names appear
    expect(wrapper.text()).toContain('Entertainer Routines')
    expect(wrapper.text()).toContain('Personality Trait')
  })

  it('handles empty tables array gracefully', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: [] }
    })

    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('maintains sort order', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    const rows = wrapper.findAll('tbody tr')
    const results = rows.map(row => row.findAll('td')[1].text())

    expect(results).toEqual(['Actor', 'Dancer', 'Fire-eater'])
  })

  it('component mounts without errors', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mockTables }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('accepts borderColor prop', () => {
    const wrapper = mount(UiAccordionRandomTablesList, {
      props: {
        tables: mockTables,
        borderColor: 'purple-500'
      }
    })

    // Component should accept the prop without error
    expect(wrapper.exists()).toBe(true)
  })

  // NEW TESTS: Pipe-delimited columns
  it('parses pipe-delimited result_text into separate columns', () => {
    const pipeDelimitedTable = [{
      id: 3,
      table_name: 'House Tool Proficiencies',
      dice_type: null,
      description: null,
      entries: [
        {
          id: 10,
          roll_min: null,
          roll_max: null,
          result_text: 'Cannith | Alchemist\'s supplies and tinker\'s tools',
          sort_order: 0
        },
        {
          id: 11,
          roll_min: null,
          roll_max: null,
          result_text: 'Deneith | One gaming set and vehicles (land)',
          sort_order: 1
        }
      ]
    }]

    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: pipeDelimitedTable }
    })

    // Should have 2 columns (no Roll column since roll_min/roll_max are null)
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(2)

    // Check first row has 2 cells with correct content
    const firstRow = wrapper.findAll('tbody tr')[0]
    const cells = firstRow.findAll('td')
    expect(cells).toHaveLength(2)
    expect(cells[0].text()).toBe('Cannith')
    expect(cells[1].text()).toBe('Alchemist\'s supplies and tinker\'s tools')
  })

  it('hides Roll column when all entries have null roll_min/roll_max', () => {
    const noRollsTable = [{
      id: 4,
      table_name: 'Equipment List',
      dice_type: null,
      description: null,
      entries: [
        {
          id: 20,
          roll_min: null,
          roll_max: null,
          result_text: 'Backpack',
          sort_order: 0
        },
        {
          id: 21,
          roll_min: null,
          roll_max: null,
          result_text: 'Bedroll',
          sort_order: 1
        }
      ]
    }]

    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: noRollsTable }
    })

    // Should have only 1 column header (no Roll column)
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(1)
    expect(headers[0].text()).toContain('Result')

    // Rows should have only 1 cell each
    const firstRow = wrapper.findAll('tbody tr')[0]
    expect(firstRow.findAll('td')).toHaveLength(1)
  })

  it('shows Roll column when at least one entry has non-null rolls', () => {
    const mixedRollsTable = [{
      id: 5,
      table_name: 'Mixed Table',
      dice_type: 'd6',
      description: null,
      entries: [
        {
          id: 30,
          roll_min: 1,
          roll_max: 1,
          result_text: 'Option A',
          sort_order: 0
        },
        {
          id: 31,
          roll_min: null,
          roll_max: null,
          result_text: 'Option B',
          sort_order: 1
        }
      ]
    }]

    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: mixedRollsTable }
    })

    // Should have Roll column since first entry has rolls
    const headers = wrapper.findAll('th')
    expect(headers.length).toBeGreaterThan(1)
    expect(headers[0].text()).toContain('Roll')

    // First row should show roll "1"
    const firstRow = wrapper.findAll('tbody tr')[0]
    const rollCell = firstRow.findAll('td')[0]
    expect(rollCell.text()).toBe('1')

    // Second row should show empty roll
    const secondRow = wrapper.findAll('tbody tr')[1]
    const rollCell2 = secondRow.findAll('td')[0]
    expect(rollCell2.text()).toBe('')
  })

  it('handles 3+ pipe-delimited columns correctly', () => {
    const threeColumnTable = [{
      id: 6,
      table_name: 'Spell Info',
      dice_type: null,
      description: null,
      entries: [
        {
          id: 40,
          roll_min: null,
          roll_max: null,
          result_text: 'Fireball | 3rd Level | Evocation',
          sort_order: 0
        },
        {
          id: 41,
          roll_min: null,
          roll_max: null,
          result_text: 'Magic Missile | 1st Level | Evocation',
          sort_order: 1
        }
      ]
    }]

    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: threeColumnTable }
    })

    // Should have 3 column headers
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(3)

    // First row should have 3 cells
    const firstRow = wrapper.findAll('tbody tr')[0]
    const cells = firstRow.findAll('td')
    expect(cells).toHaveLength(3)
    expect(cells[0].text()).toBe('Fireball')
    expect(cells[1].text()).toBe('3rd Level')
    expect(cells[2].text()).toBe('Evocation')
  })

  it('hides dice_type when null', () => {
    const noDiceTypeTable = [{
      id: 7,
      table_name: 'Simple List',
      dice_type: null,
      description: null,
      entries: [
        {
          id: 50,
          roll_min: null,
          roll_max: null,
          result_text: 'Item A',
          sort_order: 0
        }
      ]
    }]

    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: noDiceTypeTable }
    })

    // Should show table name but not dice type
    expect(wrapper.text()).toContain('Simple List')
    expect(wrapper.text()).not.toMatch(/\(.*\)/)
  })

  it('handles entries with inconsistent column counts', () => {
    const inconsistentTable = [{
      id: 8,
      table_name: 'Variable Columns',
      dice_type: null,
      description: null,
      entries: [
        {
          id: 60,
          roll_min: null,
          roll_max: null,
          result_text: 'One',
          sort_order: 0
        },
        {
          id: 61,
          roll_min: null,
          roll_max: null,
          result_text: 'Two | Columns',
          sort_order: 1
        },
        {
          id: 62,
          roll_min: null,
          roll_max: null,
          result_text: 'Three | Columns | Here',
          sort_order: 2
        }
      ]
    }]

    const wrapper = mount(UiAccordionRandomTablesList, {
      props: { tables: inconsistentTable }
    })

    // Should create 3 columns (max from any row)
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(3)

    // First row should have 1 cell (spanning behavior handled by browser)
    const firstRow = wrapper.findAll('tbody tr')[0]
    expect(firstRow.findAll('td')[0].text()).toBe('One')

    // Third row should have 3 cells
    const thirdRow = wrapper.findAll('tbody tr')[2]
    const cells = thirdRow.findAll('td')
    expect(cells).toHaveLength(3)
  })
})
