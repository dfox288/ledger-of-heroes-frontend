import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ClassCard from '~/components/class/ClassCard.vue'
import { createMockClass } from '#tests/helpers/mockFactories'
import { testDescriptionTruncation, testMissingDescriptionFallback } from '#tests/helpers/descriptionBehavior'
import { testEntityCardBasics } from '#tests/helpers/cardBehavior'

describe('ClassCard', () => {
  const mockClass = createMockClass()

  // Entity card basics (via helper) - tests name, link, hover
  testEntityCardBasics({
    component: ClassCard,
    propName: 'characterClass',
    mockFactory: createMockClass,
    entityName: 'Wizard',
    linkPath: '/classes/phb:wizard',
    optionalFields: ['primary_ability', 'spellcasting_ability', 'sources']
  })

  // Description truncation tests using shared helper
  testDescriptionTruncation(
    () => mountSuspended(ClassCard, {
      props: { characterClass: { ...mockClass, description: 'A'.repeat(200) } }
    }),
    () => mountSuspended(ClassCard, {
      props: { characterClass: { ...mockClass, description: 'Short' } }
    })
  )

  it('formats hit die correctly', async () => {
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: mockClass }
    })

    expect(wrapper.text()).toContain('d6')
  })

  it.each([
    [6],
    [8],
    [10],
    [12]
  ])('handles different hit die sizes: d%s', async (size) => {
    const classWithHitDie = { ...mockClass, hit_die: size }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: classWithHitDie }
    })

    expect(wrapper.text()).toContain(`d${size}`)
  })

  it('shows base class badge when is_base_class is true', async () => {
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: mockClass }
    })

    expect(wrapper.text()).toContain('Base Class')
  })

  it('shows subclass badge when is_base_class is false', async () => {
    const subclass = {
      ...mockClass,
      is_base_class: false, // API returns boolean
      subclasses: undefined
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: subclass }
    })

    expect(wrapper.text()).toContain('Subclass')
  })

  it('renders primary ability when provided', async () => {
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: mockClass }
    })

    expect(wrapper.text()).toContain('INT')
  })

  it('handles missing primary ability gracefully', async () => {
    const classWithoutPrimary = { ...mockClass, primary_ability: null }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: classWithoutPrimary }
    })

    expect(wrapper.text()).toContain('Wizard')
    expect(wrapper.text()).not.toContain('🎯')
  })

  it('renders spellcasting ability when provided', async () => {
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: mockClass }
    })

    expect(wrapper.text()).toContain('Intelligence')
  })

  it('handles missing spellcasting ability gracefully', async () => {
    const nonCasterClass = { ...mockClass, spellcasting_ability: null }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: nonCasterClass }
    })

    expect(wrapper.text()).toContain('Wizard')
    // Should not show spellcasting badge
    const badges = wrapper.findAll('[class*="badge"]')
    const hasSpellcastingBadge = badges.some(b => b.text().includes('Intelligence'))
    expect(hasSpellcastingBadge).toBe(false)
  })

  it('shows subclasses count when base class has subclasses', async () => {
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: mockClass }
    })

    expect(wrapper.text()).toContain('2 Subclasses')
  })

  it('uses singular form for single subclass', async () => {
    const oneSubclassClass = {
      ...mockClass,
      subclasses: [{ id: 2, name: 'School of Evocation' }]
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: oneSubclassClass }
    })

    expect(wrapper.text()).toContain('1 Subclass')
  })

  it('hides subclasses count when none exist', async () => {
    const noSubclassesClass = { ...mockClass, subclasses: [] }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: noSubclassesClass }
    })

    expect(wrapper.text()).not.toContain('Subclass')
  })

  it('hides subclasses count for subclasses themselves', async () => {
    const subclass = {
      ...mockClass,
      is_base_class: false, // API returns boolean
      subclasses: undefined
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: subclass }
    })

    expect(wrapper.text()).not.toContain('Subclasses')
  })

  it('renders description when provided', async () => {
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: mockClass }
    })

    expect(wrapper.text()).toContain('Wizards are supreme magic-users')
  })

  // Missing description fallback test using shared helper
  testMissingDescriptionFallback(
    () => mountSuspended(ClassCard, {
      props: { characterClass: { ...mockClass, description: undefined } }
    }),
    'A playable class for D&D 5e characters'
  )

  it('displays all key information in organized layout', async () => {
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: mockClass }
    })

    const text = wrapper.text()
    expect(text).toContain('Wizard')
    expect(text).toContain('Base Class')
    expect(text).toContain('INT')
    expect(text).toContain('Intelligence')
    expect(text).toContain('d6')
    expect(text).toContain('2 Subclasses')
  })

  it.each([
    [{ code: 'STR', name: 'Strength' }],
    [{ code: 'DEX', name: 'Dexterity' }],
    [{ code: 'WIS', name: 'Wisdom' }],
    [{ code: 'CHA', name: 'Charisma' }]
  ])('handles classes with different primary abilities: %s', async (ability) => {
    const classWithAbility = {
      ...mockClass,
      primary_ability: { id: 1, ...ability }
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: classWithAbility }
    })

    expect(wrapper.text()).toContain(ability.code)
  })

  it('handles non-spellcasting classes', async () => {
    const martialClass = {
      ...mockClass,
      name: 'Fighter',
      slug: 'fighter',
      hit_die: 10,
      spellcasting_ability: null,
      primary_ability: { id: 1, code: 'STR', name: 'Strength' }
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: martialClass }
    })

    expect(wrapper.text()).toContain('Fighter')
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).not.toContain('✨')
  })

  it('handles half-casters with spellcasting ability', async () => {
    const halfCaster = {
      ...mockClass,
      name: 'Paladin',
      slug: 'paladin',
      spellcasting_ability: { id: 6, code: 'CHA', name: 'Charisma' },
      primary_ability: { id: 1, code: 'STR', name: 'Strength' }
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: halfCaster }
    })

    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('Charisma')
  })

  it('handles classes with all optional fields', async () => {
    const fullClass = {
      ...mockClass,
      primary_ability: { id: 1, code: 'INT', name: 'Intelligence' },
      spellcasting_ability: { id: 1, code: 'INT', name: 'Intelligence' },
      subclasses: [{ id: 1, name: 'Subclass' }],
      proficiencies: [{ id: 1, name: 'Daggers' }],
      description: 'Full description',
      sources: [{ code: 'PHB', name: 'Player\'s Handbook', pages: '112' }]
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: fullClass }
    })

    expect(wrapper.html()).toBeTruthy()
  })

  it('handles classes with minimal fields', async () => {
    const minimalClass = {
      id: 1,
      name: 'Barbarian',
      slug: 'barbarian',
      hit_die: 12,
      is_base_class: true, // API returns boolean
      parent_class_id: null
    }
    const wrapper = await mountSuspended(ClassCard, {
      props: { characterClass: minimalClass }
    })

    expect(wrapper.text()).toContain('Barbarian')
    expect(wrapper.text()).toContain('d12')
    expect(wrapper.text()).toContain('Base Class')
  })
})
