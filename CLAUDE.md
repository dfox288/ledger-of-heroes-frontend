# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

Nuxt 4.x frontend for D&D 5e Compendium. Consumes REST API from `../backend` (Laravel backend).

**Tech Stack:** Nuxt 4.x | NuxtUI 4.x | TypeScript | Vitest | Playwright | Pinia | Docker

**Commands:** `docker compose exec nuxt npm run ...` | Always use Docker, never run locally.

**⚠️ DO NOT use superpowers-chrome** - Browser automation is not needed for this project.

**Essential Docs:**
- `docs/PROJECT-STATUS.md` - Metrics and current status
- `docs/LATEST-HANDOVER.md` - Latest session handover (symlink to wrapper)

**Tasks & Issues:** [GitHub Issues](https://github.com/dfox288/ledger-of-heroes/issues) (shared with backend)

---

## Documentation Locations

**All documentation (plans, handovers, proposals, reference) lives in the wrapper repo:**

```
../wrapper/docs/frontend/
├── handovers/   # Session handovers
├── plans/       # Implementation plans
├── proposals/   # API enhancement proposals
├── reference/   # Stable reference docs
└── archive/     # Old handovers
```

| Doc Type | Write To |
|----------|----------|
| **Plans** | `../wrapper/docs/frontend/plans/YYYY-MM-DD-topic-design.md` |
| **Handovers** | `../wrapper/docs/frontend/handovers/SESSION-HANDOVER-YYYY-MM-DD-topic.md` |
| **Proposals** | `../wrapper/docs/frontend/proposals/` |
| **Reference** | `../wrapper/docs/frontend/reference/` |

**Stays local:** `docs/PROJECT-STATUS.md`, `docs/LATEST-HANDOVER.md` (symlink), `docs/README.md`

### Session Handover Workflow

1. Write handover to wrapper: `../wrapper/docs/frontend/handovers/SESSION-HANDOVER-YYYY-MM-DD-topic.md`
2. Update symlink:
   ```bash
   ln -sf ../../wrapper/docs/frontend/handovers/SESSION-HANDOVER-YYYY-MM-DD-topic.md docs/LATEST-HANDOVER.md
   ```
3. Commit to BOTH repos:
   - Wrapper repo: the new handover file
   - This repo: the updated symlink (if changed)

---

## Cross-Project Coordination

Use GitHub Issues in `dfox288/ledger-of-heroes` for bugs, API issues, and cross-cutting concerns.

### Check Your Inbox (do this at session start)

```bash
gh issue list --repo dfox288/ledger-of-heroes --label "frontend" --state open
```

### Create an Issue

```bash
# When you discover an API problem or cross-cutting bug
gh issue create --repo dfox288/ledger-of-heroes \
  --title "Brief description" \
  --label "backend,bug,from:frontend" \
  --body "Details here"
```

### Labels to Use

- **Assignee:** `frontend`, `backend`, `both`
- **Type:** `bug`, `feature`, `api-contract`, `data-issue`, `performance`
- **Source:** `from:frontend`, `from:backend`, `from:manual-testing`

### Close When Fixed

Issues close automatically when PR merges if the PR body contains `Closes #N`. For manual closure:

```bash
gh issue close 42 --repo dfox288/ledger-of-heroes --comment "Fixed in PR #123"
```

---

## AI Context (llms.txt)

**Fetch these before starting work:**

- **Nuxt 4** `https://nuxt.com/llms.txt` or `llms-full.txt` (~1M+ tokens)
- **Nuxt UI 4** `https://ui.nuxt.com/llms.txt` or `llms-full.txt` (~1M+ tokens)
- *Vue 3** `https://vuejs.org/llms.txt`
- **Vite** `https://vite.dev/llms.txt`

## Quick Reference

```bash
# Most common commands
docker compose exec nuxt npm run dev        # Dev server
docker compose exec nuxt npm run test       # Full test suite (~125s)
docker compose exec nuxt npm run typecheck  # TypeScript check
docker compose exec nuxt npm run lint:fix   # Auto-fix linting
node scripts/sync-api-types.js             # Sync API types (run from HOST, not Docker)
```

| Working On | Test Suite | Runtime |
|------------|------------|---------|
| **Character builder, wizard steps** | `npm run test:character` | ~40s |
| Spells page, SpellCard, filters | `npm run test:spells` | ~14s |
| Items page, ItemCard, filters | `npm run test:items` | ~12s |
| Monsters page, filters | `npm run test:monsters` | ~12s |
| Classes page, filters | `npm run test:classes` | ~12s |
| Races page, filters | `npm run test:races` | ~10s |
| Backgrounds page, filters | `npm run test:backgrounds` | ~10s |
| Feats page, filters | `npm run test:feats` | ~8s |
| Reference entities (sizes, skills) | `npm run test:reference` | ~10s |
| Shared UI components, cards | `npm run test:ui` | ~55s |
| Composables, utils, server API | `npm run test:core` | ~20s |
| All page tests | `npm run test:pages` | ~60s |
| All Pinia stores | `npm run test:stores` | ~15s |
| CI, pre-commit, final check | `npm run test` | ~250s |

### Character Builder Stress Test

Rapidly create N characters via API to test the character builder without UI:

```bash
npm run test:character-stress -- --count=10          # Create 10 characters (kept in DB)
npm run test:character-stress -- --count=3 --verbose # Watch choices being made
npm run test:character-stress -- --dry-run           # Preview without API calls
npm run test:character-stress -- --count=5 --cleanup # Create and delete after test
```

**What it tests:** Character creation → class → background → ability scores → all pending choices (proficiencies, languages, equipment, spells) → validation.

**Default behavior:** Characters are kept in the database. Use `--cleanup` to delete after creation.

**Test pool:** 5 races × 5 classes × 4 backgrounds = 100 unique combinations (PHB-focused).

---

## Development Cycle

### Every Feature/Fix

```
1. Check skills           → Use Superpower skills (NOT superpowers-laravel)
2. Check GitHub Issues    → gh issue list for assigned tasks
3. Create feature branch  → git checkout -b feature/issue-N-short-description
4. Write tests FIRST      → Watch them fail (TDD mandatory)
5. Write minimal code     → Make tests pass
6. Refactor while green   → Clean up
7. Run test suite         → Smallest relevant suite
8. Run npm run lint:fix   → Fix linting
9. Update CHANGELOG.md    → If user-facing
10. Commit + Push         → Clear message, push to feature branch
11. Create PR             → gh pr create with issue reference
12. Close GitHub Issue    → Closes automatically via PR merge (or manual close)
```

### Bug Fix Workflow (When Tests Already Exist)

When fixing bugs in code that has existing tests:

```
1. Reproduce the bug      → Understand what's broken
2. Check existing tests   → Do they test the buggy behavior?
3. UPDATE TESTS FIRST     → Write/modify tests for CORRECT behavior
4. Watch tests FAIL       → Confirms test catches the bug
5. Fix the code           → Make tests pass
6. Run test suite         → Verify no regressions
7. Commit + Push          → Include "fix:" prefix
```

**Critical:** When fixing bugs, do NOT just make existing tests pass. If tests pass with buggy code, the tests are wrong. Update tests to verify the correct behavior BEFORE fixing the code.

**Anti-pattern to avoid:**
- ❌ Code doesn't match tests → Rewrite code to match tests
- ❌ Tests pass but behavior is wrong → "Tests pass, ship it"
- ✅ Code doesn't match tests → Determine correct behavior → Update tests → Fix code

### Branch Naming Convention

```bash
# Format: feature/issue-{number}-{short-description}
git checkout -b feature/issue-42-monster-encounter-builder
git checkout -b fix/issue-99-filter-url-sync-bug
git checkout -b chore/issue-13-storybook-setup
```

**Prefixes:**
- `feature/` - New functionality
- `fix/` - Bug fixes
- `chore/` - Maintenance, docs, refactoring

### For Filter Changes (Additional)
- Add field to Pinia store (`app/stores/{entity}Filters.ts`)
- Update `useMeilisearchFilters` config in page
- Add filter UI component in page
- Test URL sync works

### For New Entity Pages (Additional)
- Create Pinia filter store
- Create list page with `useEntityList` composable
- Create detail page with `useAsyncData`
- Create card component
- Add domain test suite to `package.json`

### For API Type Changes (Additional)
- Run `node scripts/sync-api-types.js` from HOST (not Docker) - requires backend running
- Run `npm run typecheck`
- Update component props if needed

---

## Standards

### TDD Mandate

**THIS IS NON-NEGOTIABLE.**

### Rejection Criteria

Your work will be **REJECTED** if:
- Implementation code written before tests
- Tests skipped ("it's simple")
- Tests promised "later"
- Tests written after implementation
- "Manual testing is enough"

### Vitest Syntax

```typescript
// Vitest uses describe/it/expect
describe('SpellCard', () => {
  it('displays spell name', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })
    expect(wrapper.text()).toContain('Fireball')
  })
})

// Group related tests
describe('spell filtering', () => {
  it('filters by level', () => { /* ... */ })
  it('filters by school', () => { /* ... */ })
})
```

### Vitest Expectations

```typescript
expect(value).toBe(expected)           // Strict equality
expect(value).toEqual(expected)        // Deep equality
expect(array).toHaveLength(5)
expect(wrapper).toBeDefined()
expect(array).toContain('item')
expect(string).toMatch(/pattern/)
```

### Commit Convention

```bash
git commit -m "feat: Add feature description

- Detail 1
- Detail 2"
```

**NEVER use Claude or Anthropic bylines** in commits, PRs, or GitHub issues. No `Co-Authored-By: Claude`, no `Generated with Claude Code`, no AI attribution.

### Badge Size Standard

**Always use `size="md"` for UBadge components.** The default `sm` size is too small to read comfortably on cards.

```vue
<!-- ✅ Correct -->
<UBadge color="spell" variant="subtle" size="md">Concentration</UBadge>

<!-- ❌ Wrong - too small -->
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

### Other Standards
- **Feature branches** - Always work on `feature/issue-N-*` branches, never commit directly to main
- **Commit frequently** - Small, focused commits on feature branch
- **CHANGELOG.md** - Update for any user-facing change
- **PR before merge** - All changes go through pull requests

---

## Patterns

### List Page Pattern

All 7 entity list pages use `useEntityList` composable:

```typescript
const { searchQuery, currentPage, data, meta, totalResults, loading, error } =
  useEntityList({
    endpoint: '/spells',
    cacheKey: 'spells-list',
    queryBuilder,  // From useMeilisearchFilters
    perPage: 24,
    seo: { title: 'Spells', description: '...' }
  })
```

**Required components:** `<UiListPageHeader>`, `<UiListSkeletonCards>`, `<UiListErrorState>`, `<UiListEmptyState>`, `<UiListResultsCount>`, `<UiListPagination>`

**Gold Standard:** `app/pages/spells/index.vue`

### Detail Page Pattern

```typescript
// app/pages/spells/[slug].vue
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: spell, pending, error } = await useAsyncData(
  `spell-${slug.value}`,
  () => apiFetch<{ data: Spell }>(`/spells/${slug.value}`)
)

