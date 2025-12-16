# Commands & Test Suites

## Docker Commands

**Always use Docker. Never run dev server locally outside Docker.**

```bash
# Most common commands
docker compose exec nuxt npm run dev        # Dev server
docker compose exec nuxt npm run test       # Full test suite (~8 min)
docker compose exec nuxt npm run typecheck  # TypeScript check
docker compose exec nuxt npm run lint:fix   # Auto-fix linting
node scripts/sync-api-types.js             # Sync API types (run from HOST, not Docker)
```

## Test Suites by Domain

| Working On | Test Suite |
|------------|------------|
| **Character builder, wizard steps** | `npm run test:character` |
| Spells page, SpellCard, filters | `npm run test:spells` |
| Items page, ItemCard, filters | `npm run test:items` |
| Monsters page, filters | `npm run test:monsters` |
| Classes page, filters | `npm run test:classes` |
| Races page, filters | `npm run test:races` |
| Backgrounds page, filters | `npm run test:backgrounds` |
| Feats page, filters | `npm run test:feats` |
| Reference entities (sizes, skills) | `npm run test:reference` |
| Shared UI components, cards | `npm run test:ui` |
| Composables, utils, server API | `npm run test:core` |
| All page tests | `npm run test:pages` |
| All Pinia stores | `npm run test:stores` |
| CI, pre-commit, final check | `npm run test` |

**Note:** Domain suites run much faster than full suite. Use them during development.

## Speeding Up Local Tests

**CI uses sharding** (4 parallel GitHub runners via `--shard=X/4`), but this doesn't help locally since it splits tests across separate machines.

### Local Speed Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **Domain suites** | Working on specific feature | `npm run test:spells` (~14s vs ~250s) |
| **Watch mode** | TDD, iterating on tests | `npm run test -- --watch tests/components/spell/` |
| **Single file** | Debugging one test file | `npm run test -- tests/path/to/file.test.ts` |
| **Pattern match** | Run tests matching name | `npm run test -- -t "displays spell name"` |

### Increase Parallelism (Optional)

If Docker has 8GB+ memory, edit `vitest.config.ts`:
```typescript
maxForks: 4,  // Default is 2 to prevent memory issues
```

### Full Suite

Run full test suite only for:
- Pre-commit verification
- Before creating PR
- CI validation

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
