<script setup lang="ts">
import type { AbilityModifier, GrantedProficiency, FeatAdvantage } from '~/composables/useFeatDetail'

interface Props {
  abilityModifiers: AbilityModifier[]
  grantedProficiencies: GrantedProficiency[]
  advantages: FeatAdvantage[]
}

defineProps<Props>()
</script>

<template>
  <section>
    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
      What You Get
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Ability Score Card -->
      <UCard v-if="abilityModifiers.length > 0">
        <template #header>
          <div class="flex items-center gap-2 text-primary">
            <UIcon
              name="i-heroicons-arrow-trending-up"
              class="w-5 h-5"
            />
            <span class="font-semibold">Ability Score</span>
          </div>
        </template>
        <ul class="space-y-1">
          <li
            v-for="mod in abilityModifiers"
            :key="mod.code"
            class="flex items-center gap-2"
          >
            <UBadge
              :label="mod.code"
              color="primary"
              variant="subtle"
              size="md"
            />
            <span>+{{ mod.value }} {{ mod.ability }}</span>
          </li>
        </ul>
      </UCard>

      <!-- Proficiency Card -->
      <UCard v-if="grantedProficiencies.length > 0">
        <template #header>
          <div class="flex items-center gap-2 text-success">
            <UIcon
              name="i-heroicons-shield-check"
              class="w-5 h-5"
            />
            <span class="font-semibold">Proficiency</span>
          </div>
        </template>
        <ul class="space-y-1">
          <li
            v-for="prof in grantedProficiencies"
            :key="prof.name"
            class="flex items-center gap-2"
          >
            <span class="capitalize">{{ prof.name }}</span>
            <UBadge
              :label="prof.type"
              color="neutral"
              variant="subtle"
              size="md"
            />
          </li>
        </ul>
      </UCard>

      <!-- Advantage Card -->
      <UCard v-if="advantages.length > 0">
        <template #header>
          <div class="flex items-center gap-2 text-warning">
            <UIcon
              name="i-heroicons-bolt"
              class="w-5 h-5"
            />
            <span class="font-semibold">Special Abilities</span>
          </div>
        </template>
        <ul class="space-y-2">
          <li
            v-for="(adv, idx) in advantages"
            :key="idx"
          >
            <UBadge
              v-if="adv.effectType"
              :label="adv.effectType"
              color="warning"
              variant="subtle"
              size="md"
              class="mr-2"
            />
            <span class="text-sm">{{ adv.description }}</span>
          </li>
        </ul>
      </UCard>
    </div>
  </section>
</template>
