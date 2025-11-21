# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **frontend application** for the D&D 5e Compendium project. It is designed to consume the RESTful API provided by the Laravel backend located at `../importer`.

**Current Status:** ✅ **PRODUCTION-READY** - All 6 entity types (Spells, Items, Races, Classes, Backgrounds, Feats) complete with:
- Working pagination (NuxtUI v4 API with URL support)
- Semantic color-coded badges
- Collapsible accordions on detail pages
- Consistent card layouts with sources
- Full data field display

**⚠️ CRITICAL:** Read `docs/CURRENT_STATUS.md` first for complete project overview

**Latest Updates (Session 2025-01-21):**
- ✅ Enhanced spell, item, and race list + detail pages
- ✅ Fixed pagination (NuxtUI v4 v-model:page API)
- ✅ Applied semantic colors throughout
- ✅ Added accordion UI to detail pages
- ✅ Ensured all API fields are displayed
- 🔜 Classes, Backgrounds, Feats pages need same treatment

## 🚨 SUPERPOWERS SKILLS - IMPORTANT

**This is a JavaScript/TypeScript/Nuxt.js frontend project, NOT a Laravel project.**

When using Superpowers skills:
- ✅ **USE:** `superpowers:*` skills (e.g., `superpowers:brainstorming`, `superpowers:test-driven-development`, `superpowers:systematic-debugging`)
- ❌ **DO NOT USE:** `superpowers-laravel:*` skills (these are for the backend Laravel project at `../importer`)

The Laravel superpowers are for the **backend API project only**. This frontend uses standard JavaScript/TypeScript workflows and Vitest (not Laravel/PHPUnit/Pest).

## 🤖 AI Assistant Context (llms.txt)

**For AI-Assisted Development:**

Both Nuxt and NuxtUI provide official documentation in LLM-friendly format:

**Nuxt Framework:**
- **Quick Reference:** `https://nuxt.com/llms.txt` (~5K tokens) - Overview and links
- **Full Documentation:** `https://nuxt.com/llms-full.txt` (1M+ tokens) - Complete guides

**NuxtUI Library:**
- **Quick Reference:** `https://ui.nuxt.com/llms.txt` (~5K tokens) - Component API and patterns
- **Full Documentation:** `https://ui.nuxt.com/llms-full.txt` (800K+ tokens) - Complete component docs

**How to use:**
- **In this conversation:** Ask me to fetch both `https://nuxt.com/llms.txt` AND `https://ui.nuxt.com/llms.txt` for Nuxt 4 + NuxtUI best practices
- **In Cursor/Windsurf:** Type `@https://nuxt.com/llms.txt` and `@https://ui.nuxt.com/llms.txt` (manual typing required, copy-paste breaks context)
- **For specific questions:** Reference the appropriate URL when asking Nuxt or NuxtUI-related questions

**⚠️ IMPORTANT:** Before starting ANY work on this frontend project, ALWAYS fetch BOTH llms.txt files to ensure AI assistance aligns with official Nuxt 4 and NuxtUI 4 patterns and best practices.

## Parent Project Context

### Backend API Location
The backend Laravel API is located at: `/Users/dfox/Development/dnd/importer`

### Available API Endpoints (Base URL: `/api/v1`)

**Entity Endpoints:**
- `GET /api/v1/spells` - List/search spells (paginated, filterable by level, school, etc.)
- `GET /api/v1/spells/{id|slug}` - Get single spell (supports numeric ID or slug like "fireball")
- `GET /api/v1/races` - List/search races and subraces
- `GET /api/v1/races/{id|slug}` - Get single race
- `GET /api/v1/items` - List/search items and equipment
- `GET /api/v1/items/{id|slug}` - Get single item
- `GET /api/v1/backgrounds` - List/search character backgrounds
- `GET /api/v1/backgrounds/{id|slug}` - Get single background
- `GET /api/v1/classes` - List/search classes and subclasses
- `GET /api/v1/classes/{id|slug}` - Get single class
- `GET /api/v1/feats` - List/search feats
- `GET /api/v1/feats/{id|slug}` - Get single feat
- `GET /api/v1/search` - Global search across all entity types

