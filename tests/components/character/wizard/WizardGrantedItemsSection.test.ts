// tests/components/character/wizard/WizardGrantedItemsSection.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WizardGrantedItemsSection from '~/components/character/wizard/WizardGrantedItemsSection.vue'

describe('WizardGrantedItemsSection', () => {
  const mockGroups = [
    {
      label: 'From Race (Human)',
      color: 'race',
      items: [
        { id: 1, name: 'Common' },
        { id: 2, name: 'Dwarvish' }
      ]
    },
    {
      label: 'From Background (Acolyte)',
      color: 'background',
      items: [
        { id: 3, name: 'Celestial' }
      ]
    }
  ]

  describe('rendering', () => {
    it('displays section title', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: { groups: mockGroups }
      })

      expect(wrapper.text()).toContain('Already Granted')
    })

    it('displays custom title when provided', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: {
          groups: mockGroups,
          title: 'Languages You Know'
        }
      })

      expect(wrapper.text()).toContain('Languages You Know')
    })

    it('displays all group labels', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: { groups: mockGroups }
      })

      expect(wrapper.text()).toContain('From Race (Human)')
      expect(wrapper.text()).toContain('From Background (Acolyte)')
    })

    it('displays all items in each group', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: { groups: mockGroups }
      })

      expect(wrapper.text()).toContain('Common')
      expect(wrapper.text()).toContain('Dwarvish')
      expect(wrapper.text()).toContain('Celestial')
    })

    it('renders badges for items', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: { groups: mockGroups }
      })

      const badges = wrapper.findAllComponents({ name: 'UBadge' })
      // Should have 3 badges for the 3 items
      expect(badges.length).toBe(3)
    })

    it('renders nothing when groups is empty', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: { groups: [] }
      })

      expect(wrapper.find('[data-testid="granted-items-section"]').exists()).toBe(false)
    })
  })

  describe('with icons', () => {
    const groupsWithIcons = [
      {
        label: 'Saving Throws',
        color: 'class',
        icon: 'i-heroicons-heart',
        items: [
          { id: 1, name: 'Strength' },
          { id: 2, name: 'Constitution' }
        ]
      }
    ]

    it('displays icon when provided in group', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: { groups: groupsWithIcons }
      })

      expect(wrapper.find('[data-testid="group-icon"]').exists()).toBe(true)
    })
  })

  describe('item slot', () => {
    it('renders custom item content via slot', async () => {
      const wrapper = await mountSuspended(WizardGrantedItemsSection, {
        props: { groups: mockGroups },
        slots: {
          item: `<template #item="{ item }">
            <span data-testid="custom-item">Custom: {{ item.name }}</span>
          </template>`
        }
      })

      const customItems = wrapper.findAll('[data-testid="custom-item"]')
      expect(customItems.length).toBe(3)
      expect(wrapper.text()).toContain('Custom: Common')
    })
  })
})
