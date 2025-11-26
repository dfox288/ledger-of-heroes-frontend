# Project Status

**D&D 5e Compendium Frontend** | **Last Updated:** 2025-11-26

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Test Files | 120 |
| Test Cases | ~1,588 |
| Components | 81 |
| Pages | 31 |
| Composables | 16 |
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

| Suite | Files | Runtime | Command |
|-------|-------|---------|---------|
| Spells | 9 | ~14s | `npm run test:spells` |
| Items | 7 | ~12s | `npm run test:items` |
| Monsters | 6 | ~12s | `npm run test:monsters` |
| Classes | 6 | ~12s | `npm run test:classes` |
| Races | 5 | ~10s | `npm run test:races` |
| Backgrounds | 5 | ~10s | `npm run test:backgrounds` |
| Feats | 4 | ~8s | `npm run test:feats` |
| Reference | 7 | ~10s | `npm run test:reference` |
| UI | 48 | ~52s | `npm run test:ui` |
| Core | 15 | ~18s | `npm run test:core` |
| **Full Suite** | 118 | ~125s | `npm run test` |

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

| Issue | Severity | Tracking |
|-------|----------|----------|
| Cleric/Paladin `hit_die: 0` in backend | 🔴 High | `docs/proposals/CLASSES-API-ENHANCEMENTS.md` |
| Sage background missing languages array | 🟡 Medium | `docs/proposals/BACKGROUNDS-API-ENHANCEMENTS.md` |

---

## Recent Milestones

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
├── CURRENT_STATUS.md        # Detailed feature status
├── proposals/               # API enhancement proposals
│   ├── SPELLS-API-ENHANCEMENTS.md
│   ├── CLASSES-API-ENHANCEMENTS.md
│   ├── ITEMS-API-ENHANCEMENTS.md
│   ├── RACES-API-ENHANCEMENTS.md
│   ├── BACKGROUNDS-API-ENHANCEMENTS.md
│   ├── FEATS-API-ENHANCEMENTS.md
│   └── MONSTERS-API-ENHANCEMENTS.md
├── HANDOVER-*.md            # Session handovers
└── BLOCKED-*.md             # Blocked work tracking
```
