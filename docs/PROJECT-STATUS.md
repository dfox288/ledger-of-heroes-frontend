# Project Status

**D&D 5e Compendium Frontend** | **Last Updated:** 2025-12-21

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Test Files | 327 |
| Components | 282 |
| Pages | 50 |
| Composables | 50 |
| Pinia Stores | 10 (7 filter + 3 character) + `filterFactory` |
| Nitro API Routes | 106 |

> Run `just test` for an up-to-date test-case count; the full suite is not stamped into this document.

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

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation (store, wizard, Step 1) | ✅ Complete |
| 2 | Race & Class Selection | ✅ Complete |
| 3 | Ability Scores | ✅ Complete |
| 4 | Background, Equipment, Spells & Review | ✅ Complete |
| 5 | Character Sheet & Polish | ✅ Complete |
| 6 | Level-Up Wizard (HP, ASI/Feat, Subclass, Multiclass) | ✅ Complete |
| 7 | Inventory Management (equipment, encumbrance, paperdoll) | ✅ Complete |
| 8 | Play Mode (HP, conditions, counters, spell slots, rests) | ✅ Complete |

**Wizard Steps (17):** Sourcebooks → Race → Subrace → Class → Subclass → Abilities → Background → Size → Proficiencies → Languages → Equipment → Feats → Feature Choices → Spells → Physical Description → Details → Review

**Level-Up Steps:** HitPoints → AsiFeat → SubclassChoice → SubclassVariant → ClassSelection (multiclass) → Summary (+ `HitDieRoller` sub-component)

**Components:** ~120 character components across `wizard/`, `levelup/`, `sheet/`, `inventory/`, `picker/`, `ability/`, `stats/`

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

**Open Enhancements:** See [GitHub Issues](https://github.com/dfox288/ledger-of-heroes/issues?q=is:issue+is:open+label:frontend).

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

| Suite | Command | Description |
|-------|---------|-------------|
| Character | `just test-character` | Character builder, wizard, level-up, sheet, inventory, play mode |
| Spells | `just test-spells` | Spells page, SpellCard, filters |
| Items | `just test-items` | Items page, ItemCard, filters |
| Monsters | `just test-monsters` | Monsters page, filters |
| Classes | `just test-classes` | Classes page, filters |
| Races | `just test-races` | Races page, filters |
| Backgrounds | `just test-backgrounds` | Backgrounds page, filters |
| Feats | `just test-feats` | Feats page, filters |
| Reference | `just test-reference` | Reference entities |
| UI | `just test-ui-components` | Shared UI components |
| Core | `just test-core` | Composables, utils, server API |
| Pages | `just test-pages` | All page tests |
| Stores | `just test-stores` | All Pinia stores |
| **Full Suite** | `just test` | 327 test files |

**Note:** CI uses 4-way sharding for faster runs. E2E (Playwright) is currently disabled in CI — run locally via `just e2e`.

---

## API Backend Stats

**Source:** Laravel backend at `../backend`. Switch dev/stable target with `NUXT_BACKEND_ENV` in `.env`.

| Entity | Approx. Count | API Endpoint |
|--------|---------------|--------------|
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

- **2025-12-21:** CI E2E job disabled (commit `dc26b27`) pending runner availability investigation — run locally via `just e2e`
- **2025-12-21:** Extract `useCharacterPageActions` composable — PageHeader action handlers out of the component
- **2025-12-21:** Generic `StatDisplay` component replaces `StatInitiative`/`StatProficiencyBonus` duplication
- **2025-12-21:** Currency configuration moved to `app/constants/`; defense formatters extracted to `app/utils/`
- **2025-12-20:** Extract `useSSRFallback` composable — unified hydration pattern
- **2025-12-19:** Inventory: add proper types and extract shared utilities (#160)
- **2025-12-18:** Extract spell grouping logic to `useSpellGrouping` composable (#778, PR #159)
- **2025-12-17:** Standardize spell empty states + testability improvements (#793, #794, #795, PR #158)
- **2025-12-17:** Utility consolidation + type-safety pass (PR #157)
- **2025-12-17:** Encumbrance bar thresholds corrected for D&D 5e compliance (#772, PR #155)
- **2025-12-16:** Spell preparation UI follow-up fixes (#718) - multiclass SpellCard props
- **2025-12-16:** Spell preparation UI differentiation (#676) - known vs prepared caster UI
- **2025-12-16:** Multiclass spellcasting support (#631) - per-class spell tabs, class_slug tracking
- **2025-12-15:** Wizard choice consolidation (#697) - shared UI components for choice steps
- **2025-12-15:** Entity picker card consolidation - generic EntityPickerCard component
- **2025-12-15:** Optional features on Features page (#712)
- **2025-12-14:** Weapon bonus display from API (#709) - pre-computed attack/damage bonuses
- **2025-12-14:** Modal state standardization (#699) - defineModel pattern for all modals
- **2025-12-14:** Manager component consolidation - merged into characterPlayState store
- **2025-12-13:** Prone/flying status toggles (#664) - DM screen combat status
- **2025-12-13:** Entity detail modal consolidation - generic EntityDetailModal component
- **2025-12-12:** Class resource counters (#632, #688) - character sheet and DM screen
- **2025-12-12:** Minimum roll indicators (#652) - reliable talent/expertise on skills
- **2025-12-11:** Spell slot spent tracking (#618) - new API format support
- **2025-12-11:** Wizard spellbook two-column UI (#680)
- **2025-12-11:** Enriched features endpoint (#619) - prerequisites display
- **2025-12-11:** DM screen notes (#660) - per-combatant notes
- **2025-12-11:** Encounter presets (#667) - save/load monster groups
- **2025-12-11:** Condition disadvantages display (#651)
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
└── README.md                # Points to wrapper for all other docs

# All other docs live in ../wrapper/docs/frontend/
../wrapper/docs/frontend/
├── handovers/               # Session handovers
├── plans/                   # Implementation plans
├── proposals/               # API enhancement proposals
├── reference/               # Stable reference docs
└── archive/                 # Old handovers
```
