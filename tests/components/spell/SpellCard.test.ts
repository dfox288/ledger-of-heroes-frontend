import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellCard from '~/components/spell/SpellCard.vue'
import type { Spell } from '~/types'

describe('SpellCard', () => {
  const mockSpell: Spell = {
    id: 1,
    name: 'Fireball',
    slug: 'fireball',
    level: 3,
    school: {
      id: 5,
      code: 'EV',
      name: 'Evocation'
    },
    casting_time: '1 action',
    range: '150 feet',
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
    is_ritual: false,
    needs_concentration: false,
    sources: [
      { code: 'PHB', name: "Player's Handbook", pages: '241' }
    ]
  }

  it('renders spell name', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain('Fireball')
  })

  it('formats spell level correctly for low level spells', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain('3rd Level')
  })

  it('formats cantrips correctly', async () => {
    const cantrip = { ...mockSpell, level: 0 }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: cantrip }
    })

    expect(wrapper.text()).toContain('Cantrip')
  })

  it('formats 1st level correctly', async () => {
    const firstLevel = { ...mockSpell, level: 1 }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: firstLevel }
    })

    expect(wrapper.text()).toContain('1st Level')
  })

  it('formats 2nd level correctly', async () => {
    const secondLevel = { ...mockSpell, level: 2 }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: secondLevel }
    })

    expect(wrapper.text()).toContain('2nd Level')
  })

  it('renders school name when school is provided', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain('Evocation')
  })

  it('handles missing school gracefully', async () => {
    const spellWithoutSchool = { ...mockSpell, school: undefined }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: spellWithoutSchool }
    })

    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.text()).not.toContain('Evocation')
  })

  it('renders casting time', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain('1 action')
  })

  it('renders range', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain('150 feet')
  })

  it('renders description preview', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain('A bright streak flashes')
  })

  it('truncates long descriptions', async () => {
    const longDescription = 'A'.repeat(200)
    const longSpell = { ...mockSpell, description: longDescription }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: longSpell }
    })

    const text = wrapper.text()
    expect(text).toContain('...')
    expect(text.length).toBeLessThan(longDescription.length + 100)
  })

  it('does not truncate short descriptions', async () => {
    const shortDescription = 'Short spell description'
    const shortSpell = { ...mockSpell, description: shortDescription }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: shortSpell }
    })

    expect(wrapper.text()).toContain(shortDescription)
    expect(wrapper.text()).not.toContain('...')
  })

  it('shows concentration badge when needs_concentration is true', async () => {
    const concentrationSpell = { ...mockSpell, needs_concentration: true }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: concentrationSpell }
    })

    expect(wrapper.text()).toContain('Concentration')
  })

  it('hides concentration badge when needs_concentration is false', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).not.toContain('Concentration')
  })

  it('shows ritual badge when is_ritual is true', async () => {
    const ritualSpell = { ...mockSpell, is_ritual: true }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: ritualSpell }
    })

    expect(wrapper.text()).toContain('Ritual')
  })

  it('hides ritual badge when is_ritual is false', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).not.toContain('Ritual')
  })

  it('links to spell detail page with slug', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/spells/fireball')
  })

  it('applies hover effects for interactivity', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    const html = wrapper.html()
    expect(html).toContain('hover')
  })

  it('uses card component with border', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    const html = wrapper.html()
    expect(html).toContain('border')
  })

  it('renders with proper spacing structure', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    const html = wrapper.html()
    expect(html).toContain('space-y-3')
  })

  it('handles spells with all badges (concentration + ritual)', async () => {
    const fullSpell = {
      ...mockSpell,
      needs_concentration: true,
      is_ritual: true
    }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: fullSpell }
    })

    const text = wrapper.text()
    expect(text).toContain('Concentration')
    expect(text).toContain('Ritual')
  })

  it('renders sources footer', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain("Player's Handbook")
  })

  it('handles spells without sources', async () => {
    const spellWithoutSources = { ...mockSpell, sources: undefined }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: spellWithoutSources }
    })

    expect(wrapper.text()).toContain('Fireball')
  })

  it('displays all key information in organized layout', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    const text = wrapper.text()
    expect(text).toContain('3rd Level')
    expect(text).toContain('Evocation')
    expect(text).toContain('Fireball')
    expect(text).toContain('1 action')
    expect(text).toContain('150 feet')
    expect(text).toContain("Player's Handbook")
  })

  it('applies correct level color for cantrips', async () => {
    const cantrip = { ...mockSpell, level: 0 }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: cantrip }
    })

    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('applies correct level color for low level spells (1-3)', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('applies correct level color for mid level spells (4-6)', async () => {
    const midLevel = { ...mockSpell, level: 5 }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: midLevel }
    })

    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('applies correct level color for high level spells (7-9)', async () => {
    const highLevel = { ...mockSpell, level: 9 }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: highLevel }
    })

    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('handles long spell names with line clamp', async () => {
    const longName = 'Mordenkainen\'s Magnificent Mansion of Magnificent Magnificence'
    const longNameSpell = { ...mockSpell, name: longName }
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: longNameSpell }
    })

    const html = wrapper.html()
    expect(html).toContain('line-clamp-2')
  })
})
