import { describe, it, expect } from 'vitest'
import { ordinal } from '~/utils/ordinal'

describe('ordinal', () => {
  it('formats 1st, 2nd, 3rd correctly', () => {
    expect(ordinal(1)).toBe('1st')
    expect(ordinal(2)).toBe('2nd')
    expect(ordinal(3)).toBe('3rd')
  })

  it('formats 4th through 9th with th suffix', () => {
    expect(ordinal(4)).toBe('4th')
    expect(ordinal(5)).toBe('5th')
    expect(ordinal(6)).toBe('6th')
    expect(ordinal(7)).toBe('7th')
    expect(ordinal(8)).toBe('8th')
    expect(ordinal(9)).toBe('9th')
  })

  it('handles teens (11th, 12th, 13th) correctly', () => {
    expect(ordinal(11)).toBe('11th')
    expect(ordinal(12)).toBe('12th')
    expect(ordinal(13)).toBe('13th')
  })

  it('handles 21st, 22nd, 23rd correctly', () => {
    expect(ordinal(21)).toBe('21st')
    expect(ordinal(22)).toBe('22nd')
    expect(ordinal(23)).toBe('23rd')
  })

  it('handles edge cases', () => {
    expect(ordinal(0)).toBe('0th')
    expect(ordinal(10)).toBe('10th')
    expect(ordinal(100)).toBe('100th')
    expect(ordinal(101)).toBe('101st')
    expect(ordinal(111)).toBe('111th')
    expect(ordinal(112)).toBe('112th')
    expect(ordinal(113)).toBe('113th')
  })
})
