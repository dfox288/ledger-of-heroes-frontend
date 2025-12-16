// tests/components/character/sheet/OptionalFeaturesPanel.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import OptionalFeaturesPanel from '~/components/character/sheet/OptionalFeaturesPanel.vue'
import type { FeatureSelection } from '~/types/character'

// Mock artificer infusions
const artificerInfusions: FeatureSelection[] = [
  {
    feature: 'Armor of Magical Strength',
    feature_slug: 'tce:armor-of-magical-strength',
    feature_type: 'artificer_infusion',
    class: 'Artificer',
    class_slug: 'erlw:artificer',
    subclass_name: null,
    level_acquired: 2,
    is_dangling: false
  },
  {
    feature: 'Enhanced Weapon',
    feature_slug: 'erlw:enhanced-weapon',
    feature_type: 'artificer_infusion',
    class: 'Artificer',
    class_slug: 'erlw:artificer',
    subclass_name: null,
    level_acquired: 10,
    is_dangling: false
  },
  {
    feature: 'Homunculus Servant',
    feature_slug: 'erlw:homunculus-servant',
    feature_type: 'artificer_infusion',
    class: 'Artificer',
    class_slug: 'erlw:artificer',
    subclass_name: null,
    level_acquired: 2,
    is_dangling: false
  }
]

// Mock warlock invocations
const warlockInvocations: FeatureSelection[] = [
  {
    feature: 'Agonizing Blast',
    feature_slug: 'phb:agonizing-blast',
    feature_type: 'eldritch_invocation',
    class: 'Warlock',
    class_slug: 'phb:warlock',
    subclass_name: null,
    level_acquired: 2,
    is_dangling: false
  },
  {
    feature: 'Devil\'s Sight',
    feature_slug: 'phb:devils-sight',
    feature_type: 'eldritch_invocation',
    class: 'Warlock',
    class_slug: 'phb:warlock',
    subclass_name: null,
    level_acquired: 2,
    is_dangling: false
  }
]

// Mixed features from multiple classes
const mixedFeatures: FeatureSelection[] = [
  ...artificerInfusions.slice(0, 2),
  ...warlockInvocations
]

// Empty array
const emptyFeatures: FeatureSelection[] = []

describe('OptionalFeaturesPanel', () => {
  it('renders nothing when featureSelections array is empty', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: emptyFeatures }
    })
    expect(wrapper.find('[data-testid="optional-features-panel"]').exists()).toBe(false)
  })

  it('displays panel when features exist', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: artificerInfusions }
    })
    expect(wrapper.find('[data-testid="optional-features-panel"]').exists()).toBe(true)
  })

  it('displays feature names', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: artificerInfusions }
    })
    expect(wrapper.text()).toContain('Armor of Magical Strength')
    expect(wrapper.text()).toContain('Enhanced Weapon')
    expect(wrapper.text()).toContain('Homunculus Servant')
  })

  it('groups features by feature_type', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: mixedFeatures }
    })
    // Should have group headers for both types
    expect(wrapper.text()).toContain('Infusions')
    expect(wrapper.text()).toContain('Invocations')
  })

  it('displays level acquired badge', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: artificerInfusions }
    })
    // Level 2 and Level 10 should appear
    expect(wrapper.text()).toContain('Lvl 2')
    expect(wrapper.text()).toContain('Lvl 10')
  })

  it('displays class source when feature is expanded', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: mixedFeatures }
    })

    // Expand first feature (Artificer infusion)
    const firstToggle = wrapper.find('[data-testid="optional-feature-toggle-0"]')
    await firstToggle.trigger('click')
    expect(wrapper.text()).toContain('Artificer')

    // Expand third feature (Warlock invocation - index 2 after 2 infusions)
    const thirdToggle = wrapper.find('[data-testid="optional-feature-toggle-2"]')
    await thirdToggle.trigger('click')
    expect(wrapper.text()).toContain('Warlock')
  })

  it('shows feature count in header', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: artificerInfusions }
    })
    expect(wrapper.text()).toContain('(3)')
  })

  it('filters features by search query', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: artificerInfusions }
    })

    const searchInput = wrapper.find('[data-testid="optional-feature-search"]')
    await searchInput.setValue('Armor')

    // Should show Armor of Magical Strength
    expect(wrapper.text()).toContain('Armor of Magical Strength')
    // Should not show others
    expect(wrapper.text()).not.toContain('Enhanced Weapon')
    expect(wrapper.text()).not.toContain('Homunculus Servant')
  })

  it('shows no results message when search has no matches', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: artificerInfusions }
    })

    const searchInput = wrapper.find('[data-testid="optional-feature-search"]')
    await searchInput.setValue('nonexistent feature')

    expect(wrapper.text()).toContain('No features match')
  })

  it('expands feature to show class source on click', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: artificerInfusions }
    })

    // Click first feature to expand
    const featureToggle = wrapper.find('[data-testid="optional-feature-toggle-0"]')
    await featureToggle.trigger('click')

    // Should show expanded details
    expect(wrapper.text()).toContain('Artificer')
  })

  it('displays readable group labels for feature types', async () => {
    const wrapper = await mountSuspended(OptionalFeaturesPanel, {
      props: { featureSelections: mixedFeatures }
    })

    // Should use readable labels, not raw feature_type values
    expect(wrapper.text()).toContain('Infusions')
    expect(wrapper.text()).not.toContain('artificer_infusion')
    expect(wrapper.text()).toContain('Invocations')
    expect(wrapper.text()).not.toContain('eldritch_invocation')
  })
})
