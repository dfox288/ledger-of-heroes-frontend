import { describe, it, expect } from 'vitest'
import {
  getValidSlots,
  getDefaultSlot,
  needsSlotPicker,
  guessSlotFromName,
  BODY_SLOTS
} from '~/utils/equipmentSlots'

describe('equipmentSlots', () => {
  describe('getValidSlots', () => {
    it('returns armor slot for armor types', () => {
      expect(getValidSlots('Light Armor')).toEqual(['armor'])
      expect(getValidSlots('Medium Armor')).toEqual(['armor'])
      expect(getValidSlots('Heavy Armor')).toEqual(['armor'])
    })

    it('returns off_hand for shield', () => {
      expect(getValidSlots('Shield')).toEqual(['off_hand'])
    })

    it('returns main_hand and off_hand for melee weapon', () => {
      expect(getValidSlots('Melee Weapon')).toEqual(['main_hand', 'off_hand'])
    })

    it('returns main_hand only for ranged weapon', () => {
      expect(getValidSlots('Ranged Weapon')).toEqual(['main_hand'])
    })

    it('returns ring slots for ring', () => {
      expect(getValidSlots('Ring')).toEqual(['ring_1', 'ring_2'])
    })

    it('returns body slots for wondrous item', () => {
      expect(getValidSlots('Wondrous Item')).toEqual(BODY_SLOTS)
    })

    it('returns empty array for non-equippable items', () => {
      expect(getValidSlots('Potion')).toEqual([])
      expect(getValidSlots('Scroll')).toEqual([])
      expect(getValidSlots('Adventuring Gear')).toEqual([])
    })
  })

  describe('getDefaultSlot', () => {
    it('returns armor for armor types', () => {
      expect(getDefaultSlot('Light Armor')).toBe('armor')
    })

    it('returns main_hand for weapons', () => {
      expect(getDefaultSlot('Melee Weapon')).toBe('main_hand')
      expect(getDefaultSlot('Ranged Weapon')).toBe('main_hand')
    })

    it('returns ring_1 for ring', () => {
      expect(getDefaultSlot('Ring')).toBe('ring_1')
    })

    it('returns null for wondrous item', () => {
      expect(getDefaultSlot('Wondrous Item')).toBeNull()
    })
  })

  describe('needsSlotPicker', () => {
    it('returns false for single-slot items', () => {
      expect(needsSlotPicker('Light Armor')).toBe(false)
      expect(needsSlotPicker('Shield')).toBe(false)
    })

    it('returns true for wondrous item', () => {
      expect(needsSlotPicker('Wondrous Item')).toBe(true)
    })

    it('returns true for ring (user chooses slot)', () => {
      expect(needsSlotPicker('Ring')).toBe(true)
    })
  })

  describe('guessSlotFromName', () => {
    it('guesses feet for boot items', () => {
      expect(guessSlotFromName('Boots of Speed')).toBe('feet')
      expect(guessSlotFromName('Winged Boots')).toBe('feet')
    })

    it('guesses cloak for cloak items', () => {
      expect(guessSlotFromName('Cloak of Elvenkind')).toBe('cloak')
      expect(guessSlotFromName('Cape of the Mountebank')).toBe('cloak')
    })

    it('guesses belt for belt items', () => {
      expect(guessSlotFromName('Belt of Giant Strength')).toBe('belt')
      expect(guessSlotFromName('Girdle of Femininity')).toBe('belt')
    })

    it('guesses head for helm items', () => {
      expect(guessSlotFromName('Helm of Brilliance')).toBe('head')
      expect(guessSlotFromName('Circlet of Blasting')).toBe('head')
      expect(guessSlotFromName('Hat of Disguise')).toBe('head')
    })

    it('guesses neck for amulet items', () => {
      expect(guessSlotFromName('Amulet of Health')).toBe('neck')
      expect(guessSlotFromName('Necklace of Fireballs')).toBe('neck')
      expect(guessSlotFromName('Periapt of Proof against Poison')).toBe('neck')
    })

    it('guesses hands for glove items', () => {
      expect(guessSlotFromName('Gloves of Missile Snaring')).toBe('hands')
      expect(guessSlotFromName('Gauntlets of Ogre Power')).toBe('hands')
      expect(guessSlotFromName('Bracers of Defense')).toBe('hands')
    })

    it('guesses clothes for robe items', () => {
      expect(guessSlotFromName('Robe of Eyes')).toBe('clothes')
      expect(guessSlotFromName('Robes of the Archmagi')).toBe('clothes')
    })

    it('returns null for unknown items', () => {
      expect(guessSlotFromName('Bag of Holding')).toBeNull()
      expect(guessSlotFromName('Wand of Magic Missiles')).toBeNull()
    })
  })
})
