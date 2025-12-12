/**
 * Base Classes Fixture for Multiclass Testing
 *
 * Provides class data with multiclass_requirements for testing
 * the StepClassSelection component.
 */

export interface MulticlassRequirement {
  ability: { id: number; code: string; name: string }
  ability_name: string
  minimum_score: number
  is_alternative: boolean
}

export interface MulticlassRequirements {
  type: 'and' | 'or' | null
  requirements: MulticlassRequirement[]
}

export interface BaseClass {
  id: number
  slug: string
  name: string
  hit_die: number
  is_base_class: true
  multiclass_requirements: MulticlassRequirements | null
}

// PHB Base Classes with multiclass requirements
export const baseClasses: BaseClass[] = [
  {
    id: 1,
    slug: 'phb:barbarian',
    name: 'Barbarian',
    hit_die: 12,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 1, code: 'STR', name: 'Strength' },
        ability_name: 'Strength 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  },
  {
    id: 2,
    slug: 'phb:bard',
    name: 'Bard',
    hit_die: 8,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 6, code: 'CHA', name: 'Charisma' },
        ability_name: 'Charisma 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  },
  {
    id: 3,
    slug: 'phb:cleric',
    name: 'Cleric',
    hit_die: 8,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        ability_name: 'Wisdom 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  },
  {
    id: 4,
    slug: 'phb:druid',
    name: 'Druid',
    hit_die: 8,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 5, code: 'WIS', name: 'Wisdom' },
        ability_name: 'Wisdom 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  },
  {
    id: 5,
    slug: 'phb:fighter',
    name: 'Fighter',
    hit_die: 10,
    is_base_class: true,
    multiclass_requirements: {
      type: 'or',
      requirements: [
        {
          ability: { id: 1, code: 'STR', name: 'Strength' },
          ability_name: 'Strength 13',
          minimum_score: 13,
          is_alternative: true
        },
        {
          ability: { id: 2, code: 'DEX', name: 'Dexterity' },
          ability_name: 'Dexterity 13',
          minimum_score: 13,
          is_alternative: true
        }
      ]
    }
  },
  {
    id: 6,
    slug: 'phb:monk',
    name: 'Monk',
    hit_die: 8,
    is_base_class: true,
    multiclass_requirements: {
      type: 'and',
      requirements: [
        {
          ability: { id: 2, code: 'DEX', name: 'Dexterity' },
          ability_name: 'Dexterity 13',
          minimum_score: 13,
          is_alternative: false
        },
        {
          ability: { id: 5, code: 'WIS', name: 'Wisdom' },
          ability_name: 'Wisdom 13',
          minimum_score: 13,
          is_alternative: false
        }
      ]
    }
  },
  {
    id: 7,
    slug: 'phb:paladin',
    name: 'Paladin',
    hit_die: 10,
    is_base_class: true,
    multiclass_requirements: {
      type: 'and',
      requirements: [
        {
          ability: { id: 1, code: 'STR', name: 'Strength' },
          ability_name: 'Strength 13',
          minimum_score: 13,
          is_alternative: false
        },
        {
          ability: { id: 6, code: 'CHA', name: 'Charisma' },
          ability_name: 'Charisma 13',
          minimum_score: 13,
          is_alternative: false
        }
      ]
    }
  },
  {
    id: 8,
    slug: 'phb:ranger',
    name: 'Ranger',
    hit_die: 10,
    is_base_class: true,
    multiclass_requirements: {
      type: 'and',
      requirements: [
        {
          ability: { id: 2, code: 'DEX', name: 'Dexterity' },
          ability_name: 'Dexterity 13',
          minimum_score: 13,
          is_alternative: false
        },
        {
          ability: { id: 5, code: 'WIS', name: 'Wisdom' },
          ability_name: 'Wisdom 13',
          minimum_score: 13,
          is_alternative: false
        }
      ]
    }
  },
  {
    id: 9,
    slug: 'phb:rogue',
    name: 'Rogue',
    hit_die: 8,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 2, code: 'DEX', name: 'Dexterity' },
        ability_name: 'Dexterity 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  },
  {
    id: 10,
    slug: 'phb:sorcerer',
    name: 'Sorcerer',
    hit_die: 6,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 6, code: 'CHA', name: 'Charisma' },
        ability_name: 'Charisma 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  },
  {
    id: 11,
    slug: 'phb:warlock',
    name: 'Warlock',
    hit_die: 8,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 6, code: 'CHA', name: 'Charisma' },
        ability_name: 'Charisma 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  },
  {
    id: 12,
    slug: 'phb:wizard',
    name: 'Wizard',
    hit_die: 6,
    is_base_class: true,
    multiclass_requirements: {
      type: null,
      requirements: [{
        ability: { id: 4, code: 'INT', name: 'Intelligence' },
        ability_name: 'Intelligence 13',
        minimum_score: 13,
        is_alternative: false
      }]
    }
  }
]

// Helper to get a class by slug
export function getClassBySlug(slug: string): BaseClass | undefined {
  return baseClasses.find(c => c.slug === slug)
}

// Helper to get Fighter class (commonly used in tests)
export const fighterClass = baseClasses.find(c => c.slug === 'phb:fighter')!
