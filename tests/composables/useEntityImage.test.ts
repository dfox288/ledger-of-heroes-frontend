import { describe, it, expect, vi } from 'vitest'
import { useEntityImage } from '~/composables/useEntityImage'

// Mock runtime config
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      imageProvider: 'stability-ai'
    }
  })
}))

describe('useEntityImage', () => {
  describe('getImagePath', () => {
    const { getImagePath } = useEntityImage()

    // Main entities (6 tests)
    it('returns correct path for races', () => {
      const result = getImagePath('races', 'dragonborn', 256)
      expect(result).toBe('/images/generated/conversions/256/races/stability-ai/dragonborn.webp')
    })

    it('returns correct path for classes', () => {
      const result = getImagePath('classes', 'wizard', 256)
      expect(result).toBe('/images/generated/conversions/256/classes/stability-ai/wizard.webp')
    })

    it('returns correct path for backgrounds', () => {
      const result = getImagePath('backgrounds', 'acolyte', 256)
      expect(result).toBe('/images/generated/conversions/256/backgrounds/stability-ai/acolyte.webp')
    })

    it('returns correct path for feats', () => {
      const result = getImagePath('feats', 'alert', 256)
      expect(result).toBe('/images/generated/conversions/256/feats/stability-ai/alert.webp')
    })

    it('returns correct path for spells', () => {
      const result = getImagePath('spells', 'fireball', 256)
      expect(result).toBe('/images/generated/conversions/256/spells/stability-ai/fireball.webp')
    })

    it('returns correct path for items', () => {
      const result = getImagePath('items', 'longsword', 256)
      expect(result).toBe('/images/generated/conversions/256/items/stability-ai/longsword.webp')
    })

    // Reference entities with conversion (5 tests)
    it('converts ability-scores to ability_scores', () => {
      const result = getImagePath('ability-scores', 'strength', 256)
      expect(result).toBe('/images/generated/conversions/256/ability_scores/stability-ai/strength.webp')
    })

    it('converts spell-schools to spell_schools', () => {
      const result = getImagePath('spell-schools', 'evocation', 256)
      expect(result).toBe('/images/generated/conversions/256/spell_schools/stability-ai/evocation.webp')
    })

    it('converts item-types to item_types', () => {
      const result = getImagePath('item-types', 'weapon', 256)
      expect(result).toBe('/images/generated/conversions/256/item_types/stability-ai/weapon.webp')
    })

    it('converts proficiency-types to proficiency_types', () => {
      const result = getImagePath('proficiency-types', 'armor', 256)
      expect(result).toBe('/images/generated/conversions/256/proficiency_types/stability-ai/armor.webp')
    })

    it('converts damage-types to damage_types', () => {
      const result = getImagePath('damage-types', 'fire', 256)
      expect(result).toBe('/images/generated/conversions/256/damage_types/stability-ai/fire.webp')
    })

    // Reference entities with direct match (5 tests)
    it('uses direct match for conditions', () => {
      const result = getImagePath('conditions', 'blinded', 256)
      expect(result).toBe('/images/generated/conversions/256/conditions/stability-ai/blinded.webp')
    })

    it('uses direct match for languages', () => {
      const result = getImagePath('languages', 'common', 256)
      expect(result).toBe('/images/generated/conversions/256/languages/stability-ai/common.webp')
    })

    it('uses direct match for sizes', () => {
      const result = getImagePath('sizes', 'medium', 256)
      expect(result).toBe('/images/generated/conversions/256/sizes/stability-ai/medium.webp')
    })

    it('uses direct match for skills', () => {
      const result = getImagePath('skills', 'acrobatics', 256)
      expect(result).toBe('/images/generated/conversions/256/skills/stability-ai/acrobatics.webp')
    })

    it('uses direct match for sources', () => {
      const result = getImagePath('sources', 'phb', 256)
      expect(result).toBe('/images/generated/conversions/256/sources/stability-ai/phb.webp')
    })

    // Size variants (3 tests)
    it('returns 256px conversion path by default', () => {
      const result = getImagePath('skills', 'acrobatics')
      expect(result).toBe('/images/generated/conversions/256/skills/stability-ai/acrobatics.webp')
    })

    it('returns 512px conversion path when specified', () => {
      const result = getImagePath('skills', 'acrobatics', 512)
      expect(result).toBe('/images/generated/conversions/512/skills/stability-ai/acrobatics.webp')
    })

    it('returns original path when specified', () => {
      const result = getImagePath('skills', 'acrobatics', 'original')
      expect(result).toBe('/images/generated/skills/stability-ai/acrobatics.webp')
    })

    // Validation (3 tests)
    it('returns null for empty slug', () => {
      const result = getImagePath('skills', '', 256)
      expect(result).toBeNull()
    })

    it('returns null for whitespace-only slug', () => {
      const result = getImagePath('skills', '   ', 256)
      expect(result).toBeNull()
    })

    it('handles slug with hyphens correctly', () => {
      const result = getImagePath('skills', 'animal-handling', 256)
      expect(result).toBe('/images/generated/conversions/256/skills/stability-ai/animal-handling.webp')
    })

    // Namespaced slug conversion (colon → double-dash)
    describe('namespaced slugs', () => {
      it('converts colon to double-dash for spells', () => {
        const result = getImagePath('spells', 'phb:fireball', 256)
        expect(result).toBe('/images/generated/conversions/256/spells/stability-ai/phb--fireball.webp')
      })

      it('converts colon to double-dash for classes', () => {
        const result = getImagePath('classes', 'phb:wizard', 256)
        expect(result).toBe('/images/generated/conversions/256/classes/stability-ai/phb--wizard.webp')
      })

      it('converts colon to double-dash for races', () => {
        const result = getImagePath('races', 'phb:dragonborn', 256)
        expect(result).toBe('/images/generated/conversions/256/races/stability-ai/phb--dragonborn.webp')
      })

      it('converts colon to double-dash for items', () => {
        const result = getImagePath('items', 'dmg:vorpal-sword', 512)
        expect(result).toBe('/images/generated/conversions/512/items/stability-ai/dmg--vorpal-sword.webp')
      })

      it('converts colon to double-dash for original size', () => {
        const result = getImagePath('monsters', 'mm:ancient-red-dragon', 'original')
        expect(result).toBe('/images/generated/monsters/stability-ai/mm--ancient-red-dragon.webp')
      })

      it('handles slugs without namespace (backwards compatible)', () => {
        const result = getImagePath('skills', 'acrobatics', 256)
        expect(result).toBe('/images/generated/conversions/256/skills/stability-ai/acrobatics.webp')
      })

      it('handles multiple hyphens with namespace', () => {
        const result = getImagePath('feats', 'phb:war-caster', 256)
        expect(result).toBe('/images/generated/conversions/256/feats/stability-ai/phb--war-caster.webp')
      })
    })
  })
})
