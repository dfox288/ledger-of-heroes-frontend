export interface SkillOption {
  type: 'skill'
  skill_id: number
  skill: {
    id: number
    name: string
    slug: string
  }
}

export interface ProficiencyTypeOption {
  type: 'proficiency_type'
  proficiency_type_id: number
  proficiency_type: {
    id: number
    name: string
    slug: string
  }
}

export type ProficiencyOption = SkillOption | ProficiencyTypeOption

export interface ProficiencyChoice {
  /** The category of proficiency (e.g., 'skill', 'tool') */
  proficiency_type: string | null
  /** The subcategory for lookup-based choices (e.g., 'artisan' for artisan tools) */
  proficiency_subcategory: string | null
  quantity: number
  remaining: number
  /** IDs of skills already selected for this choice group */
  selected_skills: number[]
  /** IDs of proficiency types already selected for this choice group */
  selected_proficiency_types: number[]
  /** All available options - may be empty if proficiency_subcategory is set (fetch from lookup) */
  options: ProficiencyOption[]
}

export interface ProficiencyChoicesResponse {
  data: {
    class: Record<string, ProficiencyChoice>
    race: Record<string, ProficiencyChoice>
    background: Record<string, ProficiencyChoice>
  }
}

export interface CharacterProficiency {
  id: number
  source: 'class' | 'race' | 'background'
  type: 'skill' | 'saving_throw' | 'armor' | 'weapon' | 'tool' | 'language'
  name: string
  ability_score?: {
    id: number
    name: string
    code: string
  }
}

export interface CharacterFeature {
  id: number
  source: 'class' | 'race' | 'background'
  name: string
  description: string
  level?: number
}

export interface ProficienciesResponse {
  data: CharacterProficiency[]
}

export interface FeaturesResponse {
  data: CharacterFeature[]
}

/**
 * Proficiency type lookup item from /proficiency-types?category=X&subcategory=Y
 */
export interface ProficiencyTypeLookupItem {
  id: number
  slug: string
  name: string
  category: string
  subcategory: string | null
}

/**
 * Response from /proficiency-types lookup endpoint
 */
export interface ProficiencyTypeLookupResponse {
  data: ProficiencyTypeLookupItem[]
}
