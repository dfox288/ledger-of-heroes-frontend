import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionPrerequisites from '~/components/ui/accordion/UiAccordionPrerequisites.vue'
import type { EntityPrerequisiteResource } from '~/types/api/entities'

describe('UiAccordionPrerequisites', () => {
  it('renders ability score prerequisites', async () => {
    const prerequisites: EntityPrerequisiteResource[] = [
      {
        id: 1,
        prerequisite_type: 'ability_score',
        prerequisite_id: 1,
        minimum_value: 13,
        description: null,
        group_id: 1,
        ability_score: {
          id: 1,
          code: 'STR',
          name: 'Strength'
        }
      }
    ]

    const wrapper = await mountSuspended(UiAccordionPrerequisites, {
      props: { prerequisites }
    })

    expect(wrapper.text()).toContain('Strength 13 or higher')
  })

  it('renders race prerequisites', async () => {
    const prerequisites: EntityPrerequisiteResource[] = [
      {
        id: 2,
        prerequisite_type: 'race',
        prerequisite_id: 5,
        minimum_value: null,
        description: null,
        group_id: 1,
        race: {
          id: 5,
          slug: 'dwarf',
          name: 'Dwarf',
          speed: 25,
          size: { id: 1, code: 'M', name: 'Medium' }
        }
      }
    ]

    const wrapper = await mountSuspended(UiAccordionPrerequisites, {
      props: { prerequisites }
    })

    expect(wrapper.text()).toContain('Must be a Dwarf')
  })

  it('renders custom description prerequisites', async () => {
    const prerequisites: EntityPrerequisiteResource[] = [
      {
        id: 3,
        prerequisite_type: null,
        prerequisite_id: null,
        minimum_value: null,
        description: 'Attunement by a spellcaster',
        group_id: 1
      }
    ]

    const wrapper = await mountSuspended(UiAccordionPrerequisites, {
      props: { prerequisites }
    })

    expect(wrapper.text()).toContain('Attunement by a spellcaster')
  })

  it('handles empty prerequisites array', async () => {
    const wrapper = await mountSuspended(UiAccordionPrerequisites, {
      props: { prerequisites: [] }
    })

    expect(wrapper.text()).toBe('')
  })

  it('displays multiple prerequisites', async () => {
    const prerequisites: EntityPrerequisiteResource[] = [
      {
        id: 1,
        prerequisite_type: 'ability_score',
        prerequisite_id: 1,
        minimum_value: 13,
        description: null,
        group_id: 1,
        ability_score: { id: 1, code: 'STR', name: 'Strength' }
      },
      {
        id: 2,
        prerequisite_type: null,
        prerequisite_id: null,
        minimum_value: null,
        description: 'Proficient with martial weapons',
        group_id: 2
      }
    ]

    const wrapper = await mountSuspended(UiAccordionPrerequisites, {
      props: { prerequisites }
    })

    expect(wrapper.text()).toContain('Strength 13 or higher')
    expect(wrapper.text()).toContain('Proficient with martial weapons')
  })
})
