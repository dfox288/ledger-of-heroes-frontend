# Coding Standards

These are mandatory rules. Violations will result in rejected work.

---

## TDD Mandate

**THIS IS NON-NEGOTIABLE.**

### Rejection Criteria

Your work will be **REJECTED** if:
- Implementation code written before tests
- Tests skipped ("it's simple")
- Tests promised "later"
- Tests written after implementation
- "Manual testing is enough"

---

## TypeScript Standards

### Strict Mode

This project uses strict TypeScript. These rules are enforced:

```typescript
// NO implicit any - always type your parameters
function process(data) { }        // WRONG
function process(data: Spell) { } // CORRECT

// NO any type - use unknown or proper types
const result: any = fetchData()           // WRONG
const result: unknown = fetchData()       // CORRECT (if truly unknown)
const result: ApiResponse = fetchData()   // BEST (typed)

// Type assertions - avoid when possible, use type guards
const spell = data as Spell               // Avoid
if (isSpell(data)) { /* data is Spell */ } // Better
```

### Type Imports

Always use `type` imports for types-only imports (reduces bundle size):

```typescript
// CORRECT - type-only import
import type { Spell, Monster } from '~/types'
import { SpellCard } from '~/components/spell/Card.vue'

// WRONG - importing types without 'type' keyword
import { Spell, Monster } from '~/types'
```

### Generated Types

API types are auto-generated from the backend. Never manually edit:

```
app/types/api/generated.ts  # Auto-generated - DO NOT EDIT
```

To update types after backend changes:
```bash
node scripts/sync-api-types.js  # Run from HOST, not Docker
```

### Prefer Interfaces for Objects

```typescript
// Prefer interface for object shapes
interface SpellFilter {
  level?: number
  school?: string
}

// Use type for unions, intersections, primitives
type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type WithId<T> = T & { id: number }
```

---

## Vue Component Standards

### Props Definition

Always use typed props with defaults where appropriate:

```typescript
// CORRECT - TypeScript interface with defineProps
interface Props {
  spell: Spell
  showDetails?: boolean
  variant?: 'compact' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  variant: 'full'
})

// WRONG - untyped or runtime-only props
defineProps(['spell', 'showDetails'])
```

### Emits Definition

Always type your emits:

```typescript
// CORRECT
const emit = defineEmits<{
  select: [spell: Spell]
  close: []
}>()

// WRONG
const emit = defineEmits(['select', 'close'])
```

### Computed vs Methods

Use computed for derived state, methods for actions:

```typescript
// Computed - derived from reactive state, cached
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// Method - performs action or has side effects
function handleSubmit() {
  emit('submit', formData.value)
}
```

### Component File Structure

Follow this order in `<script setup>`:

```typescript
// 1. Type imports
import type { Spell } from '~/types'

// 2. Component/composable imports
import { useCharacterWizardStore } from '~/stores/characterWizard'

// 3. Props and emits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 4. Composables and stores
const store = useCharacterWizardStore()
const { apiFetch } = useApi()

// 5. Refs and reactive state
const isOpen = ref(false)

// 6. Computed properties
const canSubmit = computed(() => /* ... */)

// 7. Watchers
watch(someRef, () => { /* ... */ })

// 8. Functions/methods
function handleClick() { /* ... */ }

// 9. Lifecycle hooks
onMounted(() => { /* ... */ })
```

---

## Commit Convention

```bash
git commit -m "feat: Add feature description

- Detail 1
- Detail 2"
```

**Prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code change that neither fixes nor adds
- `test:` - Adding or updating tests
- `docs:` - Documentation only
- `chore:` - Maintenance, dependencies, config

**NEVER use Claude or Anthropic bylines** in commits, PRs, or GitHub issues. No `Co-Authored-By: Claude`, no `Generated with Claude Code`, no AI attribution.

---

## UI Standards

### Badge Size

**Always use `size="md"` for UBadge components.** The default `sm` size is too small to read comfortably on cards.

```vue
<!-- Correct -->
<UBadge color="spell" variant="subtle" size="md">Concentration</UBadge>

<!-- Wrong - too small -->
<UBadge color="spell" variant="subtle" size="xs">Concentration</UBadge>
<UBadge color="spell" variant="subtle" size="sm">Concentration</UBadge>
```

**Exception:** Use `size="lg"` for prominent header badges (entity codes like "STR", "PHB").

### Logging (Dev-Only)

**Never use `console.log/warn/error` directly.** Use the logger utility instead:

```typescript
import { logger } from '~/utils/logger'

// These only log in development mode (import.meta.dev)
logger.error('Failed to save:', err)
logger.warn('Collision detected, retrying...')
logger.info('Operation completed')
logger.debug('Debug info:', data)
```

**Why:** Keeps production console clean while preserving useful dev logs.

---

## Other Standards

- **Commit frequently** - Small, focused commits on feature branch
- **CHANGELOG.md** - Update for any user-facing change
- **PR before merge** - All changes go through pull requests
