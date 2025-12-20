<!-- app/components/character/inventory/ItemDetailModal.vue -->
<script setup lang="ts">
/**
 * Item Detail Modal
 *
 * Read-only modal displaying item details when clicking on an item in the inventory table.
 * Fetches full item data from the API when opened (if item has a slug).
 * Shows item name, type, rarity, stats (weight, value, quantity), description, and properties.
 *
 * Layout inspired by SpellDetailModal for consistency across the app.
 *
 * @see Design: docs/frontend/plans/2025-12-13-inventory-redesign.md
 */

import type { CharacterEquipment, CharacterEquipmentCharges } from '~/types/character'
import { getLocationDisplayText } from '~/utils/inventory'

// Full item data from /items/{slug} endpoint
interface FullItemData {
  name: string
  slug: string
  description?: string
  weight?: string
  item_type?: { name: string }
  armor_class?: number
  damage_dice?: string
  damage_type?: { name: string }
  versatile_damage?: string
  properties?: Array<{ name: string, description?: string }>
  cost_cp?: number
  rarity?: string
  range_normal?: number
  range_long?: number
  requires_attunement?: boolean
  stealth_disadvantage?: boolean
  strength_requirement?: number
}

// Equipment item data uses shared CharacterEquipmentItem type
// @see Issue #776 - Proper typing for nested item data

interface Props {
  item: CharacterEquipment | null
}

const props = defineProps<Props>()

defineEmits<{
  'decrement-charge': []
  'increment-charge': []
}>()

const open = defineModel<boolean>('open', { default: false })

const { apiFetch } = useApi()

// Full item data fetched from API
const fullItemData = ref<FullItemData | null>(null)
const isLoading = ref(false)
const fetchError = ref<string | null>(null)

// Fetch full item data when modal opens
watch(open, async (isOpen) => {
  if (!isOpen || !props.item) {
    fullItemData.value = null
    fetchError.value = null
    return
  }

  // Only fetch if item has a slug (not a custom item)
  const itemSlug = props.item.item_slug || props.item.item?.slug
  if (!itemSlug) {
    fullItemData.value = null
    return
  }

  isLoading.value = true
  fetchError.value = null

  try {
    const response = await apiFetch<{ data: FullItemData }>(`/items/${itemSlug}`)
    fullItemData.value = response.data
  } catch {
    fetchError.value = 'Failed to load item details'
    fullItemData.value = null
  } finally {
    isLoading.value = false
  }
}, { immediate: true })

// Minimal item data from equipment response (now properly typed)
const minimalItemData = computed(() => props.item?.item ?? null)

// Equipment item data (inline from equipment response)
const equipmentItemData = computed(() => props.item?.item ?? null)

// Display name - prefer custom name, then full data, then minimal
const displayName = computed(() => {
  if (!props.item) return ''
  if (props.item.custom_name) return props.item.custom_name
  return fullItemData.value?.name ?? minimalItemData.value?.name ?? 'Unknown Item'
})

// Description - parse JSON if needed
const description = computed(() => {
  if (!props.item) return ''

  // Try custom_description first
  if (props.item.custom_description) {
    // Backend may store JSON like {"source":"background","description":"..."}
    try {
      const parsed = JSON.parse(props.item.custom_description)
      if (typeof parsed === 'object' && parsed.description) {
        return parsed.description
      }
      // If it parsed but has no description field, it's metadata - skip it
      if (typeof parsed === 'object' && parsed.source) {
        return fullItemData.value?.description ?? ''
      }
    } catch {
      // Not JSON, use as-is
      return props.item.custom_description
    }
  }

  return fullItemData.value?.description ?? ''
})

// Weight from full data or minimal
const weight = computed(() => {
  const raw = fullItemData.value?.weight ?? minimalItemData.value?.weight
  if (raw === undefined || raw === null) return null
  // Handle both string and number types
  const num = typeof raw === 'number' ? raw : parseFloat(raw)
  return isNaN(num) ? null : num
})

// Item type - full data has object, minimal has string
const itemType = computed(() => {
  if (fullItemData.value?.item_type?.name) return fullItemData.value.item_type.name
  return minimalItemData.value?.item_type ?? null
})

const rarity = computed(() => fullItemData.value?.rarity ?? null)

// Format cost in gold pieces
const costGp = computed(() => {
  const cp = fullItemData.value?.cost_cp
  if (!cp) return null
  return (cp / 100).toFixed(2).replace(/\.00$/, '')
})

