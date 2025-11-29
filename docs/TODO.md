# TODO

Active tasks and priorities for this project.

---

## In Progress

_Tasks currently being worked on_

- [ ] Fix remaining TypeScript errors (~28) - see LATEST-HANDOVER.md for details

---

## Next Up

_Prioritized tasks ready to start_

- [ ] Apply 3-view pattern to Race detail page
- [ ] Character Builder feature (pending backend API)
- [ ] E2E test expansion (Playwright)

---

## Backend Requests (for ../importer)

_Comprehensive D&D 5e rules audit completed 2025-11-29. Critical issues found._

### 🔴 Critical (Game-Breaking) - Phase 1

- [ ] **Rogue: Sneak Attack stuck at 9d6** for levels 10-20 (should scale to 10d6 at L19)
- [ ] **Warlock: Zero Eldritch Invocations** - feature exists but no options to choose
- [ ] **Wizard: Arcane Recovery at L6** - should be Level 1 per PHB p.115
- [ ] **Monk: Four Elements missing 8 base disciplines** - subclass unplayable at L3
- [ ] **Artificer: No Infusions available** - core L2 feature non-functional
- [ ] **Rogue: Thief has "Spell Thief"** - Arcane Trickster feature contaminating Thief

### 🟠 High Priority - Phase 2

- [ ] Monk: Tool proficiency linked to "Net" weapon (data corruption)
- [ ] Fighter: Eldritch Knight missing spell slot columns in progression table
- [ ] Artificer: Battle Smith missing Steel Defender stat block
- [ ] Barbarian: L20 rage should show "Unlimited" not "6"

### 🟡 Missing Subclasses - Phase 3

- [ ] Fighter: Echo Knight (EGtW)
- [ ] Ranger: Drakewarden (FToD)
- [ ] Warlock: The Undead (VRGtR)
- [ ] Warlock: Pact of the Talisman (TCE)
- [ ] Wizard: Chronurgy Magic (EGtW)
- [ ] Wizard: Graviturgy Magic (EGtW)

### ✅ Previously Resolved

- [x] Totem options removed from feature list
- [x] Champion L10 Fighting Styles simplified
- [x] `archetype` field populated for all base classes
- [x] Barbarian/Monk/Rogue progression columns fixed

**Full audit report**: `docs/proposals/CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md`

---

## Backlog

_Future tasks, not yet prioritized_

- [ ] Storybook component documentation
- [ ] Performance optimization (lazy loading, virtual scrolling)
- [ ] PWA support
- [ ] Offline mode with cached data
- [ ] Advanced spell list builder
- [ ] Monster encounter builder

---

## Completed

_Recently completed tasks (move to CHANGELOG.md after release)_

- [x] Reference page breadcrumbs (10 pages)
- [x] Filter factory generic typing (root cause of most TS errors)
- [x] Type extensions: Monster.spellcasting, Source.edition
- [x] UiFilterChip color type fix
- [x] Fix list page search (useEntityList now accepts external searchQuery)
- [x] Fix backgrounds page searchQuery sync issue
- [x] Unified breadcrumb navigation (UiDetailBreadcrumb component)
- [x] Fix Overview/Journey test failures (127 detail tests now passing)
- [x] Class detail page 3-view architecture (Overview, Journey, Reference)
- [x] `useClassDetail` composable for shared data fetching
- [x] 12 new class components (DetailHeader, ViewNavigation, + overview/journey)
- [x] Phase 3: API flag-based filtering (`is_choice_option`, `is_multiclass_only`)
- [x] Timeline UI for class features (replaces double accordion)
- [x] `useFeatureFiltering` composable (centralizes filtering logic)
- [x] Accordion header icons with `#leading` slot
- [x] Subclass `hit_die` now uses direct field (backend fix confirmed)
- [x] Classes Detail Page Phase 1 & 2 implementation
- [x] Filter persistence with IndexedDB (7 Pinia stores)
- [x] Domain-specific test suites
- [x] API verification proposals (7 entities)
- [x] Documentation reorganization

---

## Notes

- See `PROJECT-STATUS.md` for current metrics and milestones
- See `LATEST-HANDOVER.md` for most recent session context
- See `reference/` for stable documentation
- Update this file when starting/completing tasks
