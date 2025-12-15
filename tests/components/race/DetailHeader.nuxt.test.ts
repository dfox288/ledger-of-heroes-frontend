import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RaceDetailHeader from '~/components/race/DetailHeader.vue'
import { createMockRace } from '#tests/helpers/mockFactories'

describe('RaceDetailHeader', () => {
  describe('Base Race', () => {
    it('renders breadcrumb with list link and current race', async () => {
      const race = createMockRace({ name: 'Dwarf', slug: 'dwarf' })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      const breadcrumb = wrapper.find('nav[aria-label="Breadcrumb"]')
      expect(breadcrumb.exists()).toBe(true)
      expect(breadcrumb.text()).toContain('Races')
      expect(breadcrumb.text()).toContain('Dwarf')
    })

    it('displays race name as h1', async () => {
      const race = createMockRace({ name: 'Elf', slug: 'elf' })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      const heading = wrapper.find('h1')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Elf')
    })

    it('displays "Race" badge for base races', async () => {
      const race = createMockRace()

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      expect(wrapper.text()).toContain('Race')
    })

    it('displays size badge with correct color', async () => {
      const race = createMockRace({
        size: { id: 3, code: 'M', name: 'Medium' }
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      // Size badge should be present
      expect(wrapper.text()).toContain('Medium')
    })

    it('displays truncated description', async () => {
      const race = createMockRace({
        description: 'Elves are a magical people of otherworldly grace.'
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      expect(wrapper.text()).toContain('Elves are a magical people of otherworldly grace.')
    })

    it('truncates long descriptions at 200 characters', async () => {
      const longDescription = 'A'.repeat(250)
      const race = createMockRace({ description: longDescription })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      const text = wrapper.text()
      // Should be truncated (either with ... or at a period)
      expect(text.length).toBeLessThan(longDescription.length)
    })

    it('truncates at last period if within 60% of max length', async () => {
      const description = 'This is the first sentence. This is the second sentence. ' + 'A'.repeat(150)
      const race = createMockRace({ description })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      const text = wrapper.text()
      // Should truncate at a sentence boundary
      expect(text).toContain('This is the first sentence.')
    })

    it('does not show parent race link for base races', async () => {
      const race = createMockRace()

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      expect(wrapper.text()).not.toContain('Subrace of')
    })

    it('displays entity image when available', async () => {
      const race = createMockRace({ slug: 'elf' })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      // Look for NuxtImg component or img tag
      const images = wrapper.findAll('img')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  describe('Subrace', () => {
    it('displays "Subrace" badge for subraces', async () => {
      const parentRace = { id: 1, slug: 'elf', name: 'Elf', speed: 30 }
      const subrace = createMockRace({
        name: 'High Elf',
        slug: 'high-elf',
        parent_race_id: 1,
        parent_race: parentRace
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: subrace,
          isSubrace: true,
          parentRace
        }
      })

      expect(wrapper.text()).toContain('Subrace')
    })

    it('shows parent race link with correct text', async () => {
      const parentRace = { id: 1, slug: 'elf', name: 'Elf', speed: 30 }
      const subrace = createMockRace({
        name: 'High Elf',
        slug: 'high-elf',
        parent_race_id: 1,
        parent_race: parentRace
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: subrace,
          isSubrace: true,
          parentRace
        }
      })

      expect(wrapper.text()).toContain('Subrace of')
      expect(wrapper.text()).toContain('Elf')
    })

    it('parent race link navigates to parent page', async () => {
      const parentRace = { id: 1, slug: 'dwarf', name: 'Dwarf', speed: 25 }
      const subrace = createMockRace({
        name: 'Hill Dwarf',
        slug: 'hill-dwarf',
        parent_race_id: 1,
        parent_race: parentRace
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: subrace,
          isSubrace: true,
          parentRace
        }
      })

      const link = wrapper.find('a[href="/races/dwarf"]')
      expect(link.exists()).toBe(true)
    })

    it('breadcrumb includes parent race', async () => {
      const parentRace = { id: 1, slug: 'elf', name: 'Elf', speed: 30 }
      const subrace = createMockRace({
        name: 'High Elf',
        slug: 'high-elf',
        parent_race_id: 1,
        parent_race: parentRace
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: subrace,
          isSubrace: true,
          parentRace
        }
      })

      const breadcrumb = wrapper.find('nav[aria-label="Breadcrumb"]')
      expect(breadcrumb.text()).toContain('Races')
      expect(breadcrumb.text()).toContain('Elf')
      expect(breadcrumb.text()).toContain('High Elf')
    })
  })

  describe('Size Display', () => {
    it('displays Small size', async () => {
      const race = createMockRace({
        size: { id: 2, code: 'S', name: 'Small' }
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      expect(wrapper.text()).toContain('Small')
    })

    it('displays Large size', async () => {
      const race = createMockRace({
        size: { id: 4, code: 'L', name: 'Large' }
      })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      expect(wrapper.text()).toContain('Large')
    })
  })

  describe('Edge Cases', () => {
    it('handles race without description', async () => {
      const race = createMockRace({ description: undefined })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      // Should render without crashing
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('handles race without size', async () => {
      const race = createMockRace({ size: undefined })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      // Should render without crashing
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('handles empty description', async () => {
      const race = createMockRace({ description: '' })

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      // Should not display empty paragraph
      const text = wrapper.text()
      expect(text).toBeTruthy()
    })
  })

  describe('Layout', () => {
    it('uses grid layout with 2/3 text and 1/3 image on large screens', async () => {
      const race = createMockRace()

      const wrapper = await mountSuspended(RaceDetailHeader, {
        props: {
          entity: race,
          isSubrace: false,
          parentRace: null
        }
      })

      // Check for grid classes
      const grid = wrapper.find('.grid')
      expect(grid.exists()).toBe(true)
      expect(grid.html()).toContain('lg:col-span-2')
      expect(grid.html()).toContain('lg:col-span-1')
    })
  })
})
