import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MonstersPage from '~/pages/monsters/index.vue'

describe('Monsters Page - Filter Layout', () => {
  describe('Layout improvements', () => {
    it('displays "Active filters:" label (not "Active:")', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Apply a filter to show chips
      const component = wrapper.vm as any
      component.selectedType = 'dragon'

      await wrapper.vm.$nextTick()

      // Look for the label
      const text = wrapper.text()
      expect(text).toContain('Active filters:')
      expect(text).not.toContain('Active:')
    })

    it('positions Clear filters button on same row as Active filters', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Apply filters
      const component = wrapper.vm as any
      component.selectedType = 'dragon'
      component.filtersOpen = true

      await wrapper.vm.$nextTick()

      // Find the chips container
      const chipsRow = wrapper.find('.flex.flex-wrap.items-center.justify-between')
      expect(chipsRow.exists()).toBe(true)

      // Check structure: left side has label + chips, right side has button
      const buttons = chipsRow.findAll('button')
      const clearButton = buttons.find(btn => btn.text().includes('Clear filters'))
      expect(clearButton?.exists()).toBe(true)
    })

    it('shows Clear filters button only when filters are active', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // No filters active initially
      let clearButton = wrapper.find('button:contains("Clear filters")')
      expect(clearButton.exists()).toBe(false)

      // Apply a filter
      const component = wrapper.vm as any
      component.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      // Button should appear
      const buttons = wrapper.findAll('button')
      const clearButtons = buttons.filter(btn => btn.text().includes('Clear filters'))
      expect(clearButtons.length).toBeGreaterThan(0)
    })
  })

  describe('CR Filter - Multiselect', () => {
    it('displays CR filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="cr-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('does not have label on CR filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Open filters
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Check that there's no separate label element for CR
      const filterSection = wrapper.find('[data-testid="cr-filter-multiselect"]')
      expect(filterSection.exists()).toBe(true)

      // The component itself shouldn't have a label prop creating a separate label
      const labels = wrapper.findAll('label')
      const crLabel = labels.find(label => label.text().includes('Challenge Rating'))
      expect(crLabel?.exists()).toBeFalsy()
    })

    it('allows selecting multiple CR values', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Select multiple CRs (as strings, per UiFilterMultiSelect)
      component.selectedCRs = ['0', '5', '17']
      await wrapper.vm.$nextTick()

      expect(component.selectedCRs).toEqual(['0', '5', '17'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      expect(Array.isArray(component.selectedCRs)).toBe(true)
      expect(component.selectedCRs.length).toBe(0)
    })
  })

  describe('CR Filter chip display', () => {
    it('shows chip with selected CR labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select multiple CRs (as strings)
      const component = wrapper.vm as any
      component.selectedCRs = ['0', '5', '17']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('CRs')
      expect(chip.text()).toContain('0')
      expect(chip.text()).toContain('5')
      expect(chip.text()).toContain('17')
    })

    it('shows single CR without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select single CR (as string)
      const component = wrapper.vm as any
      component.selectedCRs = ['5']

      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('CR')
      expect(chip.text()).not.toContain('CRs')
      expect(chip.text()).toContain('5')
    })

    it('clicking chip clears CR filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select CRs (as strings)
      const component = wrapper.vm as any
      component.selectedCRs = ['0', '5']

      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      await chip.trigger('click')

      // CRs should be cleared
      expect(component.selectedCRs).toEqual([])
    })

    it('does not show chip when no CRs selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedCRs = []

      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="cr-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Filter integration', () => {
    it('clears all filters including CRs', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Set multiple filters
      component.selectedCRs = ['0', '5']
      component.selectedType = 'dragon'
      component.isLegendary = '1'

      await wrapper.vm.$nextTick()

      // Clear all filters
      component.clearFilters()
      await wrapper.vm.$nextTick()

      // All should be cleared
      expect(component.selectedCRs).toEqual([])
      expect(component.selectedType).toBeNull()
      expect(component.isLegendary).toBeNull()
    })

    it('counts CR multiselect in active filter count', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Initially 0
      expect(component.activeFilterCount).toBe(0)

      // Add CR filter (array with values counts as 1)
      component.selectedCRs = ['0', '5', '17']
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBe(1)

      // Add type filter
      component.selectedType = 'dragon'
      await wrapper.vm.$nextTick()

      expect(component.activeFilterCount).toBe(2)
    })
  })

  describe('Size Filter - Multiselect', () => {
    it('displays size filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="size-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple sizes', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Select multiple sizes (as strings - size IDs)
      component.selectedSizes = ['1', '3', '6']
      await wrapper.vm.$nextTick()

      expect(component.selectedSizes).toEqual(['1', '3', '6'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      expect(Array.isArray(component.selectedSizes)).toBe(true)
      expect(component.selectedSizes.length).toBe(0)
    })
  })

  describe('Size Filter chip display', () => {
    it('shows chip with selected size labels', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select multiple sizes (as strings)
      const component = wrapper.vm as any
      component.selectedSizes = ['1', '3', '6']

      await wrapper.vm.$nextTick()

      // Wait for sizeOptions to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Sizes')
      // Note: Size labels may show as IDs in tests if reference data hasn't loaded
      // Check for either names or IDs
      const chipText = chip.text()
      expect(chipText).toMatch(/Sizes: (Tiny|1)/)
    })

    it('shows single size without plural', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select single size (as string)
      const component = wrapper.vm as any
      component.selectedSizes = ['3']

      await wrapper.vm.$nextTick()

      // Wait for sizeOptions to load
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Look for chip
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain('Size')
      expect(chip.text()).not.toContain('Sizes')
      // Note: Size labels may show as IDs in tests if reference data hasn't loaded
      const chipText = chip.text()
      expect(chipText).toMatch(/Size: (Medium|3)/)
    })

    it('clicking chip clears size filter', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Select sizes (as strings)
      const component = wrapper.vm as any
      component.selectedSizes = ['1', '3']

      await wrapper.vm.$nextTick()

      // Click chip
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      await chip.trigger('click')

      // Sizes should be cleared
      expect(component.selectedSizes).toEqual([])
    })

    it('does not show chip when no sizes selected', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.selectedSizes = []

      await wrapper.vm.$nextTick()

      // Chip should not exist
      const chip = wrapper.find('[data-testid="size-filter-chip"]')
      expect(chip.exists()).toBe(false)
    })
  })

  describe('Alignment Filter - Multiselect', () => {
    it('displays alignment filter multiselect', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      // Open filters first
      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      // Look for the multiselect
      const multiselect = wrapper.find('[data-testid="alignment-filter-multiselect"]')
      expect(multiselect.exists()).toBe(true)
    })

    it('allows selecting multiple alignments', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any

      // Select multiple alignments
      component.selectedAlignments = ['Lawful Good', 'Chaotic Evil', 'Neutral']
      await wrapper.vm.$nextTick()

      expect(component.selectedAlignments).toEqual(['Lawful Good', 'Chaotic Evil', 'Neutral'])
    })

    it('initializes as empty array', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      expect(Array.isArray(component.selectedAlignments)).toBe(true)
      expect(component.selectedAlignments.length).toBe(0)
    })
  })

  describe('Speed Filter Toggles', () => {
    it('displays has fly toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-fly-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays has swim toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-swim-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays has burrow toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-burrow-toggle"]')
      expect(toggle.exists()).toBe(true)
    })

    it('displays has climb toggle', async () => {
      const wrapper = await mountSuspended(MonstersPage)

      const component = wrapper.vm as any
      component.filtersOpen = true
      await wrapper.vm.$nextTick()

      const toggle = wrapper.find('[data-testid="has-climb-toggle"]')
      expect(toggle.exists()).toBe(true)
    })
  })
})
