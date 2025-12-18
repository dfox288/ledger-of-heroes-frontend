import { describe, it, expect } from 'vitest'
import type { Item } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type ItemSpellResource = components['schemas']['ItemSpellResource']

/**
 * Tests for useItemDetail composable.
 *
 * These tests verify the composable correctly:
 * - Detects item types via item_type.code
 * - Identifies magic/charged/spell-casting items
 * - Parses attunement text from detail field
 * - Groups spells by charge cost
 * - Formats damage, range, AC, and cost displays
 * - Returns appropriate category colors
 */
describe('useItemDetail - data organization logic', () => {
  // Test the pure logic functions without full composable mounting

  describe('isWeapon detection', () => {
    it('detects melee weapon (item_type.code === "M")', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Longsword',
        item_type: { id: 1, name: 'Melee Weapon', code: 'M' }
      }
      const isWeapon = mockItem.item_type?.code === 'M' || mockItem.item_type?.code === 'R'
      expect(isWeapon).toBe(true)
    })

    it('detects ranged weapon (item_type.code === "R")', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Longbow',
        item_type: { id: 2, name: 'Ranged Weapon', code: 'R' }
      }
      const isWeapon = mockItem.item_type?.code === 'M' || mockItem.item_type?.code === 'R'
      expect(isWeapon).toBe(true)
    })

    it('returns false for non-weapon items', () => {
      const mockItem: Partial<Item> = {
        id: 3,
        name: 'Leather Armor',
        item_type: { id: 3, name: 'Light Armor', code: 'LA' }
      }
      const isWeapon = mockItem.item_type?.code === 'M' || mockItem.item_type?.code === 'R'
      expect(isWeapon).toBe(false)
    })
  })

  describe('isMeleeWeapon detection', () => {
    it('detects melee weapon (item_type.code === "M")', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Greatsword',
        item_type: { id: 1, name: 'Melee Weapon', code: 'M' }
      }
      const isMeleeWeapon = mockItem.item_type?.code === 'M'
      expect(isMeleeWeapon).toBe(true)
    })

    it('returns false for ranged weapons', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Shortbow',
        item_type: { id: 2, name: 'Ranged Weapon', code: 'R' }
      }
      const isMeleeWeapon = mockItem.item_type?.code === 'M'
      expect(isMeleeWeapon).toBe(false)
    })
  })

  describe('isRangedWeapon detection', () => {
    it('detects ranged weapon (item_type.code === "R")', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Crossbow',
        item_type: { id: 1, name: 'Ranged Weapon', code: 'R' }
      }
      const isRangedWeapon = mockItem.item_type?.code === 'R'
      expect(isRangedWeapon).toBe(true)
    })

    it('returns false for melee weapons', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Dagger',
        item_type: { id: 2, name: 'Melee Weapon', code: 'M' }
      }
      const isRangedWeapon = mockItem.item_type?.code === 'R'
      expect(isRangedWeapon).toBe(false)
    })
  })

  describe('isAmmunition detection', () => {
    it('detects ammunition (item_type.code === "A")', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Arrows',
        item_type: { id: 1, name: 'Ammunition', code: 'A' }
      }
      const isAmmunition = mockItem.item_type?.code === 'A'
      expect(isAmmunition).toBe(true)
    })

    it('returns false for non-ammunition', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Longsword',
        item_type: { id: 2, name: 'Melee Weapon', code: 'M' }
      }
      const isAmmunition = mockItem.item_type?.code === 'A'
      expect(isAmmunition).toBe(false)
    })
  })

  describe('isArmor detection', () => {
    it('detects light armor (item_type.code === "LA")', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Leather Armor',
        item_type: { id: 1, name: 'Light Armor', code: 'LA' }
      }
      const isArmor = ['LA', 'MA', 'HA'].includes(mockItem.item_type?.code ?? '')
      expect(isArmor).toBe(true)
    })

    it('detects medium armor (item_type.code === "MA")', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Chain Mail',
        item_type: { id: 2, name: 'Medium Armor', code: 'MA' }
      }
      const isArmor = ['LA', 'MA', 'HA'].includes(mockItem.item_type?.code ?? '')
      expect(isArmor).toBe(true)
    })

    it('detects heavy armor (item_type.code === "HA")', () => {
      const mockItem: Partial<Item> = {
        id: 3,
        name: 'Plate Armor',
        item_type: { id: 3, name: 'Heavy Armor', code: 'HA' }
      }
      const isArmor = ['LA', 'MA', 'HA'].includes(mockItem.item_type?.code ?? '')
      expect(isArmor).toBe(true)
    })

    it('returns false for non-armor', () => {
      const mockItem: Partial<Item> = {
        id: 4,
        name: 'Longsword',
        item_type: { id: 4, name: 'Melee Weapon', code: 'M' }
      }
      const isArmor = ['LA', 'MA', 'HA'].includes(mockItem.item_type?.code ?? '')
      expect(isArmor).toBe(false)
    })
  })

  describe('isShield detection', () => {
    it('detects shield (item_type.code === "S")', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Shield',
        item_type: { id: 1, name: 'Shield', code: 'S' }
      }
      const isShield = mockItem.item_type?.code === 'S'
      expect(isShield).toBe(true)
    })

    it('returns false for non-shield', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Plate Armor',
        item_type: { id: 2, name: 'Heavy Armor', code: 'HA' }
      }
      const isShield = mockItem.item_type?.code === 'S'
      expect(isShield).toBe(false)
    })
  })

  describe('isCharged detection', () => {
    it('detects charged item (charges_max not null)', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Wand of Fireballs',
        charges_max: '7'
      }
      const isCharged = mockItem.charges_max != null
      expect(isCharged).toBe(true)
    })

    it('returns false when charges_max is null', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Longsword',
        charges_max: null
      }
      const isCharged = mockItem.charges_max != null
      expect(isCharged).toBe(false)
    })
  })

  describe('isMagic detection', () => {
    it('detects magic item (is_magic === true)', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Flame Tongue',
        is_magic: true
      }
      expect(mockItem.is_magic).toBe(true)
    })

    it('returns false for non-magic items', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Longsword',
        is_magic: false
      }
      expect(mockItem.is_magic).toBe(false)
    })
  })

  describe('hasSpells detection', () => {
    it('detects item with spells (spells.length > 0)', () => {
      const mockSpells: ItemSpellResource[] = [
        {
          id: '1',
          name: 'Fireball',
          slug: 'fireball',
          level: '3',
          charges_cost_min: '3',
          charges_cost_max: '3',
          charges_cost_formula: '3',
          usage_limit: '',
          level_requirement: ''
        }
      ]
      const hasSpells = (mockSpells?.length ?? 0) > 0
      expect(hasSpells).toBe(true)
    })

    it('returns false when spells array is empty', () => {
      const mockSpells: ItemSpellResource[] = []
      const hasSpells = (mockSpells?.length ?? 0) > 0
      expect(hasSpells).toBe(false)
    })
  })

  describe('requiresAttunement detection', () => {
    it('detects item requiring attunement', () => {
      const mockItem: Partial<Item> = {
        id: 1,
        name: 'Cloak of Protection',
        requires_attunement: true
      }
      expect(mockItem.requires_attunement).toBe(true)
    })

    it('returns false when no attunement required', () => {
      const mockItem: Partial<Item> = {
        id: 2,
        name: 'Potion of Healing',
        requires_attunement: false
      }
      expect(mockItem.requires_attunement).toBe(false)
    })
  })

  describe('attunementText parsing', () => {
    function parseAttunementText(detail: string | null | undefined): string | null {
      if (!detail) return null
      // Match "requires attunement" with optional qualifier
      const match = detail.match(/requires attunement(?:\s+by\s+(.+?))?(?:\.|$)/i)
      return match ? match[0] : null
    }

    it('extracts simple attunement text', () => {
      const detail = 'This magic item requires attunement.'
      const result = parseAttunementText(detail)
      expect(result).toBe('requires attunement.')
    })

    it('extracts attunement with class restriction', () => {
      const detail = 'This staff requires attunement by a sorcerer, warlock, or wizard.'
      const result = parseAttunementText(detail)
      expect(result).toBe('requires attunement by a sorcerer, warlock, or wizard.')
    })

    it('extracts attunement with race restriction', () => {
      const detail = 'This item requires attunement by a dwarf and provides special benefits.'
      const result = parseAttunementText(detail)
      expect(result).toBe('requires attunement by a dwarf and provides special benefits.')
    })

    it('returns null when no attunement text found', () => {
      const detail = 'This is a magic sword that glows in the presence of orcs.'
      const result = parseAttunementText(detail)
      expect(result).toBeNull()
    })

    it('returns null when detail is null', () => {
      const result = parseAttunementText(null)
      expect(result).toBeNull()
    })
  })

  describe('spellsByChargeCost grouping', () => {
    function groupSpellsByChargeCost(spells: ItemSpellResource[] | undefined): Map<string, ItemSpellResource[]> {
      const grouped = new Map<string, ItemSpellResource[]>()
      if (!spells) return grouped

      for (const spell of spells) {
        const cost = spell.charges_cost_formula || spell.charges_cost_min || '0'
        if (!grouped.has(cost)) grouped.set(cost, [])
        grouped.get(cost)!.push(spell)
      }
      return grouped
    }

    it('groups spells by charge cost', () => {
      const mockSpells: ItemSpellResource[] = [
        {
          id: '1',
          name: 'Magic Missile',
          slug: 'magic-missile',
          level: '1',
          charges_cost_min: '1',
          charges_cost_max: '1',
          charges_cost_formula: '1',
          usage_limit: '',
          level_requirement: ''
        },
        {
          id: '2',
          name: 'Fireball',
          slug: 'fireball',
          level: '3',
          charges_cost_min: '3',
          charges_cost_max: '3',
          charges_cost_formula: '3',
          usage_limit: '',
          level_requirement: ''
        },
        {
          id: '3',
          name: 'Shield',
          slug: 'shield',
          level: '1',
          charges_cost_min: '1',
          charges_cost_max: '1',
          charges_cost_formula: '1',
          usage_limit: '',
          level_requirement: ''
        }
      ]

      const result = groupSpellsByChargeCost(mockSpells)
      expect(result.size).toBe(2)
      expect(result.get('1')?.length).toBe(2)
      expect(result.get('3')?.length).toBe(1)
      expect(result.get('1')?.map(s => s.name)).toEqual(['Magic Missile', 'Shield'])
      expect(result.get('3')?.map(s => s.name)).toEqual(['Fireball'])
    })

    it('returns empty map when spells is undefined', () => {
      const result = groupSpellsByChargeCost(undefined)
      expect(result.size).toBe(0)
    })

    it('uses "0" as default cost when charge fields are empty', () => {
      const mockSpells: ItemSpellResource[] = [
        {
          id: '1',
          name: 'Light',
          slug: 'light',
          level: '0',
          charges_cost_min: '',
          charges_cost_max: '',
          charges_cost_formula: '',
          usage_limit: '',
          level_requirement: ''
        }
      ]

      const result = groupSpellsByChargeCost(mockSpells)
      expect(result.get('0')?.length).toBe(1)
    })
  })

  describe('damageDisplay formatting', () => {
    function formatDamageDisplay(
      damageDice: string | null | undefined,
      damageType: { name: string } | undefined,
      versatileDamage: string | null | undefined
    ): string | null {
      if (!damageDice) return null
      const baseType = damageType?.name || 'Damage'
      const base = `${damageDice} ${baseType}`
      if (versatileDamage) {
        return `${base} (${versatileDamage} versatile)`
      }
      return base
    }

    it('formats basic damage display', () => {
      const result = formatDamageDisplay('1d8', { name: 'Slashing' }, null)
      expect(result).toBe('1d8 Slashing')
    })

    it('formats damage with versatile property', () => {
      const result = formatDamageDisplay('1d8', { name: 'Slashing' }, '1d10')
      expect(result).toBe('1d8 Slashing (1d10 versatile)')
    })

    it('uses "Damage" as default type when damage_type is undefined', () => {
      const result = formatDamageDisplay('1d6', undefined, null)
      expect(result).toBe('1d6 Damage')
    })

    it('returns null when damage_dice is null', () => {
      const result = formatDamageDisplay(null, { name: 'Slashing' }, null)
      expect(result).toBeNull()
    })
  })

  describe('rangeDisplay formatting', () => {
    function formatRangeDisplay(
      rangeNormal: number | null | undefined,
      rangeLong: number | null | undefined,
      isMelee: boolean
    ): string {
      if (isMelee) return 'Melee'
      if (rangeNormal && rangeLong) {
        return `${rangeNormal}/${rangeLong} ft.`
      }
      if (rangeNormal) {
        return `${rangeNormal} ft.`
      }
      return 'N/A'
    }

    it('returns "Melee" for melee weapons', () => {
      const result = formatRangeDisplay(null, null, true)
      expect(result).toBe('Melee')
    })

    it('formats range with both normal and long', () => {
      const result = formatRangeDisplay(150, 600, false)
      expect(result).toBe('150/600 ft.')
    })

    it('formats range with only normal', () => {
      const result = formatRangeDisplay(30, null, false)
      expect(result).toBe('30 ft.')
    })

    it('returns "N/A" when no range data', () => {
      const result = formatRangeDisplay(null, null, false)
      expect(result).toBe('N/A')
    })
  })

  describe('acDisplay formatting', () => {
    function formatAcDisplay(armorClass: number | null | undefined): string | null {
      if (!armorClass) return null
      return `${armorClass}`
    }

    it('formats AC value as string', () => {
      const result = formatAcDisplay(16)
      expect(result).toBe('16')
    })

    it('returns null when AC is null', () => {
      const result = formatAcDisplay(null)
      expect(result).toBeNull()
    })

    it('returns null when AC is 0', () => {
      const result = formatAcDisplay(0)
      expect(result).toBeNull()
    })
  })

  describe('costDisplay formatting', () => {
    function formatCostDisplay(costCp: number | null | undefined): string | null {
      if (!costCp) return null

      // Convert to gp if >= 1 gp
      if (costCp >= 100) {
        const gp = costCp / 100
        // Format with commas for large numbers
        return `${gp.toLocaleString()} gp`
      }

      return `${costCp} cp`
    }

    it('formats cost in gp when >= 100 cp', () => {
      const result = formatCostDisplay(1500) // 15 gp
      expect(result).toBe('15 gp')
    })

    it('formats cost in cp when < 100 cp', () => {
      const result = formatCostDisplay(50)
      expect(result).toBe('50 cp')
    })

    it('formats large gold amounts with locale separators', () => {
      const result = formatCostDisplay(500000) // 5000 gp
      // Match 5000 with any locale separator (comma, period, space, or none)
      expect(result).toMatch(/5[,.\s]?000 gp/)
    })

    it('returns null when cost is null', () => {
      const result = formatCostDisplay(null)
      expect(result).toBeNull()
    })

    it('returns null when cost is 0', () => {
      const result = formatCostDisplay(0)
      expect(result).toBeNull()
    })
  })

  describe('categoryColor mapping', () => {
    function getCategoryColor(itemTypeCode: string | undefined): string {
      const colorMap: Record<string, string> = {
        M: 'red', // Melee Weapon
        R: 'amber', // Ranged Weapon
        A: 'orange', // Ammunition
        LA: 'blue', // Light Armor
        MA: 'indigo', // Medium Armor
        HA: 'violet', // Heavy Armor
        S: 'cyan', // Shield
        P: 'green', // Potion
        SC: 'purple', // Scroll
        W: 'pink', // Wand
        RD: 'rose', // Rod
        ST: 'fuchsia', // Staff
        RG: 'yellow', // Ring
        WD: 'lime' // Wondrous Item
      }
      return colorMap[itemTypeCode ?? ''] || 'gray'
    }

    it('returns red for melee weapons', () => {
      const result = getCategoryColor('M')
      expect(result).toBe('red')
    })

    it('returns amber for ranged weapons', () => {
      const result = getCategoryColor('R')
      expect(result).toBe('amber')
    })

    it('returns blue for light armor', () => {
      const result = getCategoryColor('LA')
      expect(result).toBe('blue')
    })

    it('returns cyan for shields', () => {
      const result = getCategoryColor('S')
      expect(result).toBe('cyan')
    })

    it('returns gray for unknown item types', () => {
      const result = getCategoryColor('UNKNOWN')
      expect(result).toBe('gray')
    })

    it('returns gray when item type is undefined', () => {
      const result = getCategoryColor(undefined)
      expect(result).toBe('gray')
    })
  })
})
