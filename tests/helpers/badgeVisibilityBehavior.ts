import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Component } from 'vue'

/**
 * Configuration for a single badge visibility test
 */
interface BadgeConfig {
  /** Text shown in the badge (e.g., 'Concentration', 'Magic') */
  badgeText: string
  /** Field name in the entity prop (e.g., 'needs_concentration', 'is_magic') */
  propField: string
  /** Optional data-testid for more precise selector (not currently used) */
  dataTestId?: string
}

/**
 * Generates standardized badge visibility tests for entity cards.
 *
 * Creates two tests per badge:
 * 1. Shows badge when condition is true
 * 2. Hides badge when condition is false
 *
 * @param component - Vue component to test (e.g., SpellCard, ItemCard)
 * @param createMock - Factory function to create mock entity data
 * @param propName - Name of the entity prop (e.g., 'spell', 'item')
 * @param badges - Array of badge configurations to test
 *
 * @example
 * ```typescript
 * testBadgeVisibility(
 *   SpellCard,
 *   createMockSpell,
 *   'spell',
 *   [
 *     { badgeText: 'Concentration', propField: 'needs_concentration' },
 *     { badgeText: 'Ritual', propField: 'is_ritual' }
 *   ]
 * )
 * ```
 */
export function testBadgeVisibility<T extends Record<string, any>>(
  component: Component,
  createMock: (overrides?: Partial<T>) => T,
  propName: string,
  badges: BadgeConfig[]
) {
  describe('Badge visibility', () => {
    badges.forEach(({ badgeText, propField }) => {
      it(`shows ${badgeText} badge when ${propField} is true`, async () => {
        const mockEntity = createMock({ [propField]: true } as Partial<T>)
        const wrapper = await mountSuspended(component, {
          props: { [propName]: mockEntity }
        })

        expect(wrapper.text()).toContain(badgeText)
      })

      it(`hides ${badgeText} badge when ${propField} is false`, async () => {
        const mockEntity = createMock({ [propField]: false } as Partial<T>)
        const wrapper = await mountSuspended(component, {
          props: { [propName]: mockEntity }
        })

        expect(wrapper.text()).not.toContain(badgeText)
      })
    })
  })
}
