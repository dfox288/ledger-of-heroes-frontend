// tests/components/character/sheet/SpellbookCard.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import SpellbookCard from '~/components/character/sheet/SpellbookCard.vue'
import type { CharacterSpell } from '~/types/character'

const mockSpell: CharacterSpell = {
  id: 1,
  spell: {
    id: 101,
    name: 'Fireball',
    slug: 'phb:fireball',
    level: 3,
    school: 'Evocation',
    casting_time: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:fireball',
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 5,
  is_prepared: false,
  is_always_prepared: false
}

describe('SpellbookCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('display', () => {
    it('displays spell name', async () => {
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: mockSpell, column: 'spellbook' }
      })
      expect(wrapper.text()).toContain('Fireball')
    })

    it('displays spell school', async () => {
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: mockSpell, column: 'spellbook' }
      })
      expect(wrapper.text()).toContain('Evocation')
    })

    it('shows concentration badge when applicable', async () => {
      const concSpell = { ...mockSpell, spell: { ...mockSpell.spell!, concentration: true } }
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: concSpell, column: 'spellbook' }
      })
      expect(wrapper.text()).toContain('Conc')
    })

    it('shows ritual badge when applicable', async () => {
      const ritualSpell = { ...mockSpell, spell: { ...mockSpell.spell!, ritual: true } }
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: ritualSpell, column: 'spellbook' }
      })
      expect(wrapper.text()).toContain('Ritual')
    })

    it('shows arrow indicator pointing right in spellbook column', async () => {
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: mockSpell, column: 'spellbook' }
      })
      expect(wrapper.find('[data-testid="prepare-indicator"]').exists()).toBe(true)
    })

    it('shows arrow indicator pointing left in prepared column', async () => {
      const preparedSpell = { ...mockSpell, is_prepared: true }
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: preparedSpell, column: 'prepared' }
      })
      expect(wrapper.find('[data-testid="unprepare-indicator"]').exists()).toBe(true)
    })
  })

  describe('states', () => {
    it('is greyed out when at limit and unprepared', async () => {
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: mockSpell, column: 'spellbook', atPrepLimit: true }
      })
      const card = wrapper.find('[data-testid="spellbook-card"]')
      expect(card.classes().join(' ')).toMatch(/opacity-40/)
    })

    it('shows always-prepared badge for domain spells', async () => {
      const alwaysSpell = { ...mockSpell, is_always_prepared: true, is_prepared: true }
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: alwaysSpell, column: 'prepared' }
      })
      expect(wrapper.text()).toContain('Always')
    })
  })

  describe('interaction', () => {
    it('emits toggle event on click', async () => {
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: mockSpell, column: 'spellbook' }
      })
      await wrapper.find('[data-testid="spellbook-card"]').trigger('click')
      expect(wrapper.emitted('toggle')).toBeTruthy()
      expect(wrapper.emitted('toggle')![0]).toEqual([mockSpell])
    })

    it('does not emit toggle when at limit and unprepared', async () => {
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: mockSpell, column: 'spellbook', atPrepLimit: true }
      })
      await wrapper.find('[data-testid="spellbook-card"]').trigger('click')
      expect(wrapper.emitted('toggle')).toBeFalsy()
    })

    it('does not emit toggle for always-prepared spells', async () => {
      const alwaysSpell = { ...mockSpell, is_always_prepared: true, is_prepared: true }
      const wrapper = await mountSuspended(SpellbookCard, {
        props: { spell: alwaysSpell, column: 'prepared' }
      })
      await wrapper.find('[data-testid="spellbook-card"]').trigger('click')
      expect(wrapper.emitted('toggle')).toBeFalsy()
    })
  })
})