**Lookup/Reference Endpoints:**
- `GET /api/v1/sources` - D&D sourcebooks (PHB, XGE, TCE, etc.)
- `GET /api/v1/spell-schools` - 8 schools of magic
- `GET /api/v1/damage-types` - 13 damage types
- `GET /api/v1/conditions` - 15 D&D conditions
- `GET /api/v1/proficiency-types` - Weapons, armor, tools, etc. (filterable by category)
- `GET /api/v1/languages` - 30 D&D languages
- `GET /api/v1/sizes` - Creature sizes
- `GET /api/v1/ability-scores` - STR, DEX, CON, INT, WIS, CHA
- `GET /api/v1/skills` - D&D skills
- `GET /api/v1/item-types` - Item categories
- `GET /api/v1/item-properties` - Weapon/armor properties

### Key API Features

**1. Dual ID/Slug Routing:**
All entities support both numeric IDs and SEO-friendly slugs:
- `/api/v1/spells/123` (numeric ID)
- `/api/v1/spells/fireball` (slug)
- `/api/v1/races/dwarf-hill` (hierarchical slug for subrace)

**2. Search & Filtering:**
- **Global search:** `GET /api/v1/search?q=dragon&types[]=spell&types[]=item`
- **Entity search:** `GET /api/v1/spells?q=fire`
- **Filters:** `?level=3`, `?school=1`, `?rarity=rare`, etc.
- **Sorting:** `?sort_by=name&sort_direction=asc`
- **Pagination:** `?per_page=25` (default: 15)
- **Search engine:** Laravel Scout + Meilisearch (typo-tolerant, <50ms response time)

**3. Rich Nested Data:**
Entities include deeply nested relationships:
- Spells: effects, class associations, multi-source citations
- Races: traits, ability modifiers, proficiencies, languages, random tables
- Items: magic properties, modifiers, abilities, prerequisites
- Classes: features, spell progression, proficiencies
- Feats: modifiers, prerequisites (ability scores, races, skills)

**4. OpenAPI Documentation:**
The backend generates OpenAPI 3.0 docs via Scramble:
- **Interactive Docs:** `http://localhost:8080/docs/api`
- **JSON Spec:** `http://localhost:8080/docs/api.json`

**⚠️ IMPORTANT:** Always download the latest OpenAPI spec (`api.json`) before doing API work. Use it as the source of truth for:
- Available endpoints and their parameters
- Request/response schemas
- Data types and validations
- Generate TypeScript types automatically

## Tech Stack

**⚠️ CRITICAL:** This project uses specific framework versions. Do NOT use older versions.

### Framework & UI
- **Framework:** Nuxt.js 4.x - https://nuxt.com/docs/4.x/getting-started/introduction
- **UI Library:** NuxtUI 4.x - https://ui.nuxt.com/docs/getting-started
- **Language:** TypeScript (strict mode)
- **Package Manager:** npm or pnpm

### Why Nuxt 4.x + NuxtUI 4.x?
- **Built-in SSR/SSG:** SEO-friendly pages for spells, items, races (critical for discoverability)
- **File-based routing:** Automatic route generation from `/pages` directory
- **Auto-imports:** No need to manually import Vue components, composables, utils
- **NuxtUI benefits:** Pre-built accessible components, dark mode, Tailwind CSS integration
- **Type safety:** Full TypeScript support with auto-generated types
- **Performance:** Automatic code-splitting, lazy loading, optimized builds

