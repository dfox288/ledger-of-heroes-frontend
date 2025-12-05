// tests/components/character/sheet/CombatStatsGrid.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CombatStatsGrid from '~/components/character/sheet/CombatStatsGrid.vue'

const mockCharacter = {
  speed: 30,
  proficiency_bonus: 2
}

const mockStats = {
  armor_class: 16,
  hit_points: { max: 28, current: 22, temporary: 5 },
  initiative_bonus: 2,
  passive_perception: 14
}

describe('CharacterSheetCombatStatsGrid', () => {
  it('displays hit points as current/max', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('22')
    expect(wrapper.text()).toContain('28')
  })

  it('displays armor class', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('16')
    expect(wrapper.text()).toContain('AC')
  })

  it('displays initiative bonus', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('Initiative')
  })

  it('displays speed', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('30')
    expect(wrapper.text()).toContain('ft')
  })

  it('displays proficiency bonus', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('Prof')
  })

  it('displays passive perception', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('14')
    expect(wrapper.text()).toContain('Passive')
  })

  it('shows temporary HP when present', async () => {
    const wrapper = await mountSuspended(CombatStatsGrid, {
      props: { character: mockCharacter, stats: mockStats }
    })
    expect(wrapper.text()).toContain('+5')
  })
})
