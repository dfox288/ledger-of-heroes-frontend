<script setup lang="ts">
import type { components } from '~/types/api/generated'

type ProficiencyTypeResource = components['schemas']['ProficiencyTypeResource']
type ItemResource = components['schemas']['ItemResource']

interface Props {
  proficiencyType: ProficiencyTypeResource
  quantity: number
  modelValue: number[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [ids: number[]]
}>()

const { apiFetch } = useApi()

// Build filter for items matching this proficiency type
const filterString = computed(() => {
  const { subcategory, category } = props.proficiencyType

  // Weapons need both melee and ranged variants (subcategory is 'martial' or 'simple')
  if (subcategory === 'martial' || subcategory === 'simple') {
    return `proficiency_category IN [${subcategory}_melee, ${subcategory}_ranged] AND is_magic = false`
  }

  // Non-weapon proficiency types (musical_instrument, artisan_tools, gaming_set)
  // use the category field directly when subcategory is null
  const filterValue = subcategory || category
  return `proficiency_category = ${filterValue} AND is_magic = false`
})

// Fetch matching items
const { data: itemsResponse, pending } = await useAsyncData(
  `equipment-items-${props.proficiencyType.slug}`,
  () => apiFetch<{ data: ItemResource[] }>('/items', {
    query: { filter: filterString.value, per_page: 100 }
  }),
  { watch: [filterString] }
)

const items = computed(() => itemsResponse.value?.data ?? [])

// Debug: log items when they change
if (import.meta.dev) {
  watch(itemsResponse, (response) => {
    console.log('[EquipmentItemPicker] Response:', response)
    console.log('[EquipmentItemPicker] Items count:', response?.data?.length ?? 0)
  }, { immediate: true })
}

// For quantity > 1, we need multiple selections
const selectedItems = computed({
  get: () => props.modelValue,
  set: (value: number[]) => emit('update:modelValue', value)
})

// Single selection for quantity = 1
const singleSelection = computed({
  get: () => props.modelValue[0] ?? undefined,
  set: (value: number | undefined) => {
    emit('update:modelValue', value ? [value] : [])
  }
})

// Format items for USelectMenu
const selectOptions = computed(() =>
  items.value.map(item => ({
    label: item.name,
    value: item.id
  }))
)
</script>

<template>
  <div class="equipment-item-picker">
    <!-- Empty state when no items available -->
    <div
      v-if="!pending && selectOptions.length === 0"
      class="text-sm text-amber-600 dark:text-amber-400 italic"
      data-test="no-items-message"
    >
      No items available (data issue - see console)
    </div>

    <!-- Single selection (quantity = 1) -->
    <USelectMenu
      v-else-if="quantity === 1"
      v-model="singleSelection"
      data-test="item-picker"
      :items="selectOptions"
      :loading="pending"
      :disabled="disabled"
      placeholder="Select item..."
      value-key="value"
      class="w-full"
    />

    <!-- Multiple selections (quantity > 1) -->
    <div
      v-else
      class="space-y-2"
    >
      <USelectMenu
        v-for="i in quantity"
        :key="i"
        :model-value="selectedItems[i - 1] ?? undefined"
        :data-test="`item-picker-${i}`"
        :items="selectOptions"
        :loading="pending"
        :disabled="disabled"
        :placeholder="`Select item ${i}...`"
        value-key="value"
        class="w-full"
        @update:model-value="(val) => {
          const newSelections = [...selectedItems]
          if (val !== null && val !== undefined) {
            newSelections[i - 1] = val as number
            selectedItems = newSelections
          }
        }"
      />
    </div>
  </div>
</template>
