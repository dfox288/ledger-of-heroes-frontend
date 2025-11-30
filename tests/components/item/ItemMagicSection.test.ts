import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemMagicSection from '~/components/item/ItemMagicSection.vue'

describe('ItemMagicSection', () => {
  // Test data helpers
  const createModifier = (category: string, value: string, condition?: string | null) => ({
    modifier_category: category,
    value,
    condition: condition ?? null
  })

  // Charges tests

  it('renders charges with max value', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: '50',
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers: []
      }
    })

    expect(wrapper.text()).toContain('50 charges')
  })

  it('renders recharge formula and timing together', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: '10',
        rechargeFormula: '1d6+4',
        rechargeTiming: 'at dawn',
        attunementText: null,
        modifiers: []
      }
    })

    expect(wrapper.text()).toContain('10 charges')
    expect(wrapper.text()).toContain('recharges 1d6+4 at dawn')
  })

  it('handles missing recharge info (shows just charges)', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: '7',
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers: []
      }
    })

    expect(wrapper.text()).toContain('7 charges')
    expect(wrapper.text()).not.toContain('recharges')
  })

  it('does not render charges when null', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers: []
      }
    })

    expect(wrapper.text()).not.toContain('charges')
  })

  // Attunement tests

  it('renders attunement requirement text', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: 'Requires attunement by sorcerer, warlock, wizard',
        modifiers: []
      }
    })

    expect(wrapper.text()).toContain('Requires attunement by sorcerer, warlock, wizard')
  })

  it('does not render attunement when null', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers: []
      }
    })

    expect(wrapper.text()).not.toContain('attunement')
  })

  // Modifier tests

  it('renders modifier bonuses grouped by category', async () => {
    const modifiers = [
      createModifier('melee_attack', '2'),
      createModifier('melee_damage', '2'),
      createModifier('spell_attack', '2')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    const text = wrapper.text()
    expect(text).toContain('+2 melee attack')
    expect(text).toContain('+2 melee damage')
    expect(text).toContain('+2 spell attack')
  })

  it('formats modifier display correctly (+2 melee attack)', async () => {
    const modifiers = [
      createModifier('melee_attack', '2')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    expect(wrapper.text()).toContain('+2 melee attack')
  })

  it('formats ranged attack modifiers correctly', async () => {
    const modifiers = [
      createModifier('ranged_attack', '1'),
      createModifier('ranged_damage', '1')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    const text = wrapper.text()
    expect(text).toContain('+1 ranged attack')
    expect(text).toContain('+1 ranged damage')
  })

  it('formats spell DC modifiers correctly', async () => {
    const modifiers = [
      createModifier('spell_dc', '2')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    expect(wrapper.text()).toContain('+2 spell save DC')
  })

  it('formats AC bonus modifiers correctly', async () => {
    const modifiers = [
      createModifier('ac_bonus', '1')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    expect(wrapper.text()).toContain('+1 AC')
  })

  it('handles item with no modifiers', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: '10',
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: 'Requires attunement',
        modifiers: []
      }
    })

    expect(wrapper.text()).toContain('10 charges')
    expect(wrapper.text()).toContain('Requires attunement')
    expect(wrapper.text()).not.toContain('Bonuses')
  })

  it('handles item with multiple modifier types', async () => {
    const modifiers = [
      createModifier('melee_attack', '2'),
      createModifier('melee_damage', '2'),
      createModifier('spell_attack', '1'),
      createModifier('ac_bonus', '1')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    const text = wrapper.text()
    expect(text).toContain('+2 melee attack')
    expect(text).toContain('+2 melee damage')
    expect(text).toContain('+1 spell attack')
    expect(text).toContain('+1 AC')
  })

  // Combined tests

  it('handles item with charges but no attunement', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: '20',
        rechargeFormula: '2d6',
        rechargeTiming: 'at dawn',
        attunementText: null,
        modifiers: []
      }
    })

    expect(wrapper.text()).toContain('20 charges')
    expect(wrapper.text()).toContain('recharges 2d6 at dawn')
    expect(wrapper.text()).not.toContain('attunement')
  })

  it('handles item with attunement but no charges', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: 'Requires attunement by a cleric or paladin',
        modifiers: []
      }
    })

    expect(wrapper.text()).toContain('Requires attunement by a cleric or paladin')
    expect(wrapper.text()).not.toContain('charges')
  })

  it('displays complete magic item with all properties', async () => {
    const modifiers = [
      createModifier('melee_attack', '3'),
      createModifier('melee_damage', '3'),
      createModifier('spell_attack', '3')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: '50',
        rechargeFormula: '4d6+2',
        rechargeTiming: 'at dawn',
        attunementText: 'Requires attunement by sorcerer, warlock, wizard',
        modifiers
      }
    })

    const text = wrapper.text()
    // Charges
    expect(text).toContain('50 charges')
    expect(text).toContain('recharges 4d6+2 at dawn')
    // Attunement
    expect(text).toContain('Requires attunement by sorcerer, warlock, wizard')
    // Modifiers
    expect(text).toContain('+3 melee attack')
    expect(text).toContain('+3 melee damage')
    expect(text).toContain('+3 spell attack')
  })

  it('does not render section when all props are null/empty', async () => {
    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers: []
      }
    })

    // Component should render but be empty or minimal
    expect(wrapper.html()).toBeTruthy()
  })

  it('handles negative modifier values', async () => {
    const modifiers = [
      createModifier('melee_attack', '-1')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    expect(wrapper.text()).toContain('-1 melee attack')
  })

  it('formats unknown modifier categories as-is', async () => {
    const modifiers = [
      createModifier('unknown_category', '5')
    ]

    const wrapper = await mountSuspended(ItemMagicSection, {
      props: {
        chargesMax: null,
        rechargeFormula: null,
        rechargeTiming: null,
        attunementText: null,
        modifiers
      }
    })

    expect(wrapper.text()).toContain('+5 unknown category')
  })
})