### Key Dependencies
- **API Client:** `$fetch` (Nuxt's built-in fetch with SSR support) or `ofetch`
- **State Management:** Nuxt's built-in `useState` + Pinia (if complex state needed)
- **Forms:** VeeValidate or native form handling
- **Validation:** Zod for schema validation
- **Testing:** Vitest + @nuxt/test-utils + @vue/test-utils
- **E2E Testing:** Playwright

## 🔴 ABSOLUTE MANDATE: Test-Driven Development (TDD)

**THIS IS NOT A SUGGESTION. THIS IS NOT OPTIONAL. THIS IS MANDATORY.**

### ⛔ STOP: Read This Before Writing ANY Code

If you are about to write component code, composable code, or any application logic **WITHOUT writing tests first**, you are violating the core development principle of this project.

**The previous development session FAILED to follow TDD.** Zero tests were written. This created technical debt and violated explicit project requirements. **You must not repeat this mistake.**

### 🚨 TDD is NON-NEGOTIABLE - Here's Why

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
          slug: 'fireball',
          level: 3,
          school: { id: 1, name: 'Evocation' },
          casting_time: '1 action',
          range: '150 feet',
          description: 'A bright streak...',
          is_ritual: false,
          needs_concentration: false
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
# This confirms the test is actually testing something!
```

#### Step 3: Write MINIMAL Implementation (GREEN Phase)
```typescript
// app/components/spell/SpellCard.vue
<script setup lang="ts">
interface Props {
  spell: {
    name: string
    level: number
    // ... minimal props needed
  }
}

const props = defineProps<Props>()

const levelText = computed(() => {
  if (props.spell.level === 0) return 'Cantrip'
  return `${props.spell.level}${['th', 'st', 'nd', 'rd'][props.spell.level] || 'th'} Level`
})
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
```typescript
// Now add styling, icons, emojis, etc.
// Run tests after each change to ensure nothing breaks
```

#### Step 6: Add More Tests, Repeat
```typescript
it('shows school badge when school is provided', async () => { ... })
it('handles missing school gracefully', async () => { ... })
it('displays ritual badge when is_ritual is true', async () => { ... })
it('navigates to detail page when clicked', async () => { ... })
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
- ❌ "I don't know how to test this, so I'll skip it"

**Correct responses:**
- ✅ "Let me write the test first to define expected behavior"
- ✅ "I've written tests that currently fail, now I'll implement"
- ✅ "Tests pass, now I can refactor with confidence"
- ✅ "I need to learn how to test this before implementing"

### 🎓 TDD Resources

**Nuxt Testing:**
- https://nuxt.com/docs/getting-started/testing
- https://test-utils.vuejs.org/
- https://vitest.dev/

**Example Test Structure:**
```typescript
describe('ComponentName', () => {
  describe('prop: propName', () => {
    it('renders correctly when provided', () => { ... })
    it('uses default value when omitted', () => { ... })
    it('handles invalid value gracefully', () => { ... })
  })

  describe('computed: computedName', () => {
    it('calculates correct value for case A', () => { ... })
    it('calculates correct value for case B', () => { ... })
  })

  describe('event: eventName', () => {
    it('emits when user does action', () => { ... })
    it('emits correct payload', () => { ... })
  })
})
```

### 🔄 Current Status: NO TESTS EXIST

**The previous session built 6 entity card components, 12 pages, and 2 composables WITHOUT tests.**

This technical debt must be addressed:
1. New features MUST follow TDD (tests first)
2. Existing components SHOULD get tests added
3. Any refactoring MUST be test-protected

### 💪 Mandatory Development Flow

```
User Request
    ↓
Understand Requirements
    ↓
🔴 WRITE TEST FIRST ← You are here!
    ↓
Watch Test FAIL
    ↓
Write Minimal Code
    ↓
Watch Test PASS
    ↓
Refactor (keep tests green)
    ↓
More Tests? → Yes → Loop back
    ↓ No
Manual Browser Check
    ↓
Commit (tests + code together)
    ↓
Done!
```

**Any deviation from this flow is unacceptable.**

---

**Remember: Tests are not optional. Tests are not "nice to have". Tests are the foundation of maintainable software. Write tests first, always.**

### Testing Standards for Nuxt 4.x:

**Test Framework:** Vitest (required for Nuxt 4.x)

```typescript
// ✅ CORRECT - Vitest with @nuxt/test-utils
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellCard from '~/components/SpellCard.vue'

describe('SpellCard', () => {
  it('displays spell name and level', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: { name: 'Fireball', level: 3 } }
    })
    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.text()).toContain('3rd level')
  })
})
```

### What Must Be Tested:

**For Component Changes:**
- ✅ Component renders with correct props
- ✅ User interactions trigger expected behavior
- ✅ Conditional rendering works correctly
- ✅ Emitted events fire with correct data
- ✅ Edge cases (empty states, loading states, error states)

**For Composable Changes:**
- ✅ Composables return expected data structure
- ✅ Reactive state updates correctly
- ✅ API calls are made with correct parameters
- ✅ Error handling works as expected
- ✅ Cache invalidation works properly

**For API Integration:**
- ✅ API client sends correct requests
- ✅ Responses are parsed correctly
- ✅ TypeScript types match OpenAPI spec
- ✅ Error responses handled gracefully
- ✅ Loading and error states managed

**For Page/Route Changes:**
- ✅ Page renders with correct layout
- ✅ Route params/query parsed correctly
- ✅ SSR hydration works without errors
- ✅ Meta tags set correctly
- ✅ Navigation works as expected

### Example TDD Workflow:

```bash
# 1. Write failing test
npm run test -- SpellList.test.ts
# SHOULD FAIL - feature doesn't exist yet

# 2. Implement minimal code
# ... write component/composable code ...

# 3. Watch test pass
npm run test -- SpellList.test.ts
# SHOULD PASS

