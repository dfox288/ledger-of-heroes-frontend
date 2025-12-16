# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

> **🚨 COMMAND POLICY — READ BEFORE EXECUTING ANY COMMAND**
>
> This project uses `just` as the primary command interface.
>
> **Before running `git`, `gh`, `docker`, `php`, `artisan`, `composer`, `npm`, or `npx`:**
> 1. Run `just --list` to check for an existing recipe
> 2. If a recipe exists → use it
> 3. If no recipe exists but the command will be reused → create a recipe first, then use it
> 4. Raw commands are acceptable ONLY for true one-off operations
>
> **Never bypass this policy.** When in doubt, add a recipe.

## Overview

Nuxt 4.x frontend for D&D 5e Compendium. Consumes REST API from `../backend` (Laravel backend).

**Tech Stack:** Nuxt 4.x | NuxtUI 4.x | TypeScript | Vitest | Playwright | Pinia | Docker

**Commands:** Use `just` for all commands. Run `just` or `just --list` to see available recipes.

**DO NOT use superpowers-chrome** - Browser automation is not needed for this project.

**Essential Docs:**
- `docs/PROJECT-STATUS.md` - Metrics and current status

**Tasks & Issues:** [GitHub Issues](https://github.com/dfox288/ledger-of-heroes/issues) (shared with backend)

---

## Session Memory (claude-mem)

**CRITICAL:** Use the **current directory name** as the `project` parameter for claude-mem searches.

| Directory | Project Name |
|-----------|--------------|
| `frontend` | `frontend` |
| `frontend-agent-1` | `frontend-agent-1` |
| `frontend-agent-2` | `frontend-agent-2` |

```
mcp__plugin_claude-mem_claude-mem-search__search with project: "<directory-name>"
```

This keeps session memory isolated between the main workspace and agent worktrees.

---

## Backend Environment

Switch between backend environments using `NUXT_BACKEND_ENV` in `.env`:

| Value | Port | Use Case |
|-------|------|----------|
| `dev` (default) | 8080 | Active backend development, bleeding-edge |
| `stable` | 8081 | Frontend work against stable, known-good API |

**To switch:**
1. Edit `.env`: `NUXT_BACKEND_ENV=stable`
2. Restart dev server: `just restart`

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
│   ├── character/   # Character builder + sheet + play mode
│   │   ├── wizard/  # Creation steps (StepRace, StepClass, etc.)
│   │   ├── levelup/ # Level-up steps (StepHitPoints, StepAsiFeat, etc.)
│   │   ├── sheet/   # Sheet panels (Header, AbilityScoreBlock, etc.)
│   │   ├── inventory/ # Equipment/inventory management
│   │   └── picker/  # Entity selection components
│   ├── dm-screen/   # DM screen components
│   ├── party/       # Party management
│   └── ui/          # Reusable (UiListPageHeader, etc.)
├── composables/     # useEntityList, useMeilisearchFilters, etc.
├── stores/          # Pinia stores (7 filter + 3 character stores)
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
| `commands.md` | Test suite domains, stress test options |
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
