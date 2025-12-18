// tests/components/character/sheet/FeaturesPanel.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeaturesPanel from '~/components/character/sheet/FeaturesPanel.vue'
import type { CharacterFeature } from '~/types/character'

// Test fixtures
const mockClassFeature: CharacterFeature = {
  id: 1,
  source: 'class',
  level_acquired: 1,
  feature_type: 'class_feature',
  feature: {
    id: 101,
    name: 'Fighting Style',
    description: 'You adopt a particular style of fighting as your specialty.',
    level: '1',
    is_optional: 'false',
    category: 'class',
    slug: 'phb:fighting-style',
    prerequisite: ''
  }
}

const mockClassFeatureLevel3: CharacterFeature = {
  id: 2,
  source: 'class',
  level_acquired: 3,
  feature_type: 'class_feature',
  feature: {
    id: 102,
    name: 'Martial Archetype',
    description: 'You choose an archetype that you strive to emulate.',
    level: '3',
    is_optional: 'false',
    category: 'class',
    slug: 'phb:martial-archetype',
    prerequisite: ''
  }
}

const mockSubclassFeature: CharacterFeature = {
  id: 3,
  source: 'subclass',
  level_acquired: 3,
  feature_type: 'subclass_feature',
  feature: {
    id: 103,
    name: 'Champion Improved Critical',
    description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.',
    level: '3',
    is_optional: 'false',
    category: 'subclass',
    slug: 'phb:champion-improved-critical',
    prerequisite: ''
  }
}

const mockOptionalFeature: CharacterFeature = {
  id: 4,
  source: 'class',
  level_acquired: 2,
  feature_type: 'class_feature',
  feature: {
    id: 104,
    name: 'Eldritch Invocation: Agonizing Blast',
    description: 'When you cast eldritch blast, add your Charisma modifier to the damage.',
    level: '2',
    is_optional: 'true',
    category: 'class',
    slug: 'phb:eldritch-invocation-agonizing-blast',
    prerequisite: ''
  }
}

const mockRacialFeature: CharacterFeature = {
  id: 5,
  source: 'race',
  level_acquired: 1,
  feature_type: 'racial_trait',
  feature: {
    id: 105,
    name: 'Darkvision',
    description: 'You can see in dim light within 60 feet of you as if it were bright light.',
    level: '1',
    is_optional: 'false',
    category: 'race',
    slug: 'phb:darkvision',
    prerequisite: ''
  }
}

const mockBackgroundFeature: CharacterFeature = {
  id: 6,
  source: 'background',
  level_acquired: 1,
  feature_type: 'background_feature',
  feature: {
    id: 106,
    name: 'Shelter of the Faithful',
    description: 'As an acolyte, you command the respect of those who share your faith.',
    level: '1',
    is_optional: 'false',
    category: 'background',
    slug: 'phb:shelter-of-the-faithful',
    prerequisite: ''
  }
}

