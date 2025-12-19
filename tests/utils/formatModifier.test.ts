import { describe, it, expect } from 'vitest'
import { formatModifier } from '~/utils/formatModifier'

describe('formatModifier', () => {
  it('formats positive modifiers with + prefix', () => {
    expect(formatModifier(1)).toBe('+1')
    expect(formatModifier(5)).toBe('+5')
    expect(formatModifier(10)).toBe('+10')
  })

  it('formats zero with + prefix', () => {
    expect(formatModifier(0)).toBe('+0')
  })

  it('formats negative modifiers without prefix', () => {
    expect(formatModifier(-1)).toBe('-1')
    expect(formatModifier(-3)).toBe('-3')
  })

  it('handles null by returning em dash', () => {
    expect(formatModifier(null)).toBe('—')
  })

  it('handles undefined by returning em dash', () => {
    expect(formatModifier(undefined)).toBe('—')
  })
})
