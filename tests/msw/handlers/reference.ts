/**
 * Reference Data API Handlers
 *
 * MSW handlers for reference/lookup endpoints (races, classes, sources, etc.)
 */

import { http, HttpResponse } from 'msw'

const API_BASE = '/api'

// Mock reference data
const sources = [
  { id: 1, code: 'PHB', name: 'Player\'s Handbook', category: 'Core Rulebooks', publication_year: 2014 },
  { id: 2, code: 'DMG', name: 'Dungeon Master\'s Guide', category: 'Core Rulebooks', publication_year: 2014 },
  { id: 3, code: 'XGE', name: 'Xanathar\'s Guide to Everything', category: 'Expansion', publication_year: 2017 },
  { id: 4, code: 'TCE', name: 'Tasha\'s Cauldron of Everything', category: 'Expansion', publication_year: 2020 }
]

const races = [
  {
    id: 1,
    name: 'Human',
    slug: 'phb:human',
    speed: 30,
    size: { id: 1, name: 'Medium', code: 'M' },
    ability_bonuses: [
      { ability_score: { id: 1, code: 'STR', name: 'Strength' }, bonus: 1 },
      { ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, bonus: 1 },
      { ability_score: { id: 3, code: 'CON', name: 'Constitution' }, bonus: 1 },
      { ability_score: { id: 4, code: 'INT', name: 'Intelligence' }, bonus: 1 },
      { ability_score: { id: 5, code: 'WIS', name: 'Wisdom' }, bonus: 1 },
      { ability_score: { id: 6, code: 'CHA', name: 'Charisma' }, bonus: 1 }
    ],
    sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
  },
  {
    id: 2,
    name: 'Elf',
    slug: 'phb:elf',
    speed: 30,
    size: { id: 1, name: 'Medium', code: 'M' },
    ability_bonuses: [
      { ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, bonus: 2 }
    ],
    has_subraces: true,
    sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
  }
]

const classes = [
  {
    id: 1,
    name: 'Fighter',
    slug: 'phb:fighter',
    hit_die: 10,
    primary_ability: { id: 1, code: 'STR', name: 'Strength' },
    spellcasting_ability: null,
    subclass_level: 3,
    starting_wealth: { dice_count: 5, dice_type: 10, multiplier: 10, average: 125 },
    sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
  },
  {
    id: 2,
    name: 'Wizard',
    slug: 'phb:wizard',
    hit_die: 6,
    primary_ability: { id: 4, code: 'INT', name: 'Intelligence' },
    spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
    subclass_level: 2,
    starting_wealth: { dice_count: 4, dice_type: 4, multiplier: 10, average: 100 },
    sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
  }
]

// Background list items (minimal data for list pages)
const backgroundListItems = [
  {
    id: 1,
    name: 'Acolyte',
    slug: 'phb:acolyte',
    feature_name: 'Shelter of the Faithful',
    sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
  },
  {
    id: 2,
    name: 'Soldier',
    slug: 'phb:soldier',
    feature_name: 'Military Rank',
    sources: [{ code: 'PHB', name: 'Player\'s Handbook' }]
  }
]

// Full background detail (for detail pages)
const backgroundDetails: Record<string, object> = {
  'phb:acolyte': {
    id: 1,
    name: 'Acolyte',
    slug: 'phb:acolyte',
    description: 'You have spent your life as a acolyte. This background provides unique skills and experiences.',
    feature_name: 'Acolyte Expertise',
    feature_description: 'As a acolyte, you have a special ability that sets you apart. You can call upon your expertise to gain advantage in relevant situations.',
    proficiencies: [
      { id: 1, proficiency_type: 'skill', skill: { id: 1, name: 'Investigation', ability_score: { id: 4, code: 'INT', name: 'Intelligence' } } },
      { id: 2, proficiency_type: 'skill', skill: { id: 2, name: 'Insight', ability_score: { id: 5, code: 'WIS', name: 'Wisdom' } } }
    ],
    languages: [],
    choices: [
      { id: 1, choice_type: 'language', quantity: 2, constraint: null, description: null, options: [] }
    ],
    equipment: [
      { id: 1, item_id: 100, quantity: 1, item: { name: 'Holy Symbol' } }
    ],
    starting_gold: 15,
    traits: [
      { id: 1, name: 'Description', category: null, text: 'You have spent your life as a acolyte. This background provides unique skills and experiences.' },
      { id: 2, name: 'Suggested Characteristics', category: 'Personality Traits', text: 'Use these tables to create your character personality.', data_table: { dice: 'd8', rows: [{ roll: 1, text: 'I am always calm, no matter the situation.' }, { roll: 2, text: 'I love a good mystery or puzzle.' }] } },
      { id: 3, name: 'Suggested Characteristics', category: 'Ideals', text: null, data_table: { dice: 'd6', rows: [{ roll: 1, text: 'Knowledge. Learning is the greatest pursuit. (Neutral)' }, { roll: 2, text: 'Justice. The guilty must be punished. (Lawful)' }] } },
      { id: 4, name: 'Suggested Characteristics', category: 'Bonds', text: null, data_table: { dice: 'd6', rows: [{ roll: 1, text: 'I have a mentor who taught me everything.' }] } },
      { id: 5, name: 'Suggested Characteristics', category: 'Flaws', text: null, data_table: { dice: 'd6', rows: [{ roll: 1, text: 'I am easily distracted by shiny objects.' }] } }
    ],
    sources: [{ code: 'PHB', name: 'Player\'s Handbook' }],
    tags: []
  }
}

