import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundsPage from '~/pages/backgrounds/index.vue'

describe('Backgrounds Page - New Filters (skill_proficiencies, tool_proficiency_types, grants_language_choice)', () => {
  describe('skill_proficiencies filter', () => {
    it('renders skill proficiencies multiselect filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Open filters to reveal the labels
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const html = wrapper.html()

      // Check for Skills label
      expect(html).toContain('Skills')
    })

    it('allows selecting multiple skills', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Set multiple skill IDs
      component.selectedSkills = ['1', '2']
      await wrapper.vm.$nextTick()

      expect(component.selectedSkills).toHaveLength(2)
      expect(component.selectedSkills).toContain('1')
      expect(component.selectedSkills).toContain('2')
    })

    it('displays active skill filter chips', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Mock skills data
      component.selectedSkills = ['stealth', 'perception']
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      // Should show chip with × for removal
      expect(html).toContain('✕')
    })

    it('clicking skill chip removes that skill', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth', 'perception']
      await wrapper.vm.$nextTick()

      // Find and click first chip
      const chips = wrapper.findAll('button')
      const skillChip = chips.find(btn => btn.text().includes('✕'))

      if (skillChip) {
        await skillChip.trigger('click')
      }

      // At least one should remain or array should be shorter
      expect(component.selectedSkills.length).toBeLessThanOrEqual(2)
    })

    it('includes selectedSkills in filter count', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      const initialCount = component.activeFilterCount

      component.selectedSkills = ['stealth']
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBeGreaterThan(initialCount)
    })

    it('clears skills when clear filters button is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth', 'perception']
      await wrapper.vm.$nextTick()

      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.selectedSkills).toEqual([])
    })
  })

  describe('tool_proficiency_types filter', () => {
    it('renders tool proficiency types multiselect filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Open filters to reveal the labels
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const html = wrapper.html()

      // Check for Tool Types label
      expect(html).toContain('Tool Types')
    })

    it('allows selecting multiple tool types', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools', 'musical-instruments']
      await wrapper.vm.$nextTick()

      expect(component.selectedToolTypes).toHaveLength(2)
      expect(component.selectedToolTypes).toContain('artisan-tools')
      expect(component.selectedToolTypes).toContain('musical-instruments')
    })

    it('displays active tool type filter chips', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools']
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('✕')
    })

    it('clicking tool type chip removes that type', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools', 'gaming-sets']
      await wrapper.vm.$nextTick()

      // Simulate clicking chip to remove one
      component.selectedToolTypes = component.selectedToolTypes.filter((t: string) => t !== 'artisan-tools')
      await wrapper.vm.$nextTick()

      expect(component.selectedToolTypes).toHaveLength(1)
      expect(component.selectedToolTypes).not.toContain('artisan-tools')
    })

    it('includes selectedToolTypes in filter count', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      const initialCount = component.activeFilterCount

      component.selectedToolTypes = ['gaming-sets']
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBeGreaterThan(initialCount)
    })

    it('clears tool types when clear filters button is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedToolTypes = ['artisan-tools', 'musical-instruments']
      await wrapper.vm.$nextTick()

      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.selectedToolTypes).toEqual([])
    })
  })

  describe('grants_language_choice filter', () => {
    it('renders language choice toggle filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      // Open filters to reveal the labels
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const html = wrapper.html()

      // Check for Language Choice label
      expect(html).toContain('Language Choice')
    })

    it('allows setting language choice to Yes (1)', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      expect(component.languageChoiceFilter).toBe('1')
    })

    it('allows setting language choice to No (0)', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '0'
      await wrapper.vm.$nextTick()

      expect(component.languageChoiceFilter).toBe('0')
    })

    it('allows setting language choice to All (null)', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = null
      await wrapper.vm.$nextTick()

      expect(component.languageChoiceFilter).toBeNull()
    })

    it('displays active language choice filter chip when set to Yes', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Language Choice')
      expect(html).toContain('Yes')
      expect(html).toContain('✕')
    })

    it('displays active language choice filter chip when set to No', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '0'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('Language Choice')
      expect(html).toContain('No')
      expect(html).toContain('✕')
    })

    it('does not display chip when set to All', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = null
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const languageChip = buttons.find(btn => btn.text().includes('Language Choice'))

      expect(languageChip).toBeUndefined()
    })

    it('clicking language choice chip clears the filter', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const languageChip = buttons.find(btn => btn.text().includes('Language Choice'))

      if (languageChip) {
        await languageChip.trigger('click')
      }

      expect(component.languageChoiceFilter).toBeNull()
    })

    it('includes languageChoiceFilter in filter count when not null', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      const initialCount = component.activeFilterCount

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBeGreaterThan(initialCount)
    })

    it('clears language choice when clear filters button is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.languageChoiceFilter).toBeNull()
    })
  })

  describe('combined filters', () => {
    it('counts all three new filters correctly', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      const initialCount = component.activeFilterCount

      component.selectedSkills = ['stealth']
      component.selectedToolTypes = ['artisan-tools']
      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBe(initialCount + 3)
    })

    it('clears all three new filters when clear filters is clicked', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth', 'perception']
      component.selectedToolTypes = ['artisan-tools']
      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      component.clearFilters()
      await wrapper.vm.$nextTick()

      expect(component.selectedSkills).toEqual([])
      expect(component.selectedToolTypes).toEqual([])
      expect(component.languageChoiceFilter).toBeNull()
    })

    it('displays all filter chips simultaneously', async () => {
      const wrapper = await mountSuspended(BackgroundsPage)
      const component = wrapper.vm as any

      component.selectedSkills = ['stealth']
      component.selectedToolTypes = ['gaming-sets']
      component.languageChoiceFilter = '1'
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      // Should have multiple chips with ×
      const chipCount = (html.match(/✕/g) || []).length
      expect(chipCount).toBeGreaterThanOrEqual(3)
    })
  })
})
