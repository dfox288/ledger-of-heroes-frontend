// tests/fixtures/languageChoices.ts
import type { LanguageChoicesResponse, LanguageOption } from '~/types'

/**
 * Standard language options available for selection
 */
export const standardLanguageOptions: LanguageOption[] = [
  { id: 2, name: 'Dwarvish', slug: 'dwarvish', script: 'Dwarvish' },
  { id: 3, name: 'Elvish', slug: 'elvish', script: 'Elvish' },
  { id: 4, name: 'Giant', slug: 'giant', script: 'Dwarvish' },
  { id: 5, name: 'Gnomish', slug: 'gnomish', script: 'Dwarvish' },
  { id: 6, name: 'Goblin', slug: 'goblin', script: 'Dwarvish' },
  { id: 7, name: 'Halfling', slug: 'halfling', script: 'Common' },
  { id: 8, name: 'Orc', slug: 'orc', script: 'Dwarvish' },
  { id: 9, name: 'Abyssal', slug: 'abyssal', script: 'Infernal' },
  { id: 10, name: 'Celestial', slug: 'celestial', script: 'Celestial' },
  { id: 11, name: 'Draconic', slug: 'draconic', script: 'Draconic' },
  { id: 12, name: 'Deep Speech', slug: 'deep-speech' },
  { id: 13, name: 'Infernal', slug: 'infernal', script: 'Infernal' },
  { id: 14, name: 'Primordial', slug: 'primordial', script: 'Dwarvish' },
  { id: 15, name: 'Sylvan', slug: 'sylvan', script: 'Elvish' },
  { id: 16, name: 'Undercommon', slug: 'undercommon', script: 'Elvish' }
]

/**
 * Human race with Common (fixed) + 1 language choice
 */
export const mockHumanLanguageChoices: LanguageChoicesResponse = {
  data: {
    race: {
      known: [{ id: 1, name: 'Common', slug: 'common', script: 'Common' }],
      choices: {
        quantity: 1,
        remaining: 1,
        selected: [],
        options: standardLanguageOptions
      }
    },
    background: {
      known: [],
      choices: null
    }
  }
}

/**
 * Half-Elf race with Common + Elvish (fixed) + 1 language choice
 */
export const mockHalfElfLanguageChoices: LanguageChoicesResponse = {
  data: {
    race: {
      known: [
        { id: 1, name: 'Common', slug: 'common', script: 'Common' },
        { id: 3, name: 'Elvish', slug: 'elvish', script: 'Elvish' }
      ],
      choices: {
        quantity: 1,
        remaining: 1,
        selected: [],
        options: standardLanguageOptions.filter(l => l.id !== 3) // Exclude Elvish (already known)
      }
    },
    background: {
      known: [],
      choices: null
    }
  }
}

/**
 * Acolyte background with 2 language choices
 */
export const mockAcolyteLanguageChoices: LanguageChoicesResponse = {
  data: {
    race: {
      known: [],
      choices: null
    },
    background: {
      known: [],
      choices: {
        quantity: 2,
        remaining: 2,
        selected: [],
        options: standardLanguageOptions
      }
    }
  }
}

/**
 * Human + Acolyte combo: 1 race choice + 2 background choices
 */
export const mockHumanAcolyteLanguageChoices: LanguageChoicesResponse = {
  data: {
    race: {
      known: [{ id: 1, name: 'Common', slug: 'common', script: 'Common' }],
      choices: {
        quantity: 1,
        remaining: 1,
        selected: [],
        options: standardLanguageOptions
      }
    },
    background: {
      known: [],
      choices: {
        quantity: 2,
        remaining: 2,
        selected: [],
        options: standardLanguageOptions
      }
    }
  }
}

/**
 * Dwarf race - no language choices (Dwarvish + Common fixed)
 */
export const mockDwarfLanguageChoices: LanguageChoicesResponse = {
  data: {
    race: {
      known: [
        { id: 1, name: 'Common', slug: 'common', script: 'Common' },
        { id: 2, name: 'Dwarvish', slug: 'dwarvish', script: 'Dwarvish' }
      ],
      choices: null
    },
    background: {
      known: [],
      choices: null
    }
  }
}

/**
 * No language choices needed (Dwarf + non-language background)
 */
export const mockNoLanguageChoices: LanguageChoicesResponse = {
  data: {
    race: {
      known: [
        { id: 1, name: 'Common', slug: 'common', script: 'Common' },
        { id: 2, name: 'Dwarvish', slug: 'dwarvish', script: 'Dwarvish' }
      ],
      choices: null
    },
    background: {
      known: [],
      choices: null
    }
  }
}

/**
 * Human + Acolyte with some selections already made (editing scenario)
 */
export const mockPartiallySelectedLanguageChoices: LanguageChoicesResponse = {
  data: {
    race: {
      known: [{ id: 1, name: 'Common', slug: 'common', script: 'Common' }],
      choices: {
        quantity: 1,
        remaining: 0,
        selected: [3], // Elvish selected
        options: standardLanguageOptions
      }
    },
    background: {
      known: [],
      choices: {
        quantity: 2,
        remaining: 1,
        selected: [11], // Draconic selected
        options: standardLanguageOptions.filter(l => l.id !== 3) // Exclude Elvish (selected by race)
      }
    }
  }
}