describe('FeaturesPanel', () => {
  describe('badge sizes (#797)', () => {
    it('renders source count badges with size="md"', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature, mockClassFeatureLevel3]
        }
      })

      // Find source header badges (showing count of features in each source group)
      // These should use size="md" per project standards
      const badges = wrapper.findAllComponents({ name: 'UBadge' })
      const sourceCountBadge = badges.find(badge => badge.text() === '2')

      expect(sourceCountBadge).toBeDefined()
      expect(sourceCountBadge?.props('size')).toBe('md')
    })

    it('renders level badges with size="md" for class features', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature, mockClassFeatureLevel3]
        }
      })

      // Level badges show "Lvl X" for class/subclass features
      const badges = wrapper.findAllComponents({ name: 'UBadge' })
      const levelBadge = badges.find(badge => badge.text().includes('Lvl 3'))

      expect(levelBadge).toBeDefined()
      expect(levelBadge?.props('size')).toBe('md')
    })

    it('renders level badges with size="md" for subclass features', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockSubclassFeature]
        }
      })

      const badges = wrapper.findAllComponents({ name: 'UBadge' })
      const levelBadge = badges.find(badge => badge.text().includes('Lvl 3'))

      expect(levelBadge).toBeDefined()
      expect(levelBadge?.props('size')).toBe('md')
    })

    it('renders "Chosen" badges with size="md" for optional features', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockOptionalFeature]
        }
      })

      const badges = wrapper.findAllComponents({ name: 'UBadge' })
      const chosenBadge = badges.find(badge => badge.text() === 'Chosen')

      expect(chosenBadge).toBeDefined()
      expect(chosenBadge?.props('size')).toBe('md')
    })

    it('all badges in the component use size="md"', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [
            mockClassFeature,
            mockClassFeatureLevel3,
            mockSubclassFeature,
            mockOptionalFeature,
            mockRacialFeature,
            mockBackgroundFeature
          ]
        }
      })

      const badges = wrapper.findAllComponents({ name: 'UBadge' })

      // Should have multiple badges (source counts + level badges + chosen badge)
      expect(badges.length).toBeGreaterThan(0)

      // ALL badges should use size="md"
      for (const badge of badges) {
        expect(badge.props('size')).toBe('md')
      }
    })
  })

  describe('aria-expanded accessibility (#800)', () => {
    it('toggle buttons have aria-expanded attribute', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature]
        }
      })

      const toggleButton = wrapper.find('[data-testid="feature-toggle-1"]')
      expect(toggleButton.exists()).toBe(true)
      expect(toggleButton.attributes('aria-expanded')).toBeDefined()
    })

    it('aria-expanded is "false" when feature is collapsed', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature]
        }
      })

      const toggleButton = wrapper.find('[data-testid="feature-toggle-1"]')
      expect(toggleButton.attributes('aria-expanded')).toBe('false')
    })

    it('aria-expanded is "true" when feature is expanded', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature]
        }
      })

      const toggleButton = wrapper.find('[data-testid="feature-toggle-1"]')

      // Click to expand
      await toggleButton.trigger('click')

      expect(toggleButton.attributes('aria-expanded')).toBe('true')
    })

    it('aria-expanded toggles correctly on multiple clicks', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature]
        }
      })

      const toggleButton = wrapper.find('[data-testid="feature-toggle-1"]')

      // Initially collapsed
      expect(toggleButton.attributes('aria-expanded')).toBe('false')

      // Click to expand
      await toggleButton.trigger('click')
      expect(toggleButton.attributes('aria-expanded')).toBe('true')

      // Click to collapse
      await toggleButton.trigger('click')
      expect(toggleButton.attributes('aria-expanded')).toBe('false')
    })

    it('each feature toggle has independent aria-expanded state', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature, mockClassFeatureLevel3]
        }
      })

      const toggleButton1 = wrapper.find('[data-testid="feature-toggle-1"]')
      const toggleButton2 = wrapper.find('[data-testid="feature-toggle-2"]')

      // Both start collapsed
      expect(toggleButton1.attributes('aria-expanded')).toBe('false')
      expect(toggleButton2.attributes('aria-expanded')).toBe('false')

      // Expand first one only
      await toggleButton1.trigger('click')

      expect(toggleButton1.attributes('aria-expanded')).toBe('true')
      expect(toggleButton2.attributes('aria-expanded')).toBe('false')
    })
  })

  describe('basic functionality', () => {
    it('displays feature name', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature]
        }
      })

      expect(wrapper.text()).toContain('Fighting Style')
    })

    it('groups features by source', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature, mockRacialFeature, mockBackgroundFeature]
        }
      })

      expect(wrapper.text()).toContain('Class Features')
      expect(wrapper.text()).toContain('Racial Traits')
      expect(wrapper.text()).toContain('Background Feature')
    })

    it('shows empty state when no features', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: []
        }
      })

      expect(wrapper.text()).toContain('No features yet')
    })

    it('expands feature to show description on click', async () => {
      const wrapper = await mountSuspended(FeaturesPanel, {
        props: {
          features: [mockClassFeature]
        }
      })

      // Description should not be visible initially
      expect(wrapper.text()).not.toContain('You adopt a particular style')

      // Click to expand
      const toggleButton = wrapper.find('[data-testid="feature-toggle-1"]')
      await toggleButton.trigger('click')

      // Description should now be visible
      expect(wrapper.text()).toContain('You adopt a particular style')
    })
  })
})
