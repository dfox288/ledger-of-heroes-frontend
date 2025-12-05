// tests/components/character/sheet/AbilityScoreBlock.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AbilityScoreBlock from '~/components/character/sheet/AbilityScoreBlock.vue'

const mockStats = {
  character_id: 1,
  level: 5,
  proficiency_bonus: 3,
  ability_scores: {
    STR: { score: 16, modifier: 3 },
    DEX: { score: 14, modifier: 2 },
    CON: { score: 15, modifier: 2 },
    INT: { score: 10, modifier: 0 },
    WIS: { score: 12, modifier: 1 },
    CHA: { score: 8, modifier: -1 }
  },
  saving_throws: {
    STR: 6,
    DEX: 2,
    CON: 5,
    INT: 0,
    WIS: 1,
    CHA: -1
  },
  armor_class: 16,
  hit_points: { max: 45, current: 45, temporary: 0 },
  initiative_bonus: 2,
  passive_perception: 11,
  spellcasting: null,
  spell_slots: {},
  preparation_limit: null,
  prepared_spell_count: 0
}

describe('CharacterSheetAbilityScoreBlock', () => {
  it('displays all 6 ability scores', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('CON')
    expect(wrapper.text()).toContain('INT')
    expect(wrapper.text()).toContain('WIS')
    expect(wrapper.text()).toContain('CHA')
  })

  it('displays score values', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('16')
    expect(wrapper.text()).toContain('14')
    expect(wrapper.text()).toContain('8')
  })

  it('displays positive modifiers with + sign', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('+3')
    expect(wrapper.text()).toContain('+2')
  })

  it('displays negative modifiers with - sign', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('-1')
  })

  it('displays zero modifier as +0', async () => {
    const wrapper = await mountSuspended(AbilityScoreBlock, {
      props: { stats: mockStats }
    })
    expect(wrapper.text()).toContain('+0')
  })
})
