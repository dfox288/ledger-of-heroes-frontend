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

  it('groups by choice_group when present (Rogue structure)', async () => {
    const equipment: Equipment[] = [
      {
        id: 11,
        item_id: 729,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 1,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a rapier',
      },
      {
        id: 12,
        item_id: 732,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 2,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a shortsword',
      },
      {
        id: 13,
        item_id: 731,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_2',
        choice_option: 1,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a shortbow and quiver of arrows (20)',
      },
      {
        id: 14,
        item_id: 732,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_2',
        choice_option: 2,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a shortsword',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should create separate groups despite same choice_description
    // Group 1: rapier or shortsword
    expect(text).toMatch(/\(a\).*rapier/)
    expect(text).toMatch(/\(b\).*shortsword/)
    // Group 2: shortbow or shortsword
    expect(text).toMatch(/\(a\).*shortbow/)
    expect(text).toMatch(/\(b\).*shortsword/)
  })

  it('sorts items by choice_option within groups', async () => {
    const equipment: Equipment[] = [
      // Intentionally out of order to test sorting
      {
        id: 17,
        item_id: 1846,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_3',
        choice_option: 3,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: "an explorer's pack",
      },
      {
        id: 15,
        item_id: 1797,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_3',
        choice_option: 1,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: "a burglar's pack",
      },
      {
        id: 16,
        item_id: 1840,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_3',
        choice_option: 2,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: "a dungeoneer's pack",
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should appear in option order: 1→a, 2→b, 3→c
    expect(text).toMatch(/\(a\).*burglar/)
    expect(text).toMatch(/\(b\).*dungeoneer/)
    expect(text).toMatch(/\(c\).*explorer/)
  })

  it('uses choice_option for letters instead of array index', async () => {
    const equipment: Equipment[] = [
      // Option 2 comes first in array
      {
        id: 12,
        item_id: 732,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 2,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a shortsword',
      },
      // Option 1 comes second in array
      {
        id: 11,
        item_id: 729,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 1,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a rapier',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should use choice_option (not array index) for letters
    // After sorting, rapier (option 1) should be (a), shortsword (option 2) should be (b)
    expect(text).toMatch(/\(a\).*rapier/)
    expect(text).toMatch(/\(b\).*shortsword/)
  })

  it('falls back to choice_description when choice_group is null', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_group: null,
        choice_option: null,
        choice_description: 'Weapon choice',
        proficiency_subcategory: null,
        description: 'a longsword',
      },
      {
        id: 2,
        item_id: null,
        quantity: 1,
        is_choice: true,
        choice_group: null,
        choice_option: null,
        choice_description: 'Weapon choice',
        proficiency_subcategory: null,
        description: 'a greatsword',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should still group by choice_description when choice_group is null
    expect(text).toContain('Weapon choice')
    expect(text).toMatch(/\(a\).*longsword/)
    expect(text).toMatch(/\(b\).*greatsword/)
  })

  it('links items with item_id and slug to their detail pages', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: 729,
        quantity: 1,
        is_choice: false,
        choice_group: null,
        choice_option: null,
        choice_description: null,
        proficiency_subcategory: null,
        description: null,
        item: {
          id: 729,
          name: 'Rapier',
          slug: 'rapier',
          description: 'A finesse weapon',
          item_type: { id: 1, name: 'Weapon' },
          sources: [],
        } as any,
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const link = wrapper.find('a[href="/items/rapier"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Rapier')
  })

  it('does not link items without item_id or slug', async () => {
    const equipment: Equipment[] = [
      {
        id: 1,
        item_id: null,
        quantity: 1,
        is_choice: false,
        choice_group: null,
        choice_option: null,
        choice_description: null,
        proficiency_subcategory: null,
        description: 'a backpack',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const links = wrapper.findAll('a')
    expect(links.length).toBe(0)
    expect(wrapper.text()).toContain('a backpack')
  })

  it('links items in choice groups', async () => {
    const equipment: Equipment[] = [
      {
        id: 11,
        item_id: 729,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 1,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: null,
        item: {
          id: 729,
          name: 'Rapier',
          slug: 'rapier',
          description: 'A finesse weapon',
          item_type: { id: 1, name: 'Weapon' },
          sources: [],
        } as any,
      },
      {
        id: 12,
        item_id: 732,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 2,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: null,
        item: {
          id: 732,
          name: 'Shortsword',
          slug: 'shortsword',
          description: 'A versatile weapon',
          item_type: { id: 1, name: 'Weapon' },
          sources: [],
        } as any,
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const rapierLink = wrapper.find('a[href="/items/rapier"]')
    const shortswordLink = wrapper.find('a[href="/items/shortsword"]')

    expect(rapierLink.exists()).toBe(true)
    expect(rapierLink.text()).toBe('Rapier')
    expect(shortswordLink.exists()).toBe(true)
    expect(shortswordLink.text()).toBe('Shortsword')
  })

  it('uses choice_description for headline even with choice_group', async () => {
    const equipment: Equipment[] = [
      {
        id: 11,
        item_id: 729,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 1,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a rapier',
      },
      {
        id: 12,
        item_id: 732,
        quantity: 1,
        is_choice: true,
        choice_group: 'choice_1',
        choice_option: 2,
        choice_description: 'Starting equipment choice',
        proficiency_subcategory: null,
        description: 'a shortsword',
      },
    ]

    const wrapper = await mountSuspended(UiAccordionEquipmentList, {
      props: { equipment },
    })

    const text = wrapper.text()
    // Should display choice_description as headline, not choice_group
    expect(text).toContain('Starting equipment choice')
    expect(text).not.toContain('choice_1')
  })
})
