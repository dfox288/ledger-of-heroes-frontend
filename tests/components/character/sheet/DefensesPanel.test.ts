// tests/components/character/sheet/DefensesPanel.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DefensesPanel from '~/components/character/sheet/DefensesPanel.vue'

const dwarfDefenses = {
  damageResistances: [{ type: 'Poison', condition: null, source: 'Dwarf' }],
  damageImmunities: [],
  damageVulnerabilities: [],
  conditionAdvantages: [{ condition: 'Poisoned', effect: 'advantage', source: 'Dwarf' }],
  conditionImmunities: []
}

const elfDefenses = {
  damageResistances: [],
  damageImmunities: [],
  damageVulnerabilities: [],
  conditionAdvantages: [{ condition: 'Charmed', effect: 'advantage', source: 'Elf' }],
  conditionImmunities: [{ condition: 'Sleep', effect: 'immunity', source: 'Elf' }]
}

const emptyDefenses = {
  damageResistances: [],
  damageImmunities: [],
  damageVulnerabilities: [],
  conditionAdvantages: [],
  conditionImmunities: []
}

const mixedDefenses = {
  damageResistances: [
    { type: 'Fire', condition: null, source: 'Red Dragonborn' },
    { type: 'Cold', condition: 'from nonmagical attacks', source: 'Magic Item' }
  ],
  damageImmunities: [{ type: 'Poison', condition: null, source: 'Monk Feature' }],
  damageVulnerabilities: [{ type: 'Psychic', condition: null, source: 'Cursed' }],
  conditionAdvantages: [{ condition: 'Frightened', effect: 'advantage', source: 'Brave' }],
  conditionImmunities: [{ condition: 'Charmed', effect: 'immunity', source: 'Fey Ancestry' }]
}

const singleCategoryDefenses = {
  damageResistances: [{ type: 'Necrotic', condition: null, source: 'Aasimar' }],
  damageImmunities: [],
  damageVulnerabilities: [],
  conditionAdvantages: [],
  conditionImmunities: []
}

describe('CharacterSheetDefensesPanel', () => {
  it('renders nothing when all arrays are empty', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: emptyDefenses
    })
    expect(wrapper.find('[data-testid="defenses-panel"]').exists()).toBe(false)
  })

  it('displays resistance badges with type and source', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: dwarfDefenses
    })
    expect(wrapper.text()).toContain('Resistances')
    expect(wrapper.text()).toContain('Poison')
    expect(wrapper.text()).toContain('Dwarf')
  })

  it('displays immunity badges in success color', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: mixedDefenses
    })
    const immunityBadges = wrapper.findAll('[data-testid="immunity-badge"]')
    expect(immunityBadges.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Immunities')
    expect(wrapper.text()).toContain('Poison')
  })

  it('displays vulnerability badges in error color', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: mixedDefenses
    })
    const vulnerabilityBadges = wrapper.findAll('[data-testid="vulnerability-badge"]')
    expect(vulnerabilityBadges.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Vulnerabilities')
    expect(wrapper.text()).toContain('Psychic')
  })

  it('appends condition when present', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: mixedDefenses
    })
    // Cold resistance with condition "from nonmagical attacks"
    expect(wrapper.text()).toContain('Cold')
    expect(wrapper.text()).toContain('from nonmagical attacks')
  })

  it('handles character with multiple defense categories', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: mixedDefenses
    })

    // Check all categories are present
    expect(wrapper.text()).toContain('Resistances')
    expect(wrapper.text()).toContain('Immunities')
    expect(wrapper.text()).toContain('Vulnerabilities')
    expect(wrapper.text()).toContain('Save Advantages')
    expect(wrapper.text()).toContain('Condition Immunities')

    // Check specific entries
    expect(wrapper.text()).toContain('Fire')
    expect(wrapper.text()).toContain('Poison')
    expect(wrapper.text()).toContain('Psychic')
    expect(wrapper.text()).toContain('Frightened')
    expect(wrapper.text()).toContain('Charmed')
  })

  it('displays panel with only one populated category', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: singleCategoryDefenses
    })

    // Should show panel
    expect(wrapper.find('[data-testid="defenses-panel"]').exists()).toBe(true)

    // Should show only Resistances category
    expect(wrapper.text()).toContain('Resistances')
    expect(wrapper.text()).toContain('Necrotic')
    expect(wrapper.text()).toContain('Aasimar')

    // Should NOT show other categories
    expect(wrapper.text()).not.toContain('Immunities')
    expect(wrapper.text()).not.toContain('Vulnerabilities')
    expect(wrapper.text()).not.toContain('Save Advantages')
    expect(wrapper.text()).not.toContain('Condition Immunities')
  })

  it('displays condition advantages with "vs" prefix', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: dwarfDefenses
    })
    expect(wrapper.text()).toContain('Save Advantages')
    expect(wrapper.text()).toContain('vs Poisoned')
    expect(wrapper.text()).toContain('Dwarf')
  })

  it('displays condition immunities', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: elfDefenses
    })
    expect(wrapper.text()).toContain('Condition Immunities')
    expect(wrapper.text()).toContain('Sleep')
    expect(wrapper.text()).toContain('Elf')
  })

  it('displays both condition advantages and immunities for elf', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: elfDefenses
    })

    // Should show both categories
    expect(wrapper.text()).toContain('Save Advantages')
    expect(wrapper.text()).toContain('vs Charmed')
    expect(wrapper.text()).toContain('Condition Immunities')
    expect(wrapper.text()).toContain('Sleep')
  })

  it('formats badge text correctly with parentheses for source', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: dwarfDefenses
    })
    // Should be formatted as: "Poison (Dwarf)"
    const text = wrapper.text()
    expect(text).toMatch(/Poison.*\(Dwarf\)/)
  })

  it('formats conditional resistance correctly', async () => {
    const wrapper = await mountSuspended(DefensesPanel, {
      props: mixedDefenses
    })
    // Should be formatted as: "Cold (Magic Item) - from nonmagical attacks"
    const text = wrapper.text()
    expect(text).toMatch(/Cold.*\(Magic Item\).*from nonmagical attacks/)
  })

  it('displays multiple resistances from same source', async () => {
    const defenses = {
      ...emptyDefenses,
      damageResistances: [
        { type: 'Fire', condition: null, source: 'Tiefling' },
        { type: 'Cold', condition: null, source: 'Tiefling' }
      ]
    }
    const wrapper = await mountSuspended(DefensesPanel, {
      props: defenses
    })
    expect(wrapper.text()).toContain('Fire')
    expect(wrapper.text()).toContain('Cold')
    // Both should show Tiefling as source
    const text = wrapper.text()
    expect(text).toMatch(/Fire.*\(Tiefling\)/)
    expect(text).toMatch(/Cold.*\(Tiefling\)/)
  })
})
