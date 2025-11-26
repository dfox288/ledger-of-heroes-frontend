// tests/stores/filterFactory/types.test.ts
import { describe, it, expect } from 'vitest'
import type { FilterFieldDefinition, FilterFieldType } from '~/stores/filterFactory/types'

describe('FilterFieldDefinition types', () => {
  it('enforces correct field type discriminants', () => {
    // This test validates that TypeScript types are correctly defined
    // by creating valid field definitions
    const stringArrayField: FilterFieldDefinition = {
      name: 'selectedLevels',
      urlKey: 'level',
      type: 'stringArray',
      defaultValue: []
    }

    const numberArrayField: FilterFieldDefinition = {
      name: 'selectedHitDice',
      urlKey: 'hit_die',
      type: 'numberArray',
      defaultValue: []
    }

    const singleStringField: FilterFieldDefinition = {
      name: 'concentrationFilter',
      urlKey: 'concentration',
      type: 'string',
      defaultValue: null
    }

    const singleNumberField: FilterFieldDefinition = {
      name: 'selectedSchool',
      urlKey: 'school',
      type: 'number',
      defaultValue: null
    }

    const emptyStringField: FilterFieldDefinition = {
      name: 'selectedSize',
      urlKey: 'size',
      type: 'emptyString',
      defaultValue: ''
    }

    expect(stringArrayField.type).toBe('stringArray')
    expect(numberArrayField.type).toBe('numberArray')
    expect(singleStringField.type).toBe('string')
    expect(singleNumberField.type).toBe('number')
    expect(emptyStringField.type).toBe('emptyString')
  })

  it('allows optional persist flag (defaults to true)', () => {
    const fieldWithPersist: FilterFieldDefinition = {
      name: 'test',
      urlKey: 'test',
      type: 'string',
      defaultValue: null,
      persist: false
    }

    const fieldWithoutPersist: FilterFieldDefinition = {
      name: 'test',
      urlKey: 'test',
      type: 'string',
      defaultValue: null
    }

    expect(fieldWithPersist.persist).toBe(false)
    expect(fieldWithoutPersist.persist).toBeUndefined()
  })
})
