import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useBackgroundStats } from '~/composables/useBackgroundStats'
import type { Background } from '~/types/api/entities'
import { ITEM_ID_GOLD_PIECE } from '~/constants/items'

describe('useBackgroundStats', () => {
  it('extracts skill proficiency names', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'charlatan',
      name: 'Charlatan',
      proficiencies: [
        { proficiency_type: 'skill', skill: { id: 1, name: 'Deception', slug: 'deception' } },
        { proficiency_type: 'skill', skill: { id: 2, name: 'Sleight of Hand', slug: 'sleight-of-hand' } }
      ]
    } as Background)

    const { skillProficiencies } = useBackgroundStats(background)

    expect(skillProficiencies.value).toEqual(['Deception', 'Sleight of Hand'])
  })

  it('extracts tool proficiency names', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'charlatan',
      name: 'Charlatan',
      proficiencies: [
        { proficiency_type: 'tool', tool: { id: 1, name: 'Disguise Kit' } },
        { proficiency_type: 'tool', tool: { id: 2, name: 'Forgery Kit' } }
      ]
    } as Background)

    const { toolProficiencies } = useBackgroundStats(background)

    expect(toolProficiencies.value).toEqual(['Disguise Kit', 'Forgery Kit'])
  })

  it('extracts language names', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'acolyte',
      name: 'Acolyte',
      languages: [
        { id: 1, name: 'Common', slug: 'common' },
        { id: 2, name: 'Celestial', slug: 'celestial' }
      ]
    } as Background)

    const { languages } = useBackgroundStats(background)

    expect(languages.value).toEqual(['Common', 'Celestial'])
  })

  it('counts equipment items excluding gold', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'acolyte',
      name: 'Acolyte',
      equipment: [
        { item_id: 100, item_name: 'Holy Symbol', quantity: 1 },
        { item_id: 101, item_name: 'Prayer Book', quantity: 1 },
        { item_id: 102, item_name: 'Incense', quantity: 5 },
        { item_id: ITEM_ID_GOLD_PIECE, item_name: 'Gold Piece', quantity: 15 }
      ]
    } as Background)

    const { equipmentCount } = useBackgroundStats(background)

    expect(equipmentCount.value).toBe(3)
  })

  it('finds starting gold from equipment array', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'charlatan',
      name: 'Charlatan',
      equipment: [
        { item_id: 100, item_name: 'Fine Clothes', quantity: 1 },
        { item_id: ITEM_ID_GOLD_PIECE, item_name: 'Gold Piece', quantity: 15 }
      ]
    } as Background)

    const { startingGold } = useBackgroundStats(background)

    expect(startingGold.value).toBe(15)
  })

  it('handles missing proficiencies gracefully', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'test',
      name: 'Test'
    } as Background)

    const { skillProficiencies, toolProficiencies } = useBackgroundStats(background)

    expect(skillProficiencies.value).toEqual([])
    expect(toolProficiencies.value).toEqual([])
  })

  it('handles missing languages gracefully', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'test',
      name: 'Test'
    } as Background)

    const { languages } = useBackgroundStats(background)

    expect(languages.value).toEqual([])
  })

  it('handles missing equipment gracefully', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'test',
      name: 'Test'
    } as Background)

    const { equipmentCount, startingGold } = useBackgroundStats(background)

    expect(equipmentCount.value).toBe(0)
    expect(startingGold.value).toBeNull()
  })

  it('handles null background', () => {
    const background = ref<Background | null>(null)

    const { skillProficiencies, toolProficiencies, languages, equipmentCount, startingGold }
      = useBackgroundStats(background)

    expect(skillProficiencies.value).toEqual([])
    expect(toolProficiencies.value).toEqual([])
    expect(languages.value).toEqual([])
    expect(equipmentCount.value).toBe(0)
    expect(startingGold.value).toBeNull()
  })

  it('filters out proficiencies without skill data', () => {
    const background = ref<Background>({
      id: 1,
      slug: 'test',
      name: 'Test',
      proficiencies: [
        { proficiency_type: 'skill', skill: { id: 1, name: 'Deception', slug: 'deception' } },
        { proficiency_type: 'skill', skill: null } as any
      ]
    } as Background)

    const { skillProficiencies } = useBackgroundStats(background)

    expect(skillProficiencies.value).toEqual(['Deception'])
  })
})
