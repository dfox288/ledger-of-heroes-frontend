import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Feat } from '~/types'
import type { components } from '~/types/api/generated'
import FeatCard from '~/components/feat/FeatCard.vue'
import { testCardLinkBehavior, testCardHoverEffects, testCardBorderStyling } from '../../helpers/cardBehavior'
import { testDescriptionTruncation } from '../../helpers/descriptionBehavior'
import { testSourceFooter, testOptionalSourceFooter } from '../../helpers/sourceBehavior'

describe('FeatCard - Type Compatibility', () => {
  it('should accept OpenAPI-generated Feat type', () => {
    // This test verifies that our Feat interface is compatible with the generated type
    const generatedFeat: components['schemas']['FeatResource'] = {
      id: 1,
      name: 'Alert',
      slug: 'alert',
      prerequisites_text: null,
      description: 'Always on the lookout for danger'
    }

    // Should be assignable to our application Feat type
    const feat: Feat = generatedFeat

    expect(feat.id).toBe(1)
    expect(feat.name).toBe('Alert')
  })
})

describe('FeatCard', () => {
  const mockFeat: Feat = {
    id: 1,
    name: 'War Caster',
    slug: 'war-caster',
    prerequisites: [
      {
        ability_score: { id: 4, code: 'INT', name: 'Intelligence' },
        minimum_value: 13
      }
    ],
    modifiers: [
      { modifier_type: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 1 },
      { modifier_type: 'ability_score', ability_score: { id: 3, code: 'CON', name: 'Constitution' }, value: 1 }
    ],
    description: 'You have practiced casting spells in the midst of combat, learning techniques that grant you the following benefits.',
    sources: [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '170' }
    ]
  }

  // Shared card behavior tests (using helpers)
  testCardLinkBehavior(
    () => mountSuspended(FeatCard, { props: { feat: mockFeat } }),
    '/feats/war-caster'
  )

  testCardHoverEffects(
    () => mountSuspended(FeatCard, { props: { feat: mockFeat } })
  )

  testCardBorderStyling(
    () => mountSuspended(FeatCard, { props: { feat: mockFeat } })
  )

  testDescriptionTruncation(
    () => mountSuspended(FeatCard, { props: { feat: { ...mockFeat, description: 'A'.repeat(200) } } }),
    () => mountSuspended(FeatCard, { props: { feat: { ...mockFeat, description: 'Short feat description' } } })
  )

  testSourceFooter(
    () => mountSuspended(FeatCard, { props: { feat: mockFeat } }),
    'Player\'s Handbook'
  )

  testOptionalSourceFooter(
    () => mountSuspended(FeatCard, { props: { feat: { ...mockFeat, sources: undefined } } }),
    'War Caster'
  )

  // Feat-specific tests (domain logic)
  it('renders feat name', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    expect(wrapper.text()).toContain('War Caster')
  })

  it('shows prerequisites badge when prerequisites exist', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    expect(wrapper.text()).toContain('Prerequisites')
  })

  it('hides prerequisites warning badge when none exist', async () => {
    const noPrerequFeat = { ...mockFeat, prerequisites: [] }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: noPrerequFeat }
    })

    // Should not show red "Prerequisites" badge, but may show "No Prerequisites"
    const html = wrapper.html()
    expect(html.includes('>Prerequisites<')).toBe(false)
  })

  it('shows "No Prerequisites" badge when feat has no requirements', async () => {
    const noPrerequFeat = { ...mockFeat, prerequisites: [] }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: noPrerequFeat }
    })

    expect(wrapper.text()).toContain('No Prerequisites')
  })

  it('displays single ability score prerequisite', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    expect(wrapper.text()).toContain('INT 13+')
  })

  it('displays multiple prerequisites count', async () => {
    const multiPrerequFeat = {
      ...mockFeat,
      prerequisites: [
        { ability_score: { id: 1, code: 'STR', name: 'Strength' }, minimum_value: 13 },
        { ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, minimum_value: 13 }
      ]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: multiPrerequFeat }
    })

    expect(wrapper.text()).toContain('2 prerequisites')
  })

  it('displays description prerequisite when no ability score', async () => {
    const descPrerequFeat = {
      ...mockFeat,
      prerequisites: [{ description: 'Must be proficient with heavy armor' }]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: descPrerequFeat }
    })

    expect(wrapper.text()).toContain('Must be proficient with heavy armor')
  })

  it('shows generic text when prerequisite has no details', async () => {
    const vaguePrerequFeat = {
      ...mockFeat,
      prerequisites: [{}]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: vaguePrerequFeat }
    })

    expect(wrapper.text()).toContain('Prerequisites required')
  })

  it('shows modifiers count when modifiers exist', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    expect(wrapper.text()).toContain('2 Bonuses')
  })

  it('uses singular form for single modifier', async () => {
    const oneModFeat = {
      ...mockFeat,
      modifiers: [
        { modifier_type: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 1 }
      ]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: oneModFeat }
    })

    expect(wrapper.text()).toContain('1 Bonus')
  })

  it('hides modifiers count when none exist', async () => {
    const noModsFeat = { ...mockFeat, modifiers: [] }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: noModsFeat }
    })

    const text = wrapper.text()
    expect(text).not.toContain('Bonus')
    expect(text).not.toContain('Bonuses')
  })

  it('renders description when provided', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    expect(wrapper.text()).toContain('You have practiced casting spells')
  })

  it('shows default description when not provided', async () => {
    const featWithoutDescription = { ...mockFeat, description: undefined }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: featWithoutDescription }
    })

    expect(wrapper.text()).toContain('A feat that provides special abilities or bonuses')
  })

  it('displays all key information in organized layout', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    const text = wrapper.text()
    expect(text).toContain('War Caster')
    expect(text).toContain('Prerequisites')
    expect(text).toContain('INT 13+')
    expect(text).toContain('2 Bonuses')
  })

  it('handles feats with all optional fields', async () => {
    const fullFeat = {
      ...mockFeat,
      prerequisites: [{ ability_score: { id: 1, code: 'STR', name: 'Strength' }, minimum_value: 13 }],
      modifiers: [{ modifier_type: 'ability_score', ability_score: { id: 1, code: 'STR', name: 'Strength' }, value: 1 }],
      description: 'Full description',
      sources: [{ code: 'PHB', name: 'Player\'s Handbook', pages: '170' }]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: fullFeat }
    })

    expect(wrapper.html()).toBeTruthy()
  })

  it('handles feats with minimal fields', async () => {
    const minimalFeat = {
      id: 1,
      name: 'Lucky',
      slug: 'lucky',
      prerequisites: [],
      modifiers: []
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: minimalFeat }
    })

    expect(wrapper.text()).toContain('Lucky')
    expect(wrapper.text()).toContain('No Prerequisites')
  })

  it('handles feats with high ability score requirements', async () => {
    const highReqFeat = {
      ...mockFeat,
      prerequisites: [
        { ability_score: { id: 1, code: 'STR', name: 'Strength' }, minimum_value: 20 }
      ]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: highReqFeat }
    })

    expect(wrapper.text()).toContain('STR 20+')
  })

  it('handles feats with many modifiers', async () => {
    const manyModsFeat = {
      ...mockFeat,
      modifiers: [
        { modifier_type: 'ability_score', value: 1 },
        { modifier_type: 'ability_score', value: 1 },
        { modifier_type: 'ability_score', value: 1 },
        { modifier_type: 'ability_score', value: 1 }
      ]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: manyModsFeat }
    })

    expect(wrapper.text()).toContain('4 Bonuses')
  })

  // Background Image Tests
  it('renders background image element when slug exists', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    const bgDiv = wrapper.find('[data-test="card-background"]')
    expect(bgDiv.exists()).toBe(true)
  })

  it('has correct opacity classes for background', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    const bgDiv = wrapper.find('[data-test="card-background"]')
    expect(bgDiv.classes()).toContain('opacity-10')
    expect(bgDiv.classes()).toContain('group-hover:opacity-20')
  })

  it('applies transition to background opacity', async () => {
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: mockFeat }
    })

    const bgDiv = wrapper.find('[data-test="card-background"]')
    expect(bgDiv.classes()).toContain('transition-opacity')
  })
})
