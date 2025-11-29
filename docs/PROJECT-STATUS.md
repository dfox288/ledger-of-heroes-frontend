# Project Status

**D&D 5e Compendium Frontend** | **Last Updated:** 2025-11-29

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Test Files | 133 |
| Test Cases | ~1,842 |
| Components | 86 |
| Pages | 31 |
| Composables | 18 |
| Pinia Stores | 8 |
| Test Helpers | 8 |

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
| Reference | 7 | ~70 | ~10s | `npm run test:reference` |
| UI | 48 | ~500 | ~52s | `npm run test:ui` |
| Core | 15 | ~150 | ~18s | `npm run test:core` |
| **Full Suite** | 133 | ~1,842 | ~152s | `npm run test` |

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
| Issue | Class | Tracking |
|-------|-------|----------|
| Sneak Attack stuck at 9d6 (L10-20) | Rogue | `CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md` |
| Zero Eldritch Invocations available | Warlock | `CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md` |
| Arcane Recovery at L6 (should be L1) | Wizard | `CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md` |
| 8 base disciplines missing | Monk | `CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md` |
| No Infusions available | Artificer | `CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md` |

### Medium
| Issue | Severity | Tracking |
|-------|----------|----------|
| Missing subclasses (Echo Knight, Drakewarden, etc.) | 🟡 Medium | `CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md` |
| Sage background missing languages array | 🟡 Medium | `BACKGROUNDS-API-ENHANCEMENTS.md` |

### Resolved Issues
| Issue | Resolution |
|-------|------------|
| ~~Subclass `hit_die: 0`~~ | ✅ Backend fixed, using direct field |
| ~~Feature filtering hardcoded~~ | ✅ Now uses API flags |
| ~~Totem options missing flag~~ | ✅ Backend removed individual options (cleaner) |
| ~~Missing `archetype` field~~ | ✅ Backend added field for all classes |
| ~~Progression columns wrong~~ | ✅ Barbarian/Monk/Rogue fixed |

---

## Recent Milestones

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
├── TODO.md                  # Active tasks
├── LATEST-HANDOVER.md       # Most recent session
├── CURRENT_STATUS.md        # Detailed feature status
├── proposals/               # API enhancement proposals
│   ├── CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md  # ⚠️ Critical issues
│   ├── SPELLS-API-ENHANCEMENTS.md
│   ├── CLASSES-API-ENHANCEMENTS.md
│   ├── CLASSES-DETAIL-PAGE-FRONTEND-IMPROVEMENTS.md
│   ├── CLASSES-DETAIL-PAGE-BACKEND-FIXES.md       # Superseded by audit
│   ├── FEATURES-DISPLAY-MOCKUPS.md
│   ├── ITEMS-API-ENHANCEMENTS.md
│   ├── RACES-API-ENHANCEMENTS.md
│   ├── BACKGROUNDS-API-ENHANCEMENTS.md
│   ├── FEATS-API-ENHANCEMENTS.md
│   └── MONSTERS-API-ENHANCEMENTS.md
├── HANDOVER-*.md            # Session handovers
└── BLOCKED-*.md             # Blocked work tracking
```
