<script setup lang="ts">
const { apiFetch } = useApi()
const route = useRoute()
const slug = route.params.slug as string

const { data: entity, error, pending } = await useAsyncData(
  `class-${slug}`,
  async () => {
    const response = await apiFetch(`/classes/${slug}`)
    return response.data
  }
)

useSeoMeta({
  title: computed(() => entity.value ? `${entity.value.name} - D&D 5e Class` : 'Class - D&D 5e Compendium'),
  description: computed(() => entity.value?.description?.substring(0, 160)),
})

</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <UiDetailPageLoading v-if="pending" entityType="class" />

    <UiDetailPageError v-else-if="error" entityType="Class" />

    <div v-else-if="entity" class="space-y-8">
      <!-- Breadcrumb Navigation -->
      <UiBackLink to="/classes" label="Back to Classes" />

      <!-- Header -->
      <UiDetailPageHeader
        :title="entity.name"
        :badges="[
          { label: entity.is_base_class ? 'Base Class' : 'Subclass', color: entity.is_base_class ? 'error' : 'warning', variant: 'subtle', size: 'lg' },
          ...(entity.spellcasting_ability ? [{ label: `✨ ${entity.spellcasting_ability.name}`, color: 'primary', variant: 'soft', size: 'sm' }] : [])
        ]"
      />

      <!-- Quick Stats -->
      <UiDetailQuickStatsCard
        :columns="3"
        :stats="[
          ...(entity.hit_die ? [{ icon: 'i-heroicons-heart', label: 'Hit Die', value: `1d${entity.hit_die}` }] : []),
          ...(entity.primary_ability ? [{ icon: 'i-heroicons-star', label: 'Primary Ability', value: entity.primary_ability }] : []),
          ...(entity.spellcasting_ability ? [{ icon: 'i-heroicons-sparkles', label: 'Spellcasting Ability', value: `${entity.spellcasting_ability.name} (${entity.spellcasting_ability.code})` }] : [])
        ]"
      />

      <!-- Description (Always Visible) -->
      <UCard v-if="entity.description">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Description</h2>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line text-gray-700 dark:text-gray-300">{{ entity.description }}</p>
        </div>
      </UCard>

      <!-- Additional Details (Accordion) -->
      <UAccordion
        :items="[
          ...(entity.proficiencies && entity.proficiencies.length > 0 ? [{
            label: `Proficiencies (${entity.proficiencies.length})`,
            slot: 'proficiencies',
            defaultOpen: false
          }] : []),
          ...(entity.features && entity.features.length > 0 ? [{
            label: `Features (${entity.features.length})`,
            slot: 'features',
            defaultOpen: false
          }] : []),
          ...(entity.subclasses && entity.subclasses.length > 0 ? [{
            label: `Subclasses (${entity.subclasses.length})`,
            slot: 'subclasses',
            defaultOpen: false
          }] : []),
          ...(entity.sources && entity.sources.length > 0 ? [{
            label: 'Source',
            slot: 'source',
            defaultOpen: false
          }] : []),
          ...(entity.tags && entity.tags.length > 0 ? [{
            label: 'Tags',
            slot: 'tags',
            defaultOpen: false
          }] : [])
        ]"
        type="multiple"
      >
        <!-- Proficiencies Slot -->
        <template v-if="entity.proficiencies && entity.proficiencies.length > 0" #proficiencies>
          <UiAccordionBulletList :items="entity.proficiencies" />
        </template>

        <!-- Features Slot -->
        <template v-if="entity.features && entity.features.length > 0" #features>
          <UiAccordionTraitsList :traits="entity.features" :showLevel="true" borderColor="primary-500" />
        </template>

        <!-- Subclasses Slot -->
        <template v-if="entity.subclasses && entity.subclasses.length > 0" #subclasses>
          <UiAccordionEntityGrid :entities="entity.subclasses" basePath="/classes" />
        </template>

        <!-- Source Slot -->
        <template v-if="entity.sources && entity.sources.length > 0" #source>
          <UiSourceDisplay :sources="entity.sources" />
        </template>

        <!-- Tags Slot -->
        <template v-if="entity.tags && entity.tags.length > 0" #tags>
          <UiTagsDisplay :tags="entity.tags" />
        </template>
      </UAccordion>

      <!-- JSON Debug Panel -->
      <JsonDebugPanel :data="entity" title="Class Data" />
    </div>
  </div>
</template>
