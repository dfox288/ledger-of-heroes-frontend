// tests/components/character/builder/SubraceDetailModal.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { h } from 'vue'
import SubraceDetailModal from '~/components/character/builder/SubraceDetailModal.vue'
import type { Race } from '~/types'

// Mock parent race (e.g., Elf)
const mockParentRace: Race = {
  id: 1,
  name: 'Elf',
  slug: 'elf',
  speed: 30,
  is_subrace: 'false',
  size: { id: 1, code: 'M', name: 'Medium' },
  modifiers: [
    { id: 1, value: 2, modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' } }
  ],
  traits: [
    { id: 1, name: 'Darkvision', description: 'You can see in dim light within 60 feet' },
    { id: 2, name: 'Fey Ancestry', description: 'Advantage on saving throws against being charmed' }
  ],
  proficiencies: [
    { id: 1, proficiency_type: 'skill', proficiency_name: 'Perception' }
  ],
  languages: [
    { id: 1, language: { id: 1, name: 'Common', slug: 'common' } },
    { id: 2, language: { id: 3, name: 'Elvish', slug: 'elvish' } }
  ],
  sources: []
} as Race

// Mock subrace with inherited_data (e.g., High Elf)
const mockSubraceWithInheritedData: Race = {
  id: 2,
  name: 'High Elf',
  slug: 'high-elf',
  speed: 30,
  is_subrace: 'true',
  size: { id: 1, code: 'M', name: 'Medium' },
  modifiers: [
    { id: 3, value: 1, modifier_category: 'ability_score', ability_score: { id: 4, code: 'INT', name: 'Intelligence' } }
  ],
  traits: [
    { id: 3, name: 'Cantrip', description: 'You know one cantrip of your choice from the wizard spell list' }
  ],
  proficiencies: [
    { id: 2, proficiency_type: 'weapon', proficiency_name: 'Longsword' }
  ],
  languages: [], // No direct languages
  inherited_data: {
    traits: [
      { id: 1, name: 'Darkvision', description: 'You can see in dim light within 60 feet' },
      { id: 2, name: 'Fey Ancestry', description: 'Advantage on saving throws against being charmed' }
    ],
    modifiers: [
      { id: 1, value: 2, modifier_category: 'ability_score', ability_score: { id: 2, code: 'DEX', name: 'Dexterity' } }
    ],
    proficiencies: [
      { id: 1, proficiency_type: 'skill', proficiency_name: 'Perception' }
    ],
    languages: [
      { id: 1, language: { id: 1, name: 'Common', slug: 'common' } },
      { id: 2, language: { id: 3, name: 'Elvish', slug: 'elvish' } }
    ],
    conditions: null,
    senses: null
  },
  sources: []
} as Race

// Mock subrace without inherited_data (fallback to parentRace needed)
const mockSubraceWithoutInheritedData: Race = {
  id: 3,
  name: 'Wood Elf',
  slug: 'wood-elf',
  speed: 35,
  is_subrace: 'true',
  size: { id: 1, code: 'M', name: 'Medium' },
  modifiers: [
    { id: 4, value: 1, modifier_category: 'ability_score', ability_score: { id: 5, code: 'WIS', name: 'Wisdom' } }
  ],
  traits: [
    { id: 4, name: 'Mask of the Wild', description: 'You can attempt to hide even when only lightly obscured' }
  ],
  proficiencies: [],
  languages: [],
  // No inherited_data - should fall back to parentRace
  sources: []
} as Race

// Stub UModal to avoid teleport issues in tests
const UModalStub = {
  name: 'UModal',
  props: ['open', 'title'],
  emits: ['update:open'],
  setup(props: { open: boolean, title?: string }, { slots, emit }: { slots: Record<string, () => unknown>, emit: (event: string, value: boolean) => void }) {
    return () => props.open
      ? h('div', { class: 'modal-stub' }, [
          props.title ? h('h2', { class: 'modal-title' }, props.title) : null,
          h('button', { 'data-testid': 'modal-close', 'onClick': () => emit('update:open', false) }, 'Close'),
          slots.body ? slots.body() : slots.default?.()
        ])
      : null
  }
}

describe('SubraceDetailModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('basic rendering', () => {
    it('renders when open is true', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })
      expect(wrapper.text()).toContain('High Elf')
    })

    it('shows size and speed', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })
      expect(wrapper.text()).toContain('Medium')
      expect(wrapper.text()).toContain('30')
    })
  })

  describe('inherited languages from inherited_data', () => {
    it('displays inherited languages from inherited_data when subrace has no direct languages', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      // Should show inherited languages from inherited_data
      expect(wrapper.text()).toContain('Common')
      expect(wrapper.text()).toContain('Elvish')
      expect(wrapper.text()).toContain('Base Race Languages')
    })

    it('falls back to parentRace languages when no inherited_data', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithoutInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      // Should fall back to parent race languages
      expect(wrapper.text()).toContain('Common')
      expect(wrapper.text()).toContain('Elvish')
    })
  })

  describe('inherited proficiencies from inherited_data', () => {
    it('displays inherited proficiencies from inherited_data', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      // Should show inherited proficiency from inherited_data
      expect(wrapper.text()).toContain('Perception')
      expect(wrapper.text()).toContain('Base Race Proficiencies')
    })

    it('displays subrace-specific proficiencies separately', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      // Should show subrace proficiency
      expect(wrapper.text()).toContain('Longsword')
      expect(wrapper.text()).toContain('Subrace Proficiencies')
    })
  })

  describe('inherited traits and modifiers', () => {
    it('displays inherited ability modifiers from inherited_data', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      expect(wrapper.text()).toContain('Dexterity')
      expect(wrapper.text()).toContain('+2')
    })

    it('displays subrace ability modifiers', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      expect(wrapper.text()).toContain('Intelligence')
      expect(wrapper.text()).toContain('+1')
    })

    it('displays inherited traits from inherited_data', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      expect(wrapper.text()).toContain('Darkvision')
      expect(wrapper.text()).toContain('Fey Ancestry')
    })

    it('displays subrace-specific traits', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      expect(wrapper.text()).toContain('Cantrip')
    })
  })

  describe('close behavior', () => {
    it('emits close when modal is dismissed', async () => {
      const wrapper = await mountSuspended(SubraceDetailModal, {
        props: { subrace: mockSubraceWithInheritedData, open: true, parentRace: mockParentRace },
        global: { stubs: { UModal: UModalStub } }
      })

      await wrapper.find('[data-testid="modal-close"]').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
})
