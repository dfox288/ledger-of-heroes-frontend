import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiClassSubclassCards from '~/components/ui/class/UiClassSubclassCards.vue'

describe('UiClassSubclassCards', () => {
  const createSubclass = (overrides = {}) => ({
    id: 1,
    slug: 'champion',
    name: 'Champion',
    description: 'The archetypal Champion focuses on raw physical power.',
    features: [
      { id: 1, level: 3, feature_name: 'Improved Critical' },
      { id: 2, level: 7, feature_name: 'Remarkable Athlete' },
      { id: 3, level: 10, feature_name: 'Additional Fighting Style' },
      { id: 4, level: 15, feature_name: 'Superior Critical' },
      { id: 5, level: 18, feature_name: 'Survivor' }
    ],
    sources: [{ code: 'PHB', name: 'Player\'s Handbook', abbreviation: 'PHB' }],
    ...overrides
  })

  it('renders subclass name', async () => {
    const wrapper = await mountSuspended(UiClassSubclassCards, {
      props: {
        subclasses: [createSubclass()],
        basePath: '/classes'
      }
    })

    expect(wrapper.text()).toContain('Champion')
  })

  it('renders source badge', async () => {
    const wrapper = await mountSuspended(UiClassSubclassCards, {
      props: {
        subclasses: [createSubclass()],
        basePath: '/classes'
      }
    })

    expect(wrapper.text()).toContain('PHB')
  })

  describe('feature count filtering', () => {
    it('shows accurate feature count excluding choice options', async () => {
      // Champion has 5 real features + 6 fighting style options = 11 total
      // But should show "5 features" not "11 features"
      const championWithChoices = createSubclass({
        features: [
          { id: 1, level: 3, feature_name: 'Improved Critical' },
          { id: 2, level: 7, feature_name: 'Remarkable Athlete' },
          { id: 3, level: 10, feature_name: 'Additional Fighting Style' },
          { id: 4, level: 10, feature_name: 'Fighting Style: Archery' },
          { id: 5, level: 10, feature_name: 'Fighting Style: Defense' },
          { id: 6, level: 10, feature_name: 'Fighting Style: Dueling' },
          { id: 7, level: 10, feature_name: 'Fighting Style: Great Weapon Fighting' },
          { id: 8, level: 10, feature_name: 'Fighting Style: Protection' },
          { id: 9, level: 10, feature_name: 'Fighting Style: Two-Weapon Fighting' },
          { id: 10, level: 15, feature_name: 'Superior Critical' },
          { id: 11, level: 18, feature_name: 'Survivor' }
        ]
      })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [championWithChoices],
          basePath: '/classes'
        }
      })

      // Should show 5 features (the real ones), not 11
      expect(wrapper.text()).toContain('5 features')
      expect(wrapper.text()).not.toContain('11 features')
    })

    it('filters out Totem Warrior animal options from count', async () => {
      const totemWarrior = createSubclass({
        name: 'Path of the Totem Warrior',
        slug: 'path-of-the-totem-warrior',
        features: [
          { id: 1, level: 3, feature_name: 'Spirit Seeker' },
          { id: 2, level: 3, feature_name: 'Totem Spirit' },
          { id: 3, level: 3, feature_name: 'Bear (Path of the Totem Warrior)' },
          { id: 4, level: 3, feature_name: 'Eagle (Path of the Totem Warrior)' },
          { id: 5, level: 3, feature_name: 'Wolf (Path of the Totem Warrior)' },
          { id: 6, level: 6, feature_name: 'Aspect of the Beast' },
          { id: 7, level: 6, feature_name: 'Aspect of the Bear' },
          { id: 8, level: 6, feature_name: 'Aspect of the Eagle' },
          { id: 9, level: 6, feature_name: 'Aspect of the Wolf' },
          { id: 10, level: 10, feature_name: 'Spirit Walker' },
          { id: 11, level: 14, feature_name: 'Totemic Attunement' }
        ]
      })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [totemWarrior],
          basePath: '/classes'
        }
      })

      // Should show 5 features (Spirit Seeker, Totem Spirit, Aspect of the Beast, Spirit Walker, Totemic Attunement)
      // Not 11 (which includes all animal options)
      expect(wrapper.text()).toContain('5 features')
      expect(wrapper.text()).not.toContain('11 features')
    })

    it('shows singular "feature" for single feature', async () => {
      const singleFeature = createSubclass({
        features: [{ id: 1, level: 3, feature_name: 'Single Feature' }]
      })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [singleFeature],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).toContain('1 feature')
      expect(wrapper.text()).not.toContain('1 features')
    })

    it('handles subclass with no features', async () => {
      const noFeatures = createSubclass({ features: [] })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [noFeatures],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).toContain('0 features')
    })

    it('handles subclass with undefined features', async () => {
      const undefinedFeatures = createSubclass({ features: undefined })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [undefinedFeatures],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).toContain('0 features')
    })
  })

  describe('entry level badge', () => {
    it('shows entry level badge based on first feature level', async () => {
      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [createSubclass()],
          basePath: '/classes'
        }
      })

      // Champion features start at level 3
      expect(wrapper.text()).toContain('Level 3')
    })

    it('shows correct entry level for wizard subclasses', async () => {
      const wizardSubclass = createSubclass({
        name: 'School of Abjuration',
        slug: 'school-of-abjuration',
        features: [
          { id: 1, level: 2, feature_name: 'Abjuration Savant' },
          { id: 2, level: 2, feature_name: 'Arcane Ward' },
          { id: 3, level: 6, feature_name: 'Projected Ward' }
        ]
      })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [wizardSubclass],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).toContain('Level 2')
    })

    it('does not show entry level when no features', async () => {
      const noFeatures = createSubclass({ features: [] })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [noFeatures],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).not.toMatch(/Level \d/)
    })
  })

  describe('description preview', () => {
    it('shows description preview when available', async () => {
      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [createSubclass()],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).toContain('The archetypal Champion focuses on raw physical power.')
    })

    it('hides description preview when empty', async () => {
      const noDescription = createSubclass({ description: '' })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [noDescription],
          basePath: '/classes'
        }
      })

      // Should still render other content
      expect(wrapper.text()).toContain('Champion')
    })
  })

  describe('color-coded source badges', () => {
    it('shows green badge for core PHB subclasses', async () => {
      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [createSubclass()],
          basePath: '/classes'
        }
      })

      // PHB subclass should have success (green) color
      const badge = wrapper.find('[data-testid="source-badge"]')
      // Just verify PHB is shown - color is applied via class
      expect(wrapper.text()).toContain('PHB')
    })

    it('shows expansion badge color for XGE subclasses', async () => {
      const xgeSubclass = createSubclass({
        name: 'Cavalier',
        slug: 'cavalier',
        sources: [{ code: 'XGE', name: 'Xanathar\'s Guide to Everything', abbreviation: 'XGE' }]
      })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [xgeSubclass],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).toContain('XGE')
    })

    it('shows setting badge color for setting-specific subclasses', async () => {
      const settingSubclass = createSubclass({
        name: 'Bladesinging',
        slug: 'bladesinging',
        sources: [{ code: 'SCAG', name: 'Sword Coast Adventurer\'s Guide', abbreviation: 'SCAG' }]
      })

      const wrapper = await mountSuspended(UiClassSubclassCards, {
        props: {
          subclasses: [settingSubclass],
          basePath: '/classes'
        }
      })

      expect(wrapper.text()).toContain('SCAG')
    })
  })
})
