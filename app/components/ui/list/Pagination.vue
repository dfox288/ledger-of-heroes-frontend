<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  total: number
  itemsPerPage: number
  showEdges?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEdges: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const shouldRender = computed(() => props.total > props.itemsPerPage)

const handlePageChange = (page: number) => {
  emit('update:modelValue', page)
}
</script>

<template>
  <div v-if="shouldRender" data-testid="list-pagination" class="flex justify-center">
    <UPagination
      :page="modelValue"
      :total="total"
      :items-per-page="itemsPerPage"
      :show-edges="showEdges"
      @update:page="handlePageChange"
    />
  </div>
</template>