useSeoMeta({
  title: () => spell.value?.data.name || 'Loading...',
})
```

**Gold Standard:** `app/pages/spells/[slug].vue`, `app/pages/classes/[slug].vue`

### Filter Composables

```typescript
// 1. useMeilisearchFilters - Build filter query
const { queryParams } = useMeilisearchFilters([
  { ref: selectedLevel, field: 'level' },
  { ref: concentrationFilter, field: 'concentration', type: 'boolean' },
  { ref: selectedDamageTypes, field: 'damage_types', type: 'in' }
])

// 2. useReferenceData - Fetch lookup data
const { data: schools } = useReferenceData<SpellSchool>('/spell-schools')

// 3. useFilterCount - Badge count
const activeFilterCount = useFilterCount(selectedLevel, selectedSchool)
```

**Filter types:** `equals` (default), `boolean`, `in`, `range`, `isEmpty`, `greaterThan`

**Gold Standard:** `app/pages/spells/index.vue` (10 filters)

### Pinia Filter Stores

All 7 entity pages use Pinia stores with IndexedDB persistence:

```typescript
import { storeToRefs } from 'pinia'
import { useSpellFiltersStore } from '~/stores/spellFilters'

const store = useSpellFiltersStore()
const { searchQuery, selectedLevels } = storeToRefs(store)

