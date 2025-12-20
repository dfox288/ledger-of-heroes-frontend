// tests/utils/inventory.test.ts
/**
 * Tests for inventory utility functions
 * @see Issue #775 - Extract duplicate inventory utility functions
 */
import { describe, it, expect } from 'vitest'
import {
  getEquipmentDisplayName,
  getLocationDisplayText,
  getEquipmentIcon,
  type EquipmentLocation
} from '~/utils/inventory'
import type { CharacterEquipment } from '~/types/character'

describe('inventory utilities', () => {
  describe('getEquipmentDisplayName', () => {
    it('returns custom_name when present', () => {
      const equipment = {
        custom_name: 'My Magic Sword',
        item: { name: 'Longsword' }
      } as CharacterEquipment

      expect(getEquipmentDisplayName(equipment)).toBe('My Magic Sword')
    })

    it('returns item.name when no custom_name', () => {
      const equipment = {
        custom_name: null,
        item: { name: 'Longsword' }
      } as CharacterEquipment

      expect(getEquipmentDisplayName(equipment)).toBe('Longsword')
    })

    it('returns "Unknown Item" when item is null', () => {
      const equipment = {
        custom_name: null,
        item: null
      } as CharacterEquipment

      expect(getEquipmentDisplayName(equipment)).toBe('Unknown Item')
    })

    it('returns "Unknown Item" when item.name is undefined', () => {
      const equipment = {
        custom_name: null,
        item: {}
      } as CharacterEquipment

      expect(getEquipmentDisplayName(equipment)).toBe('Unknown Item')
    })

    it('prefers custom_name over item.name', () => {
      const equipment = {
        custom_name: 'Flametongue',
        item: { name: 'Longsword' }
      } as CharacterEquipment

      expect(getEquipmentDisplayName(equipment)).toBe('Flametongue')
    })
  })

  describe('getLocationDisplayText', () => {
    it('returns null for null location', () => {
      expect(getLocationDisplayText(null)).toBe(null)
    })

    it('returns null for undefined location', () => {
      expect(getLocationDisplayText(undefined)).toBe(null)
    })

    it('returns "Main Hand" for main_hand', () => {
      expect(getLocationDisplayText('main_hand')).toBe('Main Hand')
    })

    it('returns "Off Hand" for off_hand', () => {
      expect(getLocationDisplayText('off_hand')).toBe('Off Hand')
    })

    it('returns "Head" for head', () => {
      expect(getLocationDisplayText('head')).toBe('Head')
    })

    it('returns "Neck" for neck', () => {
      expect(getLocationDisplayText('neck')).toBe('Neck')
    })

    it('returns "Cloak" for cloak', () => {
      expect(getLocationDisplayText('cloak')).toBe('Cloak')
    })

    it('returns "Armor" for armor', () => {
      expect(getLocationDisplayText('armor')).toBe('Armor')
    })

    it('returns "Belt" for belt', () => {
      expect(getLocationDisplayText('belt')).toBe('Belt')
    })

    it('returns "Hands" for hands', () => {
      expect(getLocationDisplayText('hands')).toBe('Hands')
    })

    it('returns "Ring" for ring_1', () => {
      expect(getLocationDisplayText('ring_1')).toBe('Ring')
    })

    it('returns "Ring" for ring_2', () => {
      expect(getLocationDisplayText('ring_2')).toBe('Ring')
    })

    it('returns "Feet" for feet', () => {
      expect(getLocationDisplayText('feet')).toBe('Feet')
    })

    it('returns null for unknown location', () => {
      expect(getLocationDisplayText('unknown_slot' as EquipmentLocation)).toBe(null)
    })
  })

  describe('getEquipmentIcon', () => {
    it('returns cube icon for null equipment', () => {
      expect(getEquipmentIcon(null)).toBe('i-heroicons-cube')
    })

    it('returns bolt icon for weapons', () => {
      const equipment = { item: { item_type: 'Weapon' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-bolt')
    })

    it('returns bolt icon for melee weapons', () => {
      const equipment = { item: { item_type: 'Melee Weapon' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-bolt')
    })

    it('returns bolt icon for ranged weapons', () => {
      const equipment = { item: { item_type: 'Ranged Weapon' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-bolt')
    })

    it('returns shield icon for armor', () => {
      const equipment = { item: { item_type: 'Heavy Armor' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-shield-check')
    })

    it('returns shield icon for shields', () => {
      const equipment = { item: { item_type: 'Shield' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-shield-check')
    })

    it('returns beaker icon for potions', () => {
      const equipment = { item: { item_type: 'Potion' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-beaker')
    })

    it('returns document icon for scrolls', () => {
      const equipment = { item: { item_type: 'Scroll' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-document-text')
    })

    it('returns cube icon for unknown item types', () => {
      const equipment = { item: { item_type: 'Adventuring Gear' } } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-cube')
    })

    it('returns cube icon when item is null', () => {
      const equipment = { item: null } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-cube')
    })

    it('returns cube icon when item_type is undefined', () => {
      const equipment = { item: {} } as CharacterEquipment
      expect(getEquipmentIcon(equipment)).toBe('i-heroicons-cube')
    })
  })
})
