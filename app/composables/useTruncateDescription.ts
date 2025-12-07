import type { MaybeRef } from 'vue'

/**
 * Truncates a description string to a maximum length with ellipsis.
 *
 * @param description - The description to truncate (can be ref or raw value)
 * @param maxLength - Maximum character length before truncation (default: 150)
 * @param fallback - Value to return if description is empty/undefined (default: '')
 * @returns Computed ref with truncated description
 *
 * @example
 * const truncated = useTruncateDescription(computed(() => props.spell.description))
 * // or with options
 * const truncated = useTruncateDescription(toRef(props, 'description'), 200, 'No description')
 */
export function useTruncateDescription(
  description: MaybeRef<string | undefined | null>,
  maxLength: number = 150,
  fallback: string = ''
) {
  return computed(() => {
    const desc = toValue(description)
    if (!desc) return fallback
    if (desc.length <= maxLength) return desc
    return desc.substring(0, maxLength).trim() + '...'
  })
}
