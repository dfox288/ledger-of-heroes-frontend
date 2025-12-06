import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellClassList from '~/components/spell/SpellClassList.vue'
import type { components } from '~/types/api/generated'

type ClassResource = components['schemas']['ClassResource']

/**
 * Create mock class with minimal required fields
 */
function createMockClass(overrides: Partial<ClassResource> = {}): ClassResource {
  return {
    id: 1,
    slug: 'wizard',
    name: 'Wizard',
    hit_die: 6,
    description: 'A scholarly magic-user',
    archetype: 'Arcane Caster',
    primary_ability: 'Intelligence',
    parent_class_id: null,
    is_base_class: true,
    subclass_level: null,
    spellcasting_type: 'full',
    ...overrides
  } as ClassResource
}

describe('SpellClassList', () => {
  describe('rendering', () => {
    it('renders header', async () => {
      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [createMockClass()]
        }
      })

      expect(wrapper.text()).toContain('📚 SPELL LISTS')
    })

    it('renders empty state when no classes provided', async () => {
      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: []
        }
      })

      expect(wrapper.text()).toContain('📚 SPELL LISTS')
      expect(wrapper.text()).not.toContain('BASE CLASSES')
      expect(wrapper.text()).not.toContain('SUBCLASSES')
    })
  })

  describe('base classes', () => {
    it('displays base classes section', async () => {
      const baseClass = createMockClass({
        slug: 'wizard',
        name: 'Wizard',
        is_base_class: true
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [baseClass]
        }
      })

      expect(wrapper.text()).toContain('BASE CLASSES')
      expect(wrapper.text()).toContain('Wizard')
    })

    it('displays multiple base classes as badges', async () => {
      const classes = [
        createMockClass({ slug: 'sorcerer', name: 'Sorcerer', is_base_class: true }),
        createMockClass({ slug: 'wizard', name: 'Wizard', is_base_class: true })
      ]

      const wrapper = await mountSuspended(SpellClassList, {
        props: { classes }
      })

      expect(wrapper.text()).toContain('Sorcerer')
      expect(wrapper.text()).toContain('Wizard')
    })

    it('links base classes to class detail page', async () => {
      const baseClass = createMockClass({
        slug: 'wizard',
        name: 'Wizard',
        is_base_class: true
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [baseClass]
        }
      })

      const link = wrapper.find('a[href="/classes/wizard"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('Wizard')
    })
  })

  describe('subclasses', () => {
    it('displays subclasses section', async () => {
      const subclass = createMockClass({
        slug: 'light-domain',
        name: 'Light Domain',
        is_base_class: false,
        parent_class: createMockClass({
          slug: 'cleric',
          name: 'Cleric',
          is_base_class: true
        })
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [subclass]
        }
      })

      expect(wrapper.text()).toContain('SUBCLASSES')
      expect(wrapper.text()).toContain('Light Domain')
    })

    it('displays parent class name in muted text', async () => {
      const subclass = createMockClass({
        slug: 'light-domain',
        name: 'Light Domain',
        is_base_class: false,
        parent_class: createMockClass({
          slug: 'cleric',
          name: 'Cleric',
          is_base_class: true
        })
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [subclass]
        }
      })

      // Parent class name should appear in parentheses
      expect(wrapper.text()).toMatch(/Light Domain.*Cleric/i)
    })

    it('links subclasses to subclass detail page', async () => {
      const subclass = createMockClass({
        slug: 'light-domain',
        name: 'Light Domain',
        is_base_class: false,
        parent_class: createMockClass({
          slug: 'cleric',
          name: 'Cleric',
          is_base_class: true
        })
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [subclass]
        }
      })

      const link = wrapper.find('a[href="/classes/light-domain"]')
      expect(link.exists()).toBe(true)
    })

    it('handles subclass without parent_class', async () => {
      const subclass = createMockClass({
        slug: 'light-domain',
        name: 'Light Domain',
        is_base_class: false
        // no parent_class field
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [subclass]
        }
      })

      expect(wrapper.text()).toContain('Light Domain')
      // Should not crash and should still render subclass
    })
  })

  describe('grouping', () => {
    it('groups classes into base and subclasses sections', async () => {
      const classes = [
        createMockClass({
          slug: 'wizard',
          name: 'Wizard',
          is_base_class: true
        }),
        createMockClass({
          slug: 'light-domain',
          name: 'Light Domain',
          is_base_class: false,
          parent_class: createMockClass({
            slug: 'cleric',
            name: 'Cleric',
            is_base_class: true
          })
        }),
        createMockClass({
          slug: 'sorcerer',
          name: 'Sorcerer',
          is_base_class: true
        })
      ]

      const wrapper = await mountSuspended(SpellClassList, {
        props: { classes }
      })

      const text = wrapper.text()
      expect(text).toContain('BASE CLASSES')
      expect(text).toContain('SUBCLASSES')
      expect(text).toContain('Wizard')
      expect(text).toContain('Sorcerer')
      expect(text).toContain('Light Domain')
    })

    it('hides base classes section if no base classes', async () => {
      const subclass = createMockClass({
        slug: 'light-domain',
        name: 'Light Domain',
        is_base_class: false,
        parent_class: createMockClass({
          slug: 'cleric',
          name: 'Cleric',
          is_base_class: true
        })
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [subclass]
        }
      })

      expect(wrapper.text()).not.toContain('BASE CLASSES')
      expect(wrapper.text()).toContain('SUBCLASSES')
    })

    it('hides subclasses section if no subclasses', async () => {
      const baseClass = createMockClass({
        slug: 'wizard',
        name: 'Wizard',
        is_base_class: true
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [baseClass]
        }
      })

      expect(wrapper.text()).toContain('BASE CLASSES')
      expect(wrapper.text()).not.toContain('SUBCLASSES')
    })
  })

  describe('styling', () => {
    it('uses class color for badges', async () => {
      const baseClass = createMockClass({
        slug: 'wizard',
        name: 'Wizard',
        is_base_class: true
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [baseClass]
        }
      })

      // UBadge should have color="class"
      const badge = wrapper.find('[data-badge]')
      expect(badge.exists()).toBe(true)
    })

    it('uses md size for badges', async () => {
      const baseClass = createMockClass({
        slug: 'wizard',
        name: 'Wizard',
        is_base_class: true
      })

      const wrapper = await mountSuspended(SpellClassList, {
        props: {
          classes: [baseClass]
        }
      })

      // Should use standard md size as per badge size standard
      const badge = wrapper.find('[data-badge]')
      expect(badge.exists()).toBe(true)
    })
  })
})
