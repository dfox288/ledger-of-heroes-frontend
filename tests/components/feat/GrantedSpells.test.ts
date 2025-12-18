import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeatGrantedSpells from '~/components/feat/GrantedSpells.vue'
import type { components } from '~/types/api/generated'

type EntitySpellResource = components['schemas']['EntitySpellResource']
import type { EntityChoice } from '~/types'

const mockSpells: EntitySpellResource[] = [
  {
    id: 1,
    spell_id: 42,
    spell: {
      id: 42,
      slug: 'detect-magic',
      name: 'Detect Magic',
      level: 1,
      school: {
        id: 1,
        code: 'D',
        name: 'Divination',
        slug: 'divination',
        description: null
      },
      casting_time: '1 action',
      casting_time_type: 'action',
      range: 'Self',
      components: 'V, S',
      material_components: null,
      material_cost_gp: '0',
      material_consumed: 'false',
      duration: 'Concentration, up to 10 minutes',
      needs_concentration: true,
      is_ritual: true,
      description: 'For the duration, you sense the presence of magic within 30 feet of you.',
      higher_levels: null,
      requires_verbal: true,
      requires_somatic: true,
      requires_material: false,
      area_of_effect: '30-foot radius sphere'
    },
    ability_score_id: null,
    ability_score: undefined,
    level_requirement: null,
    usage_limit: null,
    is_cantrip: false,
    charges_cost_min: null,
    charges_cost_max: null,
    charges_cost_formula: null
  },
  {
    id: 2,
    spell_id: 99,
    spell: {
      id: 99,
      slug: 'light',
      name: 'Light',
      level: 0,
      school: {
        id: 2,
        code: 'EV',
        name: 'Evocation',
        slug: 'evocation',
        description: null
      },
      casting_time: '1 action',
      casting_time_type: 'action',
      range: 'Touch',
      components: 'V, M',
      material_components: 'a firefly or phosphorescent moss',
      material_cost_gp: '0',
      material_consumed: 'false',
      duration: '1 hour',
      needs_concentration: false,
      is_ritual: false,
      description: 'You touch one object that is no larger than 10 feet in any dimension.',
      higher_levels: null,
      requires_verbal: true,
      requires_somatic: false,
      requires_material: true,
      area_of_effect: 'Touch'
    },
    ability_score_id: null,
    ability_score: undefined,
    level_requirement: null,
    usage_limit: null,
    is_cantrip: true,
    charges_cost_min: null,
    charges_cost_max: null,
    charges_cost_formula: null
  },
  {
    id: 3,
    spell_id: 88,
    spell: {
      id: 88,
      slug: 'shield',
      name: 'Shield',
      level: 1,
      school: {
        id: 3,
        code: 'A',
        name: 'Abjuration',
        slug: 'abjuration',
        description: null
      },
      casting_time: '1 reaction',
      casting_time_type: 'reaction',
      range: 'Self',
      components: 'V, S',
      material_components: null,
      material_cost_gp: '0',
      material_consumed: 'false',
      duration: '1 round',
      needs_concentration: false,
      is_ritual: false,
      description: 'An invisible barrier of magical force appears and protects you.',
      higher_levels: null,
      requires_verbal: true,
      requires_somatic: true,
      requires_material: false,
      area_of_effect: 'Self'
    },
    ability_score_id: null,
    ability_score: undefined,
    level_requirement: null,
    usage_limit: null,
    is_cantrip: false,
    charges_cost_min: null,
    charges_cost_max: null,
    charges_cost_formula: null
  }
]

