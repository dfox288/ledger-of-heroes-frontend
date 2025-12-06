/**
 * D&D-themed word dictionaries for generating memorable character slugs.
 * Used with unique-names-generator to create URLs like "arcane-phoenix-m7k2"
 */

/**
 * Evocative adjectives that suggest character traits without being prescriptive.
 * Deliberately avoids class/race-specific terms.
 */
export const dndAdjectives: string[] = [
  // Mystical
  'arcane', 'astral', 'celestial', 'eldritch', 'ethereal', 'mystic', 'occult', 'primal',
  // Heroic qualities
  'bold', 'brave', 'cunning', 'dauntless', 'fearless', 'gallant', 'noble', 'valiant',
  // Dark/mysterious
  'cryptic', 'dark', 'hidden', 'shadow', 'silent', 'veiled', 'twilight', 'midnight',
  // Elemental
  'blazing', 'frozen', 'golden', 'iron', 'silver', 'storm', 'thunder', 'verdant',
  // Ancient/legendary
  'ancient', 'elder', 'forgotten', 'legendary', 'lost', 'mythic', 'timeless', 'fabled',
  // Nature
  'feral', 'wild', 'savage', 'untamed', 'spectral', 'wandering', 'roaming', 'restless'
]

/**
 * Fantasy nouns that evoke adventure and heroism.
 * Deliberately generic enough to fit any character concept.
 */
export const dndNouns: string[] = [
  // Creatures
  'dragon', 'falcon', 'griffin', 'hawk', 'phoenix', 'raven', 'serpent', 'wolf', 'wyrm',
  // Adventurer types
  'herald', 'nomad', 'pilgrim', 'seeker', 'wanderer', 'warden', 'sentinel', 'guardian',
  // Objects of power
  'blade', 'crown', 'ember', 'flame', 'jewel', 'rune', 'sigil', 'star', 'thorn',
  // Knowledge/magic
  'chronicle', 'codex', 'grimoire', 'oracle', 'prophecy', 'riddle', 'sage', 'scroll',
  // Places/nature
  'grove', 'haven', 'hollow', 'peak', 'shore', 'vale', 'veil', 'wilds'
]

// Type for unique-names-generator compatibility
export type Dictionary = string[]
