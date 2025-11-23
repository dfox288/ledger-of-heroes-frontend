import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Tests to verify search.vue has monster support
describe('Search Page - Monster Filter Support', () => {
  it('should include Monsters in filterOptions', () => {
    // Read the actual search.vue file
    const searchPagePath = join(process.cwd(), 'app/pages/search.vue')
    const searchPageContent = readFileSync(searchPagePath, 'utf-8')

    // Check if Monsters filter is in the filterOptions
    // Look for the line: { label: `Monsters (${getCount('monsters')})`, value: 'monsters', disabled: getCount('monsters') === 0 }
    const hasMonsterFilter = searchPageContent.includes('Monsters (') && searchPageContent.includes("value: 'monsters'")

    expect(hasMonsterFilter).toBe(true)
  })

  it('should include monster in getFilterColor mapping', () => {
    // Read the actual search.vue file
    const searchPagePath = join(process.cwd(), 'app/pages/search.vue')
    const searchPageContent = readFileSync(searchPagePath, 'utf-8')

    // Check if monsters: 'monster' is in the entityColors mapping
    const hasMonsterColor = searchPageContent.includes("monsters: 'monster'")

    expect(hasMonsterColor).toBe(true)
  })
})
