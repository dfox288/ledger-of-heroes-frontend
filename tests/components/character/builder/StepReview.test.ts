import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import StepReview from '~/components/character/builder/StepReview.vue'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

describe('StepReview', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  async function setupStore(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
    const store = useCharacterBuilderStore()

    // Set up character data AFTER mounting
    store.characterId = 123
    store.name = 'Thorin Ironforge'
    store.selectedRace = {
      id: 1,
      name: 'Dwarf',
      slug: 'dwarf',
      is_subrace: false
    } as any
    store.selectedClass = {
      id: 2,
      name: 'Fighter',
      slug: 'fighter',
      hit_die: 10,
      spellcasting_ability: null
    } as any
    store.abilityScores = {
      strength: 16,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 13,
      charisma: 8
    }
    store.selectedBackground = {
      id: 3,
      name: 'Soldier',
      slug: 'soldier',
      feature_name: 'Military Rank'
    } as any

    await wrapper.vm.$nextTick()
    return store
  }

  it('displays page title', async () => {
    const wrapper = await mountSuspended(StepReview)

    expect(wrapper.text()).toContain('Review Your Character')
  })

  it('displays character name', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Thorin Ironforge')
  })

  it('displays selected race', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Dwarf')
  })

  it('displays selected class', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Fighter')
  })

  it('displays ability scores', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    // Should show ability score values
    expect(wrapper.text()).toContain('16') // strength
    expect(wrapper.text()).toContain('14') // constitution
    expect(wrapper.text()).toContain('STR')
    expect(wrapper.text()).toContain('CON')
  })

  it('displays selected background', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    expect(wrapper.text()).toContain('Soldier')
  })

  it('shows finish button', async () => {
    const wrapper = await mountSuspended(StepReview)

    expect(wrapper.find('[data-test="finish-btn"]').exists()).toBe(true)
  })

  it('finish button is clickable', async () => {
    const wrapper = await mountSuspended(StepReview)
    await setupStore(wrapper)

    const finishBtn = wrapper.find('[data-test="finish-btn"]')
    expect(finishBtn.exists()).toBe(true)

    // Verify button can be triggered (navigation tested in e2e)
    await finishBtn.trigger('click')
  })

  describe('with spells (caster class)', () => {
    it('displays spells section for casters', async () => {
      const wrapper = await mountSuspended(StepReview)
      const store = await setupStore(wrapper)

      // Change to caster class and add spells
      store.selectedClass = {
        id: 5,
        name: 'Wizard',
        slug: 'wizard',
        hit_die: 6,
        spellcasting_ability: { id: 4, code: 'INT', name: 'Intelligence' }
      } as any

      store.selectedSpells = [
        { id: 1, spell_id: 101, spell: { id: 101, name: 'Fire Bolt', level: 0 } },
        { id: 2, spell_id: 102, spell: { id: 102, name: 'Magic Missile', level: 1 } }
      ] as any[]

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Spells')
      expect(wrapper.text()).toContain('Fire Bolt')
      expect(wrapper.text()).toContain('Magic Missile')
    })
  })

  describe('with equipment', () => {
    it('displays fixed equipment', async () => {
      const wrapper = await mountSuspended(StepReview)
      const store = await setupStore(wrapper)

      store.selectedClass = {
        ...store.selectedClass,
        equipment: [
          { id: 1, item: { name: 'Shield' }, quantity: 1, is_choice: false }
        ]
      } as any

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Shield')
    })

    it('displays chosen equipment', async () => {
      const wrapper = await mountSuspended(StepReview)
      const store = await setupStore(wrapper)

      store.selectedClass = {
        ...store.selectedClass,
        equipment: [
          { id: 10, item: { name: 'Longsword' }, quantity: 1, is_choice: true, choice_group: 'choice_1' },
          { id: 11, item: { name: 'Battleaxe' }, quantity: 1, is_choice: true, choice_group: 'choice_1' }
        ]
      } as any
      store.equipmentChoices.set('choice_1', 10) // Selected longsword

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Longsword')
    })
  })

  describe('edit buttons', () => {
    it('shows edit button for name section', async () => {
      const wrapper = await mountSuspended(StepReview)

      expect(wrapper.find('[data-test="edit-name"]').exists()).toBe(true)
    })

    it('navigates to correct step when edit clicked', async () => {
      const wrapper = await mountSuspended(StepReview)
      const store = useCharacterBuilderStore()

      await wrapper.find('[data-test="edit-name"]').trigger('click')

      expect(store.currentStep).toBe(1)
    })
  })
})
