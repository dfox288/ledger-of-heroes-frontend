# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **frontend application** for the D&D 5e Compendium project. It consumes the RESTful API provided by the Laravel backend located at `../importer`.

**Current Status:** ✅ **PRODUCTION-READY** - All 6 entity types (Spells, Items, Races, Classes, Backgrounds, Feats) complete with working pagination, semantic colors, consistent UI, and reusable components.

**⚠️ CRITICAL:** Read `docs/CURRENT_STATUS.md` first for complete project overview

## 🚨 SUPERPOWERS SKILLS - IMPORTANT

**This is a JavaScript/TypeScript/Nuxt.js frontend project, NOT a Laravel project.**

- ✅ **USE:** `superpowers:*` skills (e.g., `superpowers:brainstorming`, `superpowers:test-driven-development`)
- ❌ **DO NOT USE:** `superpowers-laravel:*` skills (these are for the backend Laravel project at `../importer`)

## 🤖 AI Assistant Context (llms.txt)

**For AI-Assisted Development:**

Both Nuxt and NuxtUI provide official documentation in LLM-friendly format:

**Nuxt Framework:**
- **Quick Reference:** `https://nuxt.com/llms.txt` (~5K tokens) - Overview and links
- **Full Documentation:** `https://nuxt.com/llms-full.txt` (1M+ tokens) - Complete guides

**NuxtUI Library:**
- **Quick Reference:** `https://ui.nuxt.com/llms.txt` (~5K tokens) - Component API and patterns
- **Full Documentation:** `https://ui.nuxt.com/llms-full.txt` (800K+ tokens) - Complete component docs

**⚠️ IMPORTANT:** Before starting ANY work on this frontend project, ALWAYS fetch BOTH llms.txt files to ensure AI assistance aligns with official Nuxt 4 and NuxtUI 4 patterns and best practices.

## Backend API

**Location:** `/Users/dfox/Development/dnd/importer`
**Base URL:** `http://localhost:8080/api/v1`
**OpenAPI Docs:** `http://localhost:8080/docs/api`
**OpenAPI Spec:** `http://localhost:8080/docs/api.json`

**Key Endpoints:**
- `GET /api/v1/{entity}` - List (spells, items, races, classes, backgrounds, feats)
- `GET /api/v1/{entity}/{id|slug}` - Get single entity (supports ID or slug)
- `GET /api/v1/search` - Global search across all entities

**Features:**
- Dual ID/Slug routing (e.g., `/api/v1/spells/123` or `/api/v1/spells/fireball`)
- Search & filtering with Meilisearch (<50ms response time)
- Rich nested data (traits, modifiers, proficiencies, etc.)
- Pagination (default: 15 per page)

## Tech Stack

**⚠️ CRITICAL:** This project uses specific framework versions. Do NOT use older versions.

**Framework & UI:**
- **Framework:** Nuxt.js 4.x - https://nuxt.com/docs/4.x/getting-started/introduction
- **UI Library:** NuxtUI 4.x - https://ui.nuxt.com/docs/getting-started
- **Language:** TypeScript (strict mode)
- **Package Manager:** npm or pnpm

**Why Nuxt 4.x + NuxtUI 4.x?**
- Built-in SSR/SSG for SEO-friendly pages
- File-based routing with auto-imports
- Pre-built accessible components with dark mode
- Full TypeScript support with auto-generated types
- Automatic code-splitting and optimized builds

