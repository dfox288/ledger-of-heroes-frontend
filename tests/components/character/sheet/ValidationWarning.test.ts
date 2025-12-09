// tests/components/character/sheet/ValidationWarning.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ValidationWarning from '~/components/character/sheet/ValidationWarning.vue'

const mockValidResult = {
  valid: true,
  dangling_references: { items: [] },
  summary: {
    total_references: 5,
    valid_references: 5,
    dangling_count: 0
  }
}

const mockInvalidResult = {
  valid: false,
  dangling_references: {
    items: [
      'custom:removed-race',
      'homebrew:deleted-class'
    ]
  },
  summary: {
    total_references: 5,
    valid_references: 3,
    dangling_count: 2
  }
}

describe('CharacterSheetValidationWarning', () => {
  it('renders nothing when validation result is null', async () => {
    const wrapper = await mountSuspended(ValidationWarning, {
      props: { validationResult: null }
    })
    expect(wrapper.find('[data-testid="validation-warning"]').exists()).toBe(false)
  })

  it('renders nothing when character is valid', async () => {
    const wrapper = await mountSuspended(ValidationWarning, {
      props: { validationResult: mockValidResult }
    })
    expect(wrapper.find('[data-testid="validation-warning"]').exists()).toBe(false)
  })

  it('renders warning alert when character has dangling references', async () => {
    const wrapper = await mountSuspended(ValidationWarning, {
      props: { validationResult: mockInvalidResult }
    })
    expect(wrapper.find('[data-testid="validation-warning"]').exists()).toBe(true)
  })

  it('displays title about invalid references', async () => {
    const wrapper = await mountSuspended(ValidationWarning, {
      props: { validationResult: mockInvalidResult }
    })
    expect(wrapper.text()).toContain('invalid references')
  })

  it('lists all dangling references', async () => {
    const wrapper = await mountSuspended(ValidationWarning, {
      props: { validationResult: mockInvalidResult }
    })
    expect(wrapper.text()).toContain('custom:removed-race')
    expect(wrapper.text()).toContain('homebrew:deleted-class')
  })

  it('shows count of dangling references', async () => {
    const wrapper = await mountSuspended(ValidationWarning, {
      props: { validationResult: mockInvalidResult }
    })
    // Should mention "2" somewhere since there are 2 dangling references
    expect(wrapper.text()).toMatch(/2/)
  })
})
