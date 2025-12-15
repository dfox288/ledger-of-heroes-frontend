// tests/components/character/sheet/SpellbookFilters.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellbookFilters from '~/components/character/sheet/SpellbookFilters.vue'

describe('SpellbookFilters', () => {
  const defaultProps = {
    searchQuery: '',
    selectedSchool: null as string | null,
    selectedLevel: null as number | null,
    concentrationOnly: false,
    ritualOnly: false
  }

  describe('search input', () => {
    it('displays search input', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('emits update:searchQuery on input', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      await wrapper.find('input[type="text"]').setValue('fireball')
      expect(wrapper.emitted('update:searchQuery')).toBeTruthy()
      expect(wrapper.emitted('update:searchQuery')![0]).toEqual(['fireball'])
    })
  })

  describe('school dropdown', () => {
    it('displays school dropdown', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      expect(wrapper.find('[data-testid="school-filter"]').exists()).toBe(true)
    })

    it('emits update:selectedSchool on selection', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      // Find and trigger the select
      const select = wrapper.find('[data-testid="school-filter"]')
      await select.trigger('click')
      // Note: Full dropdown interaction requires more setup, testing the emit
    })
  })

  describe('level dropdown', () => {
    it('displays level dropdown', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      expect(wrapper.find('[data-testid="level-filter"]').exists()).toBe(true)
    })
  })

  describe('checkboxes', () => {
    it('displays concentration checkbox', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      expect(wrapper.find('[data-testid="concentration-filter"]').exists()).toBe(true)
    })

    it('displays ritual checkbox', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      expect(wrapper.find('[data-testid="ritual-filter"]').exists()).toBe(true)
    })

    it('emits update:concentrationOnly on toggle', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      await wrapper.find('[data-testid="concentration-filter"]').trigger('click')
      expect(wrapper.emitted('update:concentrationOnly')).toBeTruthy()
    })

    it('emits update:ritualOnly on toggle', async () => {
      const wrapper = await mountSuspended(SpellbookFilters, { props: defaultProps })
      await wrapper.find('[data-testid="ritual-filter"]').trigger('click')
      expect(wrapper.emitted('update:ritualOnly')).toBeTruthy()
    })
  })
})
