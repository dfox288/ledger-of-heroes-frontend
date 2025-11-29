<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { CharacterClass, Spell } from '~/types'

definePageMeta({
  title: 'Spell List Generator - D&D 5e Compendium',
  description: 'Create and manage your spell list for any D&D 5e spellcasting class'
})

useSeoMeta({
  title: 'Spell List Generator - D&D 5e Compendium',
  description: 'Create and manage your spell list for any D&D 5e spellcasting class'
})

const { apiFetch } = useApi()

// Fetch spellcasting classes
const { data: classes, status: classesStatus } = await useAsyncData<CharacterClass[]>(
  'spellcasting-classes',
  async () => {
    const response = await apiFetch<{ data: CharacterClass[] }>('/classes?per_page=100')
    // Filter to only BASE spellcasting classes (no subclasses, must have spellcasting ability)
    return response?.data?.filter(c =>
      c.is_base_class === true && c.spellcasting_ability !== null && c.spellcasting_ability !== undefined
    ) || []
  }
)

const classesLoading = computed(() => classesStatus.value === 'pending')

// Use spell list generator composable
const {
  selectedClass,
  characterLevel,
  selectedSpells,
  spellSlots,
  maxSpells,
  toggleSpell,
  selectionCount,
  setClassData,
  saveToStorage,
  loadFromStorage,
  clearAll
} = useSpellListGenerator()

// Class dropdown options
const classOptions = computed(() => {
  if (!classes.value) return []
  return classes.value.map(c => ({
    label: c.name,
    value: c.slug
  }))
})

// Level dropdown options
const levelOptions = Array.from({ length: 20 }, (_, i) => ({
  label: `Level ${i + 1}`,
  value: i + 1
}))

// Selected class option (for USelectMenu v-model)
const selectedClassOption = ref<string | undefined>(undefined)

// Watch for class selection with confirmation if spells already selected
watch(selectedClassOption, (newSlug, oldSlug) => {
  if (newSlug && classes.value) {
    const newClass = classes.value.find(c => c.slug === newSlug)
    if (newClass) {
      // If changing class and spells are already selected, confirm
      if (oldSlug && selectionCount.value > 0) {
        const confirmed = confirm(
          `Changing class will clear your ${selectionCount.value} selected spell${selectionCount.value > 1 ? 's' : ''}. Continue?`
        )
        if (!confirmed) {
          // Revert selection
          selectedClassOption.value = oldSlug
          return
        }
      }
      setClassData(newClass)
      // Clear selections when changing class
      if (oldSlug && oldSlug !== newSlug) {
        clearAll()
      }
    }
  }
})

// Fetch spells for selected class (using Meilisearch filter syntax)
const { data: spells, status: spellsStatus } = await useAsyncData(
  'class-spells',
  async () => {
    if (!selectedClass.value) return []
    const response = await apiFetch<{ data: Spell[] }>(
      `/spells?filter=class_slugs IN [${selectedClass.value.slug}]&per_page=100`
    )
    return response?.data || []
  },
  {
    watch: [selectedClass],
    immediate: false
  }
)

const spellsLoading = computed(() => spellsStatus.value === 'pending')

// Group spells by level
const spellsByLevel = computed(() => {
  if (!spells.value) return new Map()

  const grouped = new Map<number, Spell[]>()

  for (const spell of spells.value) {
    const level = spell.level
    if (!grouped.has(level)) {
      grouped.set(level, [])
    }
    grouped.get(level)!.push(spell)
  }

  return grouped
})

// Get spell level label
const getSpellLevelLabel = (level: number) => {
  if (level === 0) return 'Cantrips'
  if (level === 1) return '1st Level Spells'
  if (level === 2) return '2nd Level Spells'
  if (level === 3) return '3rd Level Spells'
  return `${level}th Level Spells`
}

// Available spell levels (based on character level)
const availableSpellLevels = computed(() => {
  const levels = [0] // Always include cantrips
  const charLevel = characterLevel.value

  // Add leveled spells based on character level
  if (charLevel >= 1) levels.push(1)
  if (charLevel >= 3) levels.push(2)
  if (charLevel >= 5) levels.push(3)
  if (charLevel >= 7) levels.push(4)
  if (charLevel >= 9) levels.push(5)
  if (charLevel >= 11) levels.push(6)
  if (charLevel >= 13) levels.push(7)
  if (charLevel >= 15) levels.push(8)
  if (charLevel >= 17) levels.push(9)

  return levels
})

