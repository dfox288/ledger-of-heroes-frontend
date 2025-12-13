// tests/components/character/ImportModal.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ImportModal from '~/components/character/ImportModal.vue'

// Valid export data structure
const validExportData = {
  format_version: '1.1',
  exported_at: '2025-12-13T08:50:20+00:00',
  character: {
    public_id: 'arcane-grove-10QL',
    name: 'Test Character',
    race: 'phb:human',
    ability_scores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }
  }
}

// Component VM type for accessing internal state
interface ImportModalVM {
  activeTab: string
  selectedFile: File | null
  pastedJson: string
  error: string | null
  parsedData: unknown
  canImport: boolean
  validateAndParse: () => void
  handleImport: () => void
  handleCancel: () => void
}

describe('CharacterImportModal', () => {
  describe('initial state', () => {
    it('initializes with empty state', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM

      // Core state should be empty/null
      expect(vm.selectedFile).toBeNull()
      expect(vm.pastedJson).toBe('')
      expect(vm.error).toBeNull()
      expect(vm.parsedData).toBeNull()
      expect(vm.canImport).toBe(false)
    })
  })

  describe('validation', () => {
    it('sets error when JSON is invalid', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = 'not valid json {'
      vm.validateAndParse()

      expect(vm.error).toBe('Invalid JSON format')
      expect(vm.parsedData).toBeNull()
      expect(vm.canImport).toBe(false)
    })

    it('sets error when format_version is missing', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = JSON.stringify({ character: { name: 'Test' } })
      vm.validateAndParse()

      expect(vm.error).toBe('Missing format version')
      expect(vm.parsedData).toBeNull()
      expect(vm.canImport).toBe(false)
    })

    it('sets error when character data is missing', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = JSON.stringify({ format_version: '1.1' })
      vm.validateAndParse()

      expect(vm.error).toBe('Missing character data')
      expect(vm.parsedData).toBeNull()
      expect(vm.canImport).toBe(false)
    })

    it('parses valid JSON successfully', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = JSON.stringify(validExportData)
      vm.validateAndParse()

      expect(vm.error).toBeNull()
      expect(vm.parsedData).toEqual(validExportData)
      expect(vm.canImport).toBe(true)
    })

    it('clears error when valid JSON replaces invalid', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM

      // First enter invalid
      vm.pastedJson = 'invalid'
      vm.validateAndParse()
      expect(vm.error).toBeTruthy()

      // Then enter valid
      vm.pastedJson = JSON.stringify(validExportData)
      vm.validateAndParse()
      expect(vm.error).toBeNull()
      expect(vm.canImport).toBe(true)
    })

    it('handles empty input gracefully', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = ''
      vm.validateAndParse()

      expect(vm.error).toBeNull()
      expect(vm.parsedData).toBeNull()
      expect(vm.canImport).toBe(false)
    })

    it('handles whitespace-only input gracefully', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = '   \n\t  '
      vm.validateAndParse()

      expect(vm.error).toBeNull()
      expect(vm.parsedData).toBeNull()
      expect(vm.canImport).toBe(false)
    })
  })

  describe('import action', () => {
    it('emits import event with parsed data', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = JSON.stringify(validExportData)
      vm.validateAndParse()

      vm.handleImport()

      expect(wrapper.emitted('import')).toBeTruthy()
      expect(wrapper.emitted('import')![0]).toEqual([validExportData])
    })

    it('emits update:open false after import', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = JSON.stringify(validExportData)
      vm.validateAndParse()

      vm.handleImport()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })

    it('does nothing when no valid data', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      // No data set

      vm.handleImport()

      expect(wrapper.emitted('import')).toBeFalsy()
    })
  })

  describe('cancel action', () => {
    it('emits update:open false', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.handleCancel()

      expect(wrapper.emitted('update:open')).toBeTruthy()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })
  })

  describe('state reset', () => {
    it('resets all state when modal opens', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: false }
      })

      const vm = wrapper.vm as unknown as ImportModalVM

      // Set some state
      vm.pastedJson = 'some json'
      vm.error = 'some error'

      // Open modal
      await wrapper.setProps({ open: true })
      await wrapper.vm.$nextTick()

      // State should be reset (activeTab value depends on UTabs implementation)
      expect(vm.pastedJson).toBe('')
      expect(vm.selectedFile).toBeNull()
      expect(vm.error).toBeNull()
      expect(vm.parsedData).toBeNull()
    })
  })

  describe('canImport computed', () => {
    it('is false when parsedData is null', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      expect(vm.canImport).toBe(false)
    })

    it('is false when error exists', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = 'invalid json'
      vm.validateAndParse()

      expect(vm.error).toBeTruthy()
      expect(vm.canImport).toBe(false)
    })

    it('is true when valid data and no error', async () => {
      const wrapper = await mountSuspended(ImportModal, {
        props: { open: true }
      })

      const vm = wrapper.vm as unknown as ImportModalVM
      vm.pastedJson = JSON.stringify(validExportData)
      vm.validateAndParse()

      expect(vm.canImport).toBe(true)
    })
  })
})
