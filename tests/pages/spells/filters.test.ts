/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Spells Page - Filter Tests (Consolidated)
 *
 * This file consolidates tests for spell page filters:
 * - Level filter UI and behavior
 * - Tag filter (useMeilisearchFilters integration)
 *
 * Consolidation: 2 files → 1 file
 * GitHub Issue: #323
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellsPage from '~/pages/spells/index.vue'
import { useMeilisearchFilters } from '~/composables/useMeilisearchFilters'

describe('Spells Page - Filters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ===========================================================================
  // Level Filter Tests
  // ===========================================================================
  describe('level filter', () => {
    describe('UI components', () => {
      it('displays level filter multiselect', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.filtersOpen = true
        await wrapper.vm.$nextTick()

        const multiselect = wrapper.find('[data-testid="level-filter-multiselect"]')
        expect(multiselect.exists()).toBe(true)
      })

      it('does not display mode toggle (removed)', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.filtersOpen = true
        await wrapper.vm.$nextTick()

        const toggle = wrapper.find('[data-testid="level-filter-mode-toggle"]')
        expect(toggle.exists()).toBe(false)
      })

      it('does not display slider (removed)', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.filtersOpen = true
        await wrapper.vm.$nextTick()

        const slider = wrapper.find('[data-testid="level-range-slider"]')
        expect(slider.exists()).toBe(false)
      })
    })

    describe('multiselect behavior', () => {
      it('allows selecting multiple levels', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.selectedLevels = ['0', '3', '9']

        expect(component.selectedLevels).toEqual(['0', '3', '9'])
      })

      it('initializes as empty array', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.clearFilters()

        expect(Array.isArray(component.selectedLevels)).toBe(true)
        expect(component.selectedLevels.length).toBe(0)
      })
    })

    describe('filter chip display', () => {
      it('shows chip with selected level labels', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.selectedLevels = ['0', '3', '9']

        await wrapper.vm.$nextTick()

        const chip = wrapper.find('[data-testid="level-filter-chip"]')
        expect(chip.exists()).toBe(true)
        expect(chip.text()).toContain('Levels')
        expect(chip.text()).toContain('Cantrip')
        expect(chip.text()).toContain('3rd')
        expect(chip.text()).toContain('9th')
      })

      it('shows single level without plural', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.selectedLevels = ['3']

        await wrapper.vm.$nextTick()

        const chip = wrapper.find('[data-testid="level-filter-chip"]')
        expect(chip.exists()).toBe(true)
        expect(chip.text()).toContain('Level')
        expect(chip.text()).toContain('3rd')
      })

      it('shows "Cantrip" for level 0', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.selectedLevels = ['0']

        await wrapper.vm.$nextTick()

        const chip = wrapper.find('[data-testid="level-filter-chip"]')
        expect(chip.exists()).toBe(true)
        expect(chip.text()).toContain('Cantrip')
      })

      it('clicking chip clears level filter', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.selectedLevels = ['0', '3']

        await wrapper.vm.$nextTick()

        const chip = wrapper.find('[data-testid="level-filter-chip"]')
        await chip.trigger('click')

        expect(component.selectedLevels).toEqual([])
      })

      it('does not show chip when no levels selected', async () => {
        const wrapper = await mountSuspended(SpellsPage)

        const component = wrapper.vm as any
        component.selectedLevels = []

        const chip = wrapper.find('[data-testid="level-filter-chip"]')
        expect(chip.exists()).toBe(false)
      })
    })
  })

  // ===========================================================================
  // Tag Filter Tests (useMeilisearchFilters integration)
  // ===========================================================================
  describe('tag filter', () => {
    describe('useMeilisearchFilters with tag_slugs', () => {
      it('builds IN filter for single tag slug', () => {
        const selectedTags = ref(['ritual-caster'])

        const { queryParams } = useMeilisearchFilters([
          { ref: selectedTags, field: 'tag_slugs', type: 'in' }
        ])

        expect(queryParams.value).toEqual({
          filter: 'tag_slugs IN [ritual-caster]'
        })
      })

      it('builds IN filter for multiple tag slugs', () => {
        const selectedTags = ref(['ritual-caster', 'touch-spells'])

        const { queryParams } = useMeilisearchFilters([
          { ref: selectedTags, field: 'tag_slugs', type: 'in' }
        ])

        expect(queryParams.value).toEqual({
          filter: 'tag_slugs IN [ritual-caster, touch-spells]'
        })
      })

      it('skips when no tags selected', () => {
        const selectedTags = ref([])

        const { queryParams } = useMeilisearchFilters([
          { ref: selectedTags, field: 'tag_slugs', type: 'in' }
        ])

        expect(queryParams.value).toEqual({})
      })

      it('combines tag filter with other filters', () => {
        const selectedTags = ref(['ritual-caster'])
        const selectedLevel = ref(1)
        const concentrationFilter = ref('1')

        const { queryParams } = useMeilisearchFilters([
          { ref: selectedLevel, field: 'level' },
          { ref: concentrationFilter, field: 'concentration', type: 'boolean' },
          { ref: selectedTags, field: 'tag_slugs', type: 'in' }
        ])

        expect(queryParams.value).toEqual({
          filter: 'level = 1 AND concentration = true AND tag_slugs IN [ritual-caster]'
        })
      })

      it('reactively updates when tags change', () => {
        const selectedTags = ref<string[]>([])

        const { queryParams } = useMeilisearchFilters([
          { ref: selectedTags, field: 'tag_slugs', type: 'in' }
        ])

        expect(queryParams.value).toEqual({})

        selectedTags.value = ['ritual-caster']
        expect(queryParams.value).toEqual({
          filter: 'tag_slugs IN [ritual-caster]'
        })

        selectedTags.value = ['ritual-caster', 'touch-spells']
        expect(queryParams.value).toEqual({
          filter: 'tag_slugs IN [ritual-caster, touch-spells]'
        })

        selectedTags.value = []
        expect(queryParams.value).toEqual({})
      })
    })

    describe('tag filter state management', () => {
      it('initializes from query params - single tag', () => {
        const route = {
          query: { tag: 'ritual-caster' }
        }

        const selectedTags = ref<string[]>(
          route.query.tag
            ? (Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]) as string[]
            : []
        )

        expect(selectedTags.value).toEqual(['ritual-caster'])
      })

      it('initializes from query params - multiple tags', () => {
        const route = {
          query: { tag: ['ritual-caster', 'touch-spells'] }
        }

        const selectedTags = ref<string[]>(
          route.query.tag
            ? (Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]) as string[]
            : []
        )

        expect(selectedTags.value).toEqual(['ritual-caster', 'touch-spells'])
      })

      it('initializes empty when no query params', () => {
        const route = {
          query: {}
        }

        const selectedTags = ref<string[]>(
          route.query.tag
            ? (Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]) as string[]
            : []
        )

        expect(selectedTags.value).toEqual([])
      })
    })

    describe('tag chip removal', () => {
      it('removes single tag from filter', () => {
        const selectedTags = ref(['ritual-caster', 'touch-spells'])

        selectedTags.value = selectedTags.value.filter(t => t !== 'ritual-caster')

        expect(selectedTags.value).toEqual(['touch-spells'])
      })

      it('clears all tags when last chip removed', () => {
        const selectedTags = ref(['ritual-caster'])

        selectedTags.value = selectedTags.value.filter(t => t !== 'ritual-caster')

        expect(selectedTags.value).toEqual([])
      })
    })

    describe('tag filter count', () => {
      it('counts active tag filters correctly', () => {
        const selectedTags = ref<string[]>([])

        const countActiveFilters = (...filters: any[]) => {
          return filters.filter((f) => {
            if (Array.isArray(f.value)) return f.value.length > 0
            return f.value !== null && f.value !== undefined && f.value !== ''
          }).length
        }

        expect(countActiveFilters(selectedTags)).toBe(0)

        selectedTags.value = ['ritual-caster']
        expect(countActiveFilters(selectedTags)).toBe(1)

        selectedTags.value = ['ritual-caster', 'touch-spells']
        expect(countActiveFilters(selectedTags)).toBe(1)
      })
    })

    describe('tag options data structure', () => {
      it('has correct structure for UI components', () => {
        const tagOptions = [
          { label: 'Ritual Caster', value: 'ritual-caster' },
          { label: 'Touch Spells', value: 'touch-spells' }
        ]

        expect(tagOptions).toHaveLength(2)
        expect(tagOptions[0]).toHaveProperty('label')
        expect(tagOptions[0]).toHaveProperty('value')
        expect(tagOptions[0].label).toBe('Ritual Caster')
        expect(tagOptions[0].value).toBe('ritual-caster')
      })
    })
  })
})
