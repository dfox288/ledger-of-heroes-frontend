// tests/composables/useHpCalculations.test.ts
import { describe, it, expect } from 'vitest'
import { applyHpDelta, applyTempHp } from '~/composables/useHpCalculations'

describe('useHpCalculations', () => {
  // =========================================================================
  // applyHpDelta - Damage Tests
  // =========================================================================

  describe('applyHpDelta - damage', () => {
    it('subtracts damage from current HP when no temp HP', () => {
      const result = applyHpDelta({
        delta: -10,
        currentHp: 40,
        maxHp: 50,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(30)
      expect(result.newTempHp).toBe(0)
    })

    it('absorbs damage with temp HP first', () => {
      const result = applyHpDelta({
        delta: -5,
        currentHp: 40,
        maxHp: 50,
        tempHp: 8
      })

      // 5 damage absorbed by temp HP
      expect(result.newCurrentHp).toBe(40)
      expect(result.newTempHp).toBe(3)
    })

    it('overflows damage to current HP after temp HP depleted', () => {
      const result = applyHpDelta({
        delta: -12,
        currentHp: 40,
        maxHp: 50,
        tempHp: 8
      })

      // 8 temp HP absorbs first, 4 overflow to current HP
      expect(result.newCurrentHp).toBe(36)
      expect(result.newTempHp).toBe(0)
    })

    it('floors HP at 0 (no negative HP)', () => {
      const result = applyHpDelta({
        delta: -100,
        currentHp: 40,
        maxHp: 50,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(0)
      expect(result.newTempHp).toBe(0)
    })

    it('floors HP at 0 even with temp HP', () => {
      const result = applyHpDelta({
        delta: -100,
        currentHp: 40,
        maxHp: 50,
        tempHp: 10
      })

      expect(result.newCurrentHp).toBe(0)
      expect(result.newTempHp).toBe(0)
    })

    it('handles exact temp HP depletion', () => {
      const result = applyHpDelta({
        delta: -8,
        currentHp: 40,
        maxHp: 50,
        tempHp: 8
      })

      expect(result.newCurrentHp).toBe(40)
      expect(result.newTempHp).toBe(0)
    })

    it('handles 1 damage with temp HP', () => {
      const result = applyHpDelta({
        delta: -1,
        currentHp: 40,
        maxHp: 50,
        tempHp: 5
      })

      expect(result.newCurrentHp).toBe(40)
      expect(result.newTempHp).toBe(4)
    })
  })

  // =========================================================================
  // applyHpDelta - Healing Tests
  // =========================================================================

  describe('applyHpDelta - healing', () => {
    it('adds healing to current HP', () => {
      const result = applyHpDelta({
        delta: 10,
        currentHp: 30,
        maxHp: 50,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(40)
      expect(result.newTempHp).toBe(0)
    })

    it('caps healing at max HP', () => {
      const result = applyHpDelta({
        delta: 100,
        currentHp: 40,
        maxHp: 50,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(50)
      expect(result.newTempHp).toBe(0)
    })

    it('healing does not affect temp HP', () => {
      const result = applyHpDelta({
        delta: 10,
        currentHp: 30,
        maxHp: 50,
        tempHp: 8
      })

      expect(result.newCurrentHp).toBe(40)
      expect(result.newTempHp).toBe(8) // Unchanged
    })

    it('handles healing when already at max HP', () => {
      const result = applyHpDelta({
        delta: 10,
        currentHp: 50,
        maxHp: 50,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(50)
      expect(result.newTempHp).toBe(0)
    })

    it('handles healing from 0 HP', () => {
      const result = applyHpDelta({
        delta: 5,
        currentHp: 0,
        maxHp: 50,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(5)
      expect(result.newTempHp).toBe(0)
    })

    it('handles 1 HP healing', () => {
      const result = applyHpDelta({
        delta: 1,
        currentHp: 49,
        maxHp: 50,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(50)
      expect(result.newTempHp).toBe(0)
    })
  })

  // =========================================================================
  // applyHpDelta - Zero Delta Tests
  // =========================================================================

  describe('applyHpDelta - zero delta', () => {
    it('returns unchanged values for zero delta', () => {
      const result = applyHpDelta({
        delta: 0,
        currentHp: 40,
        maxHp: 50,
        tempHp: 5
      })

      expect(result.newCurrentHp).toBe(40)
      expect(result.newTempHp).toBe(5)
    })
  })

  // =========================================================================
  // applyTempHp Tests
  // =========================================================================

  describe('applyTempHp', () => {
    it('sets temp HP when none exists', () => {
      const result = applyTempHp({
        newTempHp: 10,
        currentTempHp: 0
      })

      expect(result).toBe(10)
    })

    it('keeps higher value when new is greater', () => {
      const result = applyTempHp({
        newTempHp: 15,
        currentTempHp: 10
      })

      expect(result).toBe(15)
    })

    it('keeps existing value when current is greater', () => {
      const result = applyTempHp({
        newTempHp: 5,
        currentTempHp: 10
      })

      expect(result).toBe(10)
    })

    it('keeps existing value when equal', () => {
      const result = applyTempHp({
        newTempHp: 10,
        currentTempHp: 10
      })

      expect(result).toBe(10)
    })

    it('replaces with same value (no change)', () => {
      const result = applyTempHp({
        newTempHp: 8,
        currentTempHp: 8
      })

      expect(result).toBe(8)
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('handles very large damage', () => {
      const result = applyHpDelta({
        delta: -9999,
        currentHp: 100,
        maxHp: 100,
        tempHp: 50
      })

      expect(result.newCurrentHp).toBe(0)
      expect(result.newTempHp).toBe(0)
    })

    it('handles very large healing', () => {
      const result = applyHpDelta({
        delta: 9999,
        currentHp: 1,
        maxHp: 100,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(100)
      expect(result.newTempHp).toBe(0)
    })

    it('handles character with 1 max HP (familiar)', () => {
      const result = applyHpDelta({
        delta: -2,
        currentHp: 1,
        maxHp: 1,
        tempHp: 0
      })

      expect(result.newCurrentHp).toBe(0)
      expect(result.newTempHp).toBe(0)
    })

    it('handles very high temp HP', () => {
      const result = applyHpDelta({
        delta: -50,
        currentHp: 40,
        maxHp: 40,
        tempHp: 100
      })

      expect(result.newCurrentHp).toBe(40)
      expect(result.newTempHp).toBe(50)
    })
  })
})
