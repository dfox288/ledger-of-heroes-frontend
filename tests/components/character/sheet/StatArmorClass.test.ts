// tests/components/character/sheet/StatArmorClass.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatArmorClass from '~/components/character/sheet/StatArmorClass.vue'

// Test fixtures
const mockArmoredCharacter = {
  classes: [{ class: { slug: 'phb:fighter' } }],
  equipped: {
    armor: { name: 'Chain Mail', armor_class: '16' },
    shield: null
  },
  modifiers: { STR: 2, DEX: 1, CON: 2, INT: 0, WIS: 1, CHA: 0 }
}

const mockBarbarianCharacter = {
  classes: [{ class: { slug: 'phb:barbarian' } }],
  equipped: { armor: null, shield: null },
  modifiers: { STR: 2, DEX: 2, CON: 3, INT: 0, WIS: 1, CHA: -1 }
}

const mockMonkCharacter = {
  classes: [{ class: { slug: 'phb:monk' } }],
  equipped: { armor: null, shield: null },
  modifiers: { STR: 0, DEX: 3, CON: 1, INT: 0, WIS: 2, CHA: 0 }
}

const mockWizardCharacter = {
  classes: [{ class: { slug: 'phb:wizard' } }],
  equipped: { armor: null, shield: null },
  modifiers: { STR: -1, DEX: 2, CON: 1, INT: 3, WIS: 1, CHA: 0 }
}

const mockShieldOnlyCharacter = {
  classes: [{ class: { slug: 'phb:wizard' } }],
  equipped: {
    armor: null,
    shield: { name: 'Shield', armor_class: '2' }
  },
  modifiers: { STR: -1, DEX: 2, CON: 1, INT: 3, WIS: 1, CHA: 0 }
}

describe('StatArmorClass', () => {
  describe('display', () => {
    it('displays "AC" label', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 16, character: mockArmoredCharacter }
      })
      expect(wrapper.text()).toContain('AC')
    })

    it('displays armor class value', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 18, character: mockArmoredCharacter }
      })
      expect(wrapper.text()).toContain('18')
    })

    it('displays placeholder when armor class is null', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: null, character: mockArmoredCharacter }
      })
      expect(wrapper.text()).toContain('—')
    })

    it('has data-testid="ac-cell"', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 16, character: mockArmoredCharacter }
      })
      expect(wrapper.find('[data-testid="ac-cell"]').exists()).toBe(true)
    })

    it('has cursor-help class for tooltip indication', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 16, character: mockArmoredCharacter }
      })
      expect(wrapper.find('.cursor-help').exists()).toBe(true)
    })
  })

  describe('tooltip text', () => {
    it('shows armor name when character has armor equipped', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 16, character: mockArmoredCharacter }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Chain Mail')
    })

    it('shows Unarmored Defense for Barbarian (DEX + CON)', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 15, character: mockBarbarianCharacter }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Unarmored Defense')
      expect(vm.tooltipText).toContain('DEX')
      expect(vm.tooltipText).toContain('CON')
    })

    it('shows Unarmored Defense for Monk (DEX + WIS)', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 15, character: mockMonkCharacter }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Unarmored Defense')
      expect(vm.tooltipText).toContain('DEX')
      expect(vm.tooltipText).toContain('WIS')
    })

    it('shows basic unarmored AC for other classes', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 12, character: mockWizardCharacter }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Unarmored')
      expect(vm.tooltipText).toContain('DEX')
    })

    it('shows shield in tooltip when equipped', async () => {
      const armoredWithShield = {
        ...mockArmoredCharacter,
        equipped: {
          armor: { name: 'Chain Mail', armor_class: '16' },
          shield: { name: 'Shield', armor_class: '2' }
        }
      }
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 18, character: armoredWithShield }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Chain Mail')
      expect(vm.tooltipText).toContain('Shield')
    })

    it('shows shield with unarmored for shield-only characters', async () => {
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 14, character: mockShieldOnlyCharacter }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Unarmored')
      expect(vm.tooltipText).toContain('Shield')
    })
  })

  describe('edge cases', () => {
    it('handles missing classes array', async () => {
      const noClasses = { ...mockWizardCharacter, classes: null }
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 10, character: noClasses }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Unarmored')
    })

    it('handles missing equipped object', async () => {
      const noEquipped = { ...mockWizardCharacter, equipped: null }
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 12, character: noEquipped }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Unarmored')
    })

    it('handles missing modifiers', async () => {
      const noModifiers = { ...mockWizardCharacter, modifiers: null }
      const wrapper = await mountSuspended(StatArmorClass, {
        props: { armorClass: 10, character: noModifiers }
      })
      const vm = wrapper.vm as any
      expect(vm.tooltipText).toContain('Unarmored')
    })
  })
})
