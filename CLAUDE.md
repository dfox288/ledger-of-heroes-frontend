# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

Nuxt 4.x frontend for D&D 5e Compendium. Consumes REST API from `../importer` (Laravel backend).

**Tech Stack:** Nuxt 4.x | NuxtUI 4.x | TypeScript | Vitest | Playwright | Pinia | Docker

**Commands:** `docker compose exec nuxt npm run ...` | Always use Docker, never run locally.

**Essential Docs:**
- `docs/PROJECT-STATUS.md` - Metrics and current status
- `docs/TODO.md` - Active tasks
- `docs/LATEST-HANDOVER.md` - Latest session handover
- `docs/proposals/` - API enhancement proposals

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
docker compose exec nuxt npm run types:sync # Sync API types from backend
```

| Working On | Test Suite | Runtime |
|------------|------------|---------|
| Spells page, SpellCard, filters | `npm run test:spells` | ~14s |
| Items page, ItemCard, filters | `npm run test:items` | ~12s |
| Monsters page, filters | `npm run test:monsters` | ~12s |
| Classes page, filters | `npm run test:classes` | ~12s |
| Races page, filters | `npm run test:races` | ~10s |
| Backgrounds page, filters | `npm run test:backgrounds` | ~10s |
| Feats page, filters | `npm run test:feats` | ~8s |
| Reference entities (sizes, skills) | `npm run test:reference` | ~10s |
| Shared UI components | `npm run test:ui` | ~52s |
| Composables, utils, server API | `npm run test:core` | ~18s |
| CI, pre-commit, final check | `npm run test` | ~125s |

---

## Development Cycle

### Every Feature/Fix

```
1. Check skills           → Use Superpower skills (NOT superpowers-laravel)
2. Update docs/TODO.md    → Mark task "in progress"
3. Write tests FIRST      → Watch them fail (TDD mandatory)
4. Write minimal code     → Make tests pass
5. Refactor while green   → Clean up
6. Run test suite         → Smallest relevant suite
7. Run npm run lint:fix   → Fix linting
8. Update CHANGELOG.md    → If user-facing
9. Commit + Push          → Clear message with Claude footer
10. Update docs/TODO.md   → Mark complete
```

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
- Run `npm run types:sync` (requires backend running)
- Run `npm run typecheck`
- Update component props if needed

---

## Standards

### TDD is Mandatory

**If tests aren't written FIRST, the feature ISN'T done.**

```typescript
// Write test FIRST
describe('SpellCard', () => {
  it('displays spell name', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })
    expect(wrapper.text()).toContain('Fireball')
  })
})

// Then implement minimal code to pass
// Then refactor while keeping tests green
```

**Rejection criteria:**
- ❌ Implementation before tests
- ❌ Tests skipped ("it's simple")
- ❌ Tests written after implementation

### Commit Convention

```bash
git commit -m "feat: Add feature description

- Detail 1
- Detail 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

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

### Other Standards
- **No git worktrees** - Work directly on main branch
- **Commit immediately** - Don't batch unrelated changes
- **CHANGELOG.md** - Update for any user-facing change

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

## API Reference

### Backend

**Location:** `../importer` | **Base URL:** `http://localhost:8080/api/v1` | **Docs:** `http://localhost:8080/docs/api`

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
│   └── ui/          # Reusable (UiListPageHeader, etc.)
├── composables/     # useEntityList, useMeilisearchFilters, etc.
├── stores/          # Pinia filter stores (7 entity stores)
├── pages/           # File-based routing
├── types/           # TypeScript types (api/generated.ts)
└── assets/css/      # Tailwind + NuxtUI colors

tests/
├── components/      # Component tests by entity
├── stores/          # Pinia store tests
├── composables/     # Composable tests
└── helpers/         # Shared test utilities

docs/
├── PROJECT-STATUS.md   # Metrics (single source of truth)
├── CURRENT_STATUS.md   # Detailed status
├── proposals/          # API enhancement proposals
├── HANDOVER-*.md       # Session handovers
└── BLOCKED-*.md        # Blocked work
```

---

## Docker Setup

```bash
# 1. Start backend first
cd ../importer && docker compose up -d

# 2. Start frontend
cd ../frontend && docker compose up -d

# 3. Install dependencies (first time)
docker compose exec nuxt npm install

# Access: http://localhost:3000
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

Before marking features complete:

- [ ] Tests written FIRST (TDD)
- [ ] All tests pass (domain suite + full suite)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Browser verification (light/dark mode)
- [ ] Mobile-responsive
- [ ] CHANGELOG.md updated (if user-facing)
- [ ] **Committed immediately**

---

## Resources

- **Nuxt 4:** https://nuxt.com/docs/4.x
- **NuxtUI 4:** https://ui.nuxt.com/docs
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Backend API Docs:** http://localhost:8080/docs/api

---

**Branch:** `main` | **Status:** See `docs/PROJECT-STATUS.md`
