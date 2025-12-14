import { describe, it, expect } from 'vitest'
import {
  getSlotsFromBackend,
  getDefaultSlotFromBackend,
  needsSlotPickerFromBackend,
  guessSlotFromName
} from '~/utils/equipmentSlots'

describe('equipmentSlots', () => {
  describe('getSlotsFromBackend', () => {
    it('returns armor slot for ARMOR equipment_slot', () => {
      expect(getSlotsFromBackend('ARMOR')).toEqual(['armor'])
    })

    it('returns off_hand for SHIELD equipment_slot', () => {
      expect(getSlotsFromBackend('SHIELD')).toEqual(['off_hand'])
    })

    it('returns main_hand and off_hand for HAND/WEAPON equipment_slot', () => {
      expect(getSlotsFromBackend('HAND')).toEqual(['main_hand', 'off_hand'])
      expect(getSlotsFromBackend('WEAPON')).toEqual(['main_hand', 'off_hand'])
    })

    it('returns ring slots for RING equipment_slot', () => {
      expect(getSlotsFromBackend('RING')).toEqual(['ring_1', 'ring_2'])
    })

    it('returns body slots correctly', () => {
      expect(getSlotsFromBackend('HEAD')).toEqual(['head'])
      expect(getSlotsFromBackend('NECK')).toEqual(['neck'])
      expect(getSlotsFromBackend('CLOAK')).toEqual(['cloak'])
      expect(getSlotsFromBackend('BELT')).toEqual(['belt'])
      expect(getSlotsFromBackend('HANDS')).toEqual(['hands'])
      expect(getSlotsFromBackend('FEET')).toEqual(['feet'])
    })

    it('handles aliases', () => {
      expect(getSlotsFromBackend('GLOVES')).toEqual(['hands'])
      expect(getSlotsFromBackend('BOOTS')).toEqual(['feet'])
      expect(getSlotsFromBackend('HELMET')).toEqual(['head'])
      expect(getSlotsFromBackend('AMULET')).toEqual(['neck'])
    })

    it('returns empty array for null/undefined equipment_slot', () => {
      expect(getSlotsFromBackend(null)).toEqual([])
      expect(getSlotsFromBackend(undefined)).toEqual([])
    })

    it('returns empty array for unknown equipment_slot', () => {
      expect(getSlotsFromBackend('UNKNOWN')).toEqual([])
    })

    it('is case insensitive', () => {
      expect(getSlotsFromBackend('armor')).toEqual(['armor'])
      expect(getSlotsFromBackend('Armor')).toEqual(['armor'])
      expect(getSlotsFromBackend('ARMOR')).toEqual(['armor'])
    })
  })

  describe('getDefaultSlotFromBackend', () => {
    it('returns the slot for single-slot equipment_slots', () => {
      expect(getDefaultSlotFromBackend('ARMOR')).toBe('armor')
      expect(getDefaultSlotFromBackend('HEAD')).toBe('head')
      expect(getDefaultSlotFromBackend('CLOAK')).toBe('cloak')
      expect(getDefaultSlotFromBackend('SHIELD')).toBe('off_hand')
    })

    it('returns null for multi-slot equipment_slots (RING, WEAPON, HAND)', () => {
      expect(getDefaultSlotFromBackend('RING')).toBeNull()
      expect(getDefaultSlotFromBackend('WEAPON')).toBeNull()
      expect(getDefaultSlotFromBackend('HAND')).toBeNull()
    })

    it('returns null for null/undefined equipment_slot', () => {
      expect(getDefaultSlotFromBackend(null)).toBeNull()
      expect(getDefaultSlotFromBackend(undefined)).toBeNull()
    })
  })

  describe('needsSlotPickerFromBackend', () => {
    it('returns false for single-slot equipment_slots', () => {
      expect(needsSlotPickerFromBackend('ARMOR')).toBe(false)
      expect(needsSlotPickerFromBackend('SHIELD')).toBe(false)
      expect(needsSlotPickerFromBackend('HEAD')).toBe(false)
      expect(needsSlotPickerFromBackend('CLOAK')).toBe(false)
    })

    it('returns true for multi-slot equipment_slots', () => {
      expect(needsSlotPickerFromBackend('RING')).toBe(true)
      expect(needsSlotPickerFromBackend('WEAPON')).toBe(true)
      expect(needsSlotPickerFromBackend('HAND')).toBe(true)
    })

    it('returns false for null/undefined equipment_slot', () => {
      expect(needsSlotPickerFromBackend(null)).toBe(false)
      expect(needsSlotPickerFromBackend(undefined)).toBe(false)
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
