# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Frontend** for D&D 5e Compendium. Consumes REST API from `../importer` (Laravel backend).

**Status:** ✅ **PRODUCTION-READY** - 6 entity types, pagination, semantic colors, consistent UI, reusable components.

**⚠️ CRITICAL:** Read `docs/CURRENT_STATUS.md` first for complete project overview.

---

## 🚨 Superpowers Skills

**This is a JavaScript/TypeScript/Nuxt.js frontend project, NOT Laravel.**

- ✅ **USE:** `superpowers:*` skills
- ❌ **DO NOT USE:** `superpowers-laravel:*` skills (backend only)

---

## 🤖 AI Assistant Context (llms.txt)

**Before starting ANY work, fetch these:**

- **Nuxt:** `https://nuxt.com/llms.txt` (~5K tokens) or `https://nuxt.com/llms-full.txt` (1M+ tokens)
- **NuxtUI:** `https://ui.nuxt.com/llms.txt` (~5K tokens) or `https://ui.nuxt.com/llms-full.txt` (800K+ tokens)
- **Nuxt Image:** `https://image.nuxt.com/llms.txt`

---

## Backend API

**Location:** `/Users/dfox/Development/dnd/importer`
**Base URL:** `http://localhost:8080/api/v1`
**Docs:** `http://localhost:8080/docs/api`
**Spec:** `http://localhost:8080/docs/api.json`

**Key Endpoints:**
- `GET /api/v1/{entity}` - List (spells, items, races, classes, backgrounds, feats, monsters)
- `GET /api/v1/{entity}/{id|slug}` - Single entity (ID or slug)
- `GET /api/v1/search` - Global search

**Features:** Dual ID/Slug routing, Meilisearch (<50ms), pagination (default: 15/page)

---

## Tech Stack

**⚠️ CRITICAL:** Use specific versions below. Do NOT use older versions.

- **Framework:** Nuxt 4.x - https://nuxt.com/docs/4.x
- **UI Library:** NuxtUI 4.x - https://ui.nuxt.com/docs
- **Language:** TypeScript (strict mode)
- **Package Manager:** npm or pnpm
- **Testing:** Vitest + @nuxt/test-utils + Playwright (E2E)
- **API Client:** `$fetch` (Nuxt's built-in)
- **State:** Nuxt's `useState` + Pinia (if needed)
- **Validation:** Zod

---

## Docker Setup

**Prerequisites:** Backend running at `localhost:8080`, Docker installed.

```bash
# 1. Start backend
cd ../importer && docker compose up -d

# 2. Create .env
cp .env.example .env

# 3. Start frontend
docker compose up -d

# 4. Install dependencies (first time)
docker compose exec nuxt npm install

# 5. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8080/api/v1
```

**⚠️ CRITICAL:** Always use Docker for development/testing. Never start dev server locally outside Docker.

**Common Commands:**
```bash
docker compose exec nuxt npm run dev       # Dev server
docker compose exec nuxt npm run test      # Tests
docker compose exec nuxt npm run typecheck # Type checking
docker compose exec nuxt npm run lint      # Linting
```

---

## 🎨 NuxtUI Color System

**3-Step Process (MUST follow exactly):**

### 1. Define Semantic Names (`nuxt.config.ts`)

```typescript
ui: {
  theme: {
    colors: ['primary', 'secondary', 'spell', 'item', 'race', 'class', 'background', 'feat', 'monster']
  }
}
```

### 2. Define Custom Palettes (`app/assets/css/main.css`)

```css
@theme static {
  /* Must have exactly 11 levels: 50-950 */
  --color-arcane-50: #f5f3ff;
  --color-arcane-100: #ede9fe;
  /* ... */
  --color-arcane-950: #2e1065;
}
```

### 3. Map Names to Colors (`app/app.config.ts`)

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      spell: 'arcane',      // Custom from @theme
      item: 'treasure',     // Custom from @theme
      secondary: 'emerald'  // Tailwind default
    }
  }
})
```

**⚠️ Common Pitfalls:**
- `app.config.ts` goes in `app/` directory (Nuxt 4), NOT root!
- Must define all 11 intensity levels (50-950)
- Must register in `nuxt.config.ts` theme.colors

---

## OpenAPI Type Generation

**Generate types from backend API:**

```bash
npm run types:sync
```

**Architecture:**
1. **Generated:** `app/types/api/generated.ts` (never edit manually)
2. **Application:** `app/types/api/entities.ts`, `common.ts` (extends generated)
3. **Components:** Import application types

**When to sync:** After backend API changes, weekly/monthly, before major features.

**Workflow:**
```bash
# 1. Ensure backend running
cd ../importer && docker compose up -d

