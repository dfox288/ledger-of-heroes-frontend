<!-- app/components/character/picker/SubclassDetailModal.vue -->
<script setup lang="ts">
import type { Subclass } from '~/stores/characterWizard'

interface SubclassSource {
  code: string
  name: string
  pages?: string
}

interface SubclassFeature {
  id: number
  level: number
  feature_name: string
  description?: string
}

// Extended Subclass type for the detail modal (includes data from full API response)
interface SubclassWithDetails extends Subclass {
  parent_class?: {
    name: string
    subclass_level?: number
  }
  spellcasting_ability?: {
    id: number
    code: string
    name: string
  }
  features?: SubclassFeature[]
  sources?: SubclassSource[]
}

interface Props {
  subclass: SubclassWithDetails | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Use local ref for v-model binding
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) emit('close')
  }
})

/**
 * Check if subclass has spellcasting
 */
const hasSpellcasting = computed(() => {
  return props.subclass?.spellcasting_ability !== null
    && props.subclass?.spellcasting_ability !== undefined
})

/**
 * Get features grouped by level
 */
const featuresByLevel = computed(() => {
  if (!props.subclass?.features) return []

  // Group features by level
  const grouped = new Map<number, typeof props.subclass.features>()
  for (const feature of props.subclass.features) {
    const level = feature.level || 1
    if (!grouped.has(level)) {
      grouped.set(level, [])
    }
    grouped.get(level)!.push(feature)
  }

  // Convert to sorted array
  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([level, features]) => ({ level, features }))
})

/**
 * Truncate description for preview (remove source references)
 */
function truncateDescription(text: string | undefined, maxLength = 300): string {
  if (!text) return ''
  // Remove "Source: ..." suffix if present
  const cleaned = text.replace(/\n*Source:\s+.+$/, '').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength).trim() + '...'
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="subclass?.name ?? 'Subclass Details'"
  >
    <template #body>
      <div
        v-if="subclass"
        class="space-y-6"
      >
        <!-- Parent Class Info -->
        <div
          v-if="subclass.parent_class"
          class="flex items-center gap-2"
        >
          <UBadge
            color="class"
            variant="subtle"
            size="md"
          >
            {{ subclass.parent_class.name }}
          </UBadge>
          <span
            v-if="subclass.parent_class.subclass_level"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            Available at level {{ subclass.parent_class.subclass_level }}
          </span>
        </div>

        <!-- Description -->
        <p
          v-if="subclass.description"
          class="text-gray-700 dark:text-gray-300"
        >
          {{ truncateDescription(subclass.description, 500) }}
        </p>

        <!-- Spellcasting -->
        <div v-if="hasSpellcasting">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Spellcasting
          </h4>
          <div class="bg-spell-50 dark:bg-spell-900/20 rounded-lg p-3">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-sparkles"
                class="w-5 h-5 text-spell-500"
              />
              <span class="text-gray-700 dark:text-gray-300">
                Spellcasting Ability: <strong>{{ subclass.spellcasting_ability?.name }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Features by Level -->
        <div v-if="featuresByLevel.length > 0">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Subclass Features
          </h4>
          <div class="space-y-4">
            <div
              v-for="levelGroup in featuresByLevel"
              :key="levelGroup.level"
            >
              <div class="flex items-center gap-2 mb-2">
                <UBadge
                  color="class"
                  variant="solid"
                  size="md"
                >
                  Level {{ levelGroup.level }}
                </UBadge>
              </div>
              <div class="space-y-2 pl-2 border-l-2 border-class-200 dark:border-class-800">
                <div
                  v-for="feature in levelGroup.features"
                  :key="feature.id"
                  class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3"
                >
                  <h5 class="font-medium text-gray-900 dark:text-gray-100">
                    {{ feature.feature_name }}
                  </h5>
                  <p
                    v-if="feature.description"
                    class="text-sm text-gray-600 dark:text-gray-400 mt-1"
                  >
                    {{ truncateDescription(feature.description, 200) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Source -->
        <div
          v-if="subclass.sources && subclass.sources.length > 0"
          class="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          Source: {{ subclass.sources.map(s => `${s.name}${s.pages ? ` p. ${s.pages}` : ''}`).join(', ') }}
        </div>
        <div
          v-else-if="subclass.source"
          class="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          Source: {{ subclass.source.name }}
        </div>
      </div>
    </template>
  </UModal>
</template>
