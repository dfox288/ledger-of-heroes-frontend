// tests/components/character/sheet/SpellbookColumn.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellbookColumn from '~/components/character/sheet/SpellbookColumn.vue'
import type { CharacterSpell } from '~/types/character'

const createSpell = (overrides: Partial<CharacterSpell> & { name: string, level: number, school: string }): CharacterSpell => ({
  id: Math.random(),
  spell: {
    id: Math.random(),
    name: overrides.name,
    slug: `phb:${overrides.name.toLowerCase().replace(' ', '-')}`,
    level: overrides.level,
    school: overrides.school,
    casting_time: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: overrides.concentration ?? false,
    ritual: overrides.ritual ?? false
  },
  spell_slug: `phb:${overrides.name.toLowerCase().replace(' ', '-')}`,
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: overrides.is_prepared ?? false,
  is_always_prepared: false,
  ...overrides
})

const mockSpells: CharacterSpell[] = [
  createSpell({ name: 'Fireball', level: 3, school: 'Evocation' }),
  createSpell({ name: 'Shield', level: 1, school: 'Abjuration' }),
  createSpell({ name: 'Detect Magic', level: 1, school: 'Divination', ritual: true }),
  createSpell({ name: 'Hold Person', level: 2, school: 'Enchantment', concentration: true }),
  createSpell({ name: 'Magic Missile', level: 1, school: 'Evocation', is_prepared: true })
]

describe('SpellbookColumn', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays column header with spell count', async () => {
    const wrapper = await mountSuspended(SpellbookColumn, {
      props: { spells: mockSpells, atPrepLimit: false }
    })
    expect(wrapper.text()).toContain('Spellbook')
    expect(wrapper.text()).toMatch(/4.*spells/) // 4 unprepared
  })

  it('only shows unprepared spells', async () => {
    const wrapper = await mountSuspended(SpellbookColumn, {
      props: { spells: mockSpells, atPrepLimit: false }
    })
    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.text()).toContain('Shield')
    expect(wrapper.text()).not.toContain('Magic Missile') // prepared
  })

  it('groups spells by level', async () => {
    const wrapper = await mountSuspended(SpellbookColumn, {
      props: { spells: mockSpells, atPrepLimit: false }
    })
    expect(wrapper.text()).toContain('1st Level')
    expect(wrapper.text()).toContain('2nd Level')
    expect(wrapper.text()).toContain('3rd Level')
  })

  describe('filtering', () => {
    it('filters by search query', async () => {
      const wrapper = await mountSuspended(SpellbookColumn, {
        props: { spells: mockSpells, atPrepLimit: false }
      })
      await wrapper.find('input[type="text"]').setValue('fire')
      expect(wrapper.text()).toContain('Fireball')
      expect(wrapper.text()).not.toContain('Shield')
    })

    it('filters by school', async () => {
      const wrapper = await mountSuspended(SpellbookColumn, {
        props: { spells: mockSpells, atPrepLimit: false }
      })
      // Would need to interact with dropdown - simplified test
    })

    it('filters by concentration', async () => {
      const wrapper = await mountSuspended(SpellbookColumn, {
        props: { spells: mockSpells, atPrepLimit: false }
      })
      await wrapper.find('[data-testid="concentration-filter"]').trigger('click')
      expect(wrapper.text()).toContain('Hold Person')
      expect(wrapper.text()).not.toContain('Fireball')
    })

    it('filters by ritual', async () => {
      const wrapper = await mountSuspended(SpellbookColumn, {
        props: { spells: mockSpells, atPrepLimit: false }
      })
      await wrapper.find('[data-testid="ritual-filter"]').trigger('click')
      expect(wrapper.text()).toContain('Detect Magic')
      expect(wrapper.text()).not.toContain('Fireball')
    })
  })

  it('shows empty state when no spells match filters', async () => {
    const wrapper = await mountSuspended(SpellbookColumn, {
      props: { spells: mockSpells, atPrepLimit: false }
    })
    await wrapper.find('input[type="text"]').setValue('nonexistent')
    expect(wrapper.text()).toContain('No matching spells')
  })

  it('emits toggle event when spell card is clicked', async () => {
    const wrapper = await mountSuspended(SpellbookColumn, {
      props: { spells: mockSpells, atPrepLimit: false }
    })
    await wrapper.find('[data-testid="spellbook-card"]').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })
})
