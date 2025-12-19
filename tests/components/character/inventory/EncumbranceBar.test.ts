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

  // D&D 5e Encumbrance thresholds (PHB p.176):
  // - Green (OK): 0-33% of carrying capacity (under STR × 5)
  // - Yellow (Encumbered): 33-66% (STR × 5 to STR × 10) - Speed -10ft
  // - Red (Heavily Encumbered): 66%+ (over STR × 10) - Speed -20ft, disadvantage

  it('shows green bar when under 33% capacity (not encumbered)', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    // 45/150 = 30% - under 33% threshold
    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 45, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-success')
  })

  it('shows yellow bar when between 33-66% capacity (encumbered)', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    // 75/150 = 50% - between 33% and 66%
    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 75, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-warning')
  })

  it('shows red bar when at or over 66% capacity (heavily encumbered)', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    // 100/150 = 66.67% - over 66% threshold
    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 100, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-error')
  })

  it('shows yellow at exactly 33% threshold', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    // 49.5/150 = 33% exactly
    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 49.5, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-warning')
  })

  it('shows red at exactly 66% threshold', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    // 99/150 = 66% exactly
    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 99, carryingCapacity: 150, publicId: 'test-123' }
    })

    const bar = wrapper.find('[data-testid="encumbrance-fill"]')
    expect(bar.classes()).toContain('bg-error')
  })

  it('displays "Encumbered" status label when between 33-66%', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 75, carryingCapacity: 150, publicId: 'test-123' }
    })

    const status = wrapper.find('[data-testid="encumbrance-status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('Encumbered')
  })

  it('displays "Heavily Encumbered" status label when over 66%', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 100, carryingCapacity: 150, publicId: 'test-123' }
    })

    const status = wrapper.find('[data-testid="encumbrance-status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('Heavily Encumbered')
  })

  it('does not display status label when under 33%', async () => {
    localStorageMock.store['encumbrance-tracking-test-123'] = 'true'

    const wrapper = await mountSuspended(EncumbranceBar, {
      props: { currentWeight: 30, carryingCapacity: 150, publicId: 'test-123' }
    })

    const status = wrapper.find('[data-testid="encumbrance-status"]')
    expect(status.exists()).toBe(false)
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
