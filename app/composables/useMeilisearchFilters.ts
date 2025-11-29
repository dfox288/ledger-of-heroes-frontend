import { computed, type Ref, type ComputedRef } from 'vue'

export type FilterType
  = | 'equals' // field = value
    | 'boolean' // field = true/false (auto-converts strings)
    | 'in' // field IN [value1, value2]
    | 'range' // field >= min AND field <= max
    | 'isEmpty' // field IS EMPTY / IS NOT EMPTY
    | 'greaterThan' // field > value
    | 'rangePreset' // field >= preset.min AND field <= preset.max

export interface FilterConfig {
  /** Vue ref containing the filter value */
  ref: Ref<any>

  /** Meilisearch field name */
  field: string

  /** Filter type (default: 'equals') */
  type?: FilterType

  /** For 'range' type: min/max refs */
  min?: Ref<number | null>
  max?: Ref<number | null>

  /** For 'rangePreset' type: preset definitions */
  presets?: Record<string, { min: number, max: number }>

  /** For 'equals' with lookup: transform value before filtering.
   * For 'in' type: receives array and should return transformed array. */
  transform?: (value: any) => string | number | null | (string | number | null)[]
}

export interface UseMeilisearchFiltersReturn {
  /** Computed params object with 'filter' property */
  queryParams: ComputedRef<Record<string, unknown>>
}

/**
 * Build Meilisearch filter params from declarative filter configs
 *
 * Handles all common filter types: equals, boolean, IN, ranges, rangePreset, isEmpty, greaterThan.
 * Auto-skips null/undefined/empty values. Combines multiple filters with AND.
 *
 * @example
 * ```typescript
 * const { queryParams } = useMeilisearchFilters([
 *   { ref: selectedLevel, field: 'level' },
 *   { ref: concentrationFilter, field: 'concentration', type: 'boolean' },
 *   { ref: selectedDamageTypes, field: 'damage_types', type: 'in' },
 *   { ref: selectedACRange, field: 'armor_class', type: 'rangePreset', presets: AC_RANGE_PRESETS }
 * ])
 *
 * // Pass directly to useEntityList
 * const { ... } = useEntityList({
 *   endpoint: '/spells',
 *   queryBuilder: queryParams,
 *   // ...
 * })
 * ```
 */
export function useMeilisearchFilters(
  filters: FilterConfig[]
): UseMeilisearchFiltersReturn {
  const queryParams = computed(() => {
    const params: Record<string, unknown> = {}
    const meilisearchFilters: string[] = []

    for (const config of filters) {
      const value = config.ref.value

      // Skip null/undefined/empty values (except for range filters which use min/max)
      if (config.type !== 'range') {
        if (value === null || value === undefined) continue
        if (value === '') continue
        if (Array.isArray(value) && value.length === 0) continue
      }

      switch (config.type || 'equals') {
        case 'equals': {
          const transformedValue = config.transform ? config.transform(value) : value
          if (transformedValue !== null && transformedValue !== undefined) {
            meilisearchFilters.push(`${config.field} = ${transformedValue}`)
          }
          break
        }

        case 'boolean': {
          const boolValue = value === '1' || value === 'true' || value === true
          meilisearchFilters.push(`${config.field} = ${boolValue}`)
          break
        }

        case 'in': {
          const values = Array.isArray(value) ? value : [value]
          if (values.length > 0) {
            // Apply transform if provided (e.g., ID to code lookup)
            const transformedValues = config.transform
              ? config.transform(values)
              : values

            // Filter out null/undefined values (e.g., from failed lookups)
            const filteredValues = (Array.isArray(transformedValues) ? transformedValues : [transformedValues])
              .filter(v => v !== null && v !== undefined)

            if (filteredValues.length === 0) break

            // Quote string values that contain spaces for Meilisearch syntax
            const quotedValues = filteredValues.map((v: any) => {
              if (typeof v === 'string' && v.includes(' ')) {
                return `"${v}"`
              }
              return v
            })

            const joined = quotedValues.join(', ')
            meilisearchFilters.push(`${config.field} IN [${joined}]`)
          }
          break
        }

        case 'range': {
          const min = config.min?.value
          const max = config.max?.value
          const conditions: string[] = []

          if (min !== null && min !== undefined) {
            conditions.push(`${config.field} >= ${min}`)
          }
          if (max !== null && max !== undefined) {
            conditions.push(`${config.field} <= ${max}`)
          }

          if (conditions.length > 0) {
            meilisearchFilters.push(conditions.join(' AND '))
          }
          break
        }

        case 'isEmpty': {
          const isEmpty = value === '1' || value === 'true' || value === true
          meilisearchFilters.push(
            isEmpty
              ? `${config.field} IS EMPTY`
              : `${config.field} IS NOT EMPTY`
          )
          break
        }

        case 'greaterThan': {
          meilisearchFilters.push(`${config.field} > ${value}`)
          break
        }

        case 'rangePreset': {
          if (config.presets && value) {
            const preset = config.presets[value as string]
            if (preset) {
              meilisearchFilters.push(`${config.field} >= ${preset.min} AND ${config.field} <= ${preset.max}`)
            }
          }
          break
        }
      }
    }

    // Combine all filters with AND
    if (meilisearchFilters.length > 0) {
      params.filter = meilisearchFilters.join(' AND ')
    }

    return params
  })

  return {
    queryParams
  }
}
