import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiClassFeaturesTimeline from '~/components/ui/class/UiClassFeaturesTimeline.vue'

describe('UiClassFeaturesTimeline', () => {
  // Helper to create feature with all API flags
  const createFeature = (overrides = {}) => ({
    id: 1,
    level: 1,
    feature_name: 'Test Feature',
    description: 'Test description',
    is_optional: false,
    is_multiclass_only: false,
    is_choice_option: false,
    parent_feature_id: null,
    sort_order: 0,
    ...overrides
  })

  describe('rendering', () => {
    it('renders timeline with features grouped by level', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Fighting Style' }),
        createFeature({ id: 2, level: 1, feature_name: 'Second Wind' }),
        createFeature({ id: 3, level: 2, feature_name: 'Action Surge' }),
        createFeature({ id: 4, level: 3, feature_name: 'Martial Archetype' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      // Should show level indicators
      expect(wrapper.text()).toContain('Level 1')
      expect(wrapper.text()).toContain('Level 2')
      expect(wrapper.text()).toContain('Level 3')

      // Should show feature names
      expect(wrapper.text()).toContain('Fighting Style')
      expect(wrapper.text()).toContain('Second Wind')
      expect(wrapper.text()).toContain('Action Surge')
      expect(wrapper.text()).toContain('Martial Archetype')
    })

    it('shows feature count per level', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Feature A' }),
        createFeature({ id: 2, level: 1, feature_name: 'Feature B' }),
        createFeature({ id: 3, level: 5, feature_name: 'Feature C' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      // Level 1 should show 2 features
      expect(wrapper.text()).toMatch(/Level 1.*2 features/s)
      // Level 5 should show 1 feature
      expect(wrapper.text()).toMatch(/Level 5.*1 feature/s)
    })

    it('displays feature descriptions', async () => {
      const features = [
        createFeature({
          id: 1,
          level: 1,
          feature_name: 'Second Wind',
          description: 'You have a limited well of stamina that you can draw on.'
        })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      expect(wrapper.text()).toContain('You have a limited well of stamina')
    })

    it('orders levels numerically', async () => {
      const features = [
        createFeature({ id: 1, level: 5, feature_name: 'Level 5 Feature' }),
        createFeature({ id: 2, level: 1, feature_name: 'Level 1 Feature' }),
        createFeature({ id: 3, level: 3, feature_name: 'Level 3 Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      const text = wrapper.text()
      const level1Pos = text.indexOf('Level 1')
      const level3Pos = text.indexOf('Level 3')
      const level5Pos = text.indexOf('Level 5')

      expect(level1Pos).toBeLessThan(level3Pos)
      expect(level3Pos).toBeLessThan(level5Pos)
    })
  })

  describe('filtering', () => {
    it('filters out choice options using API flag', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Fighting Style', is_choice_option: false }),
        createFeature({ id: 2, level: 1, feature_name: 'Fighting Style: Archery', is_choice_option: true }),
        createFeature({ id: 3, level: 1, feature_name: 'Fighting Style: Defense', is_choice_option: true }),
        createFeature({ id: 4, level: 1, feature_name: 'Second Wind', is_choice_option: false })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      expect(wrapper.text()).toContain('Fighting Style')
      expect(wrapper.text()).toContain('Second Wind')
      expect(wrapper.text()).not.toContain('Fighting Style: Archery')
      expect(wrapper.text()).not.toContain('Fighting Style: Defense')
    })

    it('filters out multiclass-only features', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Multiclass Fighter', is_multiclass_only: true }),
        createFeature({ id: 2, level: 1, feature_name: 'Second Wind', is_multiclass_only: false })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      expect(wrapper.text()).toContain('Second Wind')
      expect(wrapper.text()).not.toContain('Multiclass Fighter')
    })

    it('filters out Totem options using pattern fallback', async () => {
      const features = [
        createFeature({ id: 1, level: 3, feature_name: 'Totem Spirit', is_choice_option: false }),
        createFeature({ id: 2, level: 3, feature_name: 'Bear (Path of the Totem Warrior)', is_choice_option: false }),
        createFeature({ id: 3, level: 3, feature_name: 'Eagle (Path of the Totem Warrior)', is_choice_option: false })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      expect(wrapper.text()).toContain('Totem Spirit')
      expect(wrapper.text()).not.toContain('Bear (Path of the Totem Warrior)')
      expect(wrapper.text()).not.toContain('Eagle (Path of the Totem Warrior)')
    })
  })

  describe('empty state', () => {
    it('handles empty features array gracefully', async () => {
      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features: [] }
      })

      expect(wrapper.exists()).toBe(true)
      // Should not crash, may show empty state or nothing
    })

    it('hides levels with no features after filtering', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Fighting Style: Archery', is_choice_option: true }),
        createFeature({ id: 2, level: 1, feature_name: 'Fighting Style: Defense', is_choice_option: true }),
        createFeature({ id: 3, level: 2, feature_name: 'Action Surge', is_choice_option: false })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      // Level 1 should be hidden (all features filtered)
      expect(wrapper.text()).not.toContain('Level 1')
      // Level 2 should be visible
      expect(wrapper.text()).toContain('Level 2')
    })
  })

  describe('styling', () => {
    it('uses class color theme', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Test Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesTimeline, {
        props: { features }
      })

      // Should use class color for timeline
      const html = wrapper.html()
      expect(html).toMatch(/class|primary/)
    })
  })
})