# 2. Sync types
cd ../frontend && npm run types:sync

# 3. Verify
npm run typecheck
npm run test

# 4. Commit
git add app/types/api/generated.ts
git commit -m "chore: Sync API types"
```

---

## 📋 List Page Pattern

**All 17 entity list pages use `useEntityList` composable.**

### Paginated Pages (Spells, Items, Races, Classes, Backgrounds, Feats, Monsters)

```typescript
const { searchQuery, currentPage, data, meta, totalResults, loading, error, refresh } =
  useEntityList({
    endpoint: '/spells',
    cacheKey: 'spells-list',
    queryBuilder,  // Custom filters
    perPage: 24,
    seo: { title: 'Spells', description: '...' }
  })
```

### Non-Paginated Pages (Reference entities: sizes, skills, etc.)

```typescript
const { searchQuery, data, totalResults, loading, error } =
  useEntityList({
    endpoint: '/sizes',
    cacheKey: 'sizes-list',
    queryBuilder: computed(() => ({})),
    noPagination: true,  // Sets per_page: 9999
    seo: { title: 'Sizes', description: '...' }
  })
```

**Required UI Components:**
- `<UiListPageHeader>` - Title, count, loading
- `<UiListSkeletonCards>` - Loading state
- `<UiListErrorState>` - Error state
- `<UiListEmptyState>` - Empty state
- `<UiListResultsCount>` - "1-24 of 150"
- `<UiListPagination>` - Pagination controls (paginated only)
- `<UiBackLink>` - Breadcrumb
- `<JsonDebugPanel>` - Debug (optional)

**Gold Standard:** `app/pages/spells/index.vue`, `app/pages/sizes/index.vue`

---

## 🔴 TDD MANDATE

**THIS IS NON-NEGOTIABLE.**

### Process (Follow Exactly)

1. **Write test FIRST** (RED phase)
2. **Run test - watch it FAIL**
3. **Write MINIMAL implementation** (GREEN phase)
4. **Run test - verify it PASSES**
5. **Refactor** (keep tests green)
6. **Repeat**

### Example

```typescript
// 1. Write test FIRST
describe('SpellCard', () => {
  it('displays spell name', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: { id: 1, name: 'Fireball', level: 3 } }
    })
    expect(wrapper.text()).toContain('Fireball')
  })
})

// 2. Run test - FAILS (component doesn't exist)
// 3. Write minimal implementation
// 4. Run test - PASSES
// 5. Refactor, add styling
```

### Rejection Criteria

Your work will be **REJECTED** if:
- ❌ Implementation code written before tests
- ❌ Tests skipped ("it's simple")
- ❌ Tests promised "later"
- ❌ Tests written after implementation
- ❌ "Manual testing is enough"

### Test Helpers

**For card components:** `tests/helpers/`
- `cardBehavior.ts` - Link routing, hover, borders
- `descriptionBehavior.ts` - Truncation, fallbacks
- `sourceBehavior.ts` - Source footer display

---

## 📝 CHANGELOG Updates

**⚠️ MANDATORY:** After ANY user-facing feature/fix, update `CHANGELOG.md`:

```markdown
### Added
- 3D dice background animation (2025-11-23)