# 4. Run full suite
npm run test
# ALL TESTS SHOULD PASS

# 5. Verify in browser
npm run dev
# Manual testing

# 6. Lint and type-check
npm run lint
npm run typecheck
```

### ❌ Anti-Patterns to Avoid:

- Writing implementation code before tests
- "I'll write tests after" (never happens)
- Skipping component tests "because it's simple"
- Not testing edge cases (null, undefined, empty arrays)
- Not testing error states
- Assuming existing tests cover new features
- Not updating types when API changes

### ✅ Success Criteria:

Before marking ANY feature complete:
- [ ] New feature has dedicated tests (unit + component)
- [ ] All new tests pass
- [ ] Full test suite passes (no regressions)
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] Manually verified in browser (both light/dark mode)
- [ ] SSR works correctly (no hydration errors)
- [ ] Mobile-responsive (tested at 375px, 768px, 1440px)
- [ ] Accessible (keyboard navigation, screen reader)
- [ ] Performance acceptable (no unnecessary re-renders)

**If tests aren't written, the feature ISN'T done.**

---

## Development Workflow

### 🔴 CRITICAL: Always Commit When Task Complete

**⚠️ MANDATORY WORKFLOW:**
When you complete ANY task (feature, refactoring, bug fix, etc.), you MUST:
1. ✅ Verify all tests pass
2. ✅ Verify pages work in browser (HTTP 200)
3. ✅ **COMMIT THE WORK IMMEDIATELY**

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

### Docker Setup

This project uses Docker Compose with:
- **Node 22 Alpine** - Runs Nuxt.js application
- **Nginx 1.27 Alpine** - Reverse proxy with HMR support

### Starting the Development Environment

**1. Start Backend API (required):**
```bash
cd ../importer
docker compose up -d
docker compose exec php php artisan migrate:fresh --seed
docker compose exec php bash -c 'for file in import-files/spells-*.xml; do php artisan import:spells "$file" || true; done'
docker compose exec php bash -c 'for file in import-files/races-*.xml; do php artisan import:races "$file"; done'
docker compose exec php bash -c 'for file in import-files/items-*.xml; do php artisan import:items "$file"; done'
# API available at: http://localhost:8080/api/v1
cd ../frontend
```

**2. Create environment file:**
```bash
cp .env.example .env
```

**3. Start frontend containers:**
```bash
docker compose up -d
```

**4. Install dependencies (first time only):**
```bash
docker compose exec nuxt npm install
```

**5. Access the application:**
- **Frontend:** http://localhost:3000
- **Nuxt Dev Server (direct):** http://localhost:24678
- **Backend API:** http://localhost:8080/api/v1
- **API Docs:** http://localhost:8080/docs/api

**⚠️ CRITICAL TESTING PROTOCOL:**
- **ALWAYS use Docker containers for development and testing**
- **NEVER start the dev server locally outside Docker**
- All development commands must be run via `docker compose exec nuxt <command>`
- The dev server should be accessed through the Docker container ports (3000, or alternative ports like 3001, 3002 if 3000 is occupied)
- Testing in the browser MUST be done against the Docker container URLs (e.g., http://localhost:3000, http://localhost:3001, etc.)

### Docker Commands Reference

**Container Management:**
```bash
docker compose up -d          # Start containers in background
docker compose down           # Stop and remove containers
docker compose restart        # Restart all containers
docker compose ps             # List running containers
docker compose logs -f nuxt   # Follow Nuxt logs
docker compose logs -f nginx  # Follow Nginx logs
```

**Running Commands Inside Containers:**
```bash
docker compose exec nuxt npm run dev           # Start dev server
docker compose exec nuxt npm install           # Install dependencies
docker compose exec nuxt npm run test          # Run tests
docker compose exec nuxt npm run lint          # Lint code
docker compose exec nuxt npm run typecheck     # TypeScript check
docker compose exec nuxt npx nuxi add module   # Add Nuxt module
```

**Debugging:**
```bash
docker compose exec nuxt sh                    # Shell into Nuxt container
docker compose exec nginx sh                   # Shell into Nginx container
docker compose logs --tail=100 nuxt            # View last 100 lines of Nuxt logs
```

**Rebuild Containers (after Dockerfile changes):**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Frontend Development Commands

**Development:**
```bash
npm install                  # Install dependencies
npm run dev                  # Start Nuxt dev server (http://localhost:3000)
npm run build                # Production build
npm run preview              # Preview production build locally
npm run generate             # Generate static site (SSG)
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
npm run format               # Format code (Prettier)
```

**API Types:**
```bash
npm run generate:api-types   # Generate TypeScript types from OpenAPI spec
```

## Architecture Considerations

### Project Structure (Nuxt 4.x)

```
frontend/
├── .nuxt/                   # Auto-generated (gitignored)
├── .output/                 # Build output (gitignored)
├── assets/                  # Uncompiled assets (CSS, images)
├── components/              # Vue components (auto-imported)
│   ├── spell/
│   │   ├── SpellCard.vue
│   │   ├── SpellList.vue
│   │   └── SpellFilters.vue
│   ├── item/
│   ├── race/
│   └── ui/                  # Reusable UI components
├── composables/             # Composables (auto-imported)
│   ├── useSpells.ts         # Spell API composable
│   ├── useRaces.ts
│   ├── useItems.ts
│   └── useApi.ts            # Base API client
├── layouts/                 # Page layouts
│   ├── default.vue
│   └── docs.vue
├── middleware/              # Route middleware
├── pages/                   # File-based routing
│   ├── index.vue            # Home page
│   ├── spells/
│   │   ├── index.vue        # /spells (list)
│   │   └── [slug].vue       # /spells/fireball (detail)
│   ├── items/
│   ├── races/
│   └── search.vue           # Global search page
├── plugins/                 # Nuxt plugins
├── public/                  # Static files (served at root)
├── server/                  # Server-side API routes (if needed)
│   └── api/                 # Server endpoints
├── types/                   # TypeScript type definitions
│   ├── api.d.ts             # Generated from OpenAPI spec
│   └── models.d.ts          # Custom types
├── utils/                   # Utility functions (auto-imported)
│   ├── formatters.ts        # Spell level, ability scores, etc.
│   └── validators.ts
├── tests/
│   ├── components/
│   ├── composables/
│   └── e2e/
├── app.vue                  # Root component
├── nuxt.config.ts           # Nuxt configuration
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json
```

### Nuxt 4 Component Auto-Import Rules

**⚠️ CRITICAL:** Nuxt 4 auto-imports components from the `components/` directory with specific naming conventions based on folder structure.

**Component Naming Patterns:**
- **Root level** (`components/Foo.vue`) → Use as `<Foo>`
- **Nested folders** (`components/ui/Bar.vue`) → Use as `<UiBar>`
- **Deep nesting** (`components/foo/bar/Baz.vue`) → Use as `<FooBarBaz>`

**When Multiple Components Share the Same Name:**
- Components in the root `components/` directory take priority
- Components in subdirectories MUST use the folder prefix
- Example:
  - `components/JsonDebugPanel.vue` → `<JsonDebugPanel>` (priority)
  - `components/ui/JsonDebugPanel.vue` → `<UiJsonDebugPanel>` (explicit prefix required)

**Common Pitfalls:**
- ❌ Using `<SourceDisplay>` for `components/ui/SourceDisplay.vue` → **WILL FAIL SILENTLY**
- ✅ Using `<UiSourceDisplay>` for `components/ui/SourceDisplay.vue` → **CORRECT**
- ❌ Using `<ModifiersDisplay>` for `components/ui/ModifiersDisplay.vue` → **WILL FAIL SILENTLY**
- ✅ Using `<UiModifiersDisplay>` for `components/ui/ModifiersDisplay.vue` → **CORRECT**

**Why This Matters:**
- Silent failures occur when components don't render in accordion slots or conditional blocks
- The Vue template compiles successfully but renders nothing
- Always use explicit folder prefixes for components in subdirectories

**Debugging Component Issues:**
1. Check if the component exists: `ls -la app/components/ui/`
2. Verify correct naming: `<UiComponentName>` for `components/ui/ComponentName.vue`
3. Check dev server output for compilation errors
4. Test in Docker container, not locally

### API Client Design (Nuxt Pattern)

Use Nuxt's built-in `$fetch` or `ofetch` with composables:

```typescript
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const apiFetch = $fetch.create({
    baseURL: apiBase,
    onRequest({ options }) {
      // Add auth headers if needed
    },
    onResponseError({ response }) {
      // Global error handling
      console.error('API Error:', response.status)
    }
  })

  return { apiFetch }
}

