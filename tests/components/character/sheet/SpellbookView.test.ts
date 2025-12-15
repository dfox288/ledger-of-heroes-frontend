// tests/components/character/sheet/SpellbookView.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellbookView from '~/components/character/sheet/SpellbookView.vue'
import { useCharacterPlayStateStore } from '~/stores/characterPlayState'
import type { CharacterSpell } from '~/types/character'

const createSpell = (name: string, level: number, isPrepared: boolean): CharacterSpell => ({
  id: Math.floor(Math.random() * 1000),
  spell: {
    id: Math.floor(Math.random() * 1000),
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

const mockSpells: CharacterSpell[] = [
  createSpell('Fireball', 3, true),
  createSpell('Shield', 1, true),
  createSpell('Sleep', 1, false),
  createSpell('Magic Missile', 1, false)
]

describe('SpellbookView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders two-column layout', async () => {
    const wrapper = await mountSuspended(SpellbookView, {
      props: { spells: mockSpells, preparedCount: 2, preparationLimit: 8, characterId: 1 },
      global: { plugins: [pinia] }
    })
    expect(wrapper.find('[data-testid="spellbook-column"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="prepared-column"]').exists()).toBe(true)
  })

  it('shows spellbook column with unprepared spells', async () => {
    const wrapper = await mountSuspended(SpellbookView, {
      props: { spells: mockSpells, preparedCount: 2, preparationLimit: 8, characterId: 1 },
      global: { plugins: [pinia] }
    })
    const spellbookCol = wrapper.find('[data-testid="spellbook-column"]')
    expect(spellbookCol.text()).toContain('Sleep')
    expect(spellbookCol.text()).toContain('Magic Missile')
  })

  it('shows prepared column with prepared spells', async () => {
    const wrapper = await mountSuspended(SpellbookView, {
      props: { spells: mockSpells, preparedCount: 2, preparationLimit: 8, characterId: 1 },
      global: { plugins: [pinia] }
    })
    const preparedCol = wrapper.find('[data-testid="prepared-column"]')
    expect(preparedCol.text()).toContain('Fireball')
    expect(preparedCol.text()).toContain('Shield')
  })

  it('calls toggleSpellPreparation when spell is toggled', async () => {
    const store = useCharacterPlayStateStore()
    store.initialize({
      characterId: 1,
      isDead: false,
      hitPoints: { current: 10, max: 10, temporary: 0 },
      deathSaves: { successes: 0, failures: 0 },
      currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    })
    store.initializeSpellPreparation({
      spells: mockSpells.map(s => ({ id: s.id, is_prepared: s.is_prepared, is_always_prepared: false })),
      preparationLimit: 8
    })

    const toggleSpy = vi.spyOn(store, 'toggleSpellPreparation').mockResolvedValue()

    const wrapper = await mountSuspended(SpellbookView, {
      props: { spells: mockSpells, preparedCount: 2, preparationLimit: 8, characterId: 1 },
      global: { plugins: [pinia] }
    })

    // Click an unprepared spell in spellbook column
    const cards = wrapper.findAll('[data-testid="spellbook-card"]')
    await cards[0].trigger('click')

    expect(toggleSpy).toHaveBeenCalled()
  })
})
