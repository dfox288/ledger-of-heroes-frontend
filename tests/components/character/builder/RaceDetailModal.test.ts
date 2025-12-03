// tests/components/character/builder/RaceDetailModal.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { h } from 'vue'
import RaceDetailModal from '~/components/character/builder/RaceDetailModal.vue'
import type { Race } from '~/types'

const mockRace: Race = {
  id: 1,
  name: 'Dwarf',
  slug: 'dwarf',
  speed: 25,
  size: { id: 1, code: 'M', name: 'Medium' },
  description: 'Bold and hardy dwarves',
  modifiers: [
    { id: 1, value: 2, modifier_category: 'ability_score', ability_score: { id: 1, code: 'CON', name: 'Constitution' } }
  ],
  traits: [
    { id: 1, name: 'Darkvision', description: 'You can see in dim light' },
    { id: 2, name: 'Dwarven Resilience', description: 'Advantage vs poison' }
  ],
  sources: []
} as Race

// Stub UModal to avoid teleport issues in tests
const UModalStub = {
  name: 'UModal',
  props: ['open'],
  emits: ['update:open'],
  setup(props: { open: boolean }, { slots, emit }: { slots: Record<string, () => unknown>, emit: (event: string, value: boolean) => void }) {
    return () => props.open ? h('div', { class: 'modal-stub' }, slots.body ? slots.body() : slots.default?.()) : null
  }
}

describe('RaceDetailModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders when open is true', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('Dwarf')
  })

  it('shows race description', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('Bold and hardy dwarves')
  })

  it('shows size and speed', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('Medium')
    expect(wrapper.text()).toContain('25')
  })

  it('shows ability modifiers', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('Constitution')
    expect(wrapper.text()).toContain('+2')
  })

  it('shows racial traits', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).toContain('Dwarven Resilience')
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    await wrapper.find('[data-testid="close-btn"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
