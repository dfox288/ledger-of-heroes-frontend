// tests/components/character/builder/RaceDetailModal.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
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

describe('RaceDetailModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders when open is true', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true }
    })
    expect(wrapper.text()).toContain('Dwarf')
  })

  it('shows race description', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true }
    })
    expect(wrapper.text()).toContain('Bold and hardy dwarves')
  })

  it('shows size and speed', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true }
    })
    expect(wrapper.text()).toContain('Medium')
    expect(wrapper.text()).toContain('25')
  })

  it('shows ability modifiers', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true }
    })
    expect(wrapper.text()).toContain('Constitution')
    expect(wrapper.text()).toContain('+2')
  })

  it('shows racial traits', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true }
    })
    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).toContain('Dwarven Resilience')
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = await mountSuspended(RaceDetailModal, {
      props: { race: mockRace, open: true }
    })
    await wrapper.find('[data-testid="close-btn"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