describe('FeatGrantedSpells', () => {
  it('renders section when spells are provided', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: mockSpells }
    })

    expect(wrapper.text()).toContain('Granted Spells')
  })

  it('does not render when spells array is empty', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [] }
    })

    expect(wrapper.text()).not.toContain('Granted Spells')
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders all spell cards', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: mockSpells }
    })

    expect(wrapper.text()).toContain('Detect Magic')
    expect(wrapper.text()).toContain('Light')
    expect(wrapper.text()).toContain('Shield')
  })

  it('displays spell level correctly for cantrips', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [mockSpells[1]] } // Light (cantrip)
    })

    expect(wrapper.text()).toContain('Cantrip')
  })

  it('displays spell level correctly for 1st level spells', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [mockSpells[0]] } // Detect Magic (1st level)
    })

    expect(wrapper.text()).toContain('1st Level')
  })

  it('displays spell school name', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: mockSpells }
    })

    expect(wrapper.text()).toContain('Divination')
    expect(wrapper.text()).toContain('Evocation')
    expect(wrapper.text()).toContain('Abjuration')
  })

  it('displays casting time and range', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [mockSpells[0]] } // Detect Magic
    })

    expect(wrapper.text()).toContain('1 action')
    expect(wrapper.text()).toContain('Self')
  })

  it('displays concentration badge when spell needs concentration', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [mockSpells[0]] } // Detect Magic (concentration)
    })

    expect(wrapper.text()).toContain('Concentration')
  })

  it('displays ritual badge when spell is ritual', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [mockSpells[0]] } // Detect Magic (ritual)
    })

    expect(wrapper.text()).toContain('Ritual')
  })

  it('renders background image div for spells', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [mockSpells[0]] }
    })

    // Check for background image style
    const bgDiv = wrapper.find('.bg-cover')
    expect(bgDiv.exists()).toBe(true)
  })

  it('creates links to spell detail pages', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [mockSpells[0]] }
    })

    // UCard with :to prop creates a link
    expect(wrapper.html()).toContain('/spells/detect-magic')
  })

  it('uses responsive grid layout (max 2 columns)', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: mockSpells }
    })

    const grid = wrapper.find('.grid')
    expect(grid.exists()).toBe(true)
    expect(grid.classes()).toContain('grid-cols-1')
    expect(grid.classes()).toContain('md:grid-cols-2')
    // Max 2 columns for constrained hero section width
    expect(grid.classes()).not.toContain('lg:grid-cols-3')
  })

  it('handles spells without school gracefully', async () => {
    const spellWithoutSchool: EntitySpellResource = {
      ...mockSpells[0],
      spell: {
        ...mockSpells[0].spell!,
        school: undefined
      }
    }

    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: [spellWithoutSchool] }
    })

    expect(wrapper.text()).toContain('Detect Magic')
    // Should not crash, school section should be hidden
  })

  it('displays spell icon in header', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: { spells: mockSpells }
    })

    // Check for icon (UIcon component renders as i-heroicons-sparkles class)
    expect(wrapper.html()).toContain('i-heroicons-sparkles')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Spell Choices Tests (Fey Touched, Shadow Touched, etc.)
// ─────────────────────────────────────────────────────────────────────────────

// Mock data mimicking Fey Touched feat structure
const mockMistyStepSpell: EntitySpellResource = {
  id: 100,
  spell_id: 233,
  spell: {
    id: 233,
    slug: 'misty-step',
    name: 'Misty Step',
    level: 2,
    school: {
      id: 2,
      code: 'C',
      name: 'Conjuration',
      slug: 'conjuration',
      description: null
    },
    casting_time: '1 bonus action',
    casting_time_type: 'bonus_action',
    range: 'Self',
    components: 'V',
    material_components: null,
    material_cost_gp: null,
    material_consumed: null,
    duration: 'Instantaneous',
    needs_concentration: false,
    is_ritual: false,
    description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet.',
    higher_levels: null,
    requires_verbal: true,
    requires_somatic: false,
    requires_material: false,
    area_of_effect: null
  },
  ability_score_id: null,
  ability_score: undefined,
  level_requirement: null,
  usage_limit: 'long_rest',
  is_cantrip: false,
  charges_cost_min: null,
  charges_cost_max: null,
  charges_cost_formula: null
}

// Choice placeholders (is_choice: true, spell: null)
const mockChoiceSpells: EntitySpellResource[] = [
  {
    id: 101,
    spell_id: null,
    spell: undefined,
    ability_score_id: null,
    ability_score: undefined,
    level_requirement: null,
    usage_limit: null,
    is_cantrip: false,
    charges_cost_min: null,
    charges_cost_max: null,
    charges_cost_formula: null,
    is_choice: true,
    choice_count: 1,
    choice_group: 'spell_choice_1',
    max_level: 1,
    school: {
      id: 3,
      code: 'D',
      name: 'Divination',
      slug: 'divination',
      description: null
    }
  },
  {
    id: 102,
    spell_id: null,
    spell: undefined,
    ability_score_id: null,
    ability_score: undefined,
    level_requirement: null,
    usage_limit: null,
    is_cantrip: false,
    charges_cost_min: null,
    charges_cost_max: null,
    charges_cost_formula: null,
    is_choice: true,
    choice_count: 1,
    choice_group: 'spell_choice_1',
    max_level: 1,
    school: {
      id: 4,
      code: 'EN',
      name: 'Enchantment',
      slug: 'enchantment',
      description: null
    }
  }
]

