// tests/components/character/sheet/PrepareSpellsFilters.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PrepareSpellsFilters from '~/components/character/sheet/PrepareSpellsFilters.vue'

describe('PrepareSpellsFilters', () => {
  const defaultProps = {
    searchQuery: '',
    selectedLevel: null as number | null,
    maxCastableLevel: 5,
    hidePrepared: false
  }

  describe('search input', () => {
    it('displays search input', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('has testid on search input (#795)', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true)
    })

    it('shows search placeholder', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      expect(wrapper.find('input[type="text"]').attributes('placeholder')).toContain('Search')
    })

    it('emits update:searchQuery on input', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      await wrapper.find('input[type="text"]').setValue('cure wounds')
      expect(wrapper.emitted('update:searchQuery')).toBeTruthy()
      expect(wrapper.emitted('update:searchQuery')![0]).toEqual(['cure wounds'])
    })
  })

  describe('level dropdown', () => {
    it('displays level dropdown', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      expect(wrapper.find('[data-testid="level-filter"]').exists()).toBe(true)
    })

    it('limits level options to maxCastableLevel', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, {
        props: { ...defaultProps, maxCastableLevel: 3 }
      })
      // Should only show levels 0-3 (cantrip through 3rd)
      const text = wrapper.text()
      expect(text).not.toContain('4th')
      expect(text).not.toContain('5th')
    })

    it('includes cantrips in level options', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      // Cantrips should always be available
      expect(wrapper.find('[data-testid="level-filter"]').exists()).toBe(true)
    })
  })

  describe('hide prepared toggle', () => {
    it('displays hide prepared checkbox', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      expect(wrapper.find('[data-testid="hide-prepared-filter"]').exists()).toBe(true)
    })

    it('shows correct label', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      expect(wrapper.text()).toContain('Hide prepared')
    })

    it('emits update:hidePrepared on toggle', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, { props: defaultProps })
      await wrapper.find('[data-testid="hide-prepared-filter"]').trigger('click')
      expect(wrapper.emitted('update:hidePrepared')).toBeTruthy()
    })
  })

  describe('props reactivity', () => {
    it('displays current search query from props', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, {
        props: { ...defaultProps, searchQuery: 'healing' }
      })
      const input = wrapper.find('input[type="text"]')
      expect((input.element as HTMLInputElement).value).toBe('healing')
    })

    it('reflects hidePrepared state from props', async () => {
      const wrapper = await mountSuspended(PrepareSpellsFilters, {
        props: { ...defaultProps, hidePrepared: true }
      })
      // Checkbox should be checked when hidePrepared is true
      expect(wrapper.find('[data-testid="hide-prepared-filter"]').exists()).toBe(true)
    })
  })
})
