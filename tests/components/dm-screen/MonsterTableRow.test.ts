// tests/components/dm-screen/MonsterTableRow.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MonsterTableRow from '~/components/dm-screen/MonsterTableRow.vue'
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

describe('DmScreenMonsterTableRow', () => {
  it('displays monster label', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    expect(wrapper.text()).toContain('Goblin 1')
  })

  it('displays monster name', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    expect(wrapper.text()).toContain('Goblin')
  })

  it('displays challenge rating', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    expect(wrapper.text()).toContain('CR 1/4')
  })

  it('displays HP', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('7')
  })

  it('displays HP bar', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    expect(wrapper.find('[data-testid="hp-bar"]').exists()).toBe(true)
  })

  it('displays AC', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    expect(wrapper.text()).toContain('15')
  })

  it('has red/monster visual styling', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    const row = wrapper.find('[data-testid="monster-row"]')
    expect(row.exists()).toBe(true)
    // Check for red border styling
    expect(row.classes().some(c => c.includes('red') || c.includes('border-l'))).toBe(true)
  })

  it('displays actions (condensed)', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    expect(wrapper.text()).toContain('Scimitar')
    expect(wrapper.text()).toContain('+4')
  })

  it('emits toggle event when row clicked', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    await wrapper.find('[data-testid="monster-row"]').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('emits remove event when trash clicked and confirmed', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster }
    })
    // Click remove button to show confirmation
    await wrapper.find('[data-testid="remove-btn"]').trigger('click')
    expect(wrapper.find('[data-testid="confirm-remove-btn"]').exists()).toBe(true)
    // Click confirm to emit remove
    await wrapper.find('[data-testid="confirm-remove-btn"]').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
  })

  it('shows current turn indicator when active', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster, isCurrentTurn: true }
    })
    expect(wrapper.text()).toContain('▶')
  })

  it('displays initiative when set', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster, initiative: 15 }
    })
    expect(wrapper.text()).toContain('15')
  })

  it('shows dash when initiative not set', async () => {
    const wrapper = await mountSuspended(MonsterTableRow, {
      props: { monster: mockMonster, initiative: null }
    })
    expect(wrapper.text()).toContain('—')
  })

  describe('HP adjustment buttons', () => {
    it('shows +/- buttons for quick HP adjustment', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      expect(wrapper.find('[data-testid="hp-minus-btn"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="hp-plus-btn"]').exists()).toBe(true)
    })

    it('emits update:hp with decreased value when minus clicked', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      await wrapper.find('[data-testid="hp-minus-btn"]').trigger('click')
      expect(wrapper.emitted('update:hp')).toBeTruthy()
      expect(wrapper.emitted('update:hp')?.[0]).toEqual([4]) // 5 - 1 = 4
    })

    it('emits update:hp with increased value when plus clicked', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      await wrapper.find('[data-testid="hp-plus-btn"]').trigger('click')
      expect(wrapper.emitted('update:hp')).toBeTruthy()
      expect(wrapper.emitted('update:hp')?.[0]).toEqual([6]) // 5 + 1 = 6
    })

    it('does not decrease HP below 0', async () => {
      const deadMonster = { ...mockMonster, current_hp: 0 }
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: deadMonster }
      })
      await wrapper.find('[data-testid="hp-minus-btn"]').trigger('click')
      expect(wrapper.emitted('update:hp')).toBeFalsy()
    })

    it('does not increase HP above max', async () => {
      const fullHpMonster = { ...mockMonster, current_hp: 7, max_hp: 7 }
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: fullHpMonster }
      })
      await wrapper.find('[data-testid="hp-plus-btn"]').trigger('click')
      expect(wrapper.emitted('update:hp')).toBeFalsy()
    })
  })

  describe('speed display', () => {
    it('displays walk speed', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      expect(wrapper.text()).toContain('30 ft')
    })

    it('shows fly indicator when monster can fly', async () => {
      const flyingMonster = {
        ...mockMonster,
        monster: {
          ...mockMonster.monster,
          speed: { walk: 30, fly: 60, swim: null, climb: null }
        }
      }
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: flyingMonster }
      })
      expect(wrapper.find('[data-testid="speed-fly"]').exists()).toBe(true)
    })

    it('shows swim indicator when monster can swim', async () => {
      const swimmingMonster = {
        ...mockMonster,
        monster: {
          ...mockMonster.monster,
          speed: { walk: 30, fly: null, swim: 40, climb: null }
        }
      }
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: swimmingMonster }
      })
      expect(wrapper.find('[data-testid="speed-swim"]').exists()).toBe(true)
    })

    it('shows climb indicator when monster can climb', async () => {
      const climbingMonster = {
        ...mockMonster,
        monster: {
          ...mockMonster.monster,
          speed: { walk: 30, fly: null, swim: null, climb: 30 }
        }
      }
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: climbingMonster }
      })
      expect(wrapper.find('[data-testid="speed-climb"]').exists()).toBe(true)
    })
  })

  describe('status toggles (prone/flying)', () => {
    it('displays prone toggle button', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      expect(wrapper.find('[data-testid="status-prone"]').exists()).toBe(true)
    })

    it('displays flying toggle button', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      expect(wrapper.find('[data-testid="status-flying"]').exists()).toBe(true)
    })

    it('shows prone as inactive when not in statuses', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster, statuses: [] }
      })
      const proneButton = wrapper.find('[data-testid="status-prone"]')
      expect(proneButton.classes().join(' ')).toMatch(/opacity-|neutral/)
    })

    it('shows prone as active when in statuses', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster, statuses: ['prone'] }
      })
      const proneButton = wrapper.find('[data-testid="status-prone"]')
      expect(proneButton.classes().join(' ')).not.toContain('opacity-40')
    })

    it('shows flying as active when in statuses', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster, statuses: ['flying'] }
      })
      const flyingButton = wrapper.find('[data-testid="status-flying"]')
      expect(flyingButton.classes().join(' ')).not.toContain('opacity-40')
    })

    it('emits toggle:status with "prone" when prone button clicked', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      await wrapper.find('[data-testid="status-prone"]').trigger('click')
      expect(wrapper.emitted('toggle:status')).toBeTruthy()
      expect(wrapper.emitted('toggle:status')![0]).toEqual(['prone'])
    })

    it('emits toggle:status with "flying" when flying button clicked', async () => {
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: mockMonster }
      })
      await wrapper.find('[data-testid="status-flying"]').trigger('click')
      expect(wrapper.emitted('toggle:status')).toBeTruthy()
      expect(wrapper.emitted('toggle:status')![0]).toEqual(['flying'])
    })

    it('shows fly speed when flying status is active', async () => {
      const flyingMonster = {
        ...mockMonster,
        monster: {
          ...mockMonster.monster,
          speed: { walk: 30, fly: 60, swim: null, climb: null }
        }
      }
      const wrapper = await mountSuspended(MonsterTableRow, {
        props: { monster: flyingMonster, statuses: ['flying'] }
      })
      expect(wrapper.text()).toMatch(/60\s*ft|fly.*60/)
    })
  })
})
