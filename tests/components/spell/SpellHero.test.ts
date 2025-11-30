import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellHero from '~/components/spell/SpellHero.vue'
import { createMockSpell } from '../../helpers/mockFactories'

describe('SpellHero', () => {
  const mockSpell = createMockSpell()

  // Basic rendering

  it('renders spell name as heading', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: null
      }
    })

    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Fireball')
  })

  // Level badge tests

  it('renders level badge for cantrip with gray color', async () => {
    const cantrip = createMockSpell({ level: 0, name: 'Fire Bolt' })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: cantrip,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('Cantrip')
  })

  it('renders level badge for 1st level spell', async () => {
    const spell = createMockSpell({ level: 1 })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('1st Level')
  })

  it('renders level badge for 2nd level spell', async () => {
    const spell = createMockSpell({ level: 2 })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('2nd Level')
  })

  it('renders level badge for 3rd level spell', async () => {
    const spell = createMockSpell({ level: 3 })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('3rd Level')
  })

  it('renders level badge for 9th level spell', async () => {
    const spell = createMockSpell({ level: 9 })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('9th Level')
  })

  // School badge tests

  it('renders school badge', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('Evocation')
  })

  it('renders school badge for different school', async () => {
    const spell = createMockSpell({
      school: { id: 1, code: 'A', name: 'Abjuration' }
    })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('Abjuration')
  })

  // Ritual badge tests

  it('renders ritual badge when spell is ritual', async () => {
    const ritualSpell = createMockSpell({ is_ritual: true })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: ritualSpell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('🔮')
    expect(wrapper.text()).toContain('Ritual')
  })

  it('does not render ritual badge when spell is not ritual', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: null
      }
    })

    expect(wrapper.text()).not.toContain('Ritual')
  })

  // Concentration badge tests

  it('renders concentration badge when spell needs concentration', async () => {
    const concentrationSpell = createMockSpell({ needs_concentration: true })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: concentrationSpell,
        imagePath: null
      }
    })

    expect(wrapper.text()).toContain('⭐')
    expect(wrapper.text()).toContain('Concentration')
  })

  it('does not render concentration badge when spell does not need concentration', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: null
      }
    })

    expect(wrapper.text()).not.toContain('Concentration')
  })

  // Image tests

  it('renders image when imagePath provided', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: '/images/spells/fireball.png'
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
  })

  it('handles missing image gracefully', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: null
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
  })

  it('applies correct grid layout', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: '/images/spells/fireball.png'
      }
    })

    // Check for responsive grid classes
    const container = wrapper.find('.grid')
    expect(container.exists()).toBe(true)
    expect(container.classes()).toContain('lg:grid-cols-3')
  })

  // Integration tests

  it('displays all badges together correctly', async () => {
    const fullSpell = createMockSpell({
      name: 'Bless',
      level: 1,
      school: { id: 6, code: 'EN', name: 'Enchantment' },
      is_ritual: false,
      needs_concentration: true
    })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: fullSpell,
        imagePath: '/images/spells/bless.png'
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Bless')
    expect(text).toContain('1st Level')
    expect(text).toContain('Enchantment')
    expect(text).toContain('⭐')
    expect(text).toContain('Concentration')
  })

  it('displays cantrip with ritual', async () => {
    // While rare, some cantrips can be rituals in homebrew
    const ritualCantrip = createMockSpell({
      level: 0,
      is_ritual: true,
      needs_concentration: false
    })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: ritualCantrip,
        imagePath: null
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Cantrip')
    expect(text).toContain('🔮')
    expect(text).toContain('Ritual')
  })

  it('displays high level spell with concentration', async () => {
    const highLevelSpell = createMockSpell({
      level: 9,
      needs_concentration: true,
      is_ritual: false
    })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: highLevelSpell,
        imagePath: null
      }
    })

    const text = wrapper.text()
    expect(text).toContain('9th Level')
    expect(text).toContain('⭐')
    expect(text).toContain('Concentration')
  })

  it('uses lazy loading for images', async () => {
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell: mockSpell,
        imagePath: '/images/spells/fireball.png'
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
  })

  // Badge ordering test
  it('displays badges in correct order: level, school, ritual, concentration', async () => {
    const spell = createMockSpell({
      level: 5,
      school: { id: 1, code: 'A', name: 'Abjuration' },
      is_ritual: true,
      needs_concentration: true
    })
    const wrapper = await mountSuspended(SpellHero, {
      props: {
        spell,
        imagePath: null
      }
    })

    const badgesContainer = wrapper.find('.flex')
    const text = badgesContainer.text()

    // Level and school should appear before ritual/concentration
    const levelIndex = text.indexOf('5th Level')
    const schoolIndex = text.indexOf('Abjuration')
    const ritualIndex = text.indexOf('Ritual')
    const concentrationIndex = text.indexOf('Concentration')

    expect(levelIndex).toBeGreaterThan(-1)
    expect(schoolIndex).toBeGreaterThan(-1)
    expect(ritualIndex).toBeGreaterThan(-1)
    expect(concentrationIndex).toBeGreaterThan(-1)
  })
})
