// tests/components/character/builder/ClassDetailModal.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { h } from 'vue'
import ClassDetailModal from '~/components/character/builder/ClassDetailModal.vue'
import type { CharacterClass } from '~/types'

const mockClass: CharacterClass = {
  id: 1,
  name: 'Fighter',
  slug: 'fighter',
  hit_die: 10,
  is_base_class: true,
  primary_ability: 'STR',
  description: 'A master of martial combat',
  spellcasting_ability: null,
  proficiencies: [
    { id: 1, proficiency_type: 'All Armor', proficiency_type_detail: { name: 'All Armor' } },
    { id: 2, proficiency_type: 'Shields', proficiency_type_detail: { name: 'Shields' } },
    { id: 3, proficiency_type: 'Simple Weapons', proficiency_type_detail: { name: 'Simple Weapons' } },
    { id: 4, proficiency_type: 'Martial Weapons', proficiency_type_detail: { name: 'Martial Weapons' } }
  ],
  sources: []
} as CharacterClass

const mockCasterClass: CharacterClass = {
  id: 2,
  name: 'Wizard',
  slug: 'wizard',
  hit_die: 6,
  is_base_class: true,
  primary_ability: 'INT',
  description: 'A scholarly magic-user',
  spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' },
  proficiencies: [
    { id: 1, proficiency_type: 'Daggers', proficiency_type_detail: { name: 'Daggers' } },
    { id: 2, proficiency_type: 'Quarterstaves', proficiency_type_detail: { name: 'Quarterstaves' } }
  ],
  sources: []
} as CharacterClass

// Stub UModal to avoid teleport issues in tests
const UModalStub = {
  name: 'UModal',
  props: ['open'],
  emits: ['update:open'],
  setup(props: { open: boolean }, { slots, emit }: { slots: Record<string, () => unknown>, emit: (event: string, value: boolean) => void }) {
    return () => props.open ? h('div', { class: 'modal-stub' }, slots.body ? slots.body() : slots.default?.()) : null
  }
}

describe('ClassDetailModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders when open is true', async () => {
    const wrapper = await mountSuspended(ClassDetailModal, {
      props: { characterClass: mockClass, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('Fighter')
  })

  it('shows class description', async () => {
    const wrapper = await mountSuspended(ClassDetailModal, {
      props: { characterClass: mockClass, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('master of martial combat')
  })

  it('shows hit die', async () => {
    const wrapper = await mountSuspended(ClassDetailModal, {
      props: { characterClass: mockClass, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('d10')
  })

  it('shows proficiencies', async () => {
    const wrapper = await mountSuspended(ClassDetailModal, {
      props: { characterClass: mockClass, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('All Armor')
    expect(wrapper.text()).toContain('Shields')
  })

  it('shows spellcasting info for caster classes', async () => {
    const wrapper = await mountSuspended(ClassDetailModal, {
      props: { characterClass: mockCasterClass, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).toContain('Spellcasting')
    expect(wrapper.text()).toContain('Intelligence')
  })

  it('does not show spellcasting section for non-casters', async () => {
    const wrapper = await mountSuspended(ClassDetailModal, {
      props: { characterClass: mockClass, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    expect(wrapper.text()).not.toContain('Spellcasting Ability')
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = await mountSuspended(ClassDetailModal, {
      props: { characterClass: mockClass, open: true },
      global: { stubs: { UModal: UModalStub } }
    })
    await wrapper.find('[data-testid="close-btn"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
