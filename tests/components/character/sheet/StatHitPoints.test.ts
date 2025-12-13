// tests/components/character/sheet/StatHitPoints.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatHitPoints from '~/components/character/sheet/StatHitPoints.vue'

const mockHitPoints = { current: 22, max: 28, temporary: 5 }
const zeroHp = { current: 0, max: 28, temporary: 0 }

describe('StatHitPoints', () => {
  describe('basic display', () => {
    it('displays "HP" label when healthy', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints }
      })
      expect(wrapper.text()).toContain('HP')
    })

    it('displays current/max HP', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints }
      })
      expect(wrapper.text()).toContain('22')
      expect(wrapper.text()).toContain('28')
    })

    it('displays temporary HP when present', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints }
      })
      expect(wrapper.text()).toContain('+5')
      expect(wrapper.text()).toContain('temp')
    })

    it('hides temporary HP when zero', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: { current: 20, max: 28, temporary: 0 } }
      })
      expect(wrapper.text()).not.toContain('temp')
    })

    it('has data-testid="hp-cell"', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints }
      })
      expect(wrapper.find('[data-testid="hp-cell"]').exists()).toBe(true)
    })

    it('has expected visual structure (rounded card)', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints }
      })
      expect(wrapper.find('.rounded-lg').exists()).toBe(true)
    })
  })

  describe('death states', () => {
    it('shows "DYING" label when at 0 HP', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp }
      })
      expect(wrapper.text()).toContain('DYING')
    })

    it('shows "DEAD" label when is_dead is true', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp, isDead: true }
      })
      expect(wrapper.text()).toContain('DEAD')
    })

    it('shows "STABLE" label when stabilized (3 successes)', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp, deathSaveSuccesses: 3 }
      })
      expect(wrapper.text()).toContain('STABLE')
    })

    it('uses is_dead prop over death save calculation', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: {
          hitPoints: zeroHp,
          isDead: false,
          deathSaveFailures: 3 // Should be overridden by isDead
        }
      })
      // Should NOT show DEAD since isDead is explicitly false
      expect(wrapper.text()).not.toContain('DEAD')
    })

    it('falls back to death save calculation when isDead is null', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: {
          hitPoints: zeroHp,
          isDead: null, // Explicitly null to indicate "not set"
          deathSaveFailures: 3
        }
      })
      expect(wrapper.text()).toContain('DEAD')
    })

    it('applies error styling when dying', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      expect(cell.classes().some(c => c.includes('error'))).toBe(true)
    })

    it('applies info styling when stabilized', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp, deathSaveSuccesses: 3 }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      expect(cell.classes().some(c => c.includes('info'))).toBe(true)
    })

    it('applies dark styling when dead', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp, isDead: true }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      expect(cell.classes().some(c => c.includes('gray-900') || c.includes('black'))).toBe(true)
    })
  })

  describe('editable mode', () => {
    it('has cursor-pointer when editable and not at zero HP', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints, editable: true }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      expect(cell.classes()).toContain('cursor-pointer')
    })

    it('has cursor-pointer when editable and dying (for healing)', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp, editable: true }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      expect(cell.classes()).toContain('cursor-pointer')
    })

    it('does not have cursor-pointer when not editable', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints, editable: false }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      expect(cell.classes()).not.toContain('cursor-pointer')
    })

    it('shows Add Temp HP button when editable and not at zero HP', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints, editable: true }
      })
      expect(wrapper.find('[data-testid="add-temp-hp-btn"]').exists()).toBe(true)
    })

    it('hides Add Temp HP button when at zero HP', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: zeroHp, editable: true }
      })
      expect(wrapper.find('[data-testid="add-temp-hp-btn"]').exists()).toBe(false)
    })

    it('hides Add Temp HP button when not editable', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints, editable: false }
      })
      expect(wrapper.find('[data-testid="add-temp-hp-btn"]').exists()).toBe(false)
    })
  })

  describe('click events', () => {
    it('emits hp-click when HP cell clicked in editable mode', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints, editable: true }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      await cell.trigger('click')
      expect(wrapper.emitted('hp-click')).toBeTruthy()
    })

    it('does not emit hp-click when not editable', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints, editable: false }
      })
      const cell = wrapper.find('[data-testid="hp-cell"]')
      await cell.trigger('click')
      expect(wrapper.emitted('hp-click')).toBeFalsy()
    })

    it('emits temp-hp-click when Add Temp HP button clicked', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: mockHitPoints, editable: true }
      })
      const btn = wrapper.find('[data-testid="add-temp-hp-btn"]')
      await btn.trigger('click')
      expect(wrapper.emitted('temp-hp-click')).toBeTruthy()
    })
  })

  describe('placeholder handling', () => {
    it('handles null hitPoints gracefully', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: null }
      })
      expect(wrapper.text()).toContain('—')
    })

    it('handles missing current/max gracefully', async () => {
      const wrapper = await mountSuspended(StatHitPoints, {
        props: { hitPoints: { current: null, max: null, temporary: 0 } as any }
      })
      expect(wrapper.text()).toContain('—')
    })
  })
})
