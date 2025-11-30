import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemSpellsTable from '~/components/item/ItemSpellsTable.vue'
import type { components } from '~/types/api/generated'

type ItemSpellResource = components['schemas']['ItemSpellResource']

/**
 * Test suite for ItemSpellsTable component
 *
 * This component displays spells granted by an item in a table format,
 * grouped by charge cost.
 */
describe('ItemSpellsTable', () => {
  // Helper to create mock spell
  function createMockSpell(overrides: Partial<ItemSpellResource> = {}): ItemSpellResource {
    return {
      id: '1',
      name: 'Fireball',
      slug: 'fireball',
      level: '3',
      charges_cost_min: '3',
      charges_cost_max: '3',
      charges_cost_formula: '3',
      usage_limit: '',
      level_requirement: '',
      ...overrides
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Basic Rendering
  // ─────────────────────────────────────────────────────────────────────────────

  it('renders table with header row', async () => {
    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['2', [createMockSpell()]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const table = wrapper.find('table')
    expect(table.exists()).toBe(true)

    const headers = wrapper.findAll('th')
    expect(headers.length).toBe(2)
    expect(headers[0].text()).toBe('Cost')
    expect(headers[1].text()).toBe('Spells')
  })

  it('renders spells grouped by charge cost', async () => {
    const spell1 = createMockSpell({ id: '1', name: 'Magic Missile', charges_cost_formula: '1' })
    const spell2 = createMockSpell({ id: '2', name: 'Fireball', charges_cost_formula: '3' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['1', [spell1]],
      ['3', [spell2]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(2)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Cost Display
  // ─────────────────────────────────────────────────────────────────────────────

  it('shows "Free" for spells with zero charge cost', async () => {
    const spell = createMockSpell({ charges_cost_min: '0', charges_cost_max: '0', charges_cost_formula: '0' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['0', [spell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const costCell = wrapper.find('tbody tr td:first-child')
    expect(costCell.text()).toBe('Free')
  })

  it('shows numeric cost for non-zero charges', async () => {
    const spell = createMockSpell({ charges_cost_formula: '5' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['5', [spell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const costCell = wrapper.find('tbody tr td:first-child')
    expect(costCell.text()).toBe('5')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Spell Display
  // ─────────────────────────────────────────────────────────────────────────────

  it('renders spell names', async () => {
    const spell = createMockSpell({ name: 'Arcane Lock' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['2', [spell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    expect(wrapper.text()).toContain('Arcane Lock')
  })

  it('renders spell names as links to spell detail pages', async () => {
    const spell = createMockSpell({ name: 'Fireball', slug: 'fireball' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['3', [spell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/spells/fireball')
    expect(link.text()).toContain('Fireball')
  })

  it('shows spell level in parentheses when cast at higher level', async () => {
    // Spell is normally level 3, but cast at level 7
    const spell = createMockSpell({
      name: 'Fireball',
      slug: 'fireball',
      level: '3',
      charges_cost_formula: '7'
    })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['7', [spell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const spellsCell = wrapper.find('tbody tr td:nth-child(2)')
    expect(spellsCell.text()).toContain('Fireball')
    expect(spellsCell.text()).toContain('(7th)')
  })

  it('does not show level indicator when spell is cast at normal level', async () => {
    // Spell is level 3 and costs 3 charges (normal level)
    const spell = createMockSpell({
      name: 'Fireball',
      slug: 'fireball',
      level: '3',
      charges_cost_formula: '3'
    })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['3', [spell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const spellsCell = wrapper.find('tbody tr td:nth-child(2)')
    expect(spellsCell.text()).toContain('Fireball')
    expect(spellsCell.text()).not.toContain('(3rd)')
  })

  it('displays multiple spells in same charge group as comma-separated list', async () => {
    const spell1 = createMockSpell({ id: '1', name: 'Arcane Lock', slug: 'arcane-lock', charges_cost_formula: '2' })
    const spell2 = createMockSpell({ id: '2', name: 'Invisibility', slug: 'invisibility', charges_cost_formula: '2' })
    const spell3 = createMockSpell({ id: '3', name: 'Knock', slug: 'knock', charges_cost_formula: '2' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['2', [spell1, spell2, spell3]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const spellsCell = wrapper.find('tbody tr td:nth-child(2)')
    const cellText = spellsCell.text()

    // All spells should appear
    expect(cellText).toContain('Arcane Lock')
    expect(cellText).toContain('Invisibility')
    expect(cellText).toContain('Knock')

    // Should have commas separating them (check for comma between first two)
    expect(cellText).toMatch(/Arcane Lock.*,.*Invisibility/)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Edge Cases
  // ─────────────────────────────────────────────────────────────────────────────

  it('handles empty spells map', async () => {
    const spellsByChargeCost = new Map<string, ItemSpellResource[]>()

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    // Should render table but with no data rows
    const table = wrapper.find('table')
    expect(table.exists()).toBe(true)

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(0)
  })

  it('handles single spell group', async () => {
    const spell = createMockSpell({ name: 'Fireball', charges_cost_formula: '3' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['3', [spell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(1)
    expect(wrapper.text()).toContain('Fireball')
  })

  it('handles multiple spell groups', async () => {
    const freeSpell = createMockSpell({ id: '1', name: 'Light', charges_cost_formula: '0' })
    const cheapSpell = createMockSpell({ id: '2', name: 'Magic Missile', charges_cost_formula: '1' })
    const expensiveSpell = createMockSpell({ id: '3', name: 'Fireball', charges_cost_formula: '3' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['0', [freeSpell]],
      ['1', [cheapSpell]],
      ['3', [expensiveSpell]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3)

    // Check all spells are present
    expect(wrapper.text()).toContain('Light')
    expect(wrapper.text()).toContain('Magic Missile')
    expect(wrapper.text()).toContain('Fireball')
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  it('displays groups in order (Free first, then ascending by cost)', async () => {
    const spell1 = createMockSpell({ id: '1', name: 'Fireball', charges_cost_formula: '3' })
    const spell2 = createMockSpell({ id: '2', name: 'Magic Missile', charges_cost_formula: '1' })
    const spell3 = createMockSpell({ id: '3', name: 'Light', charges_cost_formula: '0' })
    const spell4 = createMockSpell({ id: '4', name: 'Telekinesis', charges_cost_formula: '5' })

    const spellsByChargeCost = new Map<string, ItemSpellResource[]>([
      ['3', [spell1]],
      ['1', [spell2]],
      ['0', [spell3]],
      ['5', [spell4]]
    ])

    const wrapper = await mountSuspended(ItemSpellsTable, {
      props: { spellsByChargeCost }
    })

    const costCells = wrapper.findAll('tbody tr td:first-child')
    expect(costCells.length).toBe(4)

    // Should be in order: Free (0), 1, 3, 5
    expect(costCells[0].text()).toBe('Free')
    expect(costCells[1].text()).toBe('1')
    expect(costCells[2].text()).toBe('3')
    expect(costCells[3].text()).toBe('5')
  })
})
