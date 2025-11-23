import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionConditions from '~/components/ui/accordion/UiAccordionConditions.vue'
import type { EntityConditionResource } from '~/types/api/entities'

describe('UiAccordionConditions', () => {
  const mockConditions: EntityConditionResource[] = [
    {
      id: 1,
      condition_id: 1,
      condition: {
        id: 1,
        name: 'Poisoned',
        slug: 'poisoned',
        description: 'A poisoned creature has disadvantage on attack rolls and ability checks.'
      },
      effect_type: 'immunity',
      description: null
    },
    {
      id: 2,
      condition_id: 2,
      condition: {
        id: 2,
        name: 'Frightened',
        slug: 'frightened',
        description: 'A frightened creature has disadvantage on ability checks and attack rolls.'
      },
      effect_type: 'resistance',
      description: 'While in dim light or darkness'
    }
  ]

  it('renders multiple conditions', async () => {
    const wrapper = await mountSuspended(UiAccordionConditions, {
      props: { conditions: mockConditions }
    })

    expect(wrapper.text()).toContain('Poisoned')
    expect(wrapper.text()).toContain('Frightened')
  })

  it('displays effect type badges', async () => {
    const wrapper = await mountSuspended(UiAccordionConditions, {
      props: { conditions: mockConditions }
    })

    expect(wrapper.text()).toContain('Immunity')
    expect(wrapper.text()).toContain('Resistance')
  })

  it('shows condition descriptions', async () => {
    const wrapper = await mountSuspended(UiAccordionConditions, {
      props: { conditions: mockConditions }
    })

    expect(wrapper.text()).toContain('A poisoned creature has disadvantage')
    expect(wrapper.text()).toContain('A frightened creature has disadvantage')
  })

  it('shows entity-specific description when provided', async () => {
    const wrapper = await mountSuspended(UiAccordionConditions, {
      props: { conditions: mockConditions }
    })

    expect(wrapper.text()).toContain('While in dim light or darkness')
  })

  it('handles empty conditions array', async () => {
    const wrapper = await mountSuspended(UiAccordionConditions, {
      props: { conditions: [] }
    })

    expect(wrapper.text()).toBe('')
  })

  it('handles null/undefined gracefully', async () => {
    const conditionsWithMissing: EntityConditionResource[] = [
      {
        id: 3,
        condition_id: null,
        condition: undefined,
        effect_type: 'immunity',
        description: 'Custom immunity'
      }
    ]

    const wrapper = await mountSuspended(UiAccordionConditions, {
      props: { conditions: conditionsWithMissing }
    })

    expect(wrapper.text()).toContain('Custom immunity')
  })
})
