/**
 * Formats a numeric modifier with + or - prefix.
 * Returns em dash (—) for null/undefined values.
 *
 * Examples:
 * - formatModifier(3)  -> "+3"
 * - formatModifier(-1) -> "-1"
 * - formatModifier(0)  -> "+0"
 * - formatModifier(null) -> "—"
 */
export function formatModifier(mod: number | null | undefined): string {
  if (mod === null || mod === undefined) return '—'
  return mod >= 0 ? `+${mod}` : `${mod}`
}
