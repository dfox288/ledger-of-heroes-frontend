<script setup lang="ts">
/**
 * Class Detail - Reference View
 *
 * Complete data view with full progression table,
 * all features expanded, proficiencies, equipment,
 * multiclass rules, and source information.
 */

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const {
  entity,
  pending,
  error,
  isSubclass,
  parentClass,
  features,
  proficiencies,
  equipment,
  traits,
  progressionTable
} = useClassDetail(slug)

// Use feature filtering composable
const { isMulticlassFeature, isChoiceOption } = useFeatureFiltering()

// Separate core features from multiclass features
const coreFeatures = computed(() => {
  return features.value.filter(f => !isMulticlassFeature(f))
})

const multiclassFeatures = computed(() => {
  return features.value.filter(f => isMulticlassFeature(f))
})

// Group features by level for display
const featuresByLevel = computed(() => {
  const grouped = new Map<number, typeof coreFeatures.value>()

  for (const feature of coreFeatures.value) {
    const level = feature.level || 0
    if (!grouped.has(level)) {
      grouped.set(level, [])
    }
    grouped.get(level)!.push(feature)
  }

  // Convert to sorted array
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([level, features]) => ({
      level,
      features
    }))
})

// Get choice options for a feature (nested options like Fighting Styles)
const getChoiceOptions = (feature: typeof features.value[0]) => {
  return features.value.filter(f =>
    isChoiceOption(f)
    && f.level === feature.level
    && f.parent_feature_id === feature.id
  )
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Loading -->
    <UiDetailPageLoading
      v-if="pending"
      entity-type="class"
    />

    <!-- Error -->
    <UiDetailPageError
      v-else-if="error"
      entity-type="Class"
    />

    <!-- Content -->
    <div
      v-else-if="entity"
      class="space-y-8"
    >
      <!-- Shared Header -->
      <ClassDetailHeader
        :entity="entity"
        :is-subclass="isSubclass"
        :parent-class="parentClass"
      />

      <!-- View Navigation -->
      <ClassViewNavigation :slug="slug" />

      <!-- Full Progression Table -->
      <section
        v-if="progressionTable"
        class="space-y-4"
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Class Progression
        </h2>
        <UiClassProgressionTable :progression-table="progressionTable" />
      </section>

      <!-- Complete Features Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Class Features
        </h2>

        <div class="space-y-6">
          <div
            v-for="levelGroup in featuresByLevel"
            :key="levelGroup.level"
            class="space-y-4"
          >
            <!-- Level Header -->
            <div class="flex items-center gap-3">
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Level {{ levelGroup.level }}
              </h3>
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            <!-- Features at this level -->
            <div
              v-for="feature in levelGroup.features"
              :key="feature.id"
              class="border-l-4 border-class-500 pl-4 py-2 space-y-3"
            >
              <!-- Feature Header -->
              <div class="space-y-1">
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {{ feature.feature_name }}
                </h4>

                <!-- Feature Description -->
                <div
                  v-if="feature.description"
                  class="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"
                >
                  {{ feature.description }}
                </div>
              </div>

              <!-- Choice Options (Fighting Styles, etc.) -->
              <div
                v-if="getChoiceOptions(feature).length > 0"
                class="ml-4 space-y-3 border-l-2 border-gray-300 dark:border-gray-600 pl-4"
              >
                <div
                  v-for="option in getChoiceOptions(feature)"
                  :key="option.id"
                  class="space-y-1"
                >
                  <h5 class="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {{ option.feature_name }}
                  </h5>
                  <p
                    v-if="option.description"
                    class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"
                  >
                    {{ option.description }}
                  </p>
                </div>
              </div>

              <!-- Data Tables -->
              <UiAccordionRandomTablesList
                v-if="feature.data_tables && feature.data_tables.length > 0"
                :tables="feature.data_tables"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Accordion Sections -->
      <section>
        <UAccordion
          :items="[
            ...(proficiencies.length > 0 ? [{
              label: 'Proficiencies',
              slot: 'proficiencies',
              defaultOpen: false
            }] : []),
            ...(equipment.length > 0 ? [{
              label: 'Starting Equipment',
              slot: 'equipment',
              defaultOpen: false
            }] : []),
            ...(traits.length > 0 ? [{
              label: 'Class Lore',
              slot: 'traits',
              defaultOpen: false
            }] : []),
            ...(multiclassFeatures.length > 0 ? [{
              label: 'Multiclassing',
              slot: 'multiclass',
              defaultOpen: false
            }] : []),
            ...(entity.sources && entity.sources.length > 0 ? [{
              label: 'Source',
              slot: 'source',
              defaultOpen: false
            }] : [])
          ]"
          type="multiple"
        >
          <!-- Proficiencies Slot -->
          <template
            v-if="proficiencies.length > 0"
            #proficiencies
          >
            <UiAccordionBulletList :items="proficiencies" />
          </template>

          <!-- Equipment Slot -->
          <template
            v-if="equipment.length > 0"
            #equipment
          >
            <UiAccordionEquipmentList
              :equipment="equipment"
              type="class"
            />
          </template>

          <!-- Class Lore / Traits Slot -->
          <template
            v-if="traits.length > 0"
            #traits
          >
            <UiAccordionTraitsList :traits="traits" />
          </template>

          <!-- Multiclassing Slot -->
          <template
            v-if="multiclassFeatures.length > 0"
            #multiclass
          >
            <div class="p-4 space-y-4">
              <div
                v-for="feature in multiclassFeatures"
                :key="feature.id"
                class="space-y-2"
              >
                <h4 class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ feature.feature_name }}
                </h4>
                <p
                  v-if="feature.description"
                  class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"
                >
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </template>

          <!-- Source Slot -->
          <template
            v-if="entity.sources && entity.sources.length > 0"
            #source
          >
            <UiSourceDisplay :sources="entity.sources" />
          </template>
        </UAccordion>
      </section>

      <!-- Debug Panel -->
      <JsonDebugPanel
        :data="entity"
        title="Class Data"
      />
    </div>
  </div>
</template>
