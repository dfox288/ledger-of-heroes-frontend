# Commands & Test Suites

## Docker Commands

**Always use Docker. Never run dev server locally outside Docker.**

```bash
# Most common commands
docker compose exec nuxt npm run dev        # Dev server
docker compose exec nuxt npm run test       # Full test suite (~125s)
docker compose exec nuxt npm run typecheck  # TypeScript check
docker compose exec nuxt npm run lint:fix   # Auto-fix linting
node scripts/sync-api-types.js             # Sync API types (run from HOST, not Docker)
```

## Test Suites by Domain

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

## Character Builder Stress Test

Rapidly create N characters via API to test the character builder without UI:

```bash
npm run test:character-stress -- --count=10          # Create 10 characters (kept in DB)
npm run test:character-stress -- --count=3 --verbose # Watch choices being made
npm run test:character-stress -- --dry-run           # Preview without API calls
npm run test:character-stress -- --count=5 --cleanup # Create and delete after test
```

**What it tests:** Character creation -> class -> background -> ability scores -> all pending choices (proficiencies, languages, equipment, spells) -> validation.

**Default behavior:** Characters are kept in the database. Use `--cleanup` to delete after creation.

**Test pool:** 5 races x 5 classes x 4 backgrounds = 100 unique combinations (PHB-focused).

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
