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

const backgrounds = [
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

    let filtered = backgrounds
    if (filter) {
      const sourceMatch = filter.match(/sources\.code IN \[([^\]]+)\]/)
      if (sourceMatch) {
        const allowedSources = sourceMatch[1].split(',').map(s => s.trim().replace(/"/g, ''))
        filtered = backgrounds.filter(b =>
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
    const bg = backgrounds.find(b => b.slug === params.slug || b.id === Number(params.slug))
    if (bg) {
      return HttpResponse.json({ data: bg })
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
