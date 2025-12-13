# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

Nuxt 4.x frontend for D&D 5e Compendium. Consumes REST API from `../backend` (Laravel backend).

**Tech Stack:** Nuxt 4.x | NuxtUI 4.x | TypeScript | Vitest | Playwright | Pinia | Docker

**Commands:** `docker compose exec nuxt npm run ...` | Always use Docker, never run locally.

**DO NOT use superpowers-chrome** - Browser automation is not needed for this project.

**Essential Docs:**
- `docs/PROJECT-STATUS.md` - Metrics and current status

**Tasks & Issues:** [GitHub Issues](https://github.com/dfox288/ledger-of-heroes/issues) (shared with backend)

---

## Session Memory (claude-mem)

**CRITICAL:** When searching session memory, use project name `frontend` (NOT "ledger-of-heroes"):

```
mcp__plugin_claude-mem_claude-mem-search__search with project: "frontend"
```

This retrieves context from previous sessions including decisions, changes, and discoveries.

---

## Backend Environment

Switch between backend environments using `NUXT_BACKEND_ENV` in `.env`:

| Value | Port | Use Case |
|-------|------|----------|
| `dev` (default) | 8080 | Active backend development, bleeding-edge |
| `stable` | 8081 | Frontend work against stable, known-good API |

**To switch:**
1. Edit `.env`: `NUXT_BACKEND_ENV=stable`
2. Restart dev server: `docker compose restart nuxt`

---

## Documentation Locations

**All documentation (plans, handovers, proposals, reference) lives in the wrapper repo:**

```
../wrapper/docs/frontend/
├── handovers/   # Session handovers
├── plans/       # Implementation plans
├── proposals/   # API enhancement proposals
├── reference/   # Stable reference docs
└── archive/     # Old handovers
```

| Doc Type | Write To |
|----------|----------|
| **Plans** | `../wrapper/docs/frontend/plans/YYYY-MM-DD-topic-design.md` |
| **Handovers** | `../wrapper/docs/frontend/handovers/SESSION-HANDOVER-YYYY-MM-DD-topic.md` |
| **Proposals** | `../wrapper/docs/frontend/proposals/` |
| **Reference** | `../wrapper/docs/frontend/reference/` |

**Stays local:** `docs/PROJECT-STATUS.md`, `docs/README.md`

---

## AI Context (llms.txt)

**Fetch these before starting work:**

- **Nuxt 4** `https://nuxt.com/llms.txt` or `llms-full.txt` (~1M+ tokens)
- **Nuxt UI 4** `https://ui.nuxt.com/llms.txt` or `llms-full.txt` (~1M+ tokens)
- **Vue 3** `https://vuejs.org/llms.txt`
- **Vite** `https://vite.dev/llms.txt`

---

## Project Structure

```
app/
├── components/       # Vue components (auto-import)
│   ├── spell/       # Entity-specific (SpellCard, etc.)
│   ├── monster/
│   ├── character/   # Character builder + sheet
│   │   ├── wizard/  # StepName, StepRace, StepClass, etc.
│   │   └── sheet/   # Header, AbilityScoreBlock, SkillsList, etc.
│   └── ui/          # Reusable (UiListPageHeader, etc.)
├── composables/     # useEntityList, useMeilisearchFilters, etc.
├── stores/          # Pinia stores (7 filter stores + characterWizard)
├── pages/           # File-based routing
├── types/           # TypeScript types (api/generated.ts)
└── assets/css/      # Tailwind + NuxtUI colors

tests/
├── components/      # Component tests by entity
├── stores/          # Pinia store tests
├── composables/     # Composable tests
└── helpers/         # Shared test utilities

server/api/          # Nitro server routes (API proxy)
```

---

## Rules

Detailed guidance is split into focused rule files in `.claude/rules/`:

### Mandatory Rules (Must Follow)

| Rule File | Contents |
|-----------|----------|
| `standards.md` | TDD mandate, TypeScript standards, Vue conventions, commits |
| `workflow.md` | Development cycle, branch naming, PR checklist |

### How-To Guides (Patterns)

| Rule File | Contents |
|-----------|----------|
| `patterns.md` | List/detail pages, filters, Pinia stores, NuxtUI colors |
| `api-proxy.md` | Nitro server routes, error handling, Meilisearch syntax |
| `character-wizard.md` | Wizard architecture, step patterns, validation, testing |
| `testing.md` | Test philosophy, Vitest, MSW, Playwright E2E |

### Reference

| Rule File | Contents |
|-----------|----------|
| `commands.md` | Docker commands, test suites, stress test |
| `coordination.md` | Session checklist, GitHub issues, handoffs |
| `troubleshooting.md` | Common issues, debugging techniques, nuclear options |

---

## Resources

- **Nuxt 4:** https://nuxt.com/docs/4.x
- **NuxtUI 4:** https://ui.nuxt.com/docs
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Backend API Docs:** http://localhost:8080/docs/api

---

**Default Branch:** `main` | **Workflow:** Feature branches -> PR -> Merge | **Status:** See `docs/PROJECT-STATUS.md`
