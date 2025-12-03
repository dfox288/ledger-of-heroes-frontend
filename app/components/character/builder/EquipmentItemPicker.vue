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
  const subcategory = props.proficiencyType.subcategory

  // Weapons need both melee and ranged variants
  if (subcategory === 'martial' || subcategory === 'simple') {
    return `proficiency_category IN [${subcategory}_melee, ${subcategory}_ranged] AND is_magic = false`
  }

  return `proficiency_category = ${subcategory} AND is_magic = false`
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

// For quantity > 1, we need multiple selections
const selectedItems = computed({
  get: () => props.modelValue,
  set: (value: number[]) => emit('update:modelValue', value)
})

// Single selection for quantity = 1
const singleSelection = computed({
  get: () => props.modelValue[0] ?? null,
  set: (value: number | null) => {
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
    <!-- Single selection (quantity = 1) -->
    <USelectMenu
      v-if="quantity === 1"
      v-model="singleSelection"
      data-test="item-picker"
      :options="selectOptions"
      :loading="pending"
      :disabled="disabled"
      placeholder="Select item..."
      option-attribute="label"
      value-attribute="value"
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
        :model-value="selectedItems[i - 1] ?? null"
        :data-test="`item-picker-${i}`"
        :options="selectOptions"
        :loading="pending"
        :disabled="disabled"
        :placeholder="`Select item ${i}...`"
        option-attribute="label"
        value-attribute="value"
        class="w-full"
        @update:model-value="(val: number | null) => {
          const newSelections = [...selectedItems]
          if (val !== null) {
            newSelections[i - 1] = val
            selectedItems = newSelections
          }
        }"
      />
    </div>
  </div>
</template>
