// tests/components/character/sheet/Conditions.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Conditions from '~/components/character/sheet/Conditions.vue'
import type { CharacterCondition } from '~/types/character'

/**
 * Factory for creating CharacterCondition test fixtures
 * Matches the actual API response shape
 */
function createCondition(overrides: Partial<{
  id: number
  conditionId: number
  name: string
  slug: string
  level: number | null
  source: string | null
  duration: string | null
  isDangling: boolean
  isExhaustion: boolean
  exhaustionWarning: string | null
}> = {}): CharacterCondition {
  return {
    id: overrides.id ?? 1,
    condition: {
      id: overrides.conditionId ?? 1,
      name: overrides.name ?? 'Poisoned',
      slug: overrides.slug ?? 'core:poisoned'
    },
    condition_slug: overrides.slug ?? 'core:poisoned',
    is_dangling: overrides.isDangling ?? false,
    level: overrides.level ?? null,
    source: overrides.source ?? null,
    duration: overrides.duration ?? null,
    is_exhaustion: overrides.isExhaustion ?? false,
    exhaustion_warning: overrides.exhaustionWarning ?? null
  }
}

describe('CharacterSheetConditions', () => {
  it('renders nothing when conditions is undefined', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: { conditions: undefined }
    })
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(false)
  })

  it('renders nothing when conditions array is empty', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: { conditions: [] }
    })
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(false)
  })

  it('renders panel when conditions are present', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [createCondition({
          name: 'Poisoned',
          source: 'Giant Spider bite',
          duration: '2 hours'
        })]
      }
    })
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(true)
  })

  it('displays condition name', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [createCondition({
          name: 'Poisoned',
          source: 'Giant Spider bite',
          duration: '2 hours'
        })]
      }
    })
    expect(wrapper.text()).toContain('Poisoned')
  })

  it('displays condition source and duration', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [createCondition({
          name: 'Poisoned',
          source: 'Giant Spider bite',
          duration: '2 hours'
        })]
      }
    })
    expect(wrapper.text()).toContain('Giant Spider bite')
    expect(wrapper.text()).toContain('2 hours')
  })

  it('displays multiple conditions', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          createCondition({
            id: 1,
            name: 'Poisoned',
            slug: 'core:poisoned',
            source: 'Giant Spider bite',
            duration: '2 hours'
          }),
          createCondition({
            id: 2,
            name: 'Frightened',
            slug: 'core:frightened',
            source: 'Dragon Fear',
            duration: 'Until end of next turn'
          })
        ]
      }
    })
    expect(wrapper.text()).toContain('Poisoned')
    expect(wrapper.text()).toContain('Frightened')
  })

  it('displays exhaustion level when present', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [createCondition({
          name: 'Exhaustion',
          slug: 'core:exhaustion',
          level: 2,
          source: 'Extended travel',
          duration: 'Until long rest',
          isExhaustion: true
        })]
      }
    })
    expect(wrapper.text()).toContain('Exhaustion')
    expect(wrapper.text()).toContain('2')
  })

  it('handles dangling condition gracefully', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [createCondition({
          name: 'Unknown Condition',
          slug: 'homebrew:unknown',
          source: 'Homebrew spell',
          duration: '1 minute',
          isDangling: true
        })]
      }
    })
    // Should still render, even if dangling
    expect(wrapper.find('[data-testid="conditions-alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Unknown Condition')
  })

  it('displays count of active conditions as badge', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [
          createCondition({
            id: 1,
            name: 'Poisoned',
            slug: 'core:poisoned',
            source: 'Giant Spider bite',
            duration: '2 hours'
          }),
          createCondition({
            id: 2,
            name: 'Frightened',
            slug: 'core:frightened',
            source: 'Dragon Fear',
            duration: 'Until end of next turn'
          })
        ]
      }
    })
    // Title should show "Active Conditions" with count badge
    expect(wrapper.text()).toContain('Active Conditions')
    expect(wrapper.text()).toContain('2')
  })

  it('displays single condition count correctly', async () => {
    const wrapper = await mountSuspended(Conditions, {
      props: {
        conditions: [createCondition({
          name: 'Poisoned',
          source: 'Giant Spider bite',
          duration: '2 hours'
        })]
      }
    })
    // Shows "Active Conditions" title with count badge showing "1"
    expect(wrapper.text()).toContain('Active Conditions')
    expect(wrapper.text()).toContain('1')
  })

  // =========================================================================
  // Editable Mode Tests
  // =========================================================================

  describe('editable mode', () => {
    const mockCondition = createCondition({
      id: 1,
      name: 'Poisoned',
      slug: 'core:poisoned',
      source: 'Giant Spider bite',
      duration: '2 hours'
    })

    const mockExhaustion = createCondition({
      id: 2,
      name: 'Exhaustion',
      slug: 'core:exhaustion',
      level: 2,
      source: 'Forced march',
      duration: 'Until long rest',
      isExhaustion: true
    })

    // Note: Add condition button is now in the Header component's Actions dropdown

    it('shows remove button on each condition when editable', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockCondition], editable: true }
      })
      expect(wrapper.find('[data-testid="remove-condition-core:poisoned"]').exists()).toBe(true)
    })

    it('hides remove button when not editable', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockCondition], editable: false }
      })
      expect(wrapper.find('[data-testid="remove-condition-core:poisoned"]').exists()).toBe(false)
    })

    it('emits remove with slug when remove button clicked', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockCondition], editable: true }
      })
      await wrapper.find('[data-testid="remove-condition-core:poisoned"]').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
      expect(wrapper.emitted('remove')![0]).toEqual(['core:poisoned'])
    })

    it('shows exhaustion stepper buttons when editable', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockExhaustion], editable: true }
      })
      expect(wrapper.find('[data-testid="exhaustion-increment"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="exhaustion-decrement"]').exists()).toBe(true)
    })

    it('hides exhaustion stepper when not editable', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockExhaustion], editable: false }
      })
      expect(wrapper.find('[data-testid="exhaustion-increment"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="exhaustion-decrement"]').exists()).toBe(false)
    })

    it('does not show stepper for non-exhaustion conditions', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockCondition], editable: true }
      })
      expect(wrapper.find('[data-testid="exhaustion-increment"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="exhaustion-decrement"]').exists()).toBe(false)
    })

    it('emits update-level with incremented value and preserves source/duration', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockExhaustion], editable: true }
      })
      await wrapper.find('[data-testid="exhaustion-increment"]').trigger('click')
      expect(wrapper.emitted('update-level')).toBeTruthy()
      expect(wrapper.emitted('update-level')![0]).toEqual([{
        slug: 'core:exhaustion',
        level: 3,
        source: 'Forced march',
        duration: 'Until long rest'
      }])
    })

    it('emits update-level with decremented value and preserves source/duration', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockExhaustion], editable: true }
      })
      await wrapper.find('[data-testid="exhaustion-decrement"]').trigger('click')
      expect(wrapper.emitted('update-level')).toBeTruthy()
      expect(wrapper.emitted('update-level')![0]).toEqual([{
        slug: 'core:exhaustion',
        level: 1,
        source: 'Forced march',
        duration: 'Until long rest'
      }])
    })

    it('disables increment at level 6', async () => {
      const exhaustionLevel6 = createCondition({
        ...mockExhaustion,
        name: 'Exhaustion',
        slug: 'core:exhaustion',
        level: 6,
        isExhaustion: true,
        source: 'Forced march',
        duration: 'Until long rest'
      })
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [exhaustionLevel6], editable: true }
      })
      const incrementBtn = wrapper.find('[data-testid="exhaustion-increment"]')
      expect(incrementBtn.attributes('disabled')).toBeDefined()
    })

    it('emits confirm-deadly-exhaustion when incrementing from level 5 to 6', async () => {
      const exhaustionLevel5 = createCondition({
        name: 'Exhaustion',
        slug: 'core:exhaustion',
        level: 5,
        isExhaustion: true,
        source: 'Forced march',
        duration: 'Until long rest'
      })
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [exhaustionLevel5], editable: true }
      })
      await wrapper.find('[data-testid="exhaustion-increment"]').trigger('click')
      // Should NOT emit update-level directly
      expect(wrapper.emitted('update-level')).toBeUndefined()
      // Should emit confirmation request with source/duration
      expect(wrapper.emitted('confirm-deadly-exhaustion')).toBeTruthy()
      expect(wrapper.emitted('confirm-deadly-exhaustion')![0]).toEqual([{
        slug: 'core:exhaustion',
        currentLevel: 5,
        targetLevel: 6,
        source: 'Forced march',
        duration: 'Until long rest'
      }])
    })

    it('shows death warning at level 6', async () => {
      const exhaustionLevel6 = createCondition({
        name: 'Exhaustion',
        slug: 'core:exhaustion',
        level: 6,
        isExhaustion: true
      })
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [exhaustionLevel6], editable: true }
      })
      expect(wrapper.text()).toMatch(/death/i)
    })

    it('handles exhaustion without source/duration gracefully', async () => {
      const exhaustionNoMeta = createCondition({
        name: 'Exhaustion',
        slug: 'core:exhaustion',
        level: 1,
        isExhaustion: true,
        source: null,
        duration: null
      })
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [exhaustionNoMeta], editable: true }
      })
      await wrapper.find('[data-testid="exhaustion-increment"]').trigger('click')
      expect(wrapper.emitted('update-level')).toBeTruthy()
      expect(wrapper.emitted('update-level')![0]).toEqual([{
        slug: 'core:exhaustion',
        level: 2,
        source: null,
        duration: null
      }])
    })
  })

  // =========================================================================
  // isDead Prop Tests (#544)
  // =========================================================================

  describe('isDead prop', () => {
    const mockCondition = createCondition({
      id: 1,
      name: 'Poisoned',
      slug: 'core:poisoned',
      source: 'Giant Spider bite',
      duration: '2 hours'
    })

    const mockExhaustion = createCondition({
      id: 2,
      name: 'Exhaustion',
      slug: 'core:exhaustion',
      level: 2,
      source: 'Forced march',
      duration: 'Until long rest',
      isExhaustion: true
    })

    it('hides remove button when isDead is true even if editable', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockCondition], editable: true, isDead: true }
      })
      expect(wrapper.find('[data-testid="remove-condition-core:poisoned"]').exists()).toBe(false)
    })

    it('hides exhaustion stepper when isDead is true even if editable', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockExhaustion], editable: true, isDead: true }
      })
      expect(wrapper.find('[data-testid="exhaustion-increment"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="exhaustion-decrement"]').exists()).toBe(false)
    })

    it('shows controls when isDead is false and editable', async () => {
      const wrapper = await mountSuspended(Conditions, {
        props: { conditions: [mockCondition], editable: true, isDead: false }
      })
      expect(wrapper.find('[data-testid="remove-condition-core:poisoned"]').exists()).toBe(true)
    })
  })
})
