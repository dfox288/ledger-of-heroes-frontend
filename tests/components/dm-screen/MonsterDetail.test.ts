// tests/components/dm-screen/MonsterDetail.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MonsterDetail from '~/components/dm-screen/MonsterDetail.vue'
import type { EncounterMonster } from '~/types/dm-screen'

const mockMonster: EncounterMonster = {
  id: 1,
  monster_id: 42,
  label: 'Goblin 1',
  current_hp: 5,
  max_hp: 7,
  monster: {
    name: 'Goblin',
    slug: 'mm:goblin',
    armor_class: 15,
    hit_points: { average: 7, formula: '2d6' },
    speed: { walk: 30, fly: null, swim: null, climb: null },
    challenge_rating: '1/4',
    actions: [
      { name: 'Scimitar', attack_bonus: 4, damage: '1d6+2 slashing', description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target.', action_type: 'action', recharge: null, sort_order: 1 },
      { name: 'Shortbow', attack_bonus: 4, damage: '1d6+2 piercing', description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target.', action_type: 'action', recharge: null, sort_order: 2 }
    ]
  }
}

const mockMonsterWithFly: EncounterMonster = {
  ...mockMonster,
  monster: {
    ...mockMonster.monster,
    speed: { walk: 30, fly: 60, swim: null, climb: 30 }
  }
}

describe('DmScreenMonsterDetail', () => {
  describe('basic info', () => {
    it('displays monster name and challenge rating', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('Goblin')
      expect(wrapper.text()).toContain('CR 1/4')
    })

    it('displays hit dice formula', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('2d6')
    })
  })

  describe('speeds', () => {
    it('displays walk speed', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('30 ft')
    })

    it('displays multiple speeds when present', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonsterWithFly }
      })
      expect(wrapper.text()).toContain('30 ft')
      expect(wrapper.text()).toContain('Fly')
      expect(wrapper.text()).toContain('60 ft')
      expect(wrapper.text()).toContain('Climb')
    })
  })

  describe('actions', () => {
    it('displays all monster actions', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('Scimitar')
      expect(wrapper.text()).toContain('Shortbow')
    })

    it('displays attack bonus for actions', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('+4')
    })

    it('displays damage for actions', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('1d6+2 slashing')
      expect(wrapper.text()).toContain('1d6+2 piercing')
    })

    it('displays description for melee attacks', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('reach 5 ft.')
    })

    it('displays description for ranged attacks', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('range 80/320 ft.')
    })
  })

  describe('styling', () => {
    it('has monster-themed red styling', async () => {
      const wrapper = await mountSuspended(MonsterDetail, {
        props: { monster: mockMonster }
      })
      // Check for red/monster themed background
      expect(wrapper.html()).toContain('red')
    })
  })
})
