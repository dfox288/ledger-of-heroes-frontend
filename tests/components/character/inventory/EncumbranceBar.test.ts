// tests/components/character/inventory/EncumbranceBar.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EncumbranceBar from '~/components/character/inventory/EncumbranceBar.vue'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  })
}

vi.stubGlobal('localStorage', localStorageMock)

describe('EncumbranceBar', () => {
  beforeEach(() => {
    localStorageMock.clear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('displays current weight and capacity when enabled', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 45, carryingCapacity: 150, publicId: 'test-123' }
    })

    expect(wrapper.text()).toContain('45')
    expect(wrapper.text()).toContain('150')
    expect(wrapper.text()).toContain('lbs')
  })

  it('shows green bar when under 66% capacity', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 50, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-success')
  })

  it('shows yellow bar when between 67-99% capacity', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 120, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-warning')
  })

  it('shows red bar when at or over capacity', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 160, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-error')
  })

  it('persists toggle state to localStorage', async () => {
    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 45, carryingCapacity: 150, publicId: 'test-123' }
    })

    // Toggle should be visible
    const toggle = wrapper.find('[data-testid="encumbrance-toggle"]')
    expect(toggle.exists()).toBe(true)

    // Click to enable
    await toggle.trigger('click')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'encumbrance-tracking-test-123',
      'true'
    )
  })

  it('reads initial state from localStorage', async () => {
    // Pre-set localStorage to enabled
    localStorageMock.store['encumbrance-tracking-test-456'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 45, carryingCapacity: 150, publicId: 'test-456' }
    })

    // Should show the weight (only visible when enabled)
    expect(wrapper.text()).toContain('45')
    expect(wrapper.text()).toContain('150')
  })

  it('shows hidden message when disabled', async () => {
    // localStorage not set = disabled by default
    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 45, carryingCapacity: 150, publicId: 'test-789' }
    })

    // Should show "Show" button and hint message
    expect(wrapper.text()).toContain('Show')
  })

  it('calculates percentage correctly and caps at 100%', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 200, carryingCapacity: 150, publicId: 'test-123' }
    })

    // Bar should be 100% width even though over capacity
    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.attributes('style')).toContain('width: 100%')
  })
})