export const referenceHandlers = [
  // Sources
  http.get(`${API_BASE}/sources`, () => {
    return HttpResponse.json({ data: sources })
  }),

  // Races
  http.get(`${API_BASE}/races`, ({ request }) => {
    const url = new URL(request.url)
    const filter = url.searchParams.get('filter')

    let filtered = races
    if (filter) {
      // Simple source filtering
      const sourceMatch = filter.match(/sources\.code IN \[([^\]]+)\]/)
      if (sourceMatch) {
        const allowedSources = sourceMatch[1].split(',').map(s => s.trim().replace(/"/g, ''))
        filtered = races.filter(r =>
          r.sources.some(s => allowedSources.includes(s.code))
        )
      }
    }

    return HttpResponse.json({
      data: filtered,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: filtered.length }
    })
  }),

  http.get(`${API_BASE}/races/:slug`, ({ params }) => {
    const race = races.find(r => r.slug === params.slug || r.id === Number(params.slug))
    if (race) {
      return HttpResponse.json({ data: race })
    }
    return HttpResponse.json({ error: 'Race not found' }, { status: 404 })
  }),

  // Classes
  http.get(`${API_BASE}/classes`, ({ request }) => {
    const url = new URL(request.url)
    const filter = url.searchParams.get('filter')

    let filtered = classes
    if (filter) {
      const sourceMatch = filter.match(/sources\.code IN \[([^\]]+)\]/)
      if (sourceMatch) {
        const allowedSources = sourceMatch[1].split(',').map(s => s.trim().replace(/"/g, ''))
        filtered = classes.filter(c =>
          c.sources.some(s => allowedSources.includes(s.code))
        )
      }
    }

    return HttpResponse.json({
      data: filtered,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: filtered.length }
    })
  }),

  http.get(`${API_BASE}/classes/:slug`, ({ params }) => {
    const cls = classes.find(c => c.slug === params.slug || c.id === Number(params.slug))
    if (cls) {
      return HttpResponse.json({ data: cls })
    }
    return HttpResponse.json({ error: 'Class not found' }, { status: 404 })
  }),

  // Backgrounds
  http.get(`${API_BASE}/backgrounds`, ({ request }) => {
    const url = new URL(request.url)
    const filter = url.searchParams.get('filter')

    let filtered = backgroundListItems
    if (filter) {
      const sourceMatch = filter.match(/sources\.code IN \[([^\]]+)\]/)
      if (sourceMatch) {
        const allowedSources = sourceMatch[1].split(',').map(s => s.trim().replace(/"/g, ''))
        filtered = backgroundListItems.filter(b =>
          b.sources.some(s => allowedSources.includes(s.code))
        )
      }
    }

    return HttpResponse.json({
      data: filtered,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: filtered.length }
    })
  }),

  http.get(`${API_BASE}/backgrounds/:slug`, ({ params }) => {
    const slug = params.slug as string
    // Support both 'acolyte' and 'phb:acolyte' formats
    const normalizedSlug = slug.includes(':') ? slug : `phb:${slug}`

    // Try full detail first, fall back to list item
    const detail = backgroundDetails[normalizedSlug]
    if (detail) {
      return HttpResponse.json({ data: detail })
    }
    const listItem = backgroundListItems.find(b => b.slug === normalizedSlug || b.id === Number(slug))
    if (listItem) {
      return HttpResponse.json({ data: listItem })
    }
    return HttpResponse.json({ error: 'Background not found' }, { status: 404 })
  }),

  // Ability Scores (for ability score step)
  http.get(`${API_BASE}/lookups/ability-scores`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, code: 'STR', name: 'Strength', slug: 'strength' },
        { id: 2, code: 'DEX', name: 'Dexterity', slug: 'dexterity' },
        { id: 3, code: 'CON', name: 'Constitution', slug: 'constitution' },
        { id: 4, code: 'INT', name: 'Intelligence', slug: 'intelligence' },
        { id: 5, code: 'WIS', name: 'Wisdom', slug: 'wisdom' },
        { id: 6, code: 'CHA', name: 'Charisma', slug: 'charisma' }
      ]
    })
  })
]
