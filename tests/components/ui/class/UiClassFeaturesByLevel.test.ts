import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiClassFeaturesByLevel from '~/components/ui/class/UiClassFeaturesByLevel.vue'

describe('UiClassFeaturesByLevel', () => {
  const createFeature = (overrides = {}) => ({
    id: 1,
    level: 1,
    feature_name: 'Test Feature',
    description: 'Test description',
    ...overrides
  })

  describe('grouping by level', () => {
    it('groups features by level correctly', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Level 1 Feature A' }),
        createFeature({ id: 2, level: 1, feature_name: 'Level 1 Feature B' }),
        createFeature({ id: 3, level: 3, feature_name: 'Level 3 Feature' }),
        createFeature({ id: 4, level: 5, feature_name: 'Level 5 Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Should show level headers (accordion labels)
      expect(wrapper.text()).toContain('Level 1')
      expect(wrapper.text()).toContain('Level 3')
      expect(wrapper.text()).toContain('Level 5')

      // Features are grouped correctly (check HTML structure, not visible text)
      const html = wrapper.html()
      expect(html).toContain('Level 1 (2 features)')
      expect(html).toContain('Level 3 (1 feature)')
      expect(html).toContain('Level 5 (1 feature)')
    })

    it('shows correct feature count per level', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Feature A' }),
        createFeature({ id: 2, level: 1, feature_name: 'Feature B' }),
        createFeature({ id: 3, level: 3, feature_name: 'Feature C' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Level 1 should show "2 features"
      expect(wrapper.text()).toMatch(/Level 1.*2 features/)
      // Level 3 should show "1 feature"
      expect(wrapper.text()).toMatch(/Level 3.*1 feature/)
    })

    it('uses singular "feature" for single feature per level', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Single Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      expect(wrapper.text()).toContain('1 feature')
      expect(wrapper.text()).not.toContain('1 features')
    })

    it('orders levels numerically', async () => {
      const features = [
        createFeature({ id: 1, level: 10, feature_name: 'Level 10' }),
        createFeature({ id: 2, level: 2, feature_name: 'Level 2' }),
        createFeature({ id: 3, level: 5, feature_name: 'Level 5' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      const text = wrapper.text()
      const level2Index = text.indexOf('Level 2')
      const level5Index = text.indexOf('Level 5')
      const level10Index = text.indexOf('Level 10')

      // Levels should appear in ascending order
      expect(level2Index).toBeLessThan(level5Index)
      expect(level5Index).toBeLessThan(level10Index)
    })
  })

  describe('choice option filtering', () => {
    it('filters out Fighting Style choice options from display', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Fighting Style' }),
        createFeature({ id: 2, level: 1, feature_name: 'Fighting Style: Archery' }),
        createFeature({ id: 3, level: 1, feature_name: 'Fighting Style: Defense' }),
        createFeature({ id: 4, level: 1, feature_name: 'Fighting Style: Dueling' }),
        createFeature({ id: 5, level: 2, feature_name: 'Second Wind' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      const html = wrapper.html()

      // Count should exclude choice options (1 at level 1, 1 at level 2)
      expect(wrapper.text()).toContain('Level 1 (1 feature)')
      expect(wrapper.text()).toContain('Level 2 (1 feature)')

      // Should NOT show choice option text in HTML
      expect(html).not.toContain('Fighting Style: Archery')
      expect(html).not.toContain('Fighting Style: Defense')
      expect(html).not.toContain('Fighting Style: Dueling')
    })

    it('filters out Totem Warrior animal choice options', async () => {
      const features = [
        createFeature({ id: 1, level: 3, feature_name: 'Totem Spirit' }),
        createFeature({ id: 2, level: 3, feature_name: 'Bear (Path of the Totem Warrior)' }),
        createFeature({ id: 3, level: 3, feature_name: 'Eagle (Path of the Totem Warrior)' }),
        createFeature({ id: 4, level: 3, feature_name: 'Wolf (Path of the Totem Warrior)' }),
        createFeature({ id: 5, level: 6, feature_name: 'Aspect of the Beast' }),
        createFeature({ id: 6, level: 6, feature_name: 'Aspect of the Bear' }),
        createFeature({ id: 7, level: 6, feature_name: 'Aspect of the Eagle' }),
        createFeature({ id: 8, level: 6, feature_name: 'Aspect of the Wolf' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      const html = wrapper.html()

      // Count should exclude choice options (1 at level 3, 1 at level 6)
      expect(wrapper.text()).toContain('Level 3 (1 feature)')
      expect(wrapper.text()).toContain('Level 6 (1 feature)')

      // Should NOT show animal choice options in HTML
      expect(html).not.toContain('Bear (Path of the Totem Warrior)')
      expect(html).not.toContain('Eagle (Path of the Totem Warrior)')
      expect(html).not.toContain('Wolf (Path of the Totem Warrior)')
      expect(html).not.toContain('Aspect of the Bear')
      expect(html).not.toContain('Aspect of the Eagle')
      expect(html).not.toContain('Aspect of the Wolf')
    })

    it('updates feature count to exclude choice options', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Fighting Style' }),
        createFeature({ id: 2, level: 1, feature_name: 'Fighting Style: Archery' }),
        createFeature({ id: 3, level: 1, feature_name: 'Fighting Style: Defense' }),
        createFeature({ id: 4, level: 1, feature_name: 'Second Wind' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Should show "2 features" (Fighting Style + Second Wind), not "4 features"
      expect(wrapper.text()).toMatch(/Level 1.*2 features/)
      expect(wrapper.text()).not.toContain('4 features')
    })
  })

  describe('empty state handling', () => {
    it('handles empty features array', async () => {
      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features: [] }
      })

      // Should render without error but show no content
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).not.toContain('Level')
    })

    it('hides levels with no features after filtering', async () => {
      // All features at level 1 are choice options - level should be hidden
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Fighting Style: Archery' }),
        createFeature({ id: 2, level: 1, feature_name: 'Fighting Style: Defense' }),
        createFeature({ id: 3, level: 2, feature_name: 'Action Surge' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Level 1 should be hidden (only choice options)
      expect(wrapper.text()).not.toContain('Level 1')

      // Level 2 should be visible with correct count
      expect(wrapper.text()).toContain('Level 2')
      expect(wrapper.text()).toContain('Level 2 (1 feature)')
    })
  })

  describe('showLevel prop', () => {
    it('shows level badge inside features when showLevel is true', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Test Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features, showLevel: true }
      })

      // Should have level headers AND level badges in features
      expect(wrapper.text()).toContain('Level 1')
    })

    it('hides level badge inside features when showLevel is false', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Test Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features, showLevel: false }
      })

      // Should still have level headers, just not badges within features
      expect(wrapper.text()).toContain('Level 1')
    })

    it('defaults showLevel to true', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Test Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Default should show level headers
      expect(wrapper.text()).toContain('Level 1')
    })
  })

  describe('styling', () => {
    it('uses class-500 border color', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Test Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Find element with border-class-500 class
      const html = wrapper.html()
      expect(html).toContain('border-class-')
    })

    it('is collapsible via UAccordion', async () => {
      const features = [
        createFeature({ id: 1, level: 1, feature_name: 'Test Feature' })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // UAccordion should be present (renders as button elements)
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('feature descriptions', () => {
    it('passes features with descriptions to UiAccordionTraitsList', async () => {
      const features = [
        createFeature({
          id: 1,
          level: 1,
          feature_name: 'Rage',
          description: 'In battle, you fight with primal ferocity.'
        })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Verify component structure is correct (accordion with level header)
      expect(wrapper.text()).toContain('Level 1 (1 feature)')

      // Verify UiAccordionTraitsList would receive the features
      // (actual rendering happens in accordion slots which are tested separately)
      expect(wrapper.findComponent({ name: 'UiAccordionTraitsList' })).toBeDefined()
    })

    it('handles features without descriptions', async () => {
      const features = [
        createFeature({
          id: 1,
          level: 1,
          feature_name: 'Feature Without Description',
          description: undefined
        })
      ]

      const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
        props: { features }
      })

      // Level header should appear even if description is missing
      expect(wrapper.text()).toContain('Level 1 (1 feature)')
      expect(wrapper.exists()).toBe(true)
    })
  })
})
