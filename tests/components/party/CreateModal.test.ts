// tests/components/party/CreateModal.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CreateModal from '~/components/party/CreateModal.vue'
import type { PartyListItem } from '~/types'

const mockParty: PartyListItem = {
  id: 1,
  name: 'Dragon Heist Campaign',
  description: 'Weekly Thursday game',
  character_count: 4,
  created_at: '2025-01-01T00:00:00Z'
}

interface CreateModalVM {
  localName: string
  localDescription: string
  canSave: boolean
  handleSave: () => void
  handleCancel: () => void
}

describe('PartyCreateModal', () => {
  describe('create mode', () => {
    it('uses "New Party" title in create mode', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM & { modalTitle: string }
      expect(vm.modalTitle).toBe('New Party')
    })

    it('has empty form fields in create mode', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM
      expect(vm.localName).toBe('')
      expect(vm.localDescription).toBe('')
    })

    it('uses "Create" button label in create mode', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM & { saveButtonLabel: string }
      expect(vm.saveButtonLabel).toBe('Create')
    })

    it('disables save when name is empty', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM
      expect(vm.canSave).toBe(false)
    })

    it('enables save when name is provided', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM
      vm.localName = 'New Campaign'
      await wrapper.vm.$nextTick()
      expect(vm.canSave).toBe(true)
    })

    it('emits save with form data', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM
      vm.localName = 'New Campaign'
      vm.localDescription = 'A description'

      vm.handleSave()

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')![0]).toEqual([{
        name: 'New Campaign',
        description: 'A description'
      }])
    })
  })

  describe('edit mode', () => {
    it('uses "Edit Party" title in edit mode', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: mockParty }
      })
      const vm = wrapper.vm as unknown as CreateModalVM & { modalTitle: string }
      expect(vm.modalTitle).toBe('Edit Party')
    })

    it('populates form with party data when open changes', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: false, party: mockParty }
      })

      // Trigger the watch by opening the modal
      await wrapper.setProps({ open: true })
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as unknown as CreateModalVM
      expect(vm.localName).toBe('Dragon Heist Campaign')
      expect(vm.localDescription).toBe('Weekly Thursday game')
    })

    it('uses "Save" button label in edit mode', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: mockParty }
      })
      const vm = wrapper.vm as unknown as CreateModalVM & { saveButtonLabel: string }
      expect(vm.saveButtonLabel).toBe('Save')
    })
  })

  describe('cancel action', () => {
    it('emits update:open false on cancel', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: true, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })
  })

  describe('state reset', () => {
    it('resets form when modal opens', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: false, party: null }
      })
      const vm = wrapper.vm as unknown as CreateModalVM
      vm.localName = 'Some leftover value'

      await wrapper.setProps({ open: true })
      await wrapper.vm.$nextTick()

      expect(vm.localName).toBe('')
    })

    it('populates form when opening with party', async () => {
      const wrapper = await mountSuspended(CreateModal, {
        props: { open: false, party: null }
      })

      await wrapper.setProps({ open: true, party: mockParty })
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as unknown as CreateModalVM
      expect(vm.localName).toBe('Dragon Heist Campaign')
    })
  })
})
