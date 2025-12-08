// tests/components/character/sheet/SpellsByLevel.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellsByLevel from '~/components/character/sheet/SpellsByLevel.vue'
import type { CharacterSpell } from '~/types/character'

describe('CharacterSheetSpellsByLevel', () => {
  const mockSpells: CharacterSpell[] = [
    // 1st level spells (mix of prepared and not prepared)
    {
      id: 1,
      spell: { name: 'Detect Magic', level: 1, slug: 'detect-magic', full_slug: 'phb:detect-magic' },
      is_prepared: true,
      is_always_prepared: false
    },
    {
      id: 2,
      spell: { name: 'Mage Armor', level: 1, slug: 'mage-armor', full_slug: 'phb:mage-armor' },
      is_prepared: true,
      is_always_prepared: false
    },
    {
      id: 3,
      spell: { name: 'Magic Missile', level: 1, slug: 'magic-missile', full_slug: 'phb:magic-missile' },
      is_prepared: true,
      is_always_prepared: false
    },
    {
      id: 4,
      spell: { name: 'Shield', level: 1, slug: 'shield', full_slug: 'phb:shield' },
      is_prepared: true,
      is_always_prepared: false
    },
    {
      id: 5,
      spell: { name: 'Charm Person', level: 1, slug: 'charm-person', full_slug: 'phb:charm-person' },
      is_prepared: false,
      is_always_prepared: false
    },
    {
      id: 6,
      spell: { name: 'Sleep', level: 1, slug: 'sleep', full_slug: 'phb:sleep' },
      is_prepared: false,
      is_always_prepared: false
    },
    // 2nd level spells
    {
      id: 7,
      spell: { name: 'Hold Person', level: 2, slug: 'hold-person', full_slug: 'phb:hold-person' },
      is_prepared: true,
      is_always_prepared: false
    },
    {
      id: 8,
      spell: { name: 'Misty Step', level: 2, slug: 'misty-step', full_slug: 'phb:misty-step' },
      is_prepared: true,
      is_always_prepared: false
    },
    {
      id: 9,
      spell: { name: 'Invisibility', level: 2, slug: 'invisibility', full_slug: 'phb:invisibility' },
      is_prepared: false,
      is_always_prepared: false
    },
    // 3rd level spell
    {
      id: 10,
      spell: { name: 'Fireball', level: 3, slug: 'fireball', full_slug: 'phb:fireball' },
      is_prepared: true,
      is_always_prepared: false
    }
  ]

  it('groups spells by level correctly', async () => {
    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: mockSpells }
    })

    // Should show three level groups
    expect(wrapper.text()).toContain('1st Level')
    expect(wrapper.text()).toContain('2nd Level')
    expect(wrapper.text()).toContain('3rd Level')
  })

  it('displays spell counts per level', async () => {
    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: mockSpells }
    })

    // 1st level: 6 spells, 4 prepared
    expect(wrapper.text()).toMatch(/1st Level.*6 spells.*4 prepared/s)
    // 2nd level: 3 spells, 2 prepared
    expect(wrapper.text()).toMatch(/2nd Level.*3 spells.*2 prepared/s)
    // 3rd level: 1 spell, 1 prepared
    expect(wrapper.text()).toMatch(/3rd Level.*1 spell.*1 prepared/s)
  })

  it('displays all spell names', async () => {
    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: mockSpells }
    })

    expect(wrapper.text()).toContain('Detect Magic')
    expect(wrapper.text()).toContain('Mage Armor')
    expect(wrapper.text()).toContain('Magic Missile')
    expect(wrapper.text()).toContain('Shield')
    expect(wrapper.text()).toContain('Charm Person')
    expect(wrapper.text()).toContain('Sleep')
    expect(wrapper.text()).toContain('Hold Person')
    expect(wrapper.text()).toContain('Misty Step')
    expect(wrapper.text()).toContain('Invisibility')
    expect(wrapper.text()).toContain('Fireball')
  })

  it('uses check icon for prepared spells', async () => {
    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: mockSpells }
    })

    const html = wrapper.html()
    // Count occurrences of check-circle icon in HTML
    const checkIconCount = (html.match(/i-heroicons-check-circle/g) || []).length
    expect(checkIconCount).toBe(7) // 7 prepared spells
  })

  it('uses circle icon for unprepared spells', async () => {
    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: mockSpells }
    })

    const html = wrapper.html()
    // Count occurrences of plain circle icon (not check-circle)
    // The component uses 'i-heroicons-circle' for unprepared spells
    const circleIconCount = (html.match(/i-heroicons-circle(?!-)/g) || []).length
    expect(circleIconCount).toBe(3) // 3 unprepared spells
  })

  it('sorts spells with prepared first, then alphabetically', async () => {
    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: mockSpells }
    })

    const text = wrapper.text()

    // Check 1st level spells: prepared spells should come first, then unprepared
    // Prepared: Detect Magic, Mage Armor, Magic Missile, Shield (alphabetically)
    // Unprepared: Charm Person, Sleep (alphabetically)
    const detectIndex = text.indexOf('Detect Magic')
    const mageIndex = text.indexOf('Mage Armor')
    const magicIndex = text.indexOf('Magic Missile')
    const shieldIndex = text.indexOf('Shield')
    const charmIndex = text.indexOf('Charm Person')
    const sleepIndex = text.indexOf('Sleep')

    // Prepared spells should come before unprepared
    expect(detectIndex).toBeLessThan(charmIndex)
    expect(shieldIndex).toBeLessThan(charmIndex)

    // Within prepared: alphabetical order
    expect(detectIndex).toBeLessThan(mageIndex)
    expect(mageIndex).toBeLessThan(magicIndex)
    expect(magicIndex).toBeLessThan(shieldIndex)

    // Within unprepared: alphabetical order
    expect(charmIndex).toBeLessThan(sleepIndex)
  })

  it('does not show levels with no spells', async () => {
    const firstLevelOnly: CharacterSpell[] = [
      {
        id: 1,
        spell: { name: 'Detect Magic', level: 1, slug: 'detect-magic', full_slug: 'phb:detect-magic' },
        is_prepared: true,
        is_always_prepared: false
      }
    ]

    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: firstLevelOnly }
    })

    expect(wrapper.text()).toContain('1st Level')
    expect(wrapper.text()).not.toContain('2nd Level')
    expect(wrapper.text()).not.toContain('3rd Level')
  })

  it('handles empty spells array', async () => {
    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: [] }
    })

    // Should render but show no level groups
    expect(wrapper.text()).not.toContain('1st Level')
    expect(wrapper.text()).not.toContain('2nd Level')
  })

  it('handles spells with null spell data (dangling references)', async () => {
    const spellsWithNull: CharacterSpell[] = [
      {
        id: 1,
        spell: { name: 'Detect Magic', level: 1, slug: 'detect-magic', full_slug: 'phb:detect-magic' },
        is_prepared: true,
        is_always_prepared: false
      },
      {
        id: 2,
        spell: null, // Dangling reference
        is_prepared: false,
        is_always_prepared: false
      } as CharacterSpell // Cast the entire object instead of just the null field
    ]

    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: spellsWithNull }
    })

    // Should filter out null spells and only show valid one
    expect(wrapper.text()).toContain('Detect Magic')
    expect(wrapper.text()).toContain('1st Level')
  })

  it('uses correct ordinal formatting for spell levels', async () => {
    const multiLevelSpells: CharacterSpell[] = [
      { id: 1, spell: { name: 'Spell 1', level: 1, slug: 's1', full_slug: 'phb:s1' }, is_prepared: true, is_always_prepared: false },
      { id: 2, spell: { name: 'Spell 2', level: 2, slug: 's2', full_slug: 'phb:s2' }, is_prepared: true, is_always_prepared: false },
      { id: 3, spell: { name: 'Spell 3', level: 3, slug: 's3', full_slug: 'phb:s3' }, is_prepared: true, is_always_prepared: false },
      { id: 4, spell: { name: 'Spell 4', level: 4, slug: 's4', full_slug: 'phb:s4' }, is_prepared: true, is_always_prepared: false },
      { id: 5, spell: { name: 'Spell 5', level: 5, slug: 's5', full_slug: 'phb:s5' }, is_prepared: true, is_always_prepared: false },
      { id: 6, spell: { name: 'Spell 9', level: 9, slug: 's9', full_slug: 'phb:s9' }, is_prepared: true, is_always_prepared: false }
    ]

    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: multiLevelSpells }
    })

    expect(wrapper.text()).toContain('1st Level')
    expect(wrapper.text()).toContain('2nd Level')
    expect(wrapper.text()).toContain('3rd Level')
    expect(wrapper.text()).toContain('4th Level')
    expect(wrapper.text()).toContain('5th Level')
    expect(wrapper.text()).toContain('9th Level')
  })

  it('displays singular "spell" for single spell counts', async () => {
    const singleSpell: CharacterSpell[] = [
      {
        id: 1,
        spell: { name: 'Fireball', level: 3, slug: 'fireball', full_slug: 'phb:fireball' },
        is_prepared: true,
        is_always_prepared: false
      }
    ]

    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: singleSpell }
    })

    // Should say "1 spell" not "1 spells"
    expect(wrapper.text()).toMatch(/3rd Level.*1 spell.*1 prepared/s)
  })

  it('maintains prepared spells first, then unprepared, both alphabetically', async () => {
    const mixedSpells: CharacterSpell[] = [
      { id: 1, spell: { name: 'Zebra Spell', level: 1, slug: 'z', full_slug: 'phb:z' }, is_prepared: false, is_always_prepared: false },
      { id: 2, spell: { name: 'Alpha Spell', level: 1, slug: 'a', full_slug: 'phb:a' }, is_prepared: true, is_always_prepared: false },
      { id: 3, spell: { name: 'Beta Spell', level: 1, slug: 'b', full_slug: 'phb:b' }, is_prepared: false, is_always_prepared: false },
      { id: 4, spell: { name: 'Gamma Spell', level: 1, slug: 'g', full_slug: 'phb:g' }, is_prepared: true, is_always_prepared: false }
    ]

    const wrapper = await mountSuspended(SpellsByLevel, {
      props: { spells: mixedSpells }
    })

    const text = wrapper.text()

    // Prepared spells should come first (alphabetically)
    const alphaIndex = text.indexOf('Alpha Spell')
    const gammaIndex = text.indexOf('Gamma Spell')
    const betaIndex = text.indexOf('Beta Spell')
    const zebraIndex = text.indexOf('Zebra Spell')

    // Prepared should be before unprepared
    expect(alphaIndex).toBeLessThan(betaIndex)
    expect(gammaIndex).toBeLessThan(betaIndex)

    // Within prepared: Alpha before Gamma
    expect(alphaIndex).toBeLessThan(gammaIndex)

    // Within unprepared: Beta before Zebra
    expect(betaIndex).toBeLessThan(zebraIndex)
  })
})
