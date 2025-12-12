# Character Wizard Patterns

The character wizard is the most complex feature in the app. This guide documents its architecture and patterns.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    URL (Source of Truth)                     │
│         /characters/new/race  or  /characters/{id}/edit/race │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              useCharacterWizard() composable                 │
│    - Step registry with visibility/skip logic                │
│    - Navigation (nextStep, previousStep, goToStep)           │
│    - Validation (canProceed per step)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│             useCharacterWizardStore (Pinia)                  │
│    - Character state (selections, summary)                   │
│    - API calls (selectRace, selectClass, etc.)               │
│    - Derived state (needsSubraceStep, isSpellcaster)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Step Components                           │
│    StepRace, StepClass, StepAbilities, StepEquipment, etc.  │
└─────────────────────────────────────────────────────────────┘
```

---

## Step Components

### Location

```
app/components/character/
├── wizard/           # Character creation wizard
│   ├── StepRace.vue
│   ├── StepSubrace.vue
│   ├── StepClass.vue
│   ├── StepSubclass.vue
│   ├── StepBackground.vue
│   ├── StepAbilities.vue
│   ├── StepProficiencies.vue
│   ├── StepLanguages.vue
│   ├── StepEquipment.vue
│   ├── StepSpells.vue
│   ├── StepDetails.vue
│   ├── StepReview.vue
│   └── ... (shared components)
└── levelup/          # Level-up wizard
    ├── StepHitPoints.vue
    ├── StepAsiFeat.vue
    ├── StepSubclassChoice.vue
    └── ...
```

### Step Component Pattern

Every step component follows this structure:

```typescript
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Entity } from '~/types'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import { useCharacterWizard } from '~/composables/useCharacterWizard'
import { useWizardEntitySelection } from '~/composables/useWizardEntitySelection'

// 1. Get store and wizard
const store = useCharacterWizardStore()
const { selections, sourceFilterString } = storeToRefs(store)
const { nextStep } = useCharacterWizard()

// 2. Fetch options (filtered by sourcebooks)
const { data: options } = await useAsyncData(
  `builder-options-${sourceFilterString.value}`,
  () => apiFetch<{ data: Entity[] }>(`/entities?filter=${sourceFilterString.value}`)
)

// 3. Use entity selection composable
const {
  localSelected,
  searchQuery,
  filtered,
  canProceed,
  handleSelect,
  confirmSelection
} = useWizardEntitySelection(options, {
  storeAction: entity => store.selectEntity(entity),
  existingSelection: computed(() => selections.value.entity)
})

// 4. Handle confirmation
async function handleConfirm() {
  await confirmSelection()
  nextStep()
}
</script>
```

### Key Composables

| Composable | Purpose |
|------------|---------|
| `useCharacterWizard()` | Navigation, step visibility, validation |
| `useCharacterWizardStore` | Character state, API calls |
| `useWizardEntitySelection()` | Selection logic, search, confirmation |
| `useUnifiedChoices()` | Pending choice resolution |

---

## Step Visibility and Skipping

Steps can be:
1. **Always visible** - Race, Class, Background, Abilities, Details, Review
2. **Conditionally visible** - Subrace (if race has subraces), Spells (if spellcaster)
3. **Auto-skipped** - Size (if no size choices), Languages (if no language choices)

```typescript
// In useCharacterWizard.ts
{
  name: 'subrace',
  label: 'Subrace',
  visible: () => store.needsSubraceStep  // Only show if race has subraces
},
{
  name: 'size',
  label: 'Size',
  visible: () => true,                    // Always visible in sidebar
  shouldSkip: () => !store.hasSizeChoices // Skip during navigation
}
```

**`visible()`** - Controls sidebar display
**`shouldSkip()`** - Controls navigation (skips when pressing Next)

---

## Validation (canProceed)

Each step has validation logic in `useCharacterWizard`:

```typescript
const canProceed = computed(() => {
  switch (currentStepName.value) {
    case 'race':
      return store.selections.race !== null

    case 'abilities':
      // Block if pending ASI bonuses remain
      if (!store.summary) return true
      return store.summary.pending_choices.asi === 0

    case 'details':
      return store.selections.name.trim().length > 0

    // ...
  }
})
```

**Pattern:** Check `store.summary.pending_choices` for choice-based steps.

---

## URL as Source of Truth

The wizard uses URL for step navigation, not component state:

```typescript
// Current step comes from URL
const currentStepName = computed(() => extractStepFromPath(route.path))

// Navigation changes URL, not state
async function nextStep() {
  await navigateTo(getStepUrl(nextStepInfo.value.name))
}
```

**URL patterns:**
- `/characters/new/{step}` - Before character is created
- `/characters/{publicId}/edit/{step}` - After character is created

---

## Character ID Transition

When a character is first created (race selection), it gets a `publicId`:

```typescript
function getStepUrl(stepName: string): string {
  // After creation, use publicId URLs
  if (store.publicId) {
    return `/characters/${store.publicId}/edit/${stepName}`
  }
  // Before creation, use new mode
  return `/characters/new/${stepName}`
}
```

---

## Pending Choices System

Many steps involve "pending choices" from the backend:

```typescript
interface CharacterSummary {
  pending_choices: {
    proficiencies: number  // e.g., "Choose 2 skills"
    languages: number      // e.g., "Choose 1 language"
    asi: number            // Ability score increases
    spells: number         // Spell selections
    feats: number          // Feat selections
    // ...
  }
}
```

Steps use `useUnifiedChoices()` to resolve these:

```typescript
const { makeChoice, isSubmitting } = useUnifiedChoices()

async function handleSelection(choiceId: number, selection: number[]) {
  await makeChoice(choiceId, selection)
  // Store.summary is refreshed automatically
}
```

---

## Testing Wizard Components

### Setup Helper

```typescript
import { setupWizardStore } from '@/tests/helpers/wizardTestSetup'

const store = setupWizardStore({
  race: mockRace,
  class: mockClass
})
```

### Stubbing Heavy Components

For StepReview and level-up tests, stub character sheet components:

```typescript
import { characterSheetStubs } from '@/tests/helpers/characterSheetStubs'

const wrapper = await mountSuspended(StepReview, {
  global: { stubs: characterSheetStubs }
})
```

### Testing Step Validation

```typescript
it('blocks navigation until race is selected', async () => {
  const store = setupWizardStore() // No race selected
  const { canProceed } = useCharacterWizard()

  expect(canProceed.value).toBe(false)

  store.selectRace(mockRace)
  await flushPromises()

  expect(canProceed.value).toBe(true)
})
```

---

## Level-Up Wizard

The level-up wizard (`/characters/{id}/level-up`) uses similar patterns but with different steps:

| Step | Purpose |
|------|---------|
| StepHitPoints | Roll or take average HP |
| StepAsiFeat | Choose ASI or feat (at ASI levels) |
| StepSubclassChoice | Choose subclass (at subclass level) |
| StepClassSelection | Choose class for multiclass |
| StepSpells | Learn new spells |
| StepSummary | Review and confirm |

**Key difference:** Level-up modifies an existing character, so it always has a `publicId`.
