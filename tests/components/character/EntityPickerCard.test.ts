// tests/components/character/EntityPickerCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EntityPickerCard from '~/components/character/EntityPickerCard.vue'

/**
 * Generic EntityPickerCard tests
 *
 * This component provides the shared structure for entity picker cards:
 * - Selection styling (ring when selected)
 * - Background image layer
 * - Selected checkmark badge
 * - View Details button
 * - Entity-specific content via slots
 */
describe('EntityPickerCard', () => {
  const mockEntity = {
    name: 'Test Entity',
    slug: 'test-entity',
    description: 'A test entity for testing purposes.'
  }

  describe('rendering', () => {
    it('renders entity name', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      expect(wrapper.text()).toContain('Test Entity')
    })

    it('renders description when provided', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      expect(wrapper.text()).toContain('A test entity for testing purposes.')
    })

    it('handles missing description gracefully', async () => {
      const entityWithoutDescription = { ...mockEntity, description: undefined }
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: entityWithoutDescription,
          selected: false,
          color: 'race'
        }
      })
      expect(wrapper.html()).toBeTruthy()
    })
  })

  describe('selection state', () => {
    it('shows selected styling when selected', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: true,
          color: 'race'
        }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"]')
      expect(pickerCard.classes()).toContain('ring-2')
    })

    it('does not show selected styling when not selected', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"]')
      expect(pickerCard.classes()).not.toContain('ring-2')
    })

    it('shows checkmark badge when selected', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: true,
          color: 'race'
        }
      })
      // Check for success badge with check icon
      expect(wrapper.html()).toContain('i-heroicons-check')
    })

    it('does not show checkmark badge when not selected', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      // Badge container should not be visible
      expect(wrapper.find('[data-testid="selected-check"]').exists()).toBe(false)
    })
  })

  describe('color theming', () => {
    it('applies race color when color prop is race', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: true,
          color: 'race'
        }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"]')
      expect(pickerCard.classes()).toContain('ring-race-500')
    })

    it('applies class color when color prop is class', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: true,
          color: 'class'
        }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"]')
      expect(pickerCard.classes()).toContain('ring-class-500')
    })

    it('applies background color when color prop is background', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: true,
          color: 'background'
        }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"]')
      expect(pickerCard.classes()).toContain('ring-background-500')
    })
  })

  describe('events', () => {
    it('emits select event when card is clicked', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      const pickerCard = wrapper.find('[data-testid="picker-card"]')
      await pickerCard.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockEntity])
    })

    it('emits view-details event when View Details button is clicked', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      const detailsBtn = wrapper.find('[data-testid="view-details-btn"]')
      await detailsBtn.trigger('click')

      expect(wrapper.emitted('view-details')).toBeTruthy()
    })

    it('does not emit select when View Details is clicked', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      const detailsBtn = wrapper.find('[data-testid="view-details-btn"]')
      await detailsBtn.trigger('click')

      expect(wrapper.emitted('select')).toBeFalsy()
    })
  })

  describe('background image', () => {
    it('shows background image when imageType and slug are provided', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race',
          imageType: 'races'
        }
      })
      // Background image layer should exist
      const bgLayer = wrapper.find('.bg-cover')
      expect(bgLayer.exists()).toBe(true)
    })

    it('does not show background image when imageType is not provided', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      // Background image should not have style with url
      const bgLayers = wrapper.findAll('.bg-cover')
      const hasBackgroundImage = bgLayers.some(el => el.attributes('style')?.includes('url'))
      expect(hasBackgroundImage).toBe(false)
    })
  })

  describe('slots', () => {
    it('renders badges slot content', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        },
        slots: {
          badges: '<span data-testid="custom-badge">Custom Badge</span>'
        }
      })
      expect(wrapper.find('[data-testid="custom-badge"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Badge')
    })

    it('renders stats slot content', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        },
        slots: {
          stats: '<span data-testid="custom-stats">Speed: 30 ft</span>'
        }
      })
      expect(wrapper.find('[data-testid="custom-stats"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Speed: 30 ft')
    })
  })

  describe('View Details button', () => {
    it('shows View Details button by default', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race'
        }
      })
      expect(wrapper.text()).toContain('View Details')
    })

    it('hides View Details button when hideViewDetails is true', async () => {
      const wrapper = await mountSuspended(EntityPickerCard, {
        props: {
          entity: mockEntity,
          selected: false,
          color: 'race',
          hideViewDetails: true
        }
      })
      expect(wrapper.text()).not.toContain('View Details')
    })
  })
})
