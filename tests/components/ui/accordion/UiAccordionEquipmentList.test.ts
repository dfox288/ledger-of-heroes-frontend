import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionEquipmentList from '~/components/ui/accordion/UiAccordionEquipmentList.vue'
import type { components } from '~/types/api/generated'

type Equipment = components['schemas']['EntityItemResource']

describe('UiAccordionEquipmentList', () => {
  it('renders equipment list', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'a backpack',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    expect(wrapper.text()).toContain('a backpack')
  })

  it('groups items by choice_description', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a rapier',
      },
      {
        id: 2,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a shortsword',
      },
      {
        id: 3,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_description: 'Pack choice',
        proficiency_subcategory: null,
        description: "a dungeoneer's pack",
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should show both choice groups
    expect(text).toContain('a rapier')
    expect(text).toContain('a shortsword')
    expect(text).toContain("a dungeoneer's pack")
  })

  it('displays choices with letters (a, b, c)', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a rapier',
      },
      {
        id: 2,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a shortsword',
      },
      {
        id: 3,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a longbow',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should show (a), (b), (c) prefixes
    expect(text).toMatch(/\(a\).*rapier/)
    expect(text).toMatch(/\(b\).*shortsword/)
    expect(text).toMatch(/\(c\).*longbow/)
  })

  it('separates hit points section', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'level Rogue, you begin play with 8 + your Constitution modifier hit points.',
      },
      {
        id: 2,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'a backpack',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should show hit points in separate section
    expect(text).toContain('Hit Points')
    expect(text).toContain('8 + your Constitution modifier hit points')
    expect(text).toContain('a backpack')
  })

  it('separates proficiencies section', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'level Rogue, you begin play with 8 + your Constitution modifier hit points.',
      },
      {
        id: 2,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: '-- Armor: light armor\n\t--- Weapons: simple weapons, hand crossbows',
      },
      {
        id: 3,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'a backpack',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should show proficiencies in separate section
    expect(text).toContain('Proficiencies')
    expect(text).toContain('Armor: light armor')
    expect(text).toContain('Weapons: simple weapons')
    expect(text).toContain('a backpack')
  })

  it('handles items with quantities > 1', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: 1860,
        quantity: 20,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: null,
        item: {
          id: 1860,
          name: 'Arrow',
          slug: 'arrow',
          description: 'Ammunition for a bow',
          item_type: { id: 1, name: 'Ammunition' },
          sources: [],
        } as any,
      },
      {
        id: 2,
        item_id: null,
        quantity: 3,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'torches',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should show quantities
    expect(text).toMatch(/20.*Arrow/)
    expect(text).toMatch(/3.*torches/)
  })

  it('preserves whitespace and formatting in descriptions', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: '-- Armor: light armor\n\t--- Weapons: simple weapons\n\t--- Tools: thieves\' tools',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    // Find the element that contains the description
    const descElement = wrapper.find('[class*="whitespace-pre-wrap"]')
    expect(descElement.exists()).toBe(true)

    // The description should contain line breaks
    const html = wrapper.html()
    expect(html).toContain('-- Armor: light armor')
    expect(html).toContain('--- Weapons: simple weapons')
  })

  it('handles background equipment (simpler format)', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: 1848,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: null,
        item: {
          id: 1848,
          name: 'Fine Clothes',
          slug: 'fine-clothes',
          description: 'Expensive clothing',
          item_type: { id: 2, name: 'Adventuring Gear' },
          sources: [],
        } as any,
      },
      {
        id: 2,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'identification papers',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment, type: 'background' },
    })

    const text = wrapper.text()
    // Should show item names and descriptions
    expect(text).toContain('Fine Clothes')
    expect(text).toContain('identification papers')
    // Should NOT show hit points or proficiencies headers for backgrounds
    expect(text).not.toContain('Hit Points')
    expect(text).not.toContain('Proficiencies')
  })

  it('handles empty equipment array', async () => {
    const equipment: Equipment[] = []

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should show empty state message
    expect(text).toContain('No equipment')
  })
})