// composables/useSpells.ts
import type { Spell, SpellListResponse } from '~/types/api'

export const useSpells = () => {
  const { apiFetch } = useApi()

  const fetchSpells = async (params?: {
    q?: string
    level?: number
    per_page?: number
  }): Promise<SpellListResponse> => {
    return await apiFetch('/spells', { query: params })
  }

  const fetchSpell = async (slugOrId: string | number): Promise<Spell> => {
    return await apiFetch(`/spells/${slugOrId}`)
  }

  return { fetchSpells, fetchSpell }
}
```

### State Management Strategy

**Server State (API Data):**
- Use Nuxt's built-in `useAsyncData` and `useFetch` composables
- Automatic caching, deduplication, and SSR support
- No need for React Query/TanStack Query

**Client State (UI State):**
- Use Nuxt's `useState` for global reactive state
- Use Pinia only if complex state management needed
- Prefer local component state (`ref`, `reactive`) when possible

**Example with caching:**
```typescript
// pages/spells/[slug].vue
<script setup lang="ts">
const route = useRoute()
const { fetchSpell } = useSpells()

// Automatically cached, SSR-friendly
const { data: spell, error, pending } = await useAsyncData(
  `spell-${route.params.slug}`,
  () => fetchSpell(route.params.slug as string)
)
</script>
```

### Key Features to Implement

**Phase 1: Basic Browsing**
- [ ] Spell list with search, filtering (level, school), pagination
- [ ] Item list with search, filtering (type, rarity), pagination
- [ ] Race list with subraces
- [ ] Detail pages for each entity type

**Phase 2: Advanced Search**
- [ ] Global search across all entities
- [ ] Faceted filtering (combine multiple filters)
- [ ] Bookmark/favorite entities
- [ ] Export lists as PDF/JSON

**Phase 3: Interactive Tools**
- [ ] Character builder (select race, class, background, feats)
- [ ] Spell book manager (filter by class, level)
- [ ] Item comparer (compare stats side-by-side)
- [ ] Random table roller

## Testing Strategy

### Frontend Tests (Vitest + @nuxt/test-utils)

**Unit Tests:**
- Utility functions (formatters, validators)
- Composables (API clients, state management)
- Pure logic functions

```typescript
// tests/utils/formatSpellLevel.test.ts
import { describe, it, expect } from 'vitest'
import { formatSpellLevel } from '~/utils/formatters'

