// tests/helpers/pickerCardBehavior.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Component } from 'vue'

/**
 * Configuration for picker card behavior tests
 */
interface PickerCardTestConfig<T> {
  component: Component
  mockEntity: T
  entityName: string
  propName: string
}

/**
 * Shared test suite for picker card components (RacePickerCard, ClassPickerCard, BackgroundPickerCard)
 *
 * Tests the common behavior:
 * - Renders entity name
 * - Shows selected styling when selected
 * - Does not show selected styling when not selected
 * - Emits select event when card is clicked
 * - Shows View Details button
 * - Emits view-details event when View Details button is clicked
 *
 * @example
 * testPickerCardBehavior({
 *   component: RacePickerCard,
 *   mockEntity: mockRace,
 *   entityName: 'Dwarf',
 *   propName: 'race'
 * })
 */
export function testPickerCardBehavior<T extends { name: string }>(
  config: PickerCardTestConfig<T>
) {
  const { component, mockEntity, entityName, propName } = config

  describe('Picker Card Common Behavior', () => {
    it('renders the entity name', async () => {
      const wrapper = await mountSuspended(component, {
        props: { [propName]: mockEntity, selected: false }
      })
      expect(wrapper.text()).toContain(entityName)
    })

    it('shows selected styling when selected', async () => {
      const wrapper = await mountSuspended(component, {
        props: { [propName]: mockEntity, selected: true }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"], [data-testid="picker-card"]')
      expect(pickerCard.classes()).toContain('ring-2')
    })

    it('does not show selected styling when not selected', async () => {
      const wrapper = await mountSuspended(component, {
        props: { [propName]: mockEntity, selected: false }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"], [data-testid="picker-card"]')
      expect(pickerCard.classes()).not.toContain('ring-2')
    })

    it('emits select event when card is clicked', async () => {
      const wrapper = await mountSuspended(component, {
        props: { [propName]: mockEntity, selected: false }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"], [data-testid="picker-card"]')
      await pickerCard.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockEntity])
    })

    it('shows View Details button', async () => {
      const wrapper = await mountSuspended(component, {
        props: { [propName]: mockEntity, selected: false }
      })
      expect(wrapper.text()).toContain('View Details')
    })

    it('emits view-details event when View Details button is clicked', async () => {
      const wrapper = await mountSuspended(component, {
        props: { [propName]: mockEntity, selected: false }
      })
      const detailsBtn = wrapper.find('[data-testid="view-details-btn"], [data-testid="view-details-btn"]')
      await detailsBtn.trigger('click')

      // Check for both event name variations (kebab-case and camelCase)
      const emittedEvents = wrapper.emitted()
      const hasViewDetails = emittedEvents['view-details'] || emittedEvents['viewDetails']
      expect(hasViewDetails).toBeTruthy()

      // Should not also emit select
      expect(wrapper.emitted('select')).toBeFalsy()
    })
  })
}
