import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellCard from '~/components/spell/SpellCard.vue'
import { createMockSpell } from '../../helpers/mockFactories'
import { testBadgeVisibility } from '../../helpers/badgeVisibilityBehavior'

describe('SpellCard', () => {
  const mockSpell = createMockSpell()

  // Spell-specific tests (domain logic)
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

  // Badge visibility tests (consolidated via helper)
  testBadgeVisibility(SpellCard, createMockSpell, 'spell', [
    { badgeText: 'Concentration', propField: 'needs_concentration' },
    { badgeText: 'Ritual', propField: 'is_ritual' }
  ])

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
    expect(text).toContain('Player\'s Handbook')
  })

  // Area of Effect tests (Issue #54)
  it('shows area of effect badge when area_of_effect is set', async () => {
    const aoeSpell = createMockSpell({
      area_of_effect: '{"type":"sphere","size":20}'
    })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: aoeSpell }
    })

    expect(wrapper.text()).toContain('20ft sphere')
  })

  it('hides area of effect badge when area_of_effect is null', async () => {
    const spell = createMockSpell({ area_of_effect: null })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell }
    })

    expect(wrapper.text()).not.toContain('ft')
  })

  it('displays cone type correctly', async () => {
    const coneSpell = createMockSpell({
      area_of_effect: '{"type":"cone","size":60}'
    })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: coneSpell }
    })

    expect(wrapper.text()).toContain('60ft cone')
  })

  it('displays line type correctly', async () => {
    const lineSpell = createMockSpell({
      area_of_effect: '{"type":"line","size":100}'
    })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: lineSpell }
    })

    expect(wrapper.text()).toContain('100ft line')
  })

  it('displays cube type correctly', async () => {
    const cubeSpell = createMockSpell({
      area_of_effect: '{"type":"cube","size":10}'
    })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: cubeSpell }
    })

    expect(wrapper.text()).toContain('10ft cube')
  })

  it('displays cylinder type correctly', async () => {
    const cylinderSpell = createMockSpell({
      area_of_effect: '{"type":"cylinder","size":40}'
    })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: cylinderSpell }
    })

    expect(wrapper.text()).toContain('40ft cylinder')
  })

  it('handles malformed area_of_effect gracefully', async () => {
    const badSpell = createMockSpell({
      area_of_effect: 'invalid json'
    })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: badSpell }
    })

    // Should not crash, should hide badge
    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.text()).not.toContain('ft sphere')
  })

  // Material Cost and Consumed tests (Issue #53)
  it('shows material cost badge when material_cost_gp is set', async () => {
    const expensiveSpell = createMockSpell({ material_cost_gp: '50' })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: expensiveSpell }
    })

    expect(wrapper.text()).toContain('50 gp')
  })

  it('hides material cost badge when material_cost_gp is null', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).not.toContain('gp')
  })

  it('shows consumed badge when material_consumed is true', async () => {
    const consumedSpell = createMockSpell({ material_consumed: 'true', material_cost_gp: '300' })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: consumedSpell }
    })

    expect(wrapper.text()).toContain('Consumed')
  })

  it('hides consumed badge when material_consumed is false', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).not.toContain('Consumed')
  })

  it('shows both cost and consumed together', async () => {
    const revivifySpell = createMockSpell({ material_cost_gp: '300', material_consumed: 'true' })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: revivifySpell }
    })

    const text = wrapper.text()
    expect(text).toContain('300 gp')
    expect(text).toContain('Consumed')
  })

  it('shows cost badge but not consumed badge when material is not consumed', async () => {
    const chromaticOrbSpell = createMockSpell({ material_cost_gp: '50', material_consumed: 'false' })
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: chromaticOrbSpell }
    })

    const text = wrapper.text()
    expect(text).toContain('50 gp')
    expect(text).not.toContain('Consumed')
  })
})
