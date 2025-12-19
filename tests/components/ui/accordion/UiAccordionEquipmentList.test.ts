import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionEquipmentList from '~/components/ui/accordion/UiAccordionEquipmentList.vue'
import type { components } from '~/types/api/generated'
import {
  mockEquipmentItem,
  mockEquipmentChoice,
  mockEquipmentWithItem,
  mockEquipmentMultiple,
  mockHitPoints,
  mockProficiencies,
  mockMultipleChoiceGroups
} from '#tests/fixtures/equipment'

type Equipment = components['schemas']['EntityItemResource']

describe('UiAccordionEquipmentList', () => {
  describe('basic rendering', () => {
    it('renders equipment list', async () => {
      const equipment: Equipment[] = [mockEquipmentItem]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      expect(wrapper.text()).toContain('a backpack')
    })

    it('handles empty equipment array', async () => {
      const equipment: Equipment[] = []

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      const text = wrapper.text()
      expect(text).toContain('No equipment')
    })

    it('handles items with quantities > 1', async () => {
      const equipment: Equipment[] = [
        mockEquipmentMultiple,
        {
          id: 2,
          item_id: null,
          quantity: 3,
          is_choice: false,
          choice_description: null,
          choice_group: null,
          choice_option: null,
          proficiency_subcategory: null,
          description: 'torches'
        }
      ]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      const text = wrapper.text()
      expect(text).toMatch(/20.*Arrow/)
      expect(text).toMatch(/3.*torches/)
    })
  })

  describe('choice items display', () => {
    it('renders all choice items as bullet points', async () => {
      const equipment: Equipment[] = [
        mockEquipmentChoice,
        {
          id: 3,
          item_id: null,
          quantity: 1,
          is_choice: true,
          choice_description: 'Starting equipment choice',
          choice_group: null,
          choice_option: null,
          proficiency_subcategory: null,
          description: 'a shortsword'
        },
        {
          id: 4,
          item_id: null,
          quantity: 1,
          is_choice: true,
          choice_description: 'Pack choice',
          choice_group: null,
          choice_option: null,
          proficiency_subcategory: null,
          description: 'a dungeoneer\'s pack'
        }
      ]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      const text = wrapper.text()
      expect(text).toContain('a rapier')
      expect(text).toContain('a shortsword')
      expect(text).toContain('a dungeoneer\'s pack')
    })

    it('renders multiple choice groups as flat list', async () => {
      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment: mockMultipleChoiceGroups }
      })

      const text = wrapper.text()
      // All items should be displayed (no grouping)
      expect(text).toContain('a rapier')
      expect(text).toContain('a shortsword')
      expect(text).toContain('a shortbow and quiver of arrows (20)')
    })
  })

  describe('special sections', () => {
    it('separates hit points section', async () => {
      const equipment: Equipment[] = [mockHitPoints, mockEquipmentItem]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      const text = wrapper.text()
      expect(text).toContain('Hit Points')
      expect(text).toContain('8 + your Constitution modifier hit points')
      expect(text).toContain('a backpack')
    })

    it('separates proficiencies section', async () => {
      const equipment: Equipment[] = [mockHitPoints, mockProficiencies, mockEquipmentItem]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      const text = wrapper.text()
      expect(text).toContain('Proficiencies')
      expect(text).toContain('Armor: light armor')
      expect(text).toContain('Weapons: simple weapons')
      expect(text).toContain('a backpack')
    })
  })

  describe('item linking', () => {
    it('links items with item_id and slug to their detail pages', async () => {
      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment: [mockEquipmentWithItem] }
      })

      const link = wrapper.find('a[href="/items/rapier"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Rapier')
    })

    it('does not link items without item_id or slug', async () => {
      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment: [mockEquipmentItem] }
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
            sources: []
          } as Partial<Item>
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
            sources: []
          } as Partial<Item>
        }
      ]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      const rapierLink = wrapper.find('a[href="/items/rapier"]')
      const shortswordLink = wrapper.find('a[href="/items/shortsword"]')

      expect(rapierLink.exists()).toBe(true)
      expect(rapierLink.text()).toBe('Rapier')
      expect(shortswordLink.exists()).toBe(true)
      expect(shortswordLink.text()).toBe('Shortsword')
    })
  })

  describe('formatting', () => {
    it('preserves whitespace and formatting in descriptions', async () => {
      const equipment: Equipment[] = [mockProficiencies]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment }
      })

      const descElement = wrapper.find('[class*="whitespace-pre-wrap"]')
      expect(descElement.exists()).toBe(true)

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
          choice_group: null,
          choice_option: null,
          choice_description: null,
          proficiency_subcategory: null,
          description: null,
          item: {
            id: 1848,
            name: 'Fine Clothes',
            slug: 'fine-clothes',
            description: 'Expensive clothing',
            item_type: { id: 2, name: 'Adventuring Gear' },
            sources: []
          } as Partial<Item>
        },
        {
          id: 2,
          item_id: null,
          quantity: 1,
          is_choice: false,
          choice_group: null,
          choice_option: null,
          choice_description: null,
          proficiency_subcategory: null,
          description: 'identification papers'
        }
      ]

      const wrapper = await mountSuspended(UiAccordionEquipmentList, {
        props: { equipment, type: 'background' }
      })

      const text = wrapper.text()
      expect(text).toContain('Fine Clothes')
      expect(text).toContain('identification papers')
      // Should NOT show hit points or proficiencies headers for backgrounds
      expect(text).not.toContain('Hit Points')
      expect(text).not.toContain('Proficiencies')
    })
  })
})
