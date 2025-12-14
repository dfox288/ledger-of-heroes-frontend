/**
 * MSW fixtures for encounter monsters
 */
import type { EncounterMonster } from '~/types/dm-screen'

// Monster templates (compendium data)
export const goblinTemplate = {
  name: 'Goblin',
  slug: 'mm:goblin',
  armor_class: 15,
  hit_points: { average: 7, formula: '2d6' },
  speed: { walk: 30, fly: null, swim: null, climb: null },
  challenge_rating: '1/4',
  actions: [
    { name: 'Scimitar', attack_bonus: 4, damage: '1d6+2 slashing', reach: '5 ft.', range: null },
    { name: 'Shortbow', attack_bonus: 4, damage: '1d6+2 piercing', reach: null, range: '80/320 ft.' }
  ]
}

export const bugbearTemplate = {
  name: 'Bugbear',
  slug: 'mm:bugbear',
  armor_class: 16,
  hit_points: { average: 27, formula: '5d8+5' },
  speed: { walk: 30, fly: null, swim: null, climb: null },
  challenge_rating: '1',
  actions: [
    { name: 'Morningstar', attack_bonus: 4, damage: '2d8+2 piercing', reach: '5 ft.', range: null },
    { name: 'Javelin', attack_bonus: 4, damage: '2d6+2 piercing', reach: null, range: '30/120 ft.' }
  ]
}

export const ogreTemplate = {
  name: 'Ogre',
  slug: 'mm:ogre',
  armor_class: 11,
  hit_points: { average: 59, formula: '7d10+21' },
  speed: { walk: 40, fly: null, swim: null, climb: null },
  challenge_rating: '2',
  actions: [
    { name: 'Greatclub', attack_bonus: 6, damage: '2d8+4 bludgeoning', reach: '5 ft.', range: null },
    { name: 'Javelin', attack_bonus: 6, damage: '2d6+4 piercing', reach: null, range: '30/120 ft.' }
  ]
}

// Encounter monster instances
export const mockEncounterMonsters: EncounterMonster[] = [
  {
    id: 1,
    monster_id: 42,
    label: 'Goblin 1',
    current_hp: 7,
    max_hp: 7,
    monster: goblinTemplate
  },
  {
    id: 2,
    monster_id: 42,
    label: 'Goblin 2',
    current_hp: 5,
    max_hp: 7,
    monster: goblinTemplate
  },
  {
    id: 3,
    monster_id: 55,
    label: 'Bugbear Chief',
    current_hp: 27,
    max_hp: 27,
    monster: bugbearTemplate
  }
]

// Factory for creating new monster instances
let nextMonsterId = 100

export function createEncounterMonster(
  monsterId: number,
  template: typeof goblinTemplate,
  label: string
): EncounterMonster {
  return {
    id: nextMonsterId++,
    monster_id: monsterId,
    label,
    current_hp: template.hit_points.average,
    max_hp: template.hit_points.average,
    monster: template
  }
}

export function resetMonsterId(): void {
  nextMonsterId = 100
}
