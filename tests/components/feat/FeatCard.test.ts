import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FeatCard from '~/components/feat/FeatCard.vue'
import { createMockFeat } from '#tests/helpers/mockFactories'
import { testMissingDescriptionFallback } from '#tests/helpers/descriptionBehavior'
import { testEntityCardBasics } from '#tests/helpers/cardBehavior'

describe('FeatCard', () => {
  const mockFeat = createMockFeat()

  // Entity card basics (via helper) - tests name, link, hover
  testEntityCardBasics({
    component: FeatCard,
    propName: 'feat',
    mockFactory: createMockFeat,
    entityName: 'War Caster',
    linkPath: '/feats/phb:war-caster',
    optionalFields: ['prerequisites', 'modifiers', 'sources']
  })

  // Feat-specific tests (domain logic)
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

  it('displays first prerequisite plus count for multiple ability prerequisites', async () => {
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

    // Should show "STR 13+ +1 more" instead of "2 prerequisites"
    expect(wrapper.text()).toContain('STR 13+')
    expect(wrapper.text()).toContain('+1 more')
  })

  it('displays first prerequisite plus count for 3+ prerequisites', async () => {
    const multiPrerequFeat = {
      ...mockFeat,
      prerequisites: [
        { ability_score: { id: 1, code: 'STR', name: 'Strength' }, minimum_value: 15 },
        { ability_score: { id: 2, code: 'DEX', name: 'Dexterity' }, minimum_value: 13 },
        { description: 'Proficiency with martial weapons' }
      ]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: multiPrerequFeat }
    })

    // Should show "STR 15+ +2 more"
    expect(wrapper.text()).toContain('STR 15+')
    expect(wrapper.text()).toContain('+2 more')
  })

  it('displays first description prerequisite plus count when first has no ability score', async () => {
    const multiPrerequFeat = {
      ...mockFeat,
      prerequisites: [
        { description: 'Proficiency with heavy armor' },
        { ability_score: { id: 1, code: 'STR', name: 'Strength' }, minimum_value: 13 }
      ]
    }
    const wrapper = await mountSuspended(FeatCard, {
      props: { feat: multiPrerequFeat }
    })

    // Should show first description + count
    expect(wrapper.text()).toContain('Proficiency with heavy armor')
    expect(wrapper.text()).toContain('+1 more')
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

  // Missing description fallback test using shared helper
  testMissingDescriptionFallback(
    () => mountSuspended(FeatCard, {
      props: { feat: { ...mockFeat, description: undefined } }
    }),
    'A feat that provides special abilities or bonuses'
  )

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
})
