import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MonstersPage from '~/pages/monsters/index.vue'

describe('Monsters Page - API-Driven Filters', () => {
  describe('Alignment Filter', () => {
    it('alignmentOptions computed property exists', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.alignmentOptions).toBeDefined()
      expect(Array.isArray(component.alignmentOptions)).toBe(true)
    })

    it('alignmentOptions returns array when API data loaded', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      // API data should be loaded (or empty array)
      expect(Array.isArray(component.alignmentOptions)).toBe(true)

      // If data is loaded, each option should have label and value
      if (component.alignmentOptions.length > 0) {
        component.alignmentOptions.forEach((option: any) => {
          expect(option).toHaveProperty('label')
          expect(option).toHaveProperty('value')
          expect(typeof option.label).toBe('string')
          expect(typeof option.value).toBe('string')
        })
      }
    })

    it('alignmentOptions returns empty array when API data not loaded', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      // Set alignments to null/undefined to simulate no API data
      component.alignments = null
      await wrapper.vm.$nextTick()

      expect(component.alignmentOptions).toEqual([])
    })

    it('alignment filter multiselect displays', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="alignment-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })
  })

  describe('Monster Type Filter', () => {
    it('typeOptions computed property exists', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.typeOptions).toBeDefined()
      expect(Array.isArray(component.typeOptions)).toBe(true)
    })

    it('typeOptions includes "All Types" as first option with null value', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.typeOptions.length).toBeGreaterThan(0)
      expect(component.typeOptions[0]).toEqual({
        label: 'All Types',
        value: null
      })
    })

    it('typeOptions maps API data to label/slug format', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      // Each option should have label and value (or null for "All Types")
      component.typeOptions.forEach((option: any, index: number) => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('value')
        expect(typeof option.label).toBe('string')

        // First option is "All Types" with null, rest should have string values
        if (index === 0) {
          expect(option.value).toBe(null)
        } else if (option.value !== null) {
          expect(typeof option.value).toBe('string')
        }
      })
    })

    it('creature type filter select displays', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const select = wrapper.find('[data-testid="type-filter"]')
      expect(select.exists()).toBe(true)
    })

    it('getTypeLabel helper returns correct label from computed options', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      // Test with null (should return "All Types")
      expect(component.getTypeLabel(null)).toBe('All Types')

      // Test with an actual slug if data is loaded
      if (component.typeOptions.length > 1) {
        const secondOption = component.typeOptions[1]
        if (secondOption.value) {
          expect(component.getTypeLabel(secondOption.value)).toBe(secondOption.label)
        }
      }
    })
  })

  describe('Armor Type Filter', () => {
    it('armorTypeOptions computed property exists', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      expect(component.armorTypeOptions).toBeDefined()
      expect(Array.isArray(component.armorTypeOptions)).toBe(true)
    })

    it('armorTypeOptions returns array when API data loaded', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      // API data should be loaded (or empty array)
      expect(Array.isArray(component.armorTypeOptions)).toBe(true)

      // If data is loaded, each option should have label and value
      if (component.armorTypeOptions.length > 0) {
        component.armorTypeOptions.forEach((option: any) => {
          expect(option).toHaveProperty('label')
          expect(option).toHaveProperty('value')
          expect(typeof option.label).toBe('string')
          expect(typeof option.value).toBe('string')
        })
      }
    })

    it('armorTypeOptions returns empty array when API data not loaded', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any

      // Set armorTypes to null/undefined to simulate no API data
      component.armorTypes = null
      await wrapper.vm.$nextTick()

      expect(component.armorTypeOptions).toEqual([])
    })

    it('armor type filter multiselect displays', async () => {
      const wrapper = await mountSuspended(MonstersPage)
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const multiselect = wrapper.find('[data-testid="armor-type-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })
  })
})
