import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { h } from 'vue'
import BackgroundDetailModal from '~/components/character/builder/BackgroundDetailModal.vue'

const mockBackground = {
  id: 1,
  slug: 'acolyte',
  name: 'Acolyte',
  feature_name: 'Shelter of the Faithful',
  feature_description: 'As an acolyte, you command respect from those who share your faith.',
  proficiencies: [
    { proficiency_type: 'skill', skill: { name: 'Insight' } },
    { proficiency_type: 'skill', skill: { name: 'Religion' } }
  ],
  languages: [
    { language: { name: 'Celestial' } },
    { language: { name: 'Infernal' } }
  ],
  equipment: [
    { id: 1, item: { name: 'Holy Symbol' }, quantity: 1, is_choice: false },
    { id: 2, item: { name: 'Prayer Book' }, quantity: 1, is_choice: false }
  ]
}

// Stub UModal to avoid teleport issues in tests
const UModalStub = {
  name: 'UModal',
  props: ['open', 'title'],
  emits: ['update:open'],
  setup(props: { open: boolean, title?: string }, { slots, emit }: { slots: Record<string, () => unknown>, emit: (event: string, value: boolean) => void }) {
    return () => props.open ? h('div', { class: 'modal-stub' }, [
      // Render title if provided
      props.title ? h('h2', { class: 'modal-title' }, props.title) : null,
      // Render close button that emits update:open
      h('button', { 'data-testid': 'modal-close', 'onClick': () => emit('update:open', false) }, 'Close'),
      // Render body slot
      slots.body ? slots.body() : slots.default?.()
    ]) : null
  }
}

describe('BackgroundDetailModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('displays background name in title', async () => {
    const wrapper = await mountSuspended(BackgroundDetailModal, {
      props: { background: mockBackground, open: true },
      global: { stubs: { UModal: UModalStub } }
    })

    expect(wrapper.text()).toContain('Acolyte')
  })

  it('displays feature name and description', async () => {
    const wrapper = await mountSuspended(BackgroundDetailModal, {
      props: { background: mockBackground, open: true },
      global: { stubs: { UModal: UModalStub } }
    })

    expect(wrapper.text()).toContain('Shelter of the Faithful')
    expect(wrapper.text()).toContain('command respect')
  })

  it('displays skill proficiencies', async () => {
    const wrapper = await mountSuspended(BackgroundDetailModal, {
      props: { background: mockBackground, open: true },
      global: { stubs: { UModal: UModalStub } }
    })

    expect(wrapper.text()).toContain('Insight')
    expect(wrapper.text()).toContain('Religion')
  })

  it('displays equipment list', async () => {
    const wrapper = await mountSuspended(BackgroundDetailModal, {
      props: { background: mockBackground, open: true },
      global: { stubs: { UModal: UModalStub } }
    })

    expect(wrapper.text()).toContain('Holy Symbol')
    expect(wrapper.text()).toContain('Prayer Book')
  })

  it('emits close when modal is dismissed', async () => {
    const wrapper = await mountSuspended(BackgroundDetailModal, {
      props: { background: mockBackground, open: true },
      global: { stubs: { UModal: UModalStub } }
    })

    // Click the stubbed modal's close button which triggers update:open
    await wrapper.find('[data-testid="modal-close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
