// app/types/languageChoices.ts

/**
 * A language that is automatically known (not a choice)
 */
export interface KnownLanguage {
  id: number
  name: string
  slug: string
  script?: string
}

/**
 * A language option that can be selected
 */
export interface LanguageOption {
  id: number
  name: string
  slug: string
  script?: string
}

/**
 * Language choices for a specific source (race or background)
 */
export interface LanguageSourceChoices {
  /** Languages automatically known from this source */
  known: KnownLanguage[]
  /** Choice information if this source grants language choices */
  choices: {
    /** Total number of languages to choose */
    quantity: number
    /** How many choices remain (quantity - selected.length) */
    remaining: number
    /** IDs of already selected languages */
    selected: number[]
    /** Available language options to choose from */
    options: LanguageOption[]
  } | null
}

/**
 * Response structure from GET /characters/{id}/language-choices
 */
export interface LanguageChoicesResponse {
  data: {
    race: LanguageSourceChoices
    background: LanguageSourceChoices
  }
}
