import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UiAccordionSavingThrows from '~/components/ui/accordion/UiAccordionSavingThrows.vue'

describe('UiAccordionSavingThrows', () => {
  it('renders ability score name', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Dexterity')
  })

  it('renders multiple saving throws', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: null
          },
          {
            ability_score: { id: 5, code: 'WIS', name: 'Wisdom' },
            save_effect: 'negates',
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Dexterity')
    expect(wrapper.text()).toContain('Wisdom')
  })

  it('displays "Initial Save" badge when is_initial_save is true', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Initial Save')
  })

  it('displays "Recurring Save" badge when is_initial_save is false', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 5, code: 'WIS', name: 'Wisdom' },
            save_effect: 'ends_effect',
            is_initial_save: false,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Recurring Save')
  })

  it('displays "Negates effect" when save_effect is "negates"', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 5, code: 'WIS', name: 'Wisdom' },
            save_effect: 'negates',
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Negates effect')
  })

  it('displays "Ends effect" when save_effect is "ends_effect"', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 5, code: 'WIS', name: 'Wisdom' },
            save_effect: 'ends_effect',
            is_initial_save: false,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Ends effect')
  })

  it('does not display save effect when it is null', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).not.toContain('Negates')
    expect(wrapper.text()).not.toContain('Ends')
  })

  it('handles empty array gracefully', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: []
      }
    })

    expect(wrapper.html()).toBeTruthy()
  })

  it('displays ability score code in badge', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('DEX')
  })

  it('applies proper spacing and layout classes', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    const container = wrapper.find('.space-y-3')
    expect(container.exists()).toBe(true)
  })

  it('displays "Advantage" badge when save_modifier is "advantage"', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: 'advantage'
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Advantage')
  })

  it('displays "Disadvantage" badge when save_modifier is "disadvantage"', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 5, code: 'WIS', name: 'Wisdom' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: 'disadvantage'
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Disadvantage')
  })

  it('displays "Standard Roll" badge when save_modifier is "none"', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 3, code: 'CON', name: 'Constitution' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: 'none'
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Standard Roll')
  })

  it('does not display save_modifier badge when it is null', async () => {
    const wrapper = await mountSuspended(UiAccordionSavingThrows, {
      props: {
        savingThrows: [
          {
            ability_score: { id: 2, code: 'DEX', name: 'Dexterity' },
            save_effect: null,
            is_initial_save: true,
            save_modifier: null
          }
        ]
      }
    })

    expect(wrapper.text()).not.toContain('Advantage')
    expect(wrapper.text()).not.toContain('Disadvantage')
    expect(wrapper.text()).not.toContain('Standard Roll')
  })
})
