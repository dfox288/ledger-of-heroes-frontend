// tests/components/character/sheet/WeaponsPanel.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WeaponsPanel from '~/components/character/sheet/WeaponsPanel.vue'
import type { CharacterWeapon, AbilityScoreCode } from '~/types/character'

// Mock weapon data - bonuses are pre-computed by backend
// attack_bonus includes: ability mod + proficiency (if proficient) + fighting style + magic
// damage_bonus includes: ability mod + fighting style + magic
const mockWeapons: CharacterWeapon[] = [
  {
    name: 'Longbow',
    damage_dice: '1d8',
    attack_bonus: 5, // DEX(3) + Prof(2)
    damage_bonus: 3, // DEX(3)
    ability_used: 'DEX',
    is_proficient: true
  },
  {
    name: 'Shortsword',
    damage_dice: '1d6',
    attack_bonus: 5, // DEX(3) + Prof(2)
    damage_bonus: 3, // DEX(3)
    ability_used: 'DEX',
    is_proficient: true
  }
]

const mockAbilityModifiers: Record<AbilityScoreCode, number> = {
  STR: 2,
  DEX: 3,
  CON: 1,
  INT: 0,
  WIS: 1,
  CHA: -1
}

describe('WeaponsPanel', () => {
  it('renders weapon names', async () => {
    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: mockWeapons,
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    expect(wrapper.text()).toContain('Longbow')
    expect(wrapper.text()).toContain('Shortsword')
  })

  it('displays pre-computed attack bonus from API', async () => {
    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: mockWeapons,
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    // Backend pre-computes: DEX(3) + Prof(2) = +5
    expect(wrapper.text()).toContain('+5')
  })

  it('displays attack bonus without proficiency (pre-computed by API)', async () => {
    const nonProficientWeapon: CharacterWeapon[] = [{
      name: 'Greatsword',
      damage_dice: '2d6',
      attack_bonus: 2, // Backend pre-computes: STR(2) only, no prof
      damage_bonus: 2, // STR(2)
      ability_used: 'STR',
      is_proficient: false
    }]

    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: nonProficientWeapon,
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    // Backend pre-computes: STR(2) only, no prof = +2
    expect(wrapper.text()).toContain('+2')
  })

  it('displays damage dice with pre-computed bonus from API', async () => {
    const weaponWithBonus: CharacterWeapon[] = [{
      name: 'Magic Sword',
      damage_dice: '1d8',
      attack_bonus: 5, // Backend pre-computes: STR(2) + Prof(2) + magic(1)
      damage_bonus: 3, // Backend pre-computes: STR(2) + magic(1)
      ability_used: 'STR',
      is_proficient: true
    }]

    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: weaponWithBonus,
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    // Backend pre-computes damage_bonus = 3, so display is 1d8+3
    expect(wrapper.text()).toContain('1d8+3')
  })

  it('shows unarmed strike when no weapons', async () => {
    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: [],
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    expect(wrapper.text()).toContain('Unarmed Strike')
  })

  it('shows inventory hint when no equipped weapons', async () => {
    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: [],
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    expect(wrapper.text()).toContain('Inventory')
  })

  it('expands weapon details when clicked', async () => {
    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: mockWeapons,
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    // Click expand button
    const expandBtn = wrapper.find('[data-testid="expand-weapon-0"]')
    await expandBtn.trigger('click')

    // Should show ability used
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('Proficient')
  })

  it('shows not proficient warning when applicable', async () => {
    const nonProficientWeapon: CharacterWeapon[] = [{
      name: 'Heavy Crossbow',
      damage_dice: '1d10',
      attack_bonus: 3, // DEX(3) only, no prof
      damage_bonus: 3, // DEX(3)
      ability_used: 'DEX',
      is_proficient: false
    }]

    const wrapper = await mountSuspended(WeaponsPanel, {
      props: {
        weapons: nonProficientWeapon,
        proficiencyBonus: 2,
        abilityModifiers: mockAbilityModifiers
      }
    })

    const expandBtn = wrapper.find('[data-testid="expand-weapon-0"]')
    await expandBtn.trigger('click')

    expect(wrapper.text()).toContain('Not Proficient')
  })
})
