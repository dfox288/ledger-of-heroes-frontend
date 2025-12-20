// tests/components/character/sheet/SpellsPanel.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellsPanel from '~/components/character/sheet/SpellsPanel.vue'
import type { CharacterSpell, CharacterStats } from '~/types/character'

const createSpell = (name: string, level: number, isPrepared: boolean): CharacterSpell => ({
  id: Math.random(),
  spell: {
    id: Math.random(),
    name,
    slug: `phb:${name.toLowerCase().replace(' ', '-')}`,
    level,
    school: 'Evocation',
    casting_time: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: `phb:${name.toLowerCase().replace(' ', '-')}`,
  is_dangling: false,
  preparation_status: isPrepared ? 'prepared' : 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: isPrepared,
  is_always_prepared: false
})

const mockStats: CharacterStats = {
  ability_scores: {
    STR: { score: 10, modifier: 0 },
    DEX: { score: 10, modifier: 0 },
    CON: { score: 10, modifier: 0 },
    INT: { score: 16, modifier: 3 },
    WIS: { score: 10, modifier: 0 },
    CHA: { score: 10, modifier: 0 }
  },
  combat: {
    armor_class: 10,
    initiative: 0,
    speed: 30,
    hit_points: { current: 10, max: 10, temporary: 0 }
  },
  spellcasting: {
    'phb:wizard': {
      ability: 'INT',
      ability_modifier: 3,
      spell_save_dc: 13,
      spell_attack_bonus: 5
    }
  },
  spell_slots: { 1: 2 },
  hit_points: { current: 10, max: 10, temporary: 0 },
  preparation_limit: 5,
  prepared_spell_count: 0
}

describe('SpellsPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays spells when available', async () => {
    const spells = [createSpell('Magic Missile', 1, true)]
    const wrapper = await mountSuspended(SpellsPanel, {
      props: { spells, stats: mockStats, characterId: 1, editable: false }
    })
    expect(wrapper.text()).toContain('Magic Missile')
  })

  describe('empty state (#793)', () => {
    it('shows empty state when no spells', async () => {
      const wrapper = await mountSuspended(SpellsPanel, {
        props: { spells: [], stats: mockStats, characterId: 1, editable: false }
      })
      expect(wrapper.text()).toContain('No spells known')
    })

    it('has testid on empty state container (#795)', async () => {
      const wrapper = await mountSuspended(SpellsPanel, {
        props: { spells: [], stats: mockStats, characterId: 1, editable: false }
      })
      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    })

    it('uses sparkles icon for no spells state (#793)', async () => {
      const wrapper = await mountSuspended(SpellsPanel, {
        props: { spells: [], stats: mockStats, characterId: 1, editable: false }
      })
      // Check that sparkles icon is present
      expect(wrapper.html()).toContain('i-heroicons-sparkles')
    })
  })
})
