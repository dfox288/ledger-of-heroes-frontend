// tests/components/dm-screen/CombatTableRow.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CombatTableRow from '~/components/dm-screen/CombatTableRow.vue'
import type { DmScreenCharacter } from '~/types/dm-screen'

const mockCharacter: DmScreenCharacter = {
  id: 1,
  public_id: 'brave-mage-3aBc',
  name: 'Gandalf',
  level: 5,
  class_name: 'Wizard',
  hit_points: { current: 28, max: 35, temp: 0 },
  armor_class: 15,
  proficiency_bonus: 3,
  combat: {
    initiative_modifier: 2,
    speeds: { walk: 30, fly: null, swim: null, climb: null },
    death_saves: { successes: 0, failures: 0 },
    concentration: { active: false, spell: null }
  },
  senses: {
    passive_perception: 14,
    passive_investigation: 12,
    passive_insight: 14,
    darkvision: 60
  },
  capabilities: {
    languages: ['Common', 'Elvish'],
    size: 'Medium',
    tool_proficiencies: []
  },
  equipment: {
    armor: null,
    weapons: [],
    shield: false
  },
  saving_throws: { STR: 0, DEX: 2, CON: 1, INT: 4, WIS: 2, CHA: -1 },
  conditions: [],
  spell_slots: { 1: { current: 4, max: 4 } },
  counters: []
}

