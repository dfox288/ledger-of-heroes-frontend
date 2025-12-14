// tests/components/character/sheet/SpellCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellCard from '~/components/character/sheet/SpellCard.vue'
import type { CharacterSpell } from '~/types/character'

// Mock spell data
const mockCantrip: CharacterSpell = {
  id: 1,
  spell: {
    id: 101,
    name: 'Fire Bolt',
    slug: 'phb:fire-bolt',
    level: 0,
    school: 'Evocation',
    casting_time: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:fire-bolt',
  is_dangling: false,
  preparation_status: 'known',
  source: 'class',
  level_acquired: 1,
  is_prepared: false,
  is_always_prepared: false
}

const mockLeveledSpell: CharacterSpell = {
  id: 2,
  spell: {
    id: 102,
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
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 5,
  is_prepared: true,
  is_always_prepared: false
}

const mockConcentrationSpell: CharacterSpell = {
  id: 3,
  spell: {
    id: 103,
    name: 'Hold Person',
    slug: 'phb:hold-person',
    level: 2,
    school: 'Enchantment',
    casting_time: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    ritual: false
  },
  spell_slug: 'phb:hold-person',
  is_dangling: false,
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 3,
  is_prepared: true,
  is_always_prepared: false
}

const mockRitualSpell: CharacterSpell = {
  id: 4,
  spell: {
    id: 104,
    name: 'Detect Magic',
    slug: 'phb:detect-magic',
    level: 1,
    school: 'Divination',
    casting_time: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    ritual: true
  },
  spell_slug: 'phb:detect-magic',
  is_dangling: false,
  preparation_status: 'prepared',
  source: 'class',
  level_acquired: 1,
  is_prepared: true,
  is_always_prepared: false
}

const mockAlwaysPreparedSpell: CharacterSpell = {
  id: 5,
  spell: {
    id: 105,
    name: 'Cure Wounds',
    slug: 'phb:cure-wounds',
    level: 1,
    school: 'Evocation',
    casting_time: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false
  },
  spell_slug: 'phb:cure-wounds',
  is_dangling: false,
  preparation_status: 'always_prepared',
  source: 'class',
  level_acquired: 1,
  is_prepared: true,
  is_always_prepared: true
}

describe('SpellCard', () => {
  describe('collapsed state', () => {
    it('displays spell name', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).toContain('Fireball')
    })

    it('displays spell level for leveled spells', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).toContain('3rd')
    })

    it('displays "Cantrip" for level 0 spells', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockCantrip }
      })
      expect(wrapper.text()).toContain('Cantrip')
    })

    it('shows Concentration badge when applicable', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockConcentrationSpell }
      })
      expect(wrapper.text()).toContain('Concentration')
    })

    it('shows Ritual badge when applicable', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockRitualSpell }
      })
      expect(wrapper.text()).toContain('Ritual')
    })

    it('shows prepared indicator for prepared spells', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      const preparedIcon = wrapper.find('[data-testid="prepared-icon"]')
      expect(preparedIcon.exists()).toBe(true)
    })

    it('shows always-prepared indicator', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockAlwaysPreparedSpell }
      })
      expect(wrapper.text()).toContain('Always')
    })

    it('dims unprepared spells', async () => {
      const unpreparedSpell = { ...mockLeveledSpell, is_prepared: false, preparation_status: 'known' }
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: unpreparedSpell }
      })
      const card = wrapper.find('[data-testid="spell-card"]')
      expect(card.classes().join(' ')).toMatch(/opacity/)
    })
  })

  describe('expanded state', () => {
    it('starts collapsed by default', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).not.toContain('Casting Time')
    })

    it('expands when clicked', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Casting Time')
      expect(wrapper.text()).toContain('1 action')
    })

    it('shows range when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Range')
      expect(wrapper.text()).toContain('150 feet')
    })

    it('shows components when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Components')
      expect(wrapper.text()).toContain('V, S, M')
    })

    it('shows duration when expanded', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      await wrapper.find('[data-testid="spell-card"]').trigger('click')

      expect(wrapper.text()).toContain('Duration')
      expect(wrapper.text()).toContain('Instantaneous')
    })

    it('collapses when clicked again', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })

      const card = wrapper.find('[data-testid="spell-card"]')
      await card.trigger('click') // Expand
      await card.trigger('click') // Collapse

      expect(wrapper.text()).not.toContain('Casting Time')
    })
  })

  describe('school display', () => {
    it('shows spell school', async () => {
      const wrapper = await mountSuspended(SpellCard, {
        props: { spell: mockLeveledSpell }
      })
      expect(wrapper.text()).toContain('Evocation')
    })
  })
})
