import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Spell List Generator Page', () => {
  const pageContent = readFileSync(
    join(process.cwd(), 'app/pages/spells/list-generator.vue'),
    'utf-8'
  )

  it('renders the page with heading', () => {
    expect(pageContent).toContain('<h1')
    expect(pageContent).toContain('Spell List Generator')
  })

  it('displays class and level dropdowns', () => {
    // Check for both USelectMenu components (class and level dropdowns)
    const selectMenuCount = (pageContent.match(/USelectMenu/g) || []).length
    expect(selectMenuCount).toBeGreaterThanOrEqual(2)

    // Verify the dropdowns have proper labels
    expect(pageContent).toContain('Class')
    expect(pageContent).toContain('Level')
  })

  it('uses Meilisearch filter syntax instead of deprecated MySQL params', () => {
    // Should use: filter=class_slugs IN [...]
    // Should NOT use: classes=...
    expect(pageContent).toContain('filter=')
    expect(pageContent).toContain('class_slugs IN')
    expect(pageContent).not.toContain('classes=${selectedClass')
  })

  it('uses correct API field names (needs_concentration, is_ritual)', () => {
    // Should check: needs_concentration (not concentration)
    // Should check: is_ritual (not ritual)
    expect(pageContent).toContain('needs_concentration')
    expect(pageContent).toContain('is_ritual')

    // Should NOT check deprecated fields
    expect(pageContent).not.toContain('spell.concentration')
    expect(pageContent).not.toContain('spell.ritual')
  })

  it('displays component requirement badges (V/S/M)', () => {
    // Should show verbal, somatic, material badges
    expect(pageContent).toContain('requires_verbal')
    expect(pageContent).toContain('requires_somatic')
    expect(pageContent).toContain('requires_material')
  })
})