// URL sync setup (handles mount + debounced store→URL sync)
const { clearFilters } = usePageFilterSetup(store)
```

**Available stores:** `useSpellFiltersStore`, `useItemFiltersStore`, `useMonsterFiltersStore`, `useClassFiltersStore`, `useRaceFiltersStore`, `useBackgroundFiltersStore`, `useFeatFiltersStore`

### Page Filter Setup (URL Sync)

The `usePageFilterSetup` composable handles all URL synchronization for filter pages:

```typescript
// Side-effect pattern - auto-syncs on call (like useHead)
const { clearFilters } = usePageFilterSetup(store)

// Handles:
// 1. onMounted: URL params → store (if URL has params)
// 2. watch: store changes → URL (debounced 300ms)
// 3. clearFilters(): resets store AND clears URL
```

**Interface requirement:** Store must implement `toUrlQuery`, `setFromUrlQuery()`, `clearAll()`

### Component Auto-Import

Naming based on folder structure:
- `components/Foo.vue` → `<Foo>`
- `components/ui/Bar.vue` → `<UiBar>` (NOT `<Bar>`)
- `components/spell/Card.vue` → `<SpellCard>`

**⚠️ Critical:** Nested components MUST use folder prefix!

### NuxtUI Color System

**3-step process (must follow exactly):**

1. **Register in `nuxt.config.ts`:**
   ```typescript
   ui: { theme: { colors: ['spell', 'item', 'monster', ...] } }
   ```

2. **Define palette in `app/assets/css/main.css`:**
   ```css
   @theme static {
     --color-arcane-50: #f5f3ff;
     /* ... all 11 levels: 50-950 */
   }
   ```

3. **Map in `app/app.config.ts`:**
   ```typescript
   export default defineAppConfig({
     ui: { colors: { spell: 'arcane' } }
   })
   ```

**⚠️ Common pitfall:** `app.config.ts` goes in `app/` directory (Nuxt 4), NOT root!

---

## Nitro Server Routes (API Proxy)

**⚠️ CRITICAL:** All API calls go through Nitro server routes, NOT directly to the Laravel backend!

### How It Works

```
Frontend Component → /api/spells → Nitro Route → Laravel Backend
                     (port 4000)   (server/api/)   (port 8080)