// Aggregated spell choices (using EntityChoice structure)
const mockSpellChoices: EntityChoice[] = [
  {
    id: 1,
    choice_type: 'spell',
    quantity: 1,
    constraint: null,
    description: null,
    options: [],
    spell_max_level: 1,
    spell_school_slug: 'phb:divination'
  } as EntityChoice
]

describe('FeatGrantedSpells - Spell Choices', () => {
  it('filters out is_choice spells from spell cards', async () => {
    // Pass both fixed spell and choice placeholders
    const allSpells = [mockMistyStepSpell, ...mockChoiceSpells]

    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: {
        spells: allSpells,
        spellChoices: mockSpellChoices
      }
    })

    // Should show the fixed spell
    expect(wrapper.text()).toContain('Misty Step')

    // Should NOT show choice placeholder entries as spell cards
    // (the individual choice entries have school.name but no spell.name)
    const spellLinks = wrapper.findAll('a[href^="/spells/"]')
    expect(spellLinks).toHaveLength(1) // Only Misty Step
    expect(spellLinks[0].attributes('href')).toBe('/spells/misty-step')
  })

  it('displays spell choice card when spellChoices are provided', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: {
        spells: [mockMistyStepSpell, ...mockChoiceSpells],
        spellChoices: mockSpellChoices
      }
    })

    // Should show the spell choice card
    expect(wrapper.text()).toContain('Choose')
    expect(wrapper.text()).toContain('1st-level')
  })

  it('displays school restriction in spell choice card', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: {
        spells: [mockMistyStepSpell, ...mockChoiceSpells],
        spellChoices: mockSpellChoices
      }
    })

    // Should show the school restriction (from spell_school_slug)
    expect(wrapper.text()).toContain('divination')
  })

  it('does not render spell choice section when spellChoices is empty', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: {
        spells: [mockMistyStepSpell],
        spellChoices: []
      }
    })

    // Should show fixed spell but no "Choose" text
    expect(wrapper.text()).toContain('Misty Step')
    expect(wrapper.text()).not.toContain('Choose')
  })

  it('handles multiple spell choices (Magic Initiate pattern)', async () => {
    const multipleChoices: EntityChoice[] = [
      {
        id: 10,
        choice_type: 'spell',
        quantity: 2,
        constraint: null,
        description: null,
        options: [],
        spell_max_level: 0, // cantrip
        spell_list_slug: 'phb:wizard'
      } as EntityChoice,
      {
        id: 11,
        choice_type: 'spell',
        quantity: 1,
        constraint: null,
        description: null,
        options: [],
        spell_max_level: 1,
        spell_list_slug: 'phb:wizard'
      } as EntityChoice
    ]

    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: {
        spells: [],
        spellChoices: multipleChoices
      }
    })

    // Should show both choice cards
    expect(wrapper.text()).toContain('cantrip')
    expect(wrapper.text()).toContain('1st-level')
  })

  it('displays spell list restriction when spell_list_slug is set', async () => {
    const classRestrictedChoice: EntityChoice[] = [
      {
        id: 20,
        choice_type: 'spell',
        quantity: 1,
        constraint: null,
        description: null,
        options: [],
        spell_max_level: 1,
        spell_list_slug: 'phb:wizard'
      } as EntityChoice
    ]

    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: {
        spells: [],
        spellChoices: classRestrictedChoice
      }
    })

    expect(wrapper.text()).toContain('wizard')
  })

  it('renders component when only spellChoices provided (no fixed spells)', async () => {
    const wrapper = await mountSuspended(FeatGrantedSpells, {
      props: {
        spells: mockChoiceSpells, // Only choice entries
        spellChoices: mockSpellChoices
      }
    })

    // Component should still render with the section header
    expect(wrapper.text()).toContain('Granted Spells')
    // Should show the choice card
    expect(wrapper.text()).toContain('Choose')
  })
})