describe('DmScreenCombatTableRow', () => {
  it('displays character name and class', async () => {
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('Gandalf')
    expect(wrapper.text()).toContain('Wizard')
  })

  it('displays HP bar', async () => {
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: mockCharacter }
    })
    expect(wrapper.find('[data-testid="hp-bar-fill"]').exists()).toBe(true)
  })

  it('displays armor class', async () => {
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('15')
  })

  it('highlights high AC (17+)', async () => {
    const highAcCharacter = { ...mockCharacter, armor_class: 18 }
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: highAcCharacter }
    })
    const acBadge = wrapper.find('[data-testid="ac-badge"]')
    expect(acBadge.classes().join(' ')).toMatch(/primary|blue|highlight/)
  })

  it('displays initiative modifier with sign', async () => {
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('+2')
  })

  it('displays passive scores', async () => {
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: mockCharacter }
    })
    expect(wrapper.text()).toContain('14') // Perception
    expect(wrapper.text()).toContain('12') // Investigation
  })

  it('emits toggle event for expansion', async () => {
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: mockCharacter }
    })
    await wrapper.find('[data-testid="combat-row"]').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('shows death saves when active', async () => {
    const dyingCharacter = {
      ...mockCharacter,
      combat: {
        ...mockCharacter.combat,
        death_saves: { successes: 1, failures: 2 }
      }
    }
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: dyingCharacter }
    })
    expect(wrapper.find('[data-testid="death-saves-container"]').exists()).toBe(true)
  })

  it('shows condition badges when present', async () => {
    const conditionedCharacter = {
      ...mockCharacter,
      conditions: [{ name: 'Poisoned', slug: 'poisoned', level: null }]
    }
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: conditionedCharacter }
    })
    expect(wrapper.text()).toContain('Poisoned')
  })

  it('shows concentration indicator when active', async () => {
    const concentratingCharacter = {
      ...mockCharacter,
      combat: {
        ...mockCharacter.combat,
        concentration: { active: true, spell: 'Haste' }
      }
    }
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: concentratingCharacter }
    })
    expect(wrapper.text()).toContain('Haste')
  })

  it('has clickable concentration badge for DC calculation', async () => {
    const concentratingCharacter = {
      ...mockCharacter,
      combat: {
        ...mockCharacter.combat,
        concentration: { active: true, spell: 'Haste' }
      },
      saving_throws: { ...mockCharacter.saving_throws, CON: 3 }
    }
    const wrapper = await mountSuspended(CombatTableRow, {
      props: { character: concentratingCharacter }
    })
    // The concentration badge should exist and be clickable
    const badge = wrapper.find('[data-testid="concentration-badge"]')
    expect(badge.exists()).toBe(true)
    expect(badge.classes().join(' ')).toContain('cursor-pointer')
  })

  describe('speed display', () => {
    it('displays walk speed', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter }
      })
      expect(wrapper.text()).toContain('30 ft')
    })

    it('shows fly indicator when character can fly', async () => {
      const flyingCharacter = {
        ...mockCharacter,
        combat: {
          ...mockCharacter.combat,
          speeds: { walk: 30, fly: 60, swim: null, climb: null }
        }
      }
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: flyingCharacter }
      })
      expect(wrapper.find('[data-testid="speed-fly"]').exists()).toBe(true)
    })

    it('shows swim indicator when character can swim', async () => {
      const swimmingCharacter = {
        ...mockCharacter,
        combat: {
          ...mockCharacter.combat,
          speeds: { walk: 30, fly: null, swim: 40, climb: null }
        }
      }
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: swimmingCharacter }
      })
      expect(wrapper.find('[data-testid="speed-swim"]').exists()).toBe(true)
    })

    it('shows climb indicator when character can climb', async () => {
      const climbingCharacter = {
        ...mockCharacter,
        combat: {
          ...mockCharacter.combat,
          speeds: { walk: 30, fly: null, swim: null, climb: 30 }
        }
      }
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: climbingCharacter }
      })
      expect(wrapper.find('[data-testid="speed-climb"]').exists()).toBe(true)
    })
  })

  describe('status toggles (prone/flying)', () => {
    it('displays prone toggle button', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter }
      })
      expect(wrapper.find('[data-testid="status-prone"]').exists()).toBe(true)
    })

    it('displays flying toggle button', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter }
      })
      expect(wrapper.find('[data-testid="status-flying"]').exists()).toBe(true)
    })

    it('shows prone as inactive when not in statuses', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter, statuses: [] }
      })
      const proneButton = wrapper.find('[data-testid="status-prone"]')
      // Inactive state has lower opacity or neutral color
      expect(proneButton.classes().join(' ')).toMatch(/opacity-|neutral/)
    })

    it('shows prone as active when in statuses', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter, statuses: ['prone'] }
      })
      const proneButton = wrapper.find('[data-testid="status-prone"]')
      // Active state should NOT have reduced opacity
      expect(proneButton.classes().join(' ')).not.toContain('opacity-40')
    })

    it('shows flying as active when in statuses', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter, statuses: ['flying'] }
      })
      const flyingButton = wrapper.find('[data-testid="status-flying"]')
      expect(flyingButton.classes().join(' ')).not.toContain('opacity-40')
    })

    it('emits toggle:status with "prone" when prone button clicked', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter }
      })
      await wrapper.find('[data-testid="status-prone"]').trigger('click')
      expect(wrapper.emitted('toggle:status')).toBeTruthy()
      expect(wrapper.emitted('toggle:status')![0]).toEqual(['prone'])
    })

    it('emits toggle:status with "flying" when flying button clicked', async () => {
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: mockCharacter }
      })
      await wrapper.find('[data-testid="status-flying"]').trigger('click')
      expect(wrapper.emitted('toggle:status')).toBeTruthy()
      expect(wrapper.emitted('toggle:status')![0]).toEqual(['flying'])
    })

    it('shows fly speed when flying status is active', async () => {
      const flyingCharacter = {
        ...mockCharacter,
        combat: {
          ...mockCharacter.combat,
          speeds: { walk: 30, fly: 60, swim: null, climb: null }
        }
      }
      const wrapper = await mountSuspended(CombatTableRow, {
        props: { character: flyingCharacter, statuses: ['flying'] }
      })
      // Should show fly speed when actively flying
      expect(wrapper.text()).toMatch(/60\s*ft|fly.*60/)
    })
  })
})