**Key Dependencies:**
- **API Client:** `$fetch` (Nuxt's built-in fetch with SSR support)
- **State Management:** Nuxt's built-in `useState` + Pinia (if needed)
- **Validation:** Zod for schema validation
- **Testing:** Vitest + @nuxt/test-utils + @vue/test-utils
- **E2E Testing:** Playwright

## OpenAPI Type Generation

**Type System:** Hybrid generated + manual extensions

**Generate Types:**
```bash
npm run types:sync
```

**Architecture:**
1. **Generated Layer** (`app/types/api/generated.ts`) - Auto-generated from backend OpenAPI spec, never manually edit
2. **Application Layer** (`app/types/api/entities.ts`, `common.ts`) - Extends generated types with custom logic
3. **Components** - Import and use application types

**When to Sync:**
- After backend API changes (new fields, endpoints, schema changes)
- Weekly/monthly proactive check
- Before major features that depend on API structure

**Sync Workflow:**
```bash
# 1. Ensure backend is running
cd ../importer && docker compose up -d

# 2. Sync types
cd ../frontend
npm run types:sync

# 3. Verify compatibility
npm run typecheck
npm run test

# 4. Commit changes
git add app/types/api/generated.ts
git commit -m "chore: Sync API types from backend"
```

**Design Document:** `docs/plans/2025-11-22-openapi-type-generation-design.md`

---

## 🔴 ABSOLUTE MANDATE: Test-Driven Development (TDD)

**THIS IS NOT A SUGGESTION. THIS IS NOT OPTIONAL. THIS IS MANDATORY.**

### ⛔ STOP: Read This Before Writing ANY Code

If you are about to write component code, composable code, or any application logic **WITHOUT writing tests first**, you are violating the core development principle of this project.

### 🚨 TDD is NON-NEGOTIABLE

1. **Tests are documentation** - They show HOW the code should work
2. **Tests prevent regressions** - Future changes won't break existing features
3. **Tests enable refactoring** - You can improve code with confidence
4. **Tests force good design** - Testable code is well-structured code
5. **Tests save time** - Catching bugs early is cheaper than fixing them in production

### ✋ REJECTION CRITERIA - Your Work Will Be Rejected If:

- ❌ You write implementation code before tests
- ❌ You skip tests because "it's a simple component"
- ❌ You promise to "write tests later" (they never get written)
- ❌ You claim "the feature is working" without test evidence
- ❌ You write tests AFTER implementation to "check the box"
- ❌ You rationalize that "manual testing is enough"

**If any of the above apply, the work is INCOMPLETE and must be redone.**

### ✅ MANDATORY TDD Process (Follow Exactly)

#### Step 1: Write Test FIRST (RED Phase)
```typescript
// tests/components/SpellCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellCard from '~/components/spell/SpellCard.vue'

describe('SpellCard', () => {
  it('displays spell name and level', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: {
        spell: {
          id: 1,
          name: 'Fireball',
          level: 3,
          school: { id: 1, name: 'Evocation' }
        }
      }
    })

    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.text()).toContain('3rd Level')
  })
})
```

#### Step 2: Run Test - Watch It FAIL
```bash
npm run test -- SpellCard.test.ts
# Expected: Test fails because SpellCard doesn't exist yet
```

#### Step 3: Write MINIMAL Implementation (GREEN Phase)
```typescript
// app/components/spell/SpellCard.vue
<script setup lang="ts">
interface Props {
  spell: {
    name: string
    level: number
  }
}

const props = defineProps<Props>()
const levelText = computed(() =>
  props.spell.level === 0 ? 'Cantrip' : `${props.spell.level}${['th','st','nd','rd'][props.spell.level] || 'th'} Level`
)
</script>

<template>
  <div>
    <h3>{{ spell.name }}</h3>
    <span>{{ levelText }}</span>
  </div>
</template>
```

#### Step 4: Run Test - Verify It PASSES
```bash
npm run test -- SpellCard.test.ts
# Expected: Test passes - GREEN!
```

#### Step 5: Refactor (Keep Tests GREEN)
Add styling, icons, etc. Run tests after each change.

#### Step 6: Add More Tests, Repeat
```typescript
it('shows school badge when school is provided', async () => { ... })
it('handles missing school gracefully', async () => { ... })
it('displays ritual badge when is_ritual is true', async () => { ... })
```

### 📋 TDD Checklist for EVERY Feature

Before marking work complete, verify:

- [ ] ✅ Tests were written BEFORE implementation
- [ ] ✅ Tests failed initially (RED phase verified)
- [ ] ✅ Minimal code was written to pass tests (GREEN phase)
- [ ] ✅ Code was refactored while keeping tests green
- [ ] ✅ All new tests pass
- [ ] ✅ Full test suite passes (no regressions)
- [ ] ✅ Coverage includes happy path AND edge cases
- [ ] ✅ Tests are readable and maintainable
- [ ] ✅ Manual browser verification completed
- [ ] ✅ Tests are committed with implementation

**If ANY checkbox is unchecked, the feature is NOT complete.**

### 🎯 What Must Be Tested

**Components:**
- ✅ Props render correctly
- ✅ Computed properties calculate right values
- ✅ User interactions trigger expected behavior
- ✅ Conditional rendering works (v-if, v-show)
- ✅ Event emissions fire with correct data
- ✅ Edge cases (null, undefined, empty arrays)
- ✅ Error states display appropriately

**Composables:**
- ✅ Functions return expected data types
- ✅ Reactive state updates correctly
- ✅ API calls are made with correct parameters
- ✅ Error handling works as expected
- ✅ Side effects are properly managed

**Pages:**
- ✅ SSR renders without hydration errors
- ✅ Client-side navigation works
- ✅ Query parameters are parsed correctly
- ✅ Data fetching succeeds and fails gracefully
- ✅ Meta tags are set correctly

### 🚫 Forbidden Phrases (Auto-Reject)

If you say ANY of these, you are violating TDD:

- ❌ "I'll write tests after implementing the feature"
- ❌ "The component is simple, so tests aren't needed"
- ❌ "I tested it manually in the browser"
- ❌ "We can add tests in a future PR"
- ❌ "The code is self-documenting, tests would be redundant"

**Correct responses:**
- ✅ "Let me write the test first to define expected behavior"
- ✅ "I've written tests that currently fail, now I'll implement"
- ✅ "Tests pass, now I can refactor with confidence"

### 💪 Mandatory Development Flow

```
User Request → Understand Requirements → 🔴 WRITE TEST FIRST
    → Watch Test FAIL → Write Minimal Code → Watch Test PASS
    → Refactor (keep tests green) → More Tests? (loop back)
    → Manual Browser Check → Commit (tests + code together) → Done!
```

**Any deviation from this flow is unacceptable.**

**Remember: Tests are not optional. Tests are the foundation of maintainable software. Write tests first, always.**

### 🔧 Test Helpers (For Card Components)

The project includes reusable test helpers for card components to reduce redundancy:

**Location:** `tests/helpers/`

**Available Helpers:**
- `cardBehavior.ts` - Link routing, hover effects, border styling tests
- `descriptionBehavior.ts` - Description truncation and fallback tests
- `sourceBehavior.ts` - Source footer display tests

**Usage Example:**
```typescript
import { testCardHoverEffects, testCardBorderStyling } from '../../helpers/cardBehavior'

describe('MyNewCard', () => {
  const mountCard = () => mountSuspended(MyNewCard, { props: mockData })

  // Shared behavior tests (1 line each)
  testCardHoverEffects(mountCard)
  testCardBorderStyling(mountCard)

  // Domain-specific tests (focus here)
  it('displays my unique field', ...)
})
```

**When to use helpers:**
- ✅ Creating new card components
- ✅ Testing shared UI behavior (hover, links, borders)
- ❌ Don't use for unique domain logic (test directly)

---

## 📝 CHANGELOG UPDATES

**⚠️ MANDATORY:** After completing ANY user-facing feature or fix, update `CHANGELOG.md`:

1. Add entry to the `[Unreleased]` section
2. Use appropriate category: `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`, `Security`
3. Include date in format `(YYYY-MM-DD)`
4. Be concise but descriptive

**Example:**
```markdown
### Added
- Random tables display for spells (2025-11-21)

### Fixed
- Query parameter forwarding in item-types API endpoint (2025-11-21)
```

---

## 🔴 CRITICAL: Always Commit When Task Complete

**⚠️ MANDATORY WORKFLOW:**

When you complete ANY task (feature, refactoring, bug fix, etc.), you MUST:
1. ✅ Verify all tests pass
2. ✅ Verify pages work in browser (HTTP 200)
3. ✅ **UPDATE CHANGELOG.md** (if user-facing change)
4. ✅ **COMMIT THE WORK IMMEDIATELY**

**Why This Matters:**
- Prevents work from being lost
- Creates clear history of changes
- Allows easy rollback if needed
- Maintains clean development flow
- Enables collaboration with proper context

**When to Commit:**
- ✅ After completing a feature
- ✅ After refactoring work
- ✅ After fixing a bug
- ✅ After creating/updating tests
- ✅ After ANY meaningful unit of work

**Example Workflow:**
```bash
# 1. Complete the work
npm test              # All tests pass ✅
curl http://localhost:3000/spells  # Page works ✅

# 2. Stage changes
git add <files>

# 3. Commit with descriptive message
git commit -m "feat: Add new component with tests

- Created <ComponentName> following TDD
- Added 15 tests (all passing)
- Integrated into 6 pages
- Verified all pages work

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Continue to next task
```

**DO NOT:**
- ❌ Wait until "everything is perfect" to commit
- ❌ Batch multiple unrelated changes into one commit
- ❌ Leave uncommitted work at end of session
- ❌ Skip commits for "small changes"

**Commit messages should:**
- Start with type: `feat:`, `refactor:`, `fix:`, `test:`, `docs:`
- Be descriptive (what and why)
- Include impact metrics (tests added, lines saved, etc.)
- End with Claude Code attribution

---

## Docker Setup

**Prerequisites:**
1. Backend API running at `localhost:8080`
2. Docker and Docker Compose installed

**Quick Start:**
```bash
# 1. Start backend (from ../importer)
cd ../importer && docker compose up -d
cd ../frontend

# 2. Create environment file
cp .env.example .env

# 3. Start frontend containers
docker compose up -d

# 4. Install dependencies (first time only)
docker compose exec nuxt npm install

# 5. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api/v1
# API Docs: http://localhost:8080/docs/api
```

**⚠️ CRITICAL TESTING PROTOCOL:**
- **ALWAYS use Docker containers for development and testing**
- **NEVER start the dev server locally outside Docker**
- All development commands must be run via `docker compose exec nuxt <command>`
- Testing in the browser MUST be done against Docker container URLs

**Common Docker Commands:**
```bash
# Container management
docker compose up -d          # Start containers
docker compose down           # Stop containers
docker compose restart nuxt   # Restart Nuxt
docker compose logs -f nuxt   # Follow logs

# Running commands
docker compose exec nuxt npm run dev       # Start dev server
docker compose exec nuxt npm install       # Install dependencies
docker compose exec nuxt npm run test      # Run tests
docker compose exec nuxt npm run lint      # Lint code

# Debugging
docker compose exec nuxt sh               # Shell into container
docker compose logs --tail=100 nuxt       # View last 100 lines
```

---

## Project Structure (Key Directories)

```
frontend/
├── app/
│   ├── components/          # Vue components (auto-imported)
│   │   ├── spell/          # Entity-specific components
│   │   ├── item/
│   │   ├── race/
│   │   └── ui/             # Reusable UI components
│   ├── composables/        # Composables (auto-imported)
│   ├── pages/              # File-based routing
│   ├── layouts/            # Page layouts
│   └── types/              # TypeScript types
├── tests/
│   ├── components/
│   ├── composables/
│   └── e2e/
├── docs/                   # Project documentation
├── docker/                 # Docker configuration
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.ts      # Tailwind CSS config
└── package.json
```

---

## Component Auto-Import Rules

**⚠️ CRITICAL:** Nuxt 4 auto-imports components with specific naming based on folder structure.

**Component Naming Patterns:**
- **Root level** (`components/Foo.vue`) → Use as `<Foo>`
- **Nested folders** (`components/ui/Bar.vue`) → Use as `<UiBar>`
- **Deep nesting** (`components/foo/bar/Baz.vue`) → Use as `<FooBarBaz>`

**When Multiple Components Share the Same Name:**
- Components in nested directories MUST use the folder prefix
- Example:
  - `components/ui/SourceDisplay.vue` → `<UiSourceDisplay>` (CORRECT)
  - `components/ui/SourceDisplay.vue` → `<SourceDisplay>` (WRONG - will fail silently)

**Debugging Component Issues:**
1. Check if the component exists: `ls -la app/components/ui/`
2. Verify correct naming: `<UiComponentName>` for `components/ui/ComponentName.vue`
3. Check dev server output for compilation errors
4. Test in Docker container, not locally

---

## Development Commands

**Development:**
```bash
npm install                  # Install dependencies
npm run dev                  # Start Nuxt dev server
npm run build                # Production build
npm run preview              # Preview production build
```

**Testing:**
```bash
npm run test                 # Run all tests (Vitest)
npm run test:watch           # Run tests in watch mode
npm run test:ui              # Open Vitest UI
npm run test:coverage        # Generate coverage report
npm run test:e2e             # Run Playwright E2E tests
```

**Code Quality:**
```bash
npm run lint                 # Lint code (ESLint)
npm run lint:fix             # Auto-fix linting issues
npm run typecheck            # TypeScript type checking
```

---

## Key Documentation

**Current Status:** `docs/CURRENT_STATUS.md` - Complete project overview
**Refactoring Details:** `docs/REFACTORING-COMPLETE.md` - Component extraction details
**Latest Handover:** `docs/HANDOVER-2025-01-21-UI-CONSISTENCY-COMPLETE.md`
**Setup Guide:** `CLAUDE.md` (this file)

---

## Best Practices Summary

**Code Style:**
- Use `<script setup lang="ts">` (Composition API)
- Prefer `ref` over `reactive` for better type inference
- Extract reusable composables (`useSpells`, `useApi`)
- Use Tailwind CSS via NuxtUI components
- Keep components small and focused (<150 lines)

**File Naming:**
- Components: PascalCase.vue (`SpellCard.vue`)
- Composables: camelCase.ts (`useSpells.ts`)
- Pages: lowercase/kebab-case (`spells/index.vue`)
- Types: camelCase.d.ts (`api.d.ts`)

**Component Design:**
- Single responsibility
- Clear props API with TypeScript interfaces
- Event-based communication (emit, don't call parent methods)
- Handle empty/undefined states gracefully
- Support dark mode
- Write tests first (TDD)

**Performance:**
- Use `useAsyncData` for automatic caching
- Lazy load heavy components (`<LazySpellCard>`)
- Use `<NuxtImg>` for optimized images
- Leverage Nuxt's automatic code-splitting

---

## Success Criteria (Before Marking Features Complete)

- [ ] New feature has dedicated tests (unit + component)
- [ ] All new tests pass
- [ ] Full test suite passes (no regressions)
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] Manually verified in browser (both light/dark mode)
- [ ] SSR works correctly (no hydration errors)
- [ ] Mobile-responsive (tested at 375px, 768px, 1440px)
- [ ] Accessible (keyboard navigation, screen reader)
- [ ] **Tests written FIRST (TDD mandate)**
- [ ] **Work committed immediately after completion**

**If any checkbox is unchecked, the feature ISN'T done.**

---

## Resources

**Framework Documentation:**
- Nuxt 4.x: https://nuxt.com/docs/4.x/getting-started/introduction
- NuxtUI 4.x: https://ui.nuxt.com/docs/getting-started
- Vue 3 Composition API: https://vuejs.org/guide/extras/composition-api-faq.html

**Testing:**
- Vitest: https://vitest.dev/
- @nuxt/test-utils: https://nuxt.com/docs/getting-started/testing
- @vue/test-utils: https://test-utils.vuejs.org/
- Playwright: https://playwright.dev/

**Backend Documentation:**
- API Docs (Interactive): `http://localhost:8080/docs/api`
- API Spec (JSON): `http://localhost:8080/docs/api.json`
- Backend CLAUDE.md: `../importer/CLAUDE.md`

---

**Project Status:** 🚧 Production-ready with 6 entity types, 8 reusable components, 87 tests, and comprehensive documentation. Ready for advanced features, performance optimization, or deployment.

**Next Agent: Read `docs/CURRENT_STATUS.md` first, then this file for setup and patterns.**
