import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellSchoolCard from '~/components/spell-school/SpellSchoolCard.vue'

describe('SpellSchoolCard', () => {
  const mockSpellSchool = {
    id: 1,
    code: 'A',
    name: 'Abjuration',
    description: 'Abjuration spells are protective in nature.'
  }

  it('displays spell school code as large badge', async () => {
    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: mockSpellSchool }
    })

    expect(wrapper.text()).toContain('A')
  })

  it('displays spell school name as title', async () => {
    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: mockSpellSchool }
    })

    expect(wrapper.text()).toContain('Abjuration')
  })

  it('displays description when present', async () => {
    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: mockSpellSchool }
    })

    expect(wrapper.text()).toContain('protective in nature')
  })

  it('handles missing description gracefully', async () => {
    const noDescription = {
      id: 2,
      code: 'E',
      name: 'Evocation',
      description: null
    }

    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: noDescription }
    })

    expect(wrapper.text()).toContain('Evocation')
    expect(wrapper.text()).not.toContain('null')
  })

  it('truncates long descriptions', async () => {
    const longDescription = {
      id: 3,
      code: 'T',
      name: 'Transmutation',
      description: 'Transmutation spells change the properties of a creature, object, or environment. They can turn a creature into another creature, change the nature of an object, or alter the properties of an environment. These spells are among the most versatile and powerful in existence.'
    }

    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: longDescription }
    })

    const html = wrapper.html()
    // line-clamp-2 class should be present
    expect(html).toContain('line-clamp-2')
  })

  it('displays category badge', async () => {
    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: mockSpellSchool }
    })

    expect(wrapper.text()).toContain('Spell School')
  })

  it('uses school entity color for badges', async () => {
    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: mockSpellSchool }
    })

    const html = wrapper.html()
    // Check for school color classes applied by NuxtUI
    expect(html).toContain('bg-school')
    expect(html).toContain('text-school')
  })

  it('uses school entity color for borders', async () => {
    const wrapper = await mountSuspended(SpellSchoolCard, {
      props: { spellSchool: mockSpellSchool }
    })

    const html = wrapper.html()
    expect(html).toContain('border-school-300')
    expect(html).toContain('border-school-700')
    expect(html).toContain('border-school-500')
  })

  describe('background images', () => {
    it('computes background image URL correctly using code field', async () => {
      const wrapper = await mountSuspended(SpellSchoolCard, {
        props: {
          spellSchool: {
            id: 1,
            code: 'EV',
            name: 'Evocation',
            description: 'Evocation spells'
          }
        }
      })

      const url = wrapper.vm.backgroundImageUrl
      // Uses code field (EV) not slug or name
      expect(url).toBe('/images/generated/conversions/256/spell_schools/stability-ai/EV.png')
    })
  })
})