```

The `useApi` composable provides `apiFetch` with `baseURL: '/api'`. This means:
- `apiFetch('/spells')` → calls `/api/spells` → Nitro proxies to Laravel

### When Adding New API Endpoints

**If the backend has an endpoint, you MUST create a matching Nitro route!**

```bash
# Backend endpoint:
GET http://localhost:8080/api/v1/characters/1/available-spells

# Requires Nitro route at:
server/api/characters/[id]/available-spells.get.ts
```

### Route File Structure

```
server/api/
├── spells/
│   ├── index.get.ts          # GET /api/spells
│   └── [slug].get.ts         # GET /api/spells/:slug
├── characters/
│   ├── index.get.ts          # GET /api/characters
│   ├── index.post.ts         # POST /api/characters
│   ├── [id].get.ts           # GET /api/characters/:id (accepts id or publicId)
│   ├── [id].patch.ts         # PATCH /api/characters/:id
│   ├── [id].delete.ts        # DELETE /api/characters/:id
│   └── [id]/
│       ├── stats.get.ts      # GET /api/characters/:id/stats
│       ├── pending-choices.get.ts   # GET /api/characters/:id/pending-choices
│       ├── summary.get.ts    # GET /api/characters/:id/summary
│       └── choices/
│           └── [choiceId].post.ts   # POST /api/characters/:id/choices/:choiceId
```

**Note:** Character routes accept both numeric IDs and public IDs (e.g., `arcane-phoenix-M7k2`). Frontend pages use `/characters/[publicId]/` for human-readable URLs.

### Route Template

```typescript
// server/api/characters/[id]/example.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  // Build query string if needed
  const queryString = query.param ? `?param=${query.param}` : ''

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/example${queryString}`)
  return data
})
```

### Common Mistake

```typescript
// ❌ WRONG - Direct backend call (fails in SSR, CORS issues)
const data = await $fetch('http://localhost:8080/api/v1/spells')

// ✅ CORRECT - Use Nitro proxy
const { apiFetch } = useApi()
const data = await apiFetch('/spells')
```

---

## API Reference

### Backend

**Location:** `../backend` | **Base URL:** `http://localhost:8080/api/v1` | **Docs:** `http://localhost:8080/docs/api`

