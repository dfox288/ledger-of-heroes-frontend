import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiClassFeaturesByLevel from '~/components/ui/class/UiClassFeaturesByLevel.vue'

/**
 * Integration test to verify dynamic slot content is properly structured
 * even if not visible in collapsed accordion state.
 */
describe('UiClassFeaturesByLevel - Integration', () => {
  it('properly structures feature data for accordion slots', async () => {
    const features = [
      {
        id: 1,
        level: 1,
        feature_name: 'Rage',
        description: 'In battle, you fight with primal ferocity.'
      },
      {
        id: 2,
        level: 1,
        feature_name: 'Unarmored Defense',
        description: 'Your AC equals 10 + DEX + CON.'
      },
      {
        id: 3,
        level: 2,
        feature_name: 'Reckless Attack',
        description: 'Gain advantage at the cost of giving advantage to enemies.'
      }
    ]

    const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
      props: { features }
    })

    // Access internal computed properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as any
    const featuresByLevel = vm.featuresByLevel

    // Verify grouping is correct
    expect(featuresByLevel).toHaveLength(2) // Level 1 and Level 2
    expect(featuresByLevel[0][0]).toBe(1) // First level is 1
    expect(featuresByLevel[0][1]).toHaveLength(2) // Two features at level 1
    expect(featuresByLevel[1][0]).toBe(2) // Second level is 2
    expect(featuresByLevel[1][1]).toHaveLength(1) // One feature at level 2

    // Verify accordion items structure
    const accordionItems = vm.accordionItems
    expect(accordionItems).toHaveLength(2)
    expect(accordionItems[0].label).toBe('Level 1 (2 features)')
    expect(accordionItems[0].slot).toBe('level-1')
    expect(accordionItems[1].label).toBe('Level 2 (1 feature)')
    expect(accordionItems[1].slot).toBe('level-2')
  })

  it('filters choice options from internal data structure', async () => {
    const features = [
      { id: 1, level: 1, feature_name: 'Fighting Style', description: 'Choose a style' },
      { id: 2, level: 1, feature_name: 'Fighting Style: Archery', description: 'Choice 1' },
      { id: 3, level: 1, feature_name: 'Fighting Style: Defense', description: 'Choice 2' },
      { id: 4, level: 2, feature_name: 'Action Surge', description: 'Surge!' }
    ]

    const wrapper = await mountSuspended(UiClassFeaturesByLevel, {
      props: { features }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as any
    const featuresByLevel = vm.featuresByLevel

    // Level 1 should only have 1 feature (Fighting Style, not the choices)
    expect(featuresByLevel[0][1]).toHaveLength(1)
    expect(featuresByLevel[0][1][0].feature_name).toBe('Fighting Style')

    // Level 2 should have 1 feature
    expect(featuresByLevel[1][1]).toHaveLength(1)
    expect(featuresByLevel[1][1][0].feature_name).toBe('Action Surge')
  })
})