describe('formatSpellLevel', () => {
  it('formats cantrips correctly', () => {
    expect(formatSpellLevel(0)).toBe('Cantrip')
  })

  it('formats 1st level correctly', () => {
    expect(formatSpellLevel(1)).toBe('1st level')
  })
})
```

**Component Tests:**
- Vue components with @nuxt/test-utils
- User interactions and events
- Conditional rendering
- Props and emits

```typescript
// tests/components/SpellCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellCard from '~/components/spell/SpellCard.vue'

describe('SpellCard', () => {
  it('renders spell name and level', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: {
        spell: { name: 'Fireball', level: 3, school: 'Evocation' }
      }
    })

    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.find('[data-testid="spell-level"]').text()).toBe('3rd level')
  })

  it('emits click event when card is clicked', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: { name: 'Fireball', level: 3 } }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

**Integration Tests:**
- Page-level tests with full routing
- API integration tests
- Search and filtering flows
- SSR hydration tests

**E2E Tests (Playwright):**
- Critical user paths (browse spells, view detail, search)
- Multi-page flows (character builder)
- Mobile and desktop viewports
- Accessibility testing

### API Contract Testing
- Generate TypeScript types from OpenAPI spec (`http://localhost:8080/docs/api.json`)
- Use MSW (Mock Service Worker) for API mocking in tests
- Validate API responses match expected types
- Test error scenarios (404, 500, network errors)

## CORS Configuration

The backend has CORS enabled. Default allowed origins:
- `http://localhost:3000` (Nuxt.js default dev server)

If using a different port, update `../importer/config/cors.php`

## SEO Considerations (Nuxt SSR Built-in)

Nuxt 4.x has built-in SSR support - leverage it for SEO:

