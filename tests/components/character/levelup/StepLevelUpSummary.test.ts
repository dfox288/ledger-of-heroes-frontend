// tests/components/character/levelup/StepLevelUpSummary.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepLevelUpSummary from '~/components/character/levelup/StepLevelUpSummary.vue'
import type { LevelUpResult } from '~/types/character'

describe('StepLevelUpSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockLevelUpResult: LevelUpResult = {
    previous_level: 3,
    new_level: 4,
    hp_increase: 9,
    new_max_hp: 38,
    features_gained: [
      { id: 1, name: 'Ability Score Improvement', description: 'Increase ability scores' }
    ],
    spell_slots: {},
    asi_pending: false,
    hp_choice_pending: false
  }

  it('shows level up complete message', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    expect(wrapper.text()).toContain('Level Up Complete')
  })

  it('shows level transition', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    expect(wrapper.text()).toContain('Fighter 3')
    expect(wrapper.text()).toContain('Fighter 4')
  })

  it('shows HP gained', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    expect(wrapper.text()).toContain('+9')
    expect(wrapper.text()).toContain('38')
  })

  it('shows features gained', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    expect(wrapper.text()).toContain('Ability Score Improvement')
  })

  it('has button to return to character sheet', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    expect(wrapper.find('[data-testid="view-sheet-button"]').exists()).toBe(true)
  })

  it('emits complete event when button clicked', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    await wrapper.find('[data-testid="view-sheet-button"]').trigger('click')
    expect(wrapper.emitted('complete')).toBeTruthy()
  })

  it('shows ASI choice when provided', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9,
        asiChoice: 'STR +2'
      }
    })

    expect(wrapper.text()).toContain('Ability Score Increase')
    expect(wrapper.text()).toContain('STR +2')
  })

  it('shows feat name when provided', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9,
        featName: 'Great Weapon Master'
      }
    })

    expect(wrapper.text()).toContain('Feat')
    expect(wrapper.text()).toContain('Great Weapon Master')
  })

  it('hides ASI/Feat section when neither provided', async () => {
    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: mockLevelUpResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    expect(wrapper.html()).not.toContain('Ability Score Increase')
    expect(wrapper.html()).not.toContain('i-heroicons-arrow-trending-up')
  })

  it('handles empty features list', async () => {
    const emptyFeaturesResult: LevelUpResult = {
      ...mockLevelUpResult,
      features_gained: []
    }

    const wrapper = await mountSuspended(StepLevelUpSummary, {
      props: {
        levelUpResult: emptyFeaturesResult,
        className: 'Fighter',
        hpGained: 9
      }
    })

    expect(wrapper.html()).not.toContain('New Features')
  })
})
