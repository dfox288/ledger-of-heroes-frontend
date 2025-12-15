// tests/components/character/sheet/PreparedColumn.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import PreparedColumn from '~/components/character/sheet/PreparedColumn.vue'
import type { CharacterSpell } from '~/types/character'

const createSpell = (name: string, level: number, isPrepared: boolean, isAlways = false): CharacterSpell => ({
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
  is_always_prepared: isAlways
})

const mockSpells: CharacterSpell[] = [
  createSpell('Fireball', 3, true),
  createSpell('Shield', 1, true),
  createSpell('Mage Armor', 1, true),
  createSpell('Misty Step', 2, true),
  createSpell('Bless', 1, true, true), // always prepared
  createSpell('Sleep', 1, false) // not prepared
]

describe('PreparedColumn', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays column header with prepared count', async () => {
    const wrapper = await mountSuspended(PreparedColumn, {
      props: { spells: mockSpells, preparedCount: 5, preparationLimit: 8 }
    })
    expect(wrapper.text()).toContain('Prepared Today')
    expect(wrapper.text()).toMatch(/5.*\/.*8/)
  })

  it('only shows prepared spells', async () => {
    const wrapper = await mountSuspended(PreparedColumn, {
      props: { spells: mockSpells, preparedCount: 5, preparationLimit: 8 }
    })
    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.text()).toContain('Shield')
    expect(wrapper.text()).not.toContain('Sleep') // not prepared
  })

  it('includes always-prepared spells', async () => {
    const wrapper = await mountSuspended(PreparedColumn, {
      props: { spells: mockSpells, preparedCount: 5, preparationLimit: 8 }
    })
    expect(wrapper.text()).toContain('Bless')
  })

  it('groups spells by level', async () => {
    const wrapper = await mountSuspended(PreparedColumn, {
      props: { spells: mockSpells, preparedCount: 5, preparationLimit: 8 }
    })
    expect(wrapper.text()).toContain('1st Level')
    expect(wrapper.text()).toContain('2nd Level')
    expect(wrapper.text()).toContain('3rd Level')
  })

  it('shows warning color when at limit', async () => {
    const wrapper = await mountSuspended(PreparedColumn, {
      props: { spells: mockSpells, preparedCount: 8, preparationLimit: 8 }
    })
    expect(wrapper.find('[data-testid="prep-counter"]').classes().join(' ')).toMatch(/warning|amber/)
  })

  it('emits toggle event when spell card is clicked', async () => {
    // Use only non-always-prepared spells for this test
    const nonAlwaysSpells = [createSpell('Fireball', 3, true)]
    const wrapper = await mountSuspended(PreparedColumn, {
      props: { spells: nonAlwaysSpells, preparedCount: 1, preparationLimit: 8 }
    })
    await wrapper.find('[data-testid="spellbook-card"]').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('does not emit toggle for always-prepared spells', async () => {
    const wrapper = await mountSuspended(PreparedColumn, {
      props: { spells: [createSpell('Bless', 1, true, true)], preparedCount: 1, preparationLimit: 8 }
    })
    await wrapper.find('[data-testid="spellbook-card"]').trigger('click')
    expect(wrapper.emitted('toggle')).toBeFalsy()
  })
})