**Meta Tags (per page):**
```typescript
// pages/spells/[slug].vue
<script setup lang="ts">
const route = useRoute()
const { data: spell } = await useAsyncData(...)

useSeoMeta({
  title: `${spell.value.name} - D&D 5e Spell`,
  description: spell.value.description,
  ogTitle: spell.value.name,
  ogDescription: spell.value.description,
  ogImage: '/images/spell-default.png',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: `https://dnd-compendium.com/spells/${spell.value.slug}` }
  ]
})
</script>
```

**SEO Best Practices:**
- ✅ Use slug-based URLs (`/spells/fireball` instead of `/spells/123`)
- ✅ Generate meta tags from API data (name, description)
- ✅ Add structured data (JSON-LD schema.org) for spells, items, races
- ✅ Create dynamic sitemap from API data
- ✅ Implement breadcrumbs for hierarchical entities (subraces, subclasses)
- ✅ Use semantic HTML5 (`<article>`, `<section>`, `<nav>`)
- ✅ Optimize images with Nuxt Image module

## Performance Best Practices

### Optimize for Large Lists
- **Virtual scrolling:** Use `@nuxt/virtual-list` or `vue-virtual-scroller` for 1000+ item lists
- **Pagination:** API default is 15 per page - use strategically
- **Lazy loading:** Use `<NuxtImg>` with lazy loading for images
- **Client-side caching:** Leverage `useAsyncData` auto-caching
- **Infinite scroll:** For better UX on mobile devices

### Image Optimization
- Backend does not serve images (use CDN or local assets)
- Use Nuxt Image module (`@nuxt/image`) for automatic optimization
- Use WebP format with fallbacks
- Optimize icon sets (use `@nuxt/icon` or Iconify)
- Consider D&D-themed illustrations for entity types

### Bundle Size & Code Splitting
- **Automatic code-splitting:** Nuxt splits by route automatically
- **Lazy components:** Use `<LazySpellCard>` prefix for lazy-loaded components
- **Dynamic imports:** `const HeavyComponent = defineAsyncComponent(() => import('~/components/Heavy.vue'))`
- **Tree-shaking:** Import only what you need from NuxtUI
- **Analyze bundle:** Use `nuxi analyze` to check bundle size

### SSR Performance
- **Reduce payload size:** Use `pick` to select only needed fields from API
- **Streaming:** Enable streaming SSR in nuxt.config.ts
- **Prefetching:** Use `<NuxtLink prefetch>` for critical routes
- **Cache headers:** Configure proper cache headers for static pages

## Accessibility Requirements

- Semantic HTML5 structure
- ARIA labels for interactive elements
- Keyboard navigation for all features
- High contrast mode support
- Screen reader testing for character builder

## Environment Variables

**Important:** Nuxt uses runtime config instead of build-time env vars.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private keys (server-side only)
    // apiSecret: process.env.API_SECRET

    // Public keys (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api/v1',
      apiDocsUrl: process.env.NUXT_PUBLIC_API_DOCS_URL || 'http://localhost:8080/docs/api',
    }
  }
})
```

```env
# .env (for local development)
NUXT_PUBLIC_API_BASE=http://localhost:8080/api/v1
NUXT_PUBLIC_API_DOCS_URL=http://localhost:8080/docs/api.json

# .env.production
NUXT_PUBLIC_API_BASE=https://api.dnd-compendium.com/api/v1
NUXT_PUBLIC_API_DOCS_URL=https://api.dnd-compendium.com/docs/api.json
```

**Usage in components/composables:**
```typescript
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
```

## Code Style Guidelines

### TypeScript Standards
- Use strict mode (`"strict": true` in tsconfig.json)
- Avoid `any` types (use `unknown` and type guards)
- Prefer interfaces for object shapes
- Use type inference where obvious
- Generate types from OpenAPI spec, don't write manually

### Vue/Nuxt Patterns
- Use `<script setup lang="ts">` (Composition API)
- Extract reusable composables (`useSpells`, `useRaces`, `useFilters`)
- Use Tailwind CSS (via NuxtUI) - no CSS modules needed
- Keep components small and focused (<150 lines)
- Use auto-imports (components, composables, utils)
- Prefer `ref` over `reactive` for better type inference

**Component Example:**
```vue
<script setup lang="ts">
import type { Spell } from '~/types/api'

interface Props {
  spell: Spell
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [spell: Spell]
}>()

const formattedLevel = computed(() => formatSpellLevel(props.spell.level))
</script>

<template>
  <UCard @click="emit('click', spell)">
    <h3>{{ spell.name }}</h3>
    <p>{{ formattedLevel }}</p>
  </UCard>
</template>
```

### File Naming Conventions

**Components (PascalCase.vue):**
- `SpellCard.vue` - Entity card component
- `SpellList.vue` - List component
- `SpellFilters.vue` - Filter component
- Nested: `spell/SpellCard.vue`, `item/ItemCard.vue`

**Composables (camelCase.ts):**
- `useSpells.ts` - Spell API composable
- `useFilters.ts` - Filter state composable
- `useApi.ts` - Base API client