### Fixed
- Query parameter forwarding in item-types API (2025-11-21)
```

---

## 🔴 Always Commit When Task Complete

**⚠️ MANDATORY:** When you complete ANY task:

1. ✅ Verify tests pass
2. ✅ Verify pages work (HTTP 200)
3. ✅ Update CHANGELOG.md (if user-facing)
4. ✅ **COMMIT IMMEDIATELY**

```bash
git add <files>
git commit -m "feat: Add feature with tests

- Created ComponentName following TDD
- Added 15 tests (all passing)
- Integrated into 6 pages

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**DO NOT:**
- ❌ Wait for "perfection"
- ❌ Batch unrelated changes
- ❌ Leave uncommitted work
- ❌ Skip commits for "small changes"

---

## Component Auto-Import

**Naming based on folder structure:**

- `components/Foo.vue` → `<Foo>`
- `components/ui/Bar.vue` → `<UiBar>` (NOT `<Bar>`)
- `components/foo/bar/Baz.vue` → `<FooBarBaz>`

**⚠️ Critical:** Nested components MUST use folder prefix!

---

## Development Commands

```bash
npm run dev         # Dev server
npm run build       # Production build
npm run test        # Vitest tests
npm run test:watch  # Watch mode
npm run test:e2e    # Playwright E2E
npm run typecheck   # TypeScript check
npm run lint        # ESLint
npm run lint:fix    # Auto-fix
```

---

## Project Structure

```
app/
├── components/       # Vue components (auto-import)
│   ├── spell/       # Entity-specific
│   ├── item/
│   └── ui/          # Reusable UI
├── composables/     # Composables (auto-import)
├── pages/           # File-based routing
├── layouts/         # Page layouts
└── types/           # TypeScript types
tests/
├── components/
├── composables/
└── e2e/
docs/                # Documentation
```

---

## Best Practices

**Code Style:**
- `<script setup lang="ts">` (Composition API)
- `ref` over `reactive` (better types)
- Extract reusable composables
- Tailwind via NuxtUI components
- Components <150 lines

**File Naming:**
- Components: `PascalCase.vue`
- Composables: `camelCase.ts`
- Pages: `lowercase/kebab-case`
- Types: `camelCase.d.ts`

**Component Design:**
- Single responsibility
- Clear props API with TypeScript
- Emit events (don't call parent methods)
- Handle empty/undefined gracefully
- Support dark mode
- **Write tests first (TDD)**

**Performance:**
- `useAsyncData` for caching
- Lazy load heavy components (`<LazySpellCard>`)
- `<NuxtImg>` for images
- Leverage Nuxt's code-splitting

---

## Success Checklist

Before marking features complete:

- [ ] Tests written FIRST (TDD mandate)
- [ ] All new tests pass
- [ ] Full test suite passes
- [ ] TypeScript compiles (no errors)
- [ ] ESLint passes
- [ ] Browser verification (light/dark mode)
- [ ] SSR works (no hydration errors)
- [ ] Mobile-responsive (375px, 768px, 1440px)
- [ ] Accessible (keyboard, screen reader)
- [ ] **Work committed immediately**

**If ANY checkbox is unchecked, feature is NOT done.**

---

## Key Documentation

- **Status:** `docs/CURRENT_STATUS.md`
- **Latest Handover:** `docs/HANDOVER-2025-11-23-3D-DICE-INTEGRATION.md`
- **3D Dice Guide:** `docs/3D-DICE-IMPLEMENTATION.md`
- **List Page Pattern:** `docs/HANDOVER-2025-11-22-LIST-PAGE-STANDARDIZATION-COMPLETE.md`

---

## Resources

- **Nuxt 4:** https://nuxt.com/docs/4.x
- **NuxtUI 4:** https://ui.nuxt.com/docs
- **Vue 3:** https://vuejs.org/guide/extras/composition-api-faq.html
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Backend API Docs:** http://localhost:8080/docs/api

---

**Project Status:** Production-ready. 6 entity types, 8 reusable components, 87 tests, comprehensive docs. Ready for advanced features or deployment.

**Next Agent:** Read `docs/CURRENT_STATUS.md` first, then this file for patterns and setup.
