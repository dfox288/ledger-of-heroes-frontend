import { describe, it, expectTypeOf, expect } from 'vitest'
import type { CharacterClassEntry } from '~/types/character'
import type { CharacterClass } from '~/types'

describe('CharacterClassEntry type', () => {
  it('has required properties with correct types', () => {
    const entry: CharacterClassEntry = {
      classId: 1,
      subclassId: null,
      level: 1,
      isPrimary: true,
      order: 0,
      classData: null
    }

    expectTypeOf(entry.classId).toBeNumber()
    expectTypeOf(entry.subclassId).toEqualTypeOf<number | null>()
    expectTypeOf(entry.level).toBeNumber()
    expectTypeOf(entry.isPrimary).toBeBoolean()
    expectTypeOf(entry.order).toBeNumber()
    expectTypeOf(entry.classData).toEqualTypeOf<CharacterClass | null>()
  })

  it('supports optional subclassData property', () => {
    const entry: CharacterClassEntry = {
      classId: 1,
      subclassId: 2,
      level: 3,
      isPrimary: true,
      order: 0,
      classData: null,
      subclassData: null
    }

    expect(entry.subclassData).toBeDefined()
    expectTypeOf(entry.subclassData).toEqualTypeOf<any | null | undefined>()
  })
})
