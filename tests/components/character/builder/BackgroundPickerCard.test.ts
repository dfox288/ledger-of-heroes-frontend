import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BackgroundPickerCard from '~/components/character/builder/BackgroundPickerCard.vue'

const mockBackground = {
  id: 1,
  slug: 'acolyte',
  name: 'Acolyte',
  feature_name: 'Shelter of the Faithful',
  feature_description: 'As an acolyte, you command respect...',
  proficiencies: [
    { proficiency_type: 'skill', skill: { name: 'Insight' } },
    { proficiency_type: 'skill', skill: { name: 'Religion' } }
  ],
  languages: [
    { language: { name: 'Celestial' } },
    { language: { name: 'Infernal' } }
  ],
  equipment: []
}

describe('BackgroundPickerCard', () => {
  it('displays background name', async () => {
    const wrapper = await mountSuspended(BackgroundPickerCard, {
      props: { background: mockBackground, selected: false }
    })

    expect(wrapper.text()).toContain('Acolyte')
  })

  it('displays feature name badge', async () => {
    const wrapper = await mountSuspended(BackgroundPickerCard, {
      props: { background: mockBackground, selected: false }
    })

    expect(wrapper.text()).toContain('Shelter of the Faithful')
  })

  it('displays skill proficiencies', async () => {
    const wrapper = await mountSuspended(BackgroundPickerCard, {
      props: { background: mockBackground, selected: false }
    })

    expect(wrapper.text()).toContain('Insight')
    expect(wrapper.text()).toContain('Religion')
  })

  it('shows checkmark when selected', async () => {
    const wrapper = await mountSuspended(BackgroundPickerCard, {
      props: { background: mockBackground, selected: true }
    })

    expect(wrapper.find('[data-test="selected-check"]').exists()).toBe(true)
  })

  it('emits select event on click', async () => {
    const wrapper = await mountSuspended(BackgroundPickerCard, {
      props: { background: mockBackground, selected: false }
    })

    await wrapper.find('[data-test="card-button"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([mockBackground])
  })

  it('emits viewDetails event on details button click', async () => {
    const wrapper = await mountSuspended(BackgroundPickerCard, {
      props: { background: mockBackground, selected: false }
    })

    await wrapper.find('[data-test="view-details-btn"]').trigger('click')

    expect(wrapper.emitted('viewDetails')).toBeTruthy()
  })
})
