import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

// Import all 7 main entity card components
import SpellCard from '~/components/spell/SpellCard.vue'
import ItemCard from '~/components/item/ItemCard.vue'
import MonsterCard from '~/components/monster/MonsterCard.vue'
import ClassCard from '~/components/class/ClassCard.vue'
import RaceCard from '~/components/race/RaceCard.vue'
import BackgroundCard from '~/components/background/BackgroundCard.vue'
import FeatCard from '~/components/feat/FeatCard.vue'

// Import mock factories
import {
  createMockSpell,
  createMockItem,
  createMockMonster,
  createMockClass,
  createMockRace,
  createMockBackground,
  createMockFeat
} from '../../helpers/mockFactories'

/**
 * Consolidated card behavior tests for all main entity cards.
 *
 * Tests shared behavior across all 7 entity card components:
 * - SpellCard, ItemCard, MonsterCard, ClassCard, RaceCard, BackgroundCard, FeatCard
 *
 * Each card is tested with a SINGLE mount per behavior, eliminating redundant mounts
 * across individual test files.
 *
 * Behaviors tested:
 * 1. Link to detail page with correct slug
 * 2. Hover transition effects
 * 3. Border styling
 * 4. Accessibility (proper link structure)
 */

const cardConfigs = [
  {
    name: 'SpellCard',
    component: SpellCard,
    props: { spell: createMockSpell() },
    expectedLink: '/spells/fireball'
  },
  {
    name: 'ItemCard',
    component: ItemCard,
    props: { item: createMockItem() },
    expectedLink: '/items/longsword'
  },
  {
    name: 'MonsterCard',
    component: MonsterCard,
    props: { monster: createMockMonster() },
    expectedLink: '/monsters/ancient-red-dragon'
  },
  {
    name: 'ClassCard',
    component: ClassCard,
    props: { characterClass: createMockClass() },
    expectedLink: '/classes/wizard'
  },
  {
    name: 'RaceCard',
    component: RaceCard,
    props: { race: createMockRace() },
    expectedLink: '/races/elf'
  },
  {
    name: 'BackgroundCard',
    component: BackgroundCard,
    props: { background: createMockBackground() },
    expectedLink: '/backgrounds/acolyte'
  },
  {
    name: 'FeatCard',
    component: FeatCard,
    props: { feat: createMockFeat() },
    expectedLink: '/feats/war-caster'
  }
]

describe('Shared Card Behavior', () => {
  describe.each(cardConfigs)('$name', ({ component, props, expectedLink }) => {
    it('renders as clickable link to detail page with correct slug', async () => {
      const wrapper = await mountSuspended(component, { props })
      const link = wrapper.find('a')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe(expectedLink)
    })

    it('applies hover transition effects for interactivity', async () => {
      const wrapper = await mountSuspended(component, { props })
      const html = wrapper.html()
      // All cards use transition-shadow and hover:shadow-lg
      expect(html).toContain('hover')
      expect(html).toContain('transition')
    })

    it('uses card component with proper border styling', async () => {
      const wrapper = await mountSuspended(component, { props })
      const html = wrapper.html()
      // All cards have border-2 with entity-specific colors
      expect(html).toContain('border')
      expect(html).toContain('border-2')
    })

    it('has proper link structure for accessibility', async () => {
      const wrapper = await mountSuspended(component, { props })
      const link = wrapper.find('a')
      // Link should wrap the entire card for full-card clickability
      expect(link.exists()).toBe(true)
      expect(link.classes()).toContain('block')
      // Link should have proper href attribute
      expect(link.attributes('href')).toBe(expectedLink)
    })
  })
})
