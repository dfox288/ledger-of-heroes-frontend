import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MonsterCard from '~/components/monster/MonsterCard.vue'
import { createMockMonster } from '#tests/helpers/mockFactories'
import { testDescriptionTruncation } from '#tests/helpers/descriptionBehavior'
import { testEntityCardBasics } from '#tests/helpers/cardBehavior'

describe('MonsterCard', () => {
  const mockMonster = createMockMonster()

  // Entity card basics (via helper) - tests name, link, hover
  testEntityCardBasics({
    component: MonsterCard,
    propName: 'monster',
    mockFactory: createMockMonster,
    entityName: 'Ancient Red Dragon',
    linkPath: '/monsters/mm:ancient-red-dragon',
    optionalFields: ['size', 'alignment', 'sources']
  })

  // Monster-specific tests (domain logic)
  it('renders CR badge with monster color', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    expect(wrapper.text()).toContain('CR 24')
    // CR badge should use monster entity color
    const badge = wrapper.find('[class*="bg-monster"]')
    expect(badge.exists()).toBe(true)
  })

  it('renders type badge', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    expect(wrapper.text()).toContain('dragon')
  })

  it('displays size', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    expect(wrapper.text()).toContain('Gargantuan')
  })

  it('displays alignment', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    expect(wrapper.text()).toContain('Chaotic Evil')
  })

  it('displays armor class', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    expect(wrapper.text()).toContain('AC 22')
  })

  it('displays hit points', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    expect(wrapper.text()).toContain('546 HP')
  })

  it('shows legendary indicator when has legendary actions', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    expect(wrapper.text()).toContain('Legendary')
  })

  it('hides legendary indicator when no legendary actions', async () => {
    const monster = { ...mockMonster, legendary_actions: [] }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster }
    })

    expect(wrapper.text()).not.toContain('Legendary')
  })

  // Description truncation tests using shared helper
  testDescriptionTruncation(
    () => mountSuspended(MonsterCard, {
      props: { monster: { ...mockMonster, description: 'A'.repeat(200) } }
    }),
    () => mountSuspended(MonsterCard, {
      props: { monster: { ...mockMonster, description: 'Short' } }
    })
  )

  it.each([
    ['0'],
    ['1/4'],
    ['5'],
    ['11'],
    ['24']
  ])('handles CR value %s correctly', async (cr) => {
    const monster = { ...mockMonster, challenge_rating: cr }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster }
    })

    expect(wrapper.text()).toContain(`CR ${cr}`)
    // All CR badges use monster entity color
    const badge = wrapper.find('[class*="bg-monster"]')
    expect(badge.exists()).toBe(true)
  })

  // Icon display tests (replacing emojis)
  it('displays AC with shield icon instead of emoji', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    // Should display AC value
    expect(wrapper.text()).toContain('AC 22')
    // Should have UIcon component with name attribute
    const shieldIcon = wrapper.findComponent({ name: 'UIcon' })
    expect(shieldIcon.exists()).toBe(true)
    // Should NOT have emoji
    expect(wrapper.text()).not.toContain('⚔️')
  })

  it('displays HP with heart icon instead of emoji', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    // Should display HP value
    expect(wrapper.text()).toContain('546 HP')
    // Should have UIcon components
    const icons = wrapper.findAllComponents({ name: 'UIcon' })
    expect(icons.length).toBeGreaterThan(0)
    // Should NOT have emoji
    expect(wrapper.text()).not.toContain('❤️')
  })

  it('displays size as text without emoji', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    // Should display size name
    expect(wrapper.text()).toContain('Gargantuan')
    // Should NOT have emoji
    expect(wrapper.text()).not.toContain('🔷')
  })

  // Speed display tests
  it('displays speed with bolt icon for walk speed only', async () => {
    const monsterWalkOnly = {
      ...mockMonster,
      speed_walk: 30,
      speed_fly: null,
      speed_climb: null,
      speed_swim: null,
      speed_burrow: null
    }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: monsterWalkOnly }
    })

    // Should display walk speed
    expect(wrapper.text()).toContain('30 ft')
    // Should have UIcon component (bolt icon)
    const icons = wrapper.findAllComponents({ name: 'UIcon' })
    expect(icons.length).toBeGreaterThan(0)
  })

  it('displays multiple speed types when available', async () => {
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: mockMonster }
    })

    // Should show walk speed
    expect(wrapper.text()).toContain('40 ft')
    // Should show fly speed
    expect(wrapper.text()).toContain('fly 80 ft')
  })

  it('displays climb speed when available', async () => {
    const monsterWithClimb = {
      ...mockMonster,
      speed_walk: 30,
      speed_climb: 30,
      speed_fly: null,
      speed_swim: null,
      speed_burrow: null
    }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: monsterWithClimb }
    })

    expect(wrapper.text()).toContain('climb 30 ft')
  })

  it('displays swim speed when available', async () => {
    const monsterWithSwim = {
      ...mockMonster,
      speed_walk: 30,
      speed_swim: 40,
      speed_fly: null,
      speed_climb: null,
      speed_burrow: null
    }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: monsterWithSwim }
    })

    expect(wrapper.text()).toContain('swim 40 ft')
  })

  it('displays burrow speed when available', async () => {
    const monsterWithBurrow = {
      ...mockMonster,
      speed_walk: 30,
      speed_burrow: 20,
      speed_fly: null,
      speed_climb: null,
      speed_swim: null
    }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: monsterWithBurrow }
    })

    expect(wrapper.text()).toContain('burrow 20 ft')
  })

  // Saving throw tests
  it('displays saving throw proficiencies when available', async () => {
    const monsterWithSaves = {
      ...mockMonster,
      modifiers: [
        {
          id: 1,
          modifier_category: 'saving-throw',
          ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
          value: '+5',
          condition: null,
          is_choice: false,
          choice_count: null,
          choice_constraint: null
        },
        {
          id: 2,
          modifier_category: 'saving-throw',
          ability_score: { id: 5, code: 'WIS', name: 'Wisdom' },
          value: '+4',
          condition: null,
          is_choice: false,
          choice_count: null,
          choice_constraint: null
        }
      ]
    }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: monsterWithSaves }
    })

    // Should display saving throws with icon
    expect(wrapper.text()).toContain('Saves')
    expect(wrapper.text()).toContain('DEX +5')
    expect(wrapper.text()).toContain('WIS +4')
    // Should have UIcon component for saves
    const icons = wrapper.findAllComponents({ name: 'UIcon' })
    expect(icons.length).toBeGreaterThan(0)
  })

  it('hides saving throws when none available', async () => {
    const monsterWithoutSaves = {
      ...mockMonster,
      modifiers: []
    }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: monsterWithoutSaves }
    })

    expect(wrapper.text()).not.toContain('Saves')
  })

  it('filters out non-saving-throw modifiers', async () => {
    const monsterWithMixedModifiers = {
      ...mockMonster,
      modifiers: [
        {
          id: 1,
          modifier_category: 'ability-score',
          ability_score: { id: 1, code: 'STR', name: 'Strength' },
          value: '+2',
          condition: null,
          is_choice: false,
          choice_count: null,
          choice_constraint: null
        },
        {
          id: 2,
          modifier_category: 'saving-throw',
          ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
          value: '+5',
          condition: null,
          is_choice: false,
          choice_count: null,
          choice_constraint: null
        }
      ]
    }
    const wrapper = await mountSuspended(MonsterCard, {
      props: { monster: monsterWithMixedModifiers }
    })

    // Should only show saving throw, not ability score modifier
    expect(wrapper.text()).toContain('Saves')
    expect(wrapper.text()).toContain('DEX +5')
    expect(wrapper.text()).not.toContain('STR +2')
  })
})
