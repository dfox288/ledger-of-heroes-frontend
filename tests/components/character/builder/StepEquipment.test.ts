import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepEquipment from '~/components/character/builder/StepEquipment.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'
import { mockFixedPackEquipment } from '../../../fixtures/equipment'

describe('StepEquipment', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays class equipment section', async () => {
    const wrapper = await mountSuspended(StepEquipment)

    const store = useCharacterBuilderStore()
    store.characterClasses = [{
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: {
        name: 'Fighter',
        equipment: [
          { id: 1, item_id: 1, item: { name: 'Chain Mail' }, quantity: 1, is_choice: false }
        ]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    }]

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Fighter')
    expect(wrapper.text()).toContain('Chain Mail')
  })

  it('displays background equipment section', async () => {
    const wrapper = await mountSuspended(StepEquipment)

    const store = useCharacterBuilderStore()

    store.characterClasses = [{
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      classData: { name: 'Fighter', equipment: [] } as any
    }]
    store.selectedBackground = {
      name: 'Soldier',
      equipment: [
        { id: 2, item_id: 2, item: { name: 'Insignia of Rank' }, quantity: 1, is_choice: false }
      ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Soldier')
    expect(wrapper.text()).toContain('Insignia of Rank')
  })

  it('displays equipment choice groups', async () => {
    const wrapper = await mountSuspended(StepEquipment)

    const store = useCharacterBuilderStore()
    store.characterClasses = [{
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: {
        name: 'Fighter',
        equipment: [
          { id: 1, item_id: 101, item: { name: 'Longsword' }, quantity: 1, is_choice: true, choice_group: 'weapon' },
          { id: 2, item_id: 102, item: { name: 'Rapier' }, quantity: 1, is_choice: true, choice_group: 'weapon' }
        ]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    }]

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Longsword')
    expect(wrapper.text()).toContain('Rapier')
  })

  it('disables continue button until all choices made', async () => {
    const wrapper = await mountSuspended(StepEquipment)

    const store = useCharacterBuilderStore()
    store.characterClasses = [{
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: {
        name: 'Fighter',
        equipment: [
          { id: 1, item_id: 101, item: { name: 'Longsword' }, is_choice: true, choice_group: 'weapon' }
        ]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    }]

    await wrapper.vm.$nextTick()

    const button = wrapper.find('[data-test="continue-btn"]')
    expect(button.attributes('disabled')).toBeDefined()
  })
})

describe('StepEquipment with pack contents', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows pack contents toggle for fixed equipment with contents', async () => {
    const wrapper = await mountSuspended(StepEquipment)

    const store = useCharacterBuilderStore()
    store.characterClasses = [{
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: {
        name: 'Fighter',
        equipment: [mockFixedPackEquipment]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    }]

    await wrapper.vm.$nextTick()

    // Should show the pack name
    expect(wrapper.text()).toContain('Explorer\'s Pack')
    // Should have a toggle to show contents
    expect(wrapper.find('[data-test="fixed-pack-contents-toggle-60"]').exists()).toBe(true)
  })

  it('displays pack contents when toggle clicked', async () => {
    const wrapper = await mountSuspended(StepEquipment)

    const store = useCharacterBuilderStore()
    store.characterClasses = [{
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: {
        name: 'Fighter',
        equipment: [mockFixedPackEquipment]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    }]

    await wrapper.vm.$nextTick()

    // Click toggle to expand
    await wrapper.find('[data-test="fixed-pack-contents-toggle-60"]').trigger('click')
    await wrapper.vm.$nextTick()

    // Should show contents list
    const contentsList = wrapper.find('[data-test="fixed-pack-contents-list-60"]')
    expect(contentsList.exists()).toBe(true)
    expect(contentsList.text()).toContain('Backpack')
    expect(contentsList.text()).toContain('Bedroll')
    expect(contentsList.text()).toContain('10 Torch')
  })

  it('does not show pack contents toggle for items without contents', async () => {
    const wrapper = await mountSuspended(StepEquipment)

    const store = useCharacterBuilderStore()
    store.characterClasses = [{
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: {
        name: 'Fighter',
        equipment: [
          { id: 1, item_id: 1, item: { name: 'Chain Mail' }, quantity: 1, is_choice: false }
        ]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    }]

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Chain Mail')
    expect(wrapper.find('[data-test="fixed-pack-contents-toggle-1"]').exists()).toBe(false)
  })
})
