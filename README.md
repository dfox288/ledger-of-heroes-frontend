# Ledger of Heroes — Frontend

**A D&D 5e reference, character builder, and play-mode app built on Nuxt 4 and NuxtUI 4.**

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](./tsconfig.json)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82)](https://nuxt.com)
[![NuxtUI](https://img.shields.io/badge/NuxtUI-4.x-00DC82)](https://ui.nuxt.com)
[![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-success)](./tests)

Part of the [**ledger-of-heroes**](https://github.com/dfox288/ledger-of-heroes) project (shared issue tracker, separate frontend/backend repos). Backend lives at `../backend` (Laravel).

---

## Features

- **7 entity types** with list + detail pages: Spells, Items, Races, Classes, Backgrounds, Feats, Monsters
- **11 reference pages**: Ability Scores, Conditions, Damage Types, Item Types, Languages, Proficiency Types, Sizes, Skills, Spell Schools, Sources, Creature Types
- **Character builder** — 17-step wizard (sourcebooks, race, class, abilities, background, proficiencies, equipment, spells, feats, review, …) with D&D-themed public IDs (`/characters/arcane-phoenix-M7k2`)
- **Character sheet** — stats, defenses, skills, features, inventory, spells, notes
- **Level-up wizard** — HP, ASI/feat, subclass, multiclass selection, subclass variants
- **Play mode** — HP, hit dice, conditions, counters, spell slots, short/long rest, concentration
- **DM screen** — party tracking, monster encounters, encounter presets
- **Meilisearch-powered filtering** — Spells (10 filters), Items (8), Monsters (7), Classes (4), Races (3), Feats (3), Backgrounds (2)
- **IndexedDB-persisted filters** — URL-synced via `usePageFilterSetup`
- **Dark mode** and mobile-responsive (375px – 1440px+)
- **3D polyhedral dice** background animation (three.js)

---

## Quick Start

### Prerequisites

- Docker + Docker Compose
- Backend API running at `../backend` (Laravel, typically on port 8080)
- [`just`](https://github.com/casey/just) installed (`brew install just`) — the project's primary command interface

### Setup

```bash
# 1. Copy env template
cp .env.example .env

# 2. Start Docker + dev server
just up

# 3. Access:
#    App:        http://localhost:3000
#    Backend:    http://localhost:8080/api/v1
#    API Docs:   http://localhost:8080/docs/api
```

### Switching backend environments

Edit `.env`:

```bash
NUXT_BACKEND_ENV=dev      # Active backend dev (port 8080) — default
NUXT_BACKEND_ENV=stable   # Stable, known-good API (port 8081)
```

Restart the dev server: `just restart`.

---

## Commands

This project uses [`just`](https://github.com/casey/just) as the primary command interface. Run `just` or `just --list` to see every recipe.

```bash
# Daily
just dev              # Start dev server
just restart          # Restart containers
just test             # Full test suite
just typecheck        # TypeScript
just lint-fix         # ESLint auto-fix

# Domain-specific test runs (faster iteration)
just test-character   # Character builder/sheet/play/inventory
just test-spells      # Spells list/detail/filters
just test-core        # Composables, utils, server API
just test-stores      # All Pinia stores

# Type generation from backend OpenAPI
just types-sync       # Regenerate app/types/api/generated.ts

# Git / PRs / issues
just gs               # Quick git status
just pr               # Create PR with auto-fill
just issues           # List open frontend issues
just inbox            # Handoffs + assigned issues
```

See [`.claude/rules/commands.md`](./.claude/rules/commands.md) for the full command reference.

---

## Tech Stack

| Component | Version |
|-----------|---------|
| [Nuxt](https://nuxt.com) | 4.x |
| [NuxtUI](https://ui.nuxt.com) | 4.x |
| Vue | 3.x |
| TypeScript | strict |
| [Pinia](https://pinia.vuejs.org) (+ IDB persist) | latest |
| [Vitest](https://vitest.dev) | latest |
| [Playwright](https://playwright.dev) | latest (E2E) |
| [three.js](https://threejs.org) | latest (dice) |
| Docker + Nitro proxy | — |

---

## Project Structure

See [`CLAUDE.md`](./CLAUDE.md) for the authoritative directory tree. High-level map:

```
app/
├── components/      # Vue components (auto-imported, nested folders)
├── composables/     # 50 composables (useEntityList, useApi, useCharacter*, …)
├── constants/       # Shared constants (currency config, …)
├── stores/          # 10 Pinia stores + filterFactory
├── pages/           # File-based routing
├── types/           # TypeScript types (api/generated.ts + extras)
├── utils/           # logger, defenseFormatters, badgeColors, …
└── assets/css/      # Tailwind v4 + NuxtUI theme

server/api/          # ~106 Nitro proxy routes (frontend → Nitro → Laravel)
tests/               # Vitest + MSW + Playwright
```

---

## Testing

**Test-Driven Development (TDD) is mandatory** — see [`.claude/rules/standards.md`](./.claude/rules/standards.md).

```bash
just test             # Full suite (327 test files)
just test-watch       # Watch mode
just test-file tests/path/to/file.test.ts
just test-filter "displays spell name"
just e2e              # Playwright E2E (runs locally; CI job is disabled)
```

Test infrastructure:

- **Unit/Component:** Vitest + `@nuxt/test-utils` + `@vue/test-utils`
- **Integration:** MSW intercepts Nitro routes (`tests/msw/`)
- **E2E:** Playwright (`tests/e2e/`) — currently disabled in CI, run locally
- **Helpers:** `tests/helpers/` (wizard setup, character sheet stubs, integration bootstrap)

See [`.claude/rules/testing.md`](./.claude/rules/testing.md) for philosophy, patterns, and MSW workflow.

---

## API Integration

All API calls go through Nitro server routes (`server/api/`) — **never call the Laravel backend directly from components.**

```typescript
// Frontend component → /api/spells → Nitro proxy → Laravel backend
const { apiFetch } = useApi()
const { data } = await useAsyncData('spells', () => apiFetch('/spells'))
```

**Type generation:** `just types-sync` regenerates `app/types/api/generated.ts` from the backend's OpenAPI spec.

See [`.claude/rules/api-proxy.md`](./.claude/rules/api-proxy.md) for the full proxy pattern, error handling, and Meilisearch filter syntax.

---

## Contributing

1. Read [`CLAUDE.md`](./CLAUDE.md) and the files under [`.claude/rules/`](./.claude/rules/)
2. Follow the TDD workflow — tests first, implementation second
3. Use the `just` command interface (see the command policy at the top of `CLAUDE.md`)
4. Branch naming: `feature/issue-N-desc`, `fix/issue-N-desc`, `chore/issue-N-desc`
5. Conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`)
6. **Never add AI/Claude authorship to commits, PRs, or issues** — see `.claude/rules/standards.md`

---

## Documentation

| Location | Contents |
|----------|----------|
| [`CLAUDE.md`](./CLAUDE.md) | Project structure, command policy, rule index |
| [`.claude/rules/`](./.claude/rules/) | Standards, workflow, patterns, testing, character wizard, troubleshooting |
| [`docs/PROJECT-STATUS.md`](./docs/PROJECT-STATUS.md) | Current metrics, entity coverage, recent milestones |
| [`CHANGELOG.md`](./CHANGELOG.md) | Version history |
| `../wrapper/docs/frontend/` | Plans, handovers, proposals, reference docs |

---

## Related

- **Issues / PRs:** [github.com/dfox288/ledger-of-heroes/issues](https://github.com/dfox288/ledger-of-heroes/issues) (shared with backend)
- **Backend repo:** `../backend` (Laravel)
- **Licence:** see `LICENSE`

---

Built for D&D 5e players and DMs. 🎲
