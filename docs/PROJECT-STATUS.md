# Project Status

**D&D 5e Compendium Frontend** | **Last Updated:** 2025-12-10

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Test Files | 201 |
| Test Cases | ~2,900 |
| Components | 190 |
| Pages | 40 |
| Composables | 33 |
| Pinia Stores | 13 |
| Test Helpers | 11 |

---

## Entity Coverage

| Entity | List Page | Detail Page | Card | Filters | Store | Tests |
|--------|-----------|-------------|------|---------|-------|-------|
| Spells | ✅ | ✅ | ✅ | 10 filters | ✅ | ✅ |
| Items | ✅ | ✅ | ✅ | 8 filters | ✅ | ✅ |
| Monsters | ✅ | ✅ | ✅ | 7 filters | ✅ | ✅ |
| Classes | ✅ | ✅ | ✅ | 4 filters | ✅ | ✅ |
| Races | ✅ | ✅ | ✅ | 3 filters | ✅ | ✅ |
| Backgrounds | ✅ | ✅ | ✅ | 2 filters | ✅ | ✅ |
| Feats | ✅ | ✅ | ✅ | 3 filters | ✅ | ✅ |

---

## Character Builder ✅

| Phase | Description | Status | PR |
|-------|-------------|--------|-----|
| 1 | Foundation (store, wizard, Step 1) | ✅ Complete | [#2](https://github.com/dfox288/dnd-rulebook-frontend/pull/2) |
| 2 | Race & Class Selection | ✅ Complete | [#3](https://github.com/dfox288/dnd-rulebook-frontend/pull/3) |
| 3 | Ability Scores | ✅ Complete | [#3](https://github.com/dfox288/dnd-rulebook-frontend/pull/3) |
| 4 | Background, Equipment, Spells & Review | ✅ Complete | main |
| 5 | Character Sheet & Polish | ✅ Complete | main |

**Wizard Steps:** Name ✅ → Race ✅ → Subrace ✅ → Class ✅ → Abilities ✅ → Background ✅ → Proficiencies ✅ → Equipment ✅ → Spells ✅ → Languages ✅ → Review ✅

**Components:** 35+ character builder components (pickers, modals, step components, sheet panels)
**Tests:** 200+ tests across 25+ test files

**Key Features:**
- **Memorable URLs:** D&D-themed public IDs like `/characters/arcane-phoenix-M7k2` (#287)
- **Unified Choice API:** All choices (proficiencies, languages, equipment, spells) use single API pattern (#264)
- **Full Character Sheet:** 10 sheet components with parallel data fetching (#172)
- **Route-based Navigation:** Step names in URL with middleware guards (#136)
- **Alignment Selector:** Inline with name input (#125)
- **Equipment Pack Contents:** Shows what's in packs (#133)

**Composables:**
- `useCharacterSheet` - Parallel fetching for 7 character endpoints
- `useUnifiedChoices` - Centralized choice management via unified API
- `useCharacterSlug` - D&D-themed slug generator for public IDs
- `useCharacterWizard` - Wizard step orchestration

**Pending Enhancement:** [#96](https://github.com/dfox288/dnd-rulebook-project/issues/96) - Structured item type data for equipment category choices

---

## Reference Entities (Non-Paginated)

| Entity | Page | Card | Tests |
|--------|------|------|-------|
| Ability Scores | ✅ | ✅ | ✅ |
| Conditions | ✅ | ✅ | ✅ |
| Damage Types | ✅ | ✅ | ✅ |
| Skills | ✅ | ✅ | ✅ |
| Sizes | ✅ | ✅ | ✅ |
| Languages | ✅ | ✅ | ✅ |
| Sources | ✅ | ✅ | ✅ |
| Spell Schools | ✅ | ✅ | ✅ |
| Item Types | ✅ | ✅ | ✅ |
| Proficiency Types | ✅ | ✅ | ✅ |

---

## Test Suite Performance

| Suite | Files | Tests | Runtime | Command |
|-------|-------|-------|---------|---------|
| Spells | 9 | ~180 | ~14s | `npm run test:spells` |
| Items | 7 | ~140 | ~12s | `npm run test:items` |
| Monsters | 6 | ~120 | ~12s | `npm run test:monsters` |
| Classes | 19 | ~300 | ~28s | `npm run test:classes` |
| Races | 5 | ~100 | ~10s | `npm run test:races` |
| Backgrounds | 5 | ~90 | ~10s | `npm run test:backgrounds` |
| Feats | 4 | ~80 | ~8s | `npm run test:feats` |
| Reference | 1 | ~70 | ~10s | `npm run test:reference` |
| UI | 48 | ~500 | ~52s | `npm run test:ui` |
| Core | 15 | ~150 | ~18s | `npm run test:core` |
| **Full Suite** | 193 | ~2,848 | ~235s | `npm run test` |

---

## API Backend Stats

**Source:** Backend at `../importer`

| Entity | Count | API Endpoint |
|--------|-------|--------------|
| Spells | 414 | `/api/v1/spells` |
| Monsters | 598 | `/api/v1/monsters` |
| Items | 2,000+ | `/api/v1/items` |
| Classes | 13 base + subclasses | `/api/v1/classes` |
| Races | 63 | `/api/v1/races` |
| Backgrounds | 35 | `/api/v1/backgrounds` |
| Feats | 138 | `/api/v1/feats` |

---

## Known Issues

### Critical (Backend - Game-Breaking)
*None currently - all critical issues resolved!* 🎉

### Medium
| Issue | Severity | Tracking |
|-------|----------|----------|
| Missing subclasses (Echo Knight, Drakewarden, etc.) | 🟡 Medium | `CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md` |
| Monk missing optional disciplines (Ki-based choices) | 🟡 Medium | GitHub Issue #9 |

### Resolved Issues
| Issue | Resolution |
|-------|------------|
| ~~Sneak Attack stuck at 9d6 (L10-20)~~ | ✅ Fixed - now shows L1-L19 progression (1d6 to 10d6) |
| ~~Zero Eldritch Invocations available~~ | ✅ Fixed - 54 Invocations now available |
| ~~Arcane Recovery at L6 (should be L1)~~ | ✅ Fixed - Arcane Recovery correctly at L1 |
| ~~No Infusions available~~ | ✅ Fixed - 16 Infusions now available |
| ~~Sage background missing languages~~ | ✅ Fixed - languages array with `is_choice: true, quantity: 2` |
| ~~Subclass `hit_die: 0`~~ | ✅ Backend fixed, using direct field |
| ~~Feature filtering hardcoded~~ | ✅ Now uses API flags |
| ~~Totem options missing flag~~ | ✅ Backend removed individual options (cleaner) |
| ~~Missing `archetype` field~~ | ✅ Backend added field for all classes |
| ~~Progression columns wrong~~ | ✅ Barbarian/Monk/Rogue fixed |

---

## Recent Milestones

- **2025-12-10:** Codebase cleanup (#439, #440) - removed 3 deprecated components, consolidated JsonDebugPanel
- **2025-12-09:** Wizard step validation (#437) - validates pending choices before allowing navigation
- **2025-12-09:** Character validation warnings (#435) - shows human-readable validation messages
- **2025-12-09:** Race condition fix (#435) - parallel fetchChoices calls now properly debounced
- **2025-12-09:** DefensesPanel component (#432) - displays AC, resistances, immunities, vulnerabilities
- **2025-12-08:** ESLint auto-formatting fixes - consistent code style across codebase
- **2025-12-07:** Character public ID migration (#287) - D&D-themed URLs like `arcane-phoenix-M7k2`
- **2025-12-07:** Issue cleanup - closed 11 completed issues (#264-271, #172, #174, #287)
- **2025-12-06:** Unified Choice System Migration (#264) - all wizard steps use unified API
- **2025-12-06:** Character Sheet complete (#172) - 10 sheet components with parallel fetching
- **2025-12-06:** Multi-select equipment choices (4c3fd82)
- **2025-12-06:** Language selection with slug-based API (d867223)
- **2025-12-04:** Test suite consolidation (PR #19) - removed 16 redundant test files, created 2 new helpers
- **2025-12-04:** Language choices wizard step (#131) - partial, blocked on backend endpoint #139
- **2025-12-04:** Equipment pack contents (#133) - shows `choice_items` pack contents structure
- **2025-12-04:** Alignment selector (#125) - inline with name input, 10 new tests
- **2025-12-04:** Route-based wizard navigation (#136) - step names in URL, middleware guards
- **2025-12-03:** Character Builder Phase 4 complete - Background, Equipment, Spells & Review
- **2025-12-03:** Edit level 1 characters (#105) - unified create/edit flow
- **2025-12-03:** Proficiency choices (#106) - conditional wizard step, skill selection UI
- **2025-12-02:** Character Builder Phase 2 - Race & Class Selection complete (74 tests, 8 new components)
- **2025-12-02:** Store actions: `selectRace()`, `selectClass()`, `refreshStats()`
- **2025-12-02:** Picker cards with click-to-select + View Details modal pattern
- **2025-12-02:** Subrace inline selector for races with subraces
- **2025-12-01:** Character Builder Phase 1 - Wizard foundation with Step 1 (Name) working, 30 new tests
- **2025-12-01:** Character list page (`/characters`) with CharacterCard component
- **2025-12-01:** Nitro server routes for character CRUD operations
- **2025-11-29:** Optional features display (Invocations, Infusions, Disciplines) across all class views
- **2025-11-29:** API types sync (+899 lines, `data_tables` rename)
- **2025-11-29:** Comprehensive D&D 5e rules audit of all 13 classes (6 critical issues found)
- **2025-11-29:** Frontend updated to use new `archetype` field from API
- **2025-11-29:** Class detail page 3-view architecture (Overview/Journey/Reference)
- **2025-11-29:** `useClassDetail` composable for shared class data fetching
- **2025-11-29:** 12 new class components (overview + journey views)
- **2025-11-28:** Phase 3 API flag-based filtering (+31 tests, `useFeatureFiltering` composable)
- **2025-11-28:** Timeline UI for class features (replaces double accordion)
- **2025-11-28:** Accordion headers with leading icons
- **2025-11-26:** Classes Detail Page Phase 1 & 2 (+25 tests, hit die fix, feature grouping)
- **2025-11-26:** Test Helper Library (22% reduction in store tests, mock factories)
- **2025-11-26:** Page Filter Setup Composable (removed ~140 lines duplication)
- **2025-11-26:** Pinia Store Factory Pattern (80% code reduction)
- **2025-11-26:** Filter persistence with IndexedDB (7 stores)
- **2025-11-26:** Domain-specific test suites
- **2025-11-26:** API verification proposals (7 entities)
- **2025-11-23:** 3D dice background animation
- **2025-11-22:** List page standardization complete

---

## Tech Stack

| Component | Version |
|-----------|---------|
| Nuxt | 4.x |
| NuxtUI | 4.x |
| Vue | 3.x |
| TypeScript | Strict mode |
| Vitest | Latest |
| Playwright | Latest |
| Pinia | Latest |

---

## Documentation Index

```
docs/
├── PROJECT-STATUS.md        # This file (metrics)
├── LATEST-HANDOVER.md       # Symlink to wrapper repo handover
└── README.md                # Points to wrapper for all other docs

# All other docs live in ../wrapper/docs/frontend/
../wrapper/docs/frontend/
├── handovers/               # Session handovers
├── plans/                   # Implementation plans
├── proposals/               # API enhancement proposals
├── reference/               # Stable reference docs
└── archive/                 # Old handovers
```