// Load saved selections on mount
onMounted(() => {
  if (selectedClass.value) {
    loadFromStorage()
  }
})

// Watch only for class changes to load saved data (not level changes)
// Level changes should trigger saves, not loads
watch(selectedClass, (newClass, oldClass) => {
  if (newClass && newClass !== oldClass) {
    loadFromStorage()
  }
})

// Auto-save on selection changes (debounced)
watchDebounced(
  selectedSpells,
  () => {
    if (selectedClass.value) {
      saveToStorage()
    }
  },
  { debounce: 500, deep: true }
)

// Auto-save on level changes (debounced)
watchDebounced(
  characterLevel,
  () => {
    if (selectedClass.value) {
      saveToStorage()
    }
  },
  { debounce: 500 }
)

/**
 * Handle spell toggle with max limit check
 */
const handleSpellToggle = (spellId: number) => {
  const success = toggleSpell(spellId)
  if (!success && !selectedSpells.value.has(spellId)) {
    alert(`You've reached the maximum of ${maxSpells.value} spells for this class and level.`)
  }
}

// Get selected spell objects
const selectedSpellsList = computed(() => {
  if (!spells.value) return []
  return spells.value.filter(s => selectedSpells.value.has(s.id))
})

// Group selected spells by level
const selectedByLevel = computed(() => {
  const grouped = new Map<number, Spell[]>()

  for (const spell of selectedSpellsList.value) {
    const level = spell.level
    if (!grouped.has(level)) {
      grouped.set(level, [])
    }
    grouped.get(level)!.push(spell)
  }

  // Sort levels
  return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]))
})

