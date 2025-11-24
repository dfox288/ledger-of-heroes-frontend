import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Background } from '~/types'
import type { components } from '~/types/api/generated'
import BackgroundCard from '~/components/background/BackgroundCard.vue'
import { testCardLinkBehavior, testCardHoverEffects, testCardBorderStyling } from '../../helpers/cardBehavior'
import { testDescriptionTruncation } from '../../helpers/descriptionBehavior'
import { testSourceFooter, testOptionalSourceFooter } from '../../helpers/sourceBehavior'

describe('BackgroundCard - Type Compatibility', () => {
  it('should accept OpenAPI-generated Background type', () => {
    // This test verifies that our Background interface is compatible with the generated type
    const generatedBg: components['schemas']['BackgroundResource'] = {
      id: 1,
      name: 'Acolyte',
      slug: 'acolyte'
    }

    // Should be assignable to our application Background type
    const background: Background = generatedBg

    expect(background.id).toBe(1)
    expect(background.name).toBe('Acolyte')
  })
})

describe('BackgroundCard', () => {
  const mockBackground: Background = {
    id: 1,
    name: 'Acolyte',
    slug: 'acolyte',
    proficiencies: [
      { id: 1, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 1, name: 'Insight', code: 'INSIGHT', description: null, ability_score: null }, proficiency_name: 'Insight', grants: true, is_choice: false, quantity: 1 },
      { id: 2, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 2, name: 'Religion', code: 'RELIGION', description: null, ability_score: null }, proficiency_name: 'Religion', grants: true, is_choice: false, quantity: 1 }
    ],
    languages: [
      { language: { id: 1, name: 'Common' }, is_choice: false },
      { language: { id: 2, name: 'Elvish' }, is_choice: false }
    ],
    feature_name: 'Shelter of the Faithful',
    description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods.',
    sources: [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '127' }
    ]
  }

  // Shared card behavior tests (using helpers)
  testCardLinkBehavior(
    () => mountSuspended(BackgroundCard, { props: { background: mockBackground } }),
    '/backgrounds/acolyte'
  )

  testCardHoverEffects(
    () => mountSuspended(BackgroundCard, { props: { background: mockBackground } })
  )

  testCardBorderStyling(
    () => mountSuspended(BackgroundCard, { props: { background: mockBackground } })
  )

  testDescriptionTruncation(
    () => mountSuspended(BackgroundCard, { props: { background: { ...mockBackground, description: 'A'.repeat(200) } } }),
    () => mountSuspended(BackgroundCard, { props: { background: { ...mockBackground, description: 'Short background description' } } })
  )

  testSourceFooter(
    () => mountSuspended(BackgroundCard, { props: { background: mockBackground } }),
    'Player\'s Handbook'
  )

  testOptionalSourceFooter(
    () => mountSuspended(BackgroundCard, { props: { background: { ...mockBackground, sources: undefined } } }),
    'Acolyte'
  )

  // Background-specific tests (domain logic)

  it('renders background name', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    expect(wrapper.text()).toContain('Acolyte')
  })

  it('renders feature name badge when provided', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    expect(wrapper.text()).toContain('Shelter of the Faithful')
  })

  it('hides feature badge when not provided', async () => {
    const bgWithoutFeature = { ...mockBackground, feature_name: undefined }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithoutFeature }
    })

    const html = wrapper.html()
    // Should not have the feature badge section
    expect(html).not.toContain('Shelter')
  })

  it('shows first two skill names when exactly 2 skills', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    expect(wrapper.text()).toContain('Insight, Religion')
  })

  it('shows single skill name without comma', async () => {
    const oneSkillBg = {
      ...mockBackground,
      proficiencies: [
        { id: 1, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 1, name: 'Insight', code: 'INSIGHT', description: null, ability_score: null }, proficiency_name: 'Insight', grants: true, is_choice: false, quantity: 1 }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: oneSkillBg }
    })

    expect(wrapper.text()).toContain('Insight')
    expect(wrapper.text()).not.toContain('Insight,')
  })

  it('shows first two skill names plus overflow indicator for 3+ skills', async () => {
    const threeSkillsBg = {
      ...mockBackground,
      proficiencies: [
        { id: 1, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 1, name: 'Insight', code: 'INSIGHT', description: null, ability_score: null }, proficiency_name: 'Insight', grants: true, is_choice: false, quantity: 1 },
        { id: 2, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 2, name: 'Religion', code: 'RELIGION', description: null, ability_score: null }, proficiency_name: 'Religion', grants: true, is_choice: false, quantity: 1 },
        { id: 3, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 3, name: 'Persuasion', code: 'PERSUASION', description: null, ability_score: null }, proficiency_name: 'Persuasion', grants: true, is_choice: false, quantity: 1 }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: threeSkillsBg }
    })

    expect(wrapper.text()).toContain('Insight, Religion +1 more')
  })

  it('shows correct overflow count for 4 skills', async () => {
    const fourSkillsBg = {
      ...mockBackground,
      proficiencies: [
        { id: 1, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 1, name: 'Insight', code: 'INSIGHT', description: null, ability_score: null }, proficiency_name: 'Insight', grants: true, is_choice: false, quantity: 1 },
        { id: 2, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 2, name: 'Religion', code: 'RELIGION', description: null, ability_score: null }, proficiency_name: 'Religion', grants: true, is_choice: false, quantity: 1 },
        { id: 3, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 3, name: 'Persuasion', code: 'PERSUASION', description: null, ability_score: null }, proficiency_name: 'Persuasion', grants: true, is_choice: false, quantity: 1 },
        { id: 4, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 4, name: 'Deception', code: 'DECEPTION', description: null, ability_score: null }, proficiency_name: 'Deception', grants: true, is_choice: false, quantity: 1 }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: fourSkillsBg }
    })

    expect(wrapper.text()).toContain('Insight, Religion +2 more')
  })

  it('hides skills summary when none provided', async () => {
    const noSkillsBg = { ...mockBackground, proficiencies: [] }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: noSkillsBg }
    })

    expect(wrapper.text()).not.toContain('Skills')
  })

  it('shows languages count with plural form', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    expect(wrapper.text()).toContain('2 Languages')
  })

  it('uses singular form for single language', async () => {
    const oneLangBg = {
      ...mockBackground,
      languages: [{ language: { id: 1, name: 'Common' }, is_choice: false }]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: oneLangBg }
    })

    expect(wrapper.text()).toContain('1 Language')
  })

  it('hides languages count when none provided', async () => {
    const noLangsBg = { ...mockBackground, languages: [] }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: noLangsBg }
    })

    expect(wrapper.text()).not.toContain('Language')
  })

  it('shows tool proficiencies badge when provided', async () => {
    const bgWithTools = {
      ...mockBackground,
      proficiencies: [
        ...mockBackground.proficiencies!,
        { id: 3, proficiency_type: 'tool', proficiency_subcategory: null, proficiency_type_id: null, item: { id: 1, name: 'Thieves\' Tools' }, proficiency_name: 'Thieves\' Tools', grants: true, is_choice: false, quantity: 1 },
        { id: 4, proficiency_type: 'tool', proficiency_subcategory: null, proficiency_type_id: null, item: { id: 2, name: 'Disguise Kit' }, proficiency_name: 'Disguise Kit', grants: true, is_choice: false, quantity: 1 }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithTools }
    })

    expect(wrapper.text()).toContain('2 Tools')
  })

  it('hides tool proficiencies when none provided', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    expect(wrapper.text()).not.toContain('Tools')
  })

  it('renders description when provided', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    expect(wrapper.text()).toContain('You have spent your life')
  })

  it('shows default description when not provided', async () => {
    const bgWithoutDescription = { ...mockBackground, description: undefined }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithoutDescription }
    })

    expect(wrapper.text()).toContain('A character background for D&D 5e')
  })

  it('displays all key information in organized layout', async () => {
    const fullBg = {
      ...mockBackground,
      proficiencies: [
        ...mockBackground.proficiencies!,
        { id: 3, proficiency_type: 'tool', proficiency_subcategory: null, proficiency_type_id: null, item: { id: 1, name: 'Thieves\' Tools' }, proficiency_name: 'Thieves\' Tools', grants: true, is_choice: false, quantity: 1 }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: fullBg }
    })

    const text = wrapper.text()
    expect(text).toContain('Acolyte')
    expect(text).toContain('Shelter of the Faithful')
    expect(text).toContain('Insight, Religion')
    expect(text).toContain('2 Languages')
    expect(text).toContain('1 Tools')
  })

  it('handles backgrounds with all optional fields', async () => {
    const fullBg = {
      ...mockBackground,
      proficiencies: [
        { id: 1, proficiency_type: 'skill', proficiency_subcategory: null, proficiency_type_id: null, skill: { id: 1, name: 'Insight', code: 'INSIGHT', description: null, ability_score: null }, proficiency_name: 'Insight', grants: true, is_choice: false, quantity: 1 },
        { id: 2, proficiency_type: 'tool', proficiency_subcategory: null, proficiency_type_id: null, item: { id: 1, name: 'Thieves\' Tools' }, proficiency_name: 'Thieves\' Tools', grants: true, is_choice: false, quantity: 1 }
      ],
      languages: [{ language: { id: 1, name: 'Common' }, is_choice: false }],
      feature_name: 'Feature Name',
      description: 'Full description',
      sources: [{ code: 'PHB', name: 'Player\'s Handbook', pages: '127' }]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: fullBg }
    })

    expect(wrapper.html()).toBeTruthy()
  })

  it('handles backgrounds with minimal fields', async () => {
    const minimalBg = {
      id: 1,
      name: 'Soldier',
      slug: 'soldier'
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: minimalBg }
    })

    expect(wrapper.text()).toContain('Soldier')
  })

  it('handles backgrounds with many tools', async () => {
    const manyToolsBg = {
      ...mockBackground,
      proficiencies: [
        ...mockBackground.proficiencies!,
        { id: 3, proficiency_type: 'tool', proficiency_subcategory: null, proficiency_type_id: null, item: { id: 1, name: 'Thieves\' Tools' }, proficiency_name: 'Thieves\' Tools', grants: true, is_choice: false, quantity: 1 },
        { id: 4, proficiency_type: 'tool', proficiency_subcategory: null, proficiency_type_id: null, item: { id: 2, name: 'Disguise Kit' }, proficiency_name: 'Disguise Kit', grants: true, is_choice: false, quantity: 1 },
        { id: 5, proficiency_type: 'tool', proficiency_subcategory: null, proficiency_type_id: null, item: { id: 3, name: 'Forgery Kit' }, proficiency_name: 'Forgery Kit', grants: true, is_choice: false, quantity: 1 }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: manyToolsBg }
    })

    expect(wrapper.text()).toContain('3 Tools')
  })

  // Background Image Tests
  it('renders background image element when slug exists', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    const bgDiv = wrapper.find('[data-test="card-background"]')
    expect(bgDiv.exists()).toBe(true)
  })

  it('has correct opacity classes for background', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    const bgDiv = wrapper.find('[data-test="card-background"]')
    expect(bgDiv.classes()).toContain('opacity-15')
    expect(bgDiv.classes()).toContain('group-hover:opacity-30')
  })

  it('applies transition to background with scale and rotate on hover', async () => {
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: mockBackground }
    })

    const bgDiv = wrapper.find('[data-test="card-background"]')
    expect(bgDiv.classes()).toContain('transition-all')
    expect(bgDiv.classes()).toContain('duration-300')
    expect(bgDiv.classes()).toContain('group-hover:scale-110')
    expect(bgDiv.classes()).toContain('group-hover:rotate-3')
  })

  // Equipment Tests
  it('shows equipment count badge when equipment exists', async () => {
    const bgWithEquipment = {
      ...mockBackground,
      equipment: [
        { id: 1, item_id: 1848, quantity: 1, description: null },
        { id: 2, item_id: 1961, quantity: 1, description: null },
        { id: 3, item_id: null, quantity: 20, description: 'gold pieces' }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithEquipment }
    })

    expect(wrapper.text()).toContain('3 Items')
  })

  it('hides equipment badge when no equipment', async () => {
    const bgNoEquipment = { ...mockBackground, equipment: [] }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgNoEquipment }
    })

    expect(wrapper.text()).not.toContain('Items')
  })

  it('hides equipment badge when equipment is undefined', async () => {
    const bgNoEquipment = { ...mockBackground, equipment: undefined }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgNoEquipment }
    })

    expect(wrapper.text()).not.toContain('Items')
  })

  it('shows starting gold when present in equipment', async () => {
    const bgWithGold = {
      ...mockBackground,
      equipment: [
        { id: 1, item_id: 1848, quantity: 1, description: null },
        { id: 2, item_id: 1860, quantity: 20, description: null }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithGold }
    })

    expect(wrapper.text()).toContain('20 gp')
  })

  it('handles different gold amounts', async () => {
    const bgWithDifferentGold = {
      ...mockBackground,
      equipment: [
        { id: 1, item_id: 1860, quantity: 15, description: null }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithDifferentGold }
    })

    expect(wrapper.text()).toContain('15 gp')
  })

  it('does not show gold badge when no gold in equipment', async () => {
    const bgWithoutGold = {
      ...mockBackground,
      equipment: [
        { id: 1, item_id: 1848, quantity: 1, description: null }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithoutGold }
    })

    expect(wrapper.text()).not.toContain('gp')
  })

  it('shows both equipment count and gold', async () => {
    const bgWithBoth = {
      ...mockBackground,
      equipment: [
        { id: 1, item_id: 1848, quantity: 1, description: null },
        { id: 2, item_id: 1961, quantity: 1, description: null },
        { id: 3, item_id: 1860, quantity: 20, description: null }
      ]
    }
    const wrapper = await mountSuspended(BackgroundCard, {
      props: { background: bgWithBoth }
    })

    expect(wrapper.text()).toContain('2 Items')
    expect(wrapper.text()).toContain('20 gp')
  })
})
