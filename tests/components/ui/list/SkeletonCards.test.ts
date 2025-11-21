import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonCards from '~/components/ui/list/SkeletonCards.vue'

describe('UiListSkeletonCards', () => {
  describe('rendering', () => {
    it('renders default 6 skeleton cards when count is not provided', () => {
      const wrapper = mount(SkeletonCards)

      // Count the number of cards rendered
      const cards = wrapper.findAll('.animate-pulse')
      expect(cards).toHaveLength(6)
    })

    it('renders custom number of skeleton cards when count is provided', () => {
      const wrapper = mount(SkeletonCards, {
        props: { count: 3 }
      })

      const cards = wrapper.findAll('.animate-pulse')
      expect(cards).toHaveLength(3)
    })

    it('renders 12 skeleton cards when count is 12', () => {
      const wrapper = mount(SkeletonCards, {
        props: { count: 12 }
      })

      const cards = wrapper.findAll('.animate-pulse')
      expect(cards).toHaveLength(12)
    })
  })

  describe('styling', () => {
    it('has animate-pulse class on each card', () => {
      const wrapper = mount(SkeletonCards)

      const cards = wrapper.findAll('.animate-pulse')
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(card => {
        expect(card.classes()).toContain('animate-pulse')
      })
    })

    it('has responsive grid layout classes on container', () => {
      const wrapper = mount(SkeletonCards)

      const container = wrapper.find('div')
      expect(container.classes()).toContain('grid')
      expect(container.classes()).toContain('grid-cols-1')
      expect(container.classes()).toContain('md:grid-cols-2')
      expect(container.classes()).toContain('lg:grid-cols-3')
      expect(container.classes()).toContain('gap-4')
    })
  })

  describe('skeleton structure', () => {
    it('has correct skeleton element structure in each card', () => {
      const wrapper = mount(SkeletonCards)

      // Check for space-y-3 container
      const spaceContainers = wrapper.findAll('.space-y-3')
      expect(spaceContainers.length).toBeGreaterThan(0)

      // Check for badge row (flex gap-2)
      const badgeRows = wrapper.findAll('.flex.gap-2')
      expect(badgeRows.length).toBeGreaterThan(0)

      // Check for badge skeletons in first row
      const firstBadgeRow = badgeRows[0]
      const badgeSkeletons = firstBadgeRow.findAll('.h-5')
      expect(badgeSkeletons).toHaveLength(2)

      // Check first badge skeleton width (w-20)
      expect(badgeSkeletons[0].classes()).toContain('w-20')
      expect(badgeSkeletons[0].classes()).toContain('bg-gray-200')
      expect(badgeSkeletons[0].classes()).toContain('dark:bg-gray-700')

      // Check second badge skeleton width (w-24)
      expect(badgeSkeletons[1].classes()).toContain('w-24')
      expect(badgeSkeletons[1].classes()).toContain('bg-gray-200')
      expect(badgeSkeletons[1].classes()).toContain('dark:bg-gray-700')

      // Check for title skeleton (h-6)
      const titleSkeletons = wrapper.findAll('.h-6')
      expect(titleSkeletons.length).toBeGreaterThan(0)
      expect(titleSkeletons[0].classes()).toContain('w-3/4')

      // Check for subtitle skeleton (h-4)
      const subtitleSkeletons = wrapper.findAll('.h-4')
      expect(subtitleSkeletons.length).toBeGreaterThan(0)
      expect(subtitleSkeletons[0].classes()).toContain('w-1/2')

      // Check for description skeleton (h-16)
      const descriptionSkeletons = wrapper.findAll('.h-16')
      expect(descriptionSkeletons.length).toBeGreaterThan(0)
    })

    it('applies consistent skeleton structure to all cards', () => {
      const wrapper = mount(SkeletonCards, {
        props: { count: 3 }
      })

      // Each card should have the space-y-3 container
      const spaceContainers = wrapper.findAll('.space-y-3')
      expect(spaceContainers).toHaveLength(3)

      // Each card should have badge row
      const badgeRows = wrapper.findAll('.flex.gap-2')
      expect(badgeRows).toHaveLength(3)

      // Each card should have 5 skeleton elements total (2 badges + title + subtitle + description)
      const allSkeletons = wrapper.findAll('.bg-gray-200')
      expect(allSkeletons.length).toBeGreaterThanOrEqual(15) // 5 skeletons * 3 cards
    })
  })

  describe('edge cases', () => {
    it('renders zero cards when count is 0', () => {
      const wrapper = mount(SkeletonCards, {
        props: { count: 0 }
      })

      const cards = wrapper.findAll('.animate-pulse')
      expect(cards).toHaveLength(0)
    })

    it('renders single card when count is 1', () => {
      const wrapper = mount(SkeletonCards, {
        props: { count: 1 }
      })

      const cards = wrapper.findAll('.animate-pulse')
      expect(cards).toHaveLength(1)
    })
  })
})
