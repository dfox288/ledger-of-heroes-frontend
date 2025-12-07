import type { Item } from '~/types/api/entities'
import type { components } from '~/types/api/generated'

type ItemSpellResource = components['schemas']['ItemSpellResource']

/**
 * Composable for item detail pages.
 *
 * Provides data fetching and type-adaptive computed properties that:
 * - Detect item types (weapon, armor, shield, etc.) via item_type.code
 * - Identify magic/charged/spell-casting items
 * - Parse attunement requirements from detail field
 * - Group spells by charge cost for display
 * - Format damage, range, AC, and cost displays
 * - Return category-appropriate colors
 *
 * @example
 * ```typescript
 * const slug = computed(() => route.params.slug as string)
 * const {
 *   entity,
 *   pending,
 *   error,
 *   isWeapon,
 *   isMeleeWeapon,
 *   isRangedWeapon,
 *   isAmmunition,
 *   isArmor,
 *   isShield,
 *   isCharged,
 *   isMagic,
 *   hasSpells,
 *   requiresAttunement,
 *   attunementText,
 *   spellsByChargeCost,
 *   damageDisplay,
 *   rangeDisplay,
 *   acDisplay,
 *   costDisplay,
 *   categoryColor
 * } = useItemDetail(slug)
 * ```
 */
export function useItemDetail(slug: Ref<string>) {
  // Fetch item data with caching and SEO
  // Pass the reactive ref directly so useEntityDetail can watch for changes
  const { data: entity, loading: pending, error, refresh } = useEntityDetail<Item>({
    slug,
    endpoint: '/items',
    cacheKey: 'item',
    seo: {
      titleTemplate: (name: string) => `${name} - D&D 5e Item`,
      descriptionExtractor: (item: unknown) => {
        const i = item as Item
        return i.detail?.substring(0, 160) ?? ''
      },
      fallbackTitle: 'Item - D&D 5e Compendium'
    }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Type Detection
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Is this item a weapon? (melee or ranged)
   */
  const isWeapon = computed(() => {
    const code = entity.value?.item_type?.code
    return code === 'M' || code === 'R'
  })

  /**
   * Is this a melee weapon?
   */
  const isMeleeWeapon = computed(() => entity.value?.item_type?.code === 'M')

  /**
   * Is this a ranged weapon?
   */
  const isRangedWeapon = computed(() => entity.value?.item_type?.code === 'R')

  /**
   * Is this ammunition?
   */
  const isAmmunition = computed(() => entity.value?.item_type?.code === 'A')

  /**
   * Is this armor? (light, medium, or heavy)
   */
  const isArmor = computed(() => {
    const code = entity.value?.item_type?.code
    return code === 'LA' || code === 'MA' || code === 'HA'
  })

  /**
   * Is this a shield?
   */
  const isShield = computed(() => entity.value?.item_type?.code === 'S')

  // ─────────────────────────────────────────────────────────────────────────────
  // Magic Item Properties
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Does this item have charges?
   */
  const isCharged = computed(() => entity.value?.charges_max != null)

  /**
   * Is this a magic item?
   */
  const isMagic = computed(() => entity.value?.is_magic === true)

  /**
   * Does this item cast spells?
   */
  const hasSpells = computed(() => (entity.value?.spells?.length ?? 0) > 0)

  /**
   * Does this item require attunement?
   */
  const requiresAttunement = computed(() => entity.value?.requires_attunement === true)

  /**
   * Attunement text extracted from detail field
   * e.g., "requires attunement by a sorcerer, warlock, or wizard"
   */
  const attunementText = computed(() => {
    const detail = entity.value?.detail
    if (!detail) return null

    // Match "requires attunement" with optional qualifier
    const match = detail.match(/requires attunement(?:\s+by\s+(.+?))?(?:\.|$)/i)
    return match ? match[0] : null
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Spell Grouping
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Spells grouped by charge cost for display
   * e.g., Map { '1' => [spell1, spell2], '3' => [spell3] }
   */
  const spellsByChargeCost = computed(() => {
    const grouped = new Map<string, ItemSpellResource[]>()
    const spells = entity.value?.spells
    if (!spells) return grouped

    for (const spell of spells) {
      const cost = spell.charges_cost_formula || spell.charges_cost_min || '0'
      if (!grouped.has(cost)) grouped.set(cost, [])
      grouped.get(cost)!.push(spell)
    }

    return grouped
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Display Formatting
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Damage display formatted as "1d8 Slashing" or "1d8 Slashing (1d10 versatile)"
   */
  const damageDisplay = computed(() => {
    const damageDice = entity.value?.damage_dice
    if (!damageDice) return null

    const damageType = entity.value?.damage_type?.name || 'Damage'
    const base = `${damageDice} ${damageType}`

    const versatile = entity.value?.versatile_damage
    if (versatile) {
      return `${base} (${versatile} versatile)`
    }

    return base
  })

  /**
   * Range display formatted as "Melee" or "150/600 ft."
   */
  const rangeDisplay = computed(() => {
    if (isMeleeWeapon.value) return 'Melee'

    const normal = entity.value?.range_normal
    const long = entity.value?.range_long

    if (normal && long) {
      return `${normal}/${long} ft.`
    }
    if (normal) {
      return `${normal} ft.`
    }

    return 'N/A'
  })

  /**
   * AC display formatted as string
   */
  const acDisplay = computed(() => {
    const ac = entity.value?.armor_class
    if (!ac) return null
    return `${ac}`
  })

  /**
   * Cost display formatted in gp or cp
   * e.g., "15 gp" or "50 cp" or "5,000 gp"
   */
  const costDisplay = computed(() => {
    const costCp = entity.value?.cost_cp
    if (!costCp) return null

    // Convert to gp if >= 1 gp
    if (costCp >= 100) {
      const gp = costCp / 100
      // Format with commas for large numbers
      return `${gp.toLocaleString()} gp`
    }

    return `${costCp} cp`
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Category Color
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Category color based on item type
   */
  const categoryColor = computed(() => {
    const code = entity.value?.item_type?.code

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

    return colorMap[code ?? ''] || 'gray'
  })

  return {
    // Core
    entity,
    pending,
    error,
    refresh,

    // Type Detection
    isWeapon,
    isMeleeWeapon,
    isRangedWeapon,
    isAmmunition,
    isArmor,
    isShield,

    // Magic Item Properties
    isCharged,
    isMagic,
    hasSpells,
    requiresAttunement,
    attunementText,

    // Spell Grouping
    spellsByChargeCost,

    // Display Formatting
    damageDisplay,
    rangeDisplay,
    acDisplay,
    costDisplay,

    // Category Color
    categoryColor
  }
}