// Combat stats
const damage = computed(() => {
  return equipmentItemData.value?.damage_dice ?? fullItemData.value?.damage_dice ?? minimalItemData.value?.damage_dice ?? null
})
const damageType = computed(() => {
  // Prefer inline equipment data
  if (equipmentItemData.value?.damage_type) {
    return equipmentItemData.value.damage_type
  }
  // Fallback to fetched data
  return fullItemData.value?.damage_type?.name ?? null
})
const versatileDamage = computed(() => {
  return equipmentItemData.value?.versatile_damage ?? fullItemData.value?.versatile_damage ?? null
})
const armorClass = computed(() => fullItemData.value?.armor_class ?? minimalItemData.value?.armor_class ?? null)
// Normalize property to object format
interface PropertyDisplay { name: string, description?: string }
function normalizeProperty(prop: string | { name: string, description?: string }): PropertyDisplay {
  return typeof prop === 'string' ? { name: prop } : prop
}

const properties = computed((): PropertyDisplay[] => {
  // Prefer inline equipment data if it has properties
  const inlineProps = equipmentItemData.value?.properties
  if (inlineProps && inlineProps.length > 0) {
    return inlineProps.map(normalizeProperty)
  }
  // Fallback to fetched data
  return fullItemData.value?.properties ?? []
})
const requiresAttunement = computed(() => fullItemData.value?.requires_attunement ?? minimalItemData.value?.requires_attunement ?? false)
const stealthDisadvantage = computed(() => fullItemData.value?.stealth_disadvantage ?? false)
const strMinimum = computed(() => fullItemData.value?.strength_requirement ?? null)

// Range for ranged weapons
const range = computed(() => {
  // Prefer inline equipment data (new format: object)
  const equipRange = equipmentItemData.value?.range
  if (equipRange) {
    // Use != null to handle long === 0 correctly
    if (equipRange.long != null && equipRange.long > 0) return `${equipRange.normal}/${equipRange.long} ft`
    return `${equipRange.normal} ft`
  }
  // Fallback to fetched data (old format: separate fields)
  const normal = fullItemData.value?.range_normal
  const long = fullItemData.value?.range_long
  if (!normal) return null
  if (long != null && long > 0) return `${normal}/${long} ft`
  return `${normal} ft`
})

// Armor properties (tested but not yet displayed in template)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const armorType = computed(() => equipmentItemData.value?.armor_type ?? null)

const maxDexBonus = computed(() => {
  const bonus = equipmentItemData.value?.max_dex_bonus
  // null means unlimited (light armor), don't display
  if (bonus === null || bonus === undefined) return null
  if (bonus === 0) return 'None'
  return `+${bonus} max`
})

// Magic item properties (tested but not yet displayed in template)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isMagic = computed(() => equipmentItemData.value?.is_magic ?? false)
const magicBonus = computed(() => equipmentItemData.value?.magic_bonus ?? null)

// Charge properties (static display from item data)
const chargesMax = computed(() => equipmentItemData.value?.charges_max ?? null)
const rechargeFormula = computed(() => equipmentItemData.value?.recharge_formula ?? null)
const rechargeTiming = computed(() => equipmentItemData.value?.recharge_timing ?? null)
const hasChargeInfo = computed(() => chargesMax.value !== null)

// Interactive charges (top-level charges object, backend Phase 3)
// Uses CharacterEquipmentCharges type from character.ts
const chargesObject = computed((): CharacterEquipmentCharges | null => props.item?.charges ?? null)

const hasInteractiveCharges = computed(() =>
  chargesObject.value !== null && chargesObject.value.current !== null
)

const currentCharges = computed(() => chargesObject.value?.current ?? null)
const maxChargesFromObject = computed(() => chargesObject.value?.max ?? null)

// Use charges object if available, otherwise fall back to item fields
const displayChargesMax = computed(() => maxChargesFromObject.value ?? chargesMax.value)
const displayRechargeFormula = computed(() => chargesObject.value?.recharge_formula ?? rechargeFormula.value)
const displayRechargeTiming = computed(() => chargesObject.value?.recharge_timing ?? rechargeTiming.value)

// Full damage text with type
const damageText = computed(() => {
  if (!damage.value) return null
  if (damageType.value) return `${damage.value} ${damageType.value}`
  return damage.value
})

// Badge color based on rarity
const rarityColor = computed(() => {
  switch (rarity.value?.toLowerCase()) {
    case 'common': return 'neutral'
    case 'uncommon': return 'success'
    case 'rare': return 'info'
    case 'very rare': return 'primary'
    case 'legendary': return 'warning'
    case 'artifact': return 'error'
    default: return 'neutral'
  }
})

// Location text for equipped items
const locationText = computed(() => {
  if (!props.item?.equipped) return null
  return getLocationDisplayText(props.item.location) ?? props.item.location
})

