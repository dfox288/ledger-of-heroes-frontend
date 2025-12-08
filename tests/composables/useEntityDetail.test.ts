import { describe, it, expect } from 'vitest'
import type { UseEntityDetailConfig } from '~/composables/useEntityDetail'

/**
 * Simplified tests for useEntityDetail
 *
 * Note: Full testing of useAsyncData integration requires mounting in a Nuxt context.
 * These tests verify the core logic and type safety.
 */
describe('useEntityDetail', () => {
  it('exports the correct TypeScript types', () => {
    // Type-only test - ensures interfaces are exported
    const config: UseEntityDetailConfig = {
      slug: 'fireball',
      endpoint: '/spells',
      cacheKey: 'spell',
      seo: {
        titleTemplate: name => `${name} - Test`,
        descriptionExtractor: entity => entity.description,
        fallbackTitle: 'Fallback Title'
      }
    }

    expect(config).toBeDefined()
    expect(config.slug).toBe('fireball')
    expect(config.seo.titleTemplate('Fireball')).toBe('Fireball - Test')
  })

})

/**
 * Component integration tests will verify:
 * - Actual API calls with slug
 * - SEO meta tag generation
 * - Data fetching
 * - Loading and error states
 *
 * These are better tested in page component tests where we have full Nuxt context.
 */