**Utils (camelCase.ts):**
- `formatters.ts` - Formatting utilities
- `validators.ts` - Validation utilities
- `constants.ts` - App constants

**Pages (lowercase/kebab-case):**
- `index.vue` - Home page (/)
- `spells/index.vue` - Spell list (/spells)
- `spells/[slug].vue` - Spell detail (/spells/fireball)
- `search.vue` - Global search (/search)

**Types (camelCase.d.ts):**
- `api.d.ts` - Generated API types
- `models.d.ts` - Custom types
- `global.d.ts` - Global type augmentations

## Resources & Documentation

**Backend Documentation:**
- **API Docs (Interactive):** `http://localhost:8080/docs/api`
- **API Spec (JSON):** `http://localhost:8080/docs/api.json` ⚠️ Download before API work
- Backend CLAUDE.md: `../importer/CLAUDE.md`
- Backend README: `../importer/README.md`
- Database Schema: `../importer/docs/plans/2025-11-17-dnd-compendium-database-design.md`

**Framework Documentation:**
- **Nuxt 4.x:** https://nuxt.com/docs/4.x/getting-started/introduction
- **NuxtUI 4.x:** https://ui.nuxt.com/docs/getting-started
- Vue 3 Composition API: https://vuejs.org/guide/extras/composition-api-faq.html
- Nuxt Auto-imports: https://nuxt.com/docs/guide/concepts/auto-imports

**Testing:**
- Vitest: https://vitest.dev/
- @nuxt/test-utils: https://nuxt.com/docs/getting-started/testing
- @vue/test-utils: https://test-utils.vuejs.org/
- Playwright: https://playwright.dev/

**Tools & Utilities:**
- OpenAPI TypeScript Codegen: https://github.com/openapi-ts/openapi-typescript
- VueUse (composable utilities): https://vueuse.org/
- Zod (validation): https://zod.dev/
- MSW (API mocking): https://mswjs.io/

**D&D Content:**
- D&D 5e SRD: https://dnd.wizards.com/resources/systems-reference-document
- D&D Beyond (reference): https://www.dndbeyond.com/

## Contributing Guidelines (Once Project Starts)

### Git Workflow
- Feature branches: `feature/spell-search`, `feature/character-builder`
- Commit message format:
  ```
  feat: Add spell search with filters

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### Pull Request Checklist
- [ ] All tests pass
- [ ] TypeScript compiles with no errors
- [ ] Linter passes
- [ ] Components documented with JSDoc
- [ ] Accessibility tested
- [ ] Mobile-responsive

## Next Steps

**Initial Setup (when starting project):**
1. ✅ Framework chosen: Nuxt 4.x + NuxtUI 4.x
2. Initialize Nuxt project: `npx nuxi@latest init frontend`
3. Install NuxtUI: `npx nuxi@latest module add ui`
4. Set up TypeScript strict mode in `tsconfig.json`
5. Configure ESLint and Prettier
6. Download OpenAPI spec: `curl http://localhost:8080/docs/api.json > types/api-spec.json`
7. Generate TypeScript types from OpenAPI spec
8. Set up Vitest + @nuxt/test-utils for testing
9. Configure environment variables (`.env` file)
10. Create base API client composable (`composables/useApi.ts`)

**Project Setup Commands:**
```bash
# 1. Create Nuxt 4.x project
npx nuxi@latest init .

# 2. Install NuxtUI and dependencies
npx nuxi@latest module add ui
npm install -D @nuxt/test-utils vitest @vue/test-utils happy-dom playwright

# 3. Install utilities
npm install zod @vueuse/core

# 4. Install OpenAPI TypeScript generator
npm install -D openapi-typescript

# 5. Download API spec and generate types
curl http://localhost:8080/docs/api.json > types/api-spec.json
npm run generate:api-types
```

**First Feature to Implement (TDD):**
**Spell List Page** - Validates full API integration, SSR, routing, components, and testing setup

**Implementation Order:**
1. Write tests for spell list page (TDD)
2. Create `useSpells` composable with tests
3. Create `SpellCard` component with tests
4. Create `pages/spells/index.vue` with tests
5. Add filters and search
6. Create spell detail page (`pages/spells/[slug].vue`)
7. Add SEO meta tags
8. Verify SSR works correctly

---

**Project Status:** 🚧 Frontend not yet started. Backend API fully functional with 6 entity types, search, and 3,002+ records. Ready for Nuxt 4.x + NuxtUI 4.x implementation with strict TDD.