// Clear all handler
const handleClearAll = () => {
  if (confirm('Clear all selected spells?')) {
    clearAll()
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">
            🪄 Spell List Generator
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Choose spells for your character based on class and level.
          </p>
        </div>
      </div>
    </div>

    <!-- Character Setup -->
    <div class="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold mb-4">
        Character Setup
      </h2>

      <div class="flex flex-wrap gap-4 mb-6">
        <!-- Class Dropdown -->
        <div class="w-64">
          <label class="block text-sm font-medium mb-2">Class</label>
          <USelectMenu
            v-model="selectedClassOption"
            :items="classOptions"
            value-key="value"
            placeholder="Select class"
            :loading="classesLoading"
          />
        </div>

        <!-- Level Dropdown -->
        <div class="w-32">
          <label class="block text-sm font-medium mb-2">Level</label>
          <USelectMenu
            v-model="characterLevel"
            :items="levelOptions"
            value-key="value"
            label-key="label"
            placeholder="Select level"
          />
        </div>
      </div>

      <!-- Spell Info Display (show when class selected) -->
      <div
        v-if="selectedClass"
        class="space-y-2"
      >
        <div class="flex items-center gap-4 text-sm">
          <span class="font-medium">📊 Spell Slots:</span>
          <span>Cantrips: {{ spellSlots.cantrips }}</span>
          <span v-if="spellSlots['1st']">1st: {{ spellSlots['1st'] }}</span>
          <span v-if="spellSlots['2nd']">2nd: {{ spellSlots['2nd'] }}</span>
          <span v-if="spellSlots['3rd']">3rd: {{ spellSlots['3rd'] }}</span>
          <span v-if="spellSlots['4th']">4th: {{ spellSlots['4th'] }}</span>
          <span v-if="spellSlots['5th']">5th: {{ spellSlots['5th'] }}</span>
        </div>
        <div class="text-sm">
          <span class="font-medium">📝 Spells to Prepare:</span>
          {{ maxSpells }} ({{ characterLevel }} + 3 modifier)
        </div>
      </div>
    </div>

    <!-- Main content area with sidebar layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Spell selection (flex-1) -->
      <div class="flex-1">
        <!-- Spell Selection Section -->
        <div
          v-if="selectedClass"
          class="mb-8"
        >
          <h2 class="text-xl font-semibold mb-4">
            Select Your Spells
          </h2>

          <!-- Loading state -->
          <div
            v-if="spellsLoading"
            class="space-y-4"
          >
            <UiListSkeletonCards />
          </div>

          <!-- No spells available -->
          <div
            v-else-if="!spells || spells.length === 0"
            class="text-center py-8"
          >
            <p class="text-gray-600 dark:text-gray-400">
              No spells available for {{ selectedClass.name }}.
            </p>
          </div>

          <!-- Spells grouped by level -->
          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="level in availableSpellLevels"
              :key="level"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h3 class="text-lg font-semibold mb-3">
                {{ getSpellLevelLabel(level) }}
                <span class="text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({{ spellsByLevel.get(level)?.length || 0 }} available)
                </span>
              </h3>

              <div
                v-if="spellsByLevel.get(level)"
                class="space-y-2"
              >
                <div
                  v-for="spell in spellsByLevel.get(level)"
                  :key="spell.id"
                  class="flex items-start gap-3 p-3 rounded border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <UCheckbox
                    :model-value="selectedSpells.has(spell.id)"
                    :disabled="!selectedSpells.has(spell.id) && selectionCount >= maxSpells"
                    @update:model-value="() => handleSpellToggle(spell.id)"
                  />
                  <div class="flex-1">
                    <div class="font-medium">
                      {{ spell.name }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                      <span>{{ spell.school?.name }}</span>
                      <span>•</span>
                      <span>{{ spell.range }}</span>
                      <UBadge
                        v-if="spell.needs_concentration"
                        color="primary"
                        variant="soft"
                        size="md"
                      >
                        Concentration
                      </UBadge>
                      <UBadge
                        v-if="spell.is_ritual"
                        color="info"
                        variant="soft"
                        size="md"
                      >
                        Ritual
                      </UBadge>
                      <UBadge
                        v-if="spell.requires_verbal"
                        color="neutral"
                        variant="soft"
                        size="md"
                      >
                        V
                      </UBadge>
                      <UBadge
                        v-if="spell.requires_somatic"
                        color="neutral"
                        variant="soft"
                        size="md"
                      >
                        S
                      </UBadge>
                      <UBadge
                        v-if="spell.requires_material"
                        color="neutral"
                        variant="soft"
                        size="md"
                      >
                        M
                      </UBadge>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="text-sm text-gray-500 dark:text-gray-500"
              >
                No spells available at this level.
              </div>
            </div>
          </div>
        </div>

        <!-- Prompt to select class -->
        <div
          v-else
          class="text-center py-12"
        >
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Select a class and level to begin choosing spells.
          </p>
        </div>
      </div>

      <!-- Right: Summary sidebar (sticky) -->
      <div
        v-if="selectedClass"
        class="lg:w-80"
      >
        <div class="sticky top-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4">
            📋 Your Spell List
          </h3>

          <div class="mb-4 text-sm">
            <div class="font-medium">
              {{ selectedClass.name }} Level {{ characterLevel }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              Selected: {{ selectionCount }} / {{ maxSpells }} spells
            </div>
          </div>

          <!-- Selected spells by level -->
          <div
            v-if="selectionCount > 0"
            class="space-y-3 mb-6 max-h-96 overflow-y-auto"
          >
            <div
              v-for="[level, spellsAtLevel] in selectedByLevel"
              :key="level"
            >
              <div class="text-sm font-semibold mb-1">
                {{ getSpellLevelLabel(level) }} ({{ spellsAtLevel.length }})
              </div>
              <ul class="space-y-1 text-sm pl-2">
                <li
                  v-for="spell in spellsAtLevel"
                  :key="spell.id"
                  class="text-gray-700 dark:text-gray-300"
                >
                  • {{ spell.name }}
                </li>
              </ul>
            </div>
          </div>

          <div
            v-else
            class="text-sm text-gray-500 dark:text-gray-500 mb-6"
          >
            No spells selected yet.
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <UButton
              color="neutral"
              variant="soft"
              block
              :disabled="selectionCount === 0"
              @click="handleClearAll"
            >
              🗑️ Clear All
            </UButton>
            <div class="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">
              Auto-saved to browser
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Back link -->
    <div class="mt-8">
      <UiBackLink />
    </div>
  </div>
</template>