### Meilisearch Filter Syntax

```bash
# Correct - use filter parameter
curl "http://localhost:8080/api/v1/spells?filter=level=3"
curl "http://localhost:8080/api/v1/spells?filter=level IN [0,1,2]"
curl "http://localhost:8080/api/v1/spells?filter=concentration=true AND level>=3"

# Wrong - standard query params don't work for filtering
curl "http://localhost:8080/api/v1/spells?level=3"
```

**Operators:** `=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `AND`, `OR`, `IS EMPTY`, `IS NOT EMPTY`

### Key Endpoints

| Type | Endpoints |
|------|-----------|
| **Entities** | `/spells`, `/monsters`, `/items`, `/classes`, `/races`, `/backgrounds`, `/feats` |
| **Reference** | `/ability-scores`, `/conditions`, `/damage-types`, `/skills`, `/sizes`, `/languages`, `/spell-schools`, `/sources`, `/item-types`, `/proficiency-types` |
| **Other** | `/search` (global search) |

---

## Project Structure

```
app/
├── components/       # Vue components (auto-import)
│   ├── spell/       # Entity-specific (SpellCard, etc.)
│   ├── monster/
│   ├── character/   # Character builder + sheet
│   │   ├── wizard/  # StepName, StepRace, StepClass, etc.
│   │   └── sheet/   # Header, AbilityScoreBlock, SkillsList, etc.
│   └── ui/          # Reusable (UiListPageHeader, etc.)
├── composables/     # useEntityList, useMeilisearchFilters, etc.
│   ├── useCharacterSheet.ts    # Parallel fetch for character data
│   ├── useUnifiedChoices.ts    # Choice management via unified API
│   └── useCharacterSlug.ts     # D&D-themed public ID generator
├── stores/          # Pinia stores (7 filter stores + characterWizard)
├── pages/           # File-based routing
│   └── characters/
│       ├── index.vue           # Character list
│       └── [publicId]/         # Uses public ID, not numeric ID
│           ├── index.vue       # Character sheet view
│           └── edit/           # Wizard edit flow
├── types/           # TypeScript types (api/generated.ts)
└── assets/css/      # Tailwind + NuxtUI colors

tests/
├── components/      # Component tests by entity
├── stores/          # Pinia store tests
├── composables/     # Composable tests
└── helpers/         # Shared test utilities

docs/
├── PROJECT-STATUS.md   # Metrics (single source of truth)
├── LATEST-HANDOVER.md  # Symlink → wrapper repo handover
└── README.md           # Points to wrapper for all other docs

# All other docs in: ../wrapper/docs/frontend/
```

---

## Docker Setup

```bash
# 1. Start backend first
cd ../backend && docker compose up -d

# 2. Start frontend
cd ../frontend && docker compose up -d

# 3. Install dependencies (first time)
docker compose exec nuxt npm install

# Access: http://localhost:4000 (or http://localhost:8081 via nginx)
```

**⚠️ CRITICAL:** Always use Docker. Never run dev server locally outside Docker.

---

## Testing with Pinia

```typescript
import { setActivePinia, createPinia } from 'pinia'

describe('Page Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('tests filter state', async () => {
    const wrapper = await mountSuspended(Page)
    // Clear persisted state if testing initial state
    wrapper.vm.clearFilters?.()
    await wrapper.vm.$nextTick()
  })
})
```

---

## Success Checklist

Before creating a PR:

- [ ] Working on feature branch (`feature/issue-N-*`)
- [ ] Tests written FIRST (TDD mandate)
- [ ] All tests pass (domain suite + full suite)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Browser verification (light/dark mode)
- [ ] Mobile-responsive
- [ ] CHANGELOG.md updated (if user-facing)
- [ ] Commits pushed to feature branch
- [ ] **PR created with issue reference** (`Closes #N`)

**If ANY checkbox is unchecked, work is NOT done.**

---

## Resources

- **Nuxt 4:** https://nuxt.com/docs/4.x
- **NuxtUI 4:** https://ui.nuxt.com/docs
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Backend API Docs:** http://localhost:8080/docs/api

---

**Default Branch:** `main` | **Workflow:** Feature branches → PR → Merge | **Status:** See `docs/PROJECT-STATUS.md`
