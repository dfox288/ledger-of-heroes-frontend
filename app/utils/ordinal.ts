/**
 * Converts a number to its ordinal string representation.
 * Examples: 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th"
 */
export function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' }
  const v = n % 100
  // 11th, 12th, 13th are exceptions (not 11st, 12nd, 13rd)
  const suffix = (v >= 11 && v <= 13) ? 'th' : (suffixes[n % 10] ?? 'th')
  return n + suffix
}