// Check if this is a custom item (no slug)
const isCustomItem = computed(() => {
  if (!props.item) return false
  const itemSlug = props.item.item_slug || props.item.item?.slug
  return !itemSlug
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="displayName"
  >
    <template #body>
      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center py-8"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-6 h-6 animate-spin text-gray-400"
        />
      </div>

      <!-- Error state -->
      <div
        v-else-if="fetchError"
        class="text-center py-4 text-error"
      >
        {{ fetchError }}
      </div>

      <!-- Content -->
      <div
        v-else-if="item"
        class="space-y-4"
      >
        <!-- Type and Rarity Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge
            v-if="itemType"
            color="item"
            variant="subtle"
            size="md"
          >
            {{ itemType }}
          </UBadge>
          <UBadge
            v-if="rarity"
            :color="rarityColor"
            variant="subtle"
            size="md"
          >
            {{ rarity }}
          </UBadge>
          <UBadge
            v-if="requiresAttunement"
            color="warning"
            variant="subtle"
            size="md"
          >
            Attunement
          </UBadge>
          <UBadge
            v-if="item.equipped"
            color="primary"
            variant="subtle"
            size="md"
          >
            {{ locationText }}
          </UBadge>
          <UBadge
            v-if="magicBonus"
            color="spell"
            variant="subtle"
            size="md"
          >
            +{{ magicBonus }}
          </UBadge>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div v-if="weight !== null">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Weight:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ weight }} lb</span>
          </div>
          <div v-if="costGp">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Value:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ costGp }} gp</span>
          </div>
          <div v-if="item.quantity > 1">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Quantity:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ item.quantity }}</span>
          </div>
          <div v-if="damageText">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Damage:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ damageText }}</span>
          </div>
          <div v-if="versatileDamage">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Versatile:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ versatileDamage }}</span>
          </div>
          <div v-if="armorClass">
            <span class="font-semibold text-gray-900 dark:text-gray-100">AC:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ armorClass }}</span>
          </div>
          <div v-if="range">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Range:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ range }}</span>
          </div>
          <div v-if="maxDexBonus">
            <span class="font-semibold text-gray-900 dark:text-gray-100">DEX Bonus:</span>
            <span class="ml-1 text-gray-600 dark:text-gray-400">{{ maxDexBonus }}</span>
          </div>
        </div>

        <!-- Armor Restrictions -->
        <div
          v-if="stealthDisadvantage || strMinimum"
          class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm"
        >
          <span
            v-if="stealthDisadvantage"
            class="block text-gray-600 dark:text-gray-400"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-4 h-4 inline mr-1 text-warning"
            />
            Disadvantage on Stealth checks
          </span>
          <span
            v-if="strMinimum"
            class="block text-gray-600 dark:text-gray-400"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-4 h-4 inline mr-1 text-warning"
            />
            Requires Strength {{ strMinimum }}
          </span>
        </div>

        <!-- Charges Section
             Static mode shows max charges from item data.
             Interactive mode (with +/- buttons) is ready for when backend Phase 3
             adds current_charges tracking to the CharacterEquipment response.
        -->
        <div
          v-if="hasChargeInfo || hasInteractiveCharges"
          class="bg-spell-50 dark:bg-spell-900/20 rounded-lg p-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900 dark:text-gray-100">Charges:</span>
              <!-- Interactive mode (enabled when backend provides charges.current) -->
              <template v-if="hasInteractiveCharges">
                <UButton
                  data-testid="charge-decrement"
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-minus"
                  :disabled="currentCharges === 0"
                  @click="$emit('decrement-charge')"
                />
                <span class="text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                  {{ currentCharges }} / {{ displayChargesMax }}
                </span>
                <UButton
                  data-testid="charge-increment"
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-plus"
                  :disabled="currentCharges === displayChargesMax"
                  @click="$emit('increment-charge')"
                />
              </template>
              <!-- Static mode -->
              <template v-else>
                <span class="text-gray-600 dark:text-gray-400">{{ displayChargesMax }} max</span>
              </template>
            </div>
          </div>
          <div
            v-if="displayRechargeFormula || displayRechargeTiming"
            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            Recharges {{ displayRechargeFormula }}<span v-if="displayRechargeTiming"> at {{ displayRechargeTiming }}</span>
          </div>
        </div>

        <!-- Description -->
        <div
          v-if="description"
          class="prose prose-sm dark:prose-invert max-w-none"
        >
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ description }}
          </p>
        </div>

        <!-- Properties -->
        <div
          v-if="properties.length > 0"
          class="bg-item-50 dark:bg-item-900/20 rounded-lg p-3"
        >
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Properties
          </h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="prop in properties"
              :key="prop.name"
              color="neutral"
              variant="outline"
              size="md"
              :title="prop.description"
            >
              {{ prop.name }}
            </UBadge>
          </div>
        </div>

        <!-- Custom Item Note -->
        <div
          v-if="isCustomItem"
          class="text-xs text-gray-400 dark:text-gray-500 italic"
        >
          Custom item
        </div>

        <!-- Base Item Note (when custom name is set) -->
        <div
          v-else-if="item.custom_name && fullItemData?.name"
          class="text-xs text-gray-400 dark:text-gray-500 italic"
        >
          Base item: {{ fullItemData.name }}
        </div>
      </div>
    </template>
  </UModal>
</template>
