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
      cards.forEach((card) => {
        expect(card.classes()).toContain('animate-pulse')
      })
    })
  })

  describe('skeleton structure', () => {
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
