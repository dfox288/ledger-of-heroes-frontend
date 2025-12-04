# D&D 5e Compendium - Frontend

**A production-ready D&D 5e reference application built with Nuxt 4 and NuxtUI 4.**

[![Tests](https://img.shields.io/badge/tests-2848%20passing-success)](./tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](./tsconfig.json)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82)](https://nuxt.com)
[![NuxtUI](https://img.shields.io/badge/NuxtUI-4.x-00DC82)](https://ui.nuxt.com)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Dice-purple)](https://threejs.org)

## 🎯 Project Overview

A comprehensive D&D 5th Edition reference tool featuring **7 complete entity types** with advanced search, filtering, and full stat block displays. Built with modern web technologies and following TDD best practices.

### ✨ Features

- **7 Entity Types:** Spells (477), Items (800+), Races, Classes, Backgrounds, Feats, Monsters (598)
- **10 Reference Pages:** Ability Scores, Conditions, Damage Types, Item Types, Languages, Proficiency Types, Sizes, Skills, Spell Schools, Sources
- **Builder Tools:** 🪄 Spell List Generator (12+ spellcasting classes, localStorage persistence)
- **1,400+ D&D Resources:** Official sourcebooks (PHB, XGE, TCE, MM, etc.)
- **Advanced Filtering:** Meilisearch-powered with <50ms response times
  - **Spells:** 10 filters (level, school, class, concentration, ritual, damage types, saving throws, components)
  - **Items:** 5 filters (type, rarity, magic, charges, prerequisites)
  - **Monsters:** 3 filters (CR, type, legendary)
  - **Advanced Queries:** Combined filters with AND/OR operators
- **Full Stat Blocks:** Complete monster stats, spell effects, item properties, character features
- **AI-Generated Images:** Hero images and card backgrounds for all entity types
- **3D Dice Animation:** Stunning polyhedral dice background with physics
- **Dark Mode:** Complete dark theme support via NuxtUI
- **Mobile Responsive:** 375px - 1440px+ viewports
- **100% Test Pass Rate:** 2,848 passing tests across 193 test files (Vitest + Playwright E2E)

### 🆕 Latest: Complete Meilisearch Filter Migration (2025-11-25)

**Critical Bug Fix:** 93% of spell filters were broken! All filters now migrated to Meilisearch syntax:
- **All 10 Filters Working:** Level, School, Class, Concentration, Ritual, Damage Types, Saving Throws, Verbal, Somatic, Material
- **4 Filters Removed:** Not supported by Meilisearch (casting time, range, duration, has higher levels)
- **Performance:** <50ms response times
- **Advanced Queries:** `filter=level = 3 AND class_slugs IN [wizard] AND school_code = EV` (7 results)
- **Impact:** 100% success rate (was 7% before migration)

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guidelines and project setup (TDD requirements, patterns, llms.txt)
- **[CURRENT_STATUS.md](./docs/CURRENT_STATUS.md)** - Current project status and architecture
- **[Latest Handover](./docs/HANDOVER-2025-11-25-COMPLETE-MEILISEARCH-MIGRATION.md)** - Complete Meilisearch filter migration
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **[Archive](./docs/archive/)** - Historical session documentation

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose (for containerized development)
- Backend API running at `localhost:8080` (see `../importer` directory)

### Setup

```bash
# 1. Clone the repository
cd frontend

# 2. Create environment file
cp .env.example .env

# 3. Start Docker containers
docker compose up -d

# 4. Install dependencies (first time only)
docker compose exec nuxt npm install

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api/v1
# API Docs: http://localhost:8080/docs/api
```

### Development Commands

```bash
# Start dev server
docker compose exec nuxt npm run dev

# Run tests
docker compose exec nuxt npm test

# Run tests in watch mode
docker compose exec nuxt npm run test:watch

# Type checking
docker compose exec nuxt npm run typecheck

# Linting
docker compose exec nuxt npm run lint
docker compose exec nuxt npm run lint:fix

# Sync API types from backend
docker compose exec -e NUXT_API_SPEC_URL=http://host.docker.internal:8080/docs/api.json nuxt npm run types:sync
```

## 🏗️ Tech Stack

- **Framework:** [Nuxt 4.x](https://nuxt.com) - Vue 3 meta-framework with SSR
- **UI Library:** [NuxtUI 4.x](https://ui.nuxt.com) - Tailwind CSS component library
- **Language:** TypeScript (strict mode)
- **Testing:** Vitest + @nuxt/test-utils + @vue/test-utils
- **Package Manager:** npm
- **Type Generation:** openapi-typescript (from backend OpenAPI spec)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── components/         # Vue components (auto-imported)
│   │   ├── spell/         # Entity-specific components
│   │   ├── item/
│   │   ├── monster/
│   │   └── ui/            # Reusable UI components
│   ├── composables/       # Composables (auto-imported)
│   ├── pages/             # File-based routing
│   │   ├── spells/
│   │   ├── items/
│   │   ├── monsters/      # NEW: Monsters pages
│   │   └── ...
│   ├── layouts/           # Page layouts
│   ├── types/             # TypeScript types
│   │   └── api/
│   │       ├── generated.ts  # OpenAPI generated types
│   │       ├── entities.ts   # Application entity types
│   │       └── common.ts     # Shared types
│   └── utils/             # Utility functions
├── server/
│   └── api/               # Server API routes (Nuxt server)
├── tests/                 # Test files
│   ├── components/
│   ├── composables/
│   └── helpers/           # Shared test helpers
├── docs/                  # Documentation
│   ├── plans/             # Design & implementation plans
│   └── HANDOVER-*.md      # Session handover documents
├── docker/                # Docker configuration
├── nuxt.config.ts         # Nuxt configuration
└── package.json
```

## 🧪 Testing

**Test-Driven Development (TDD) is mandatory** for all features. See [CLAUDE.md](./CLAUDE.md) for the complete TDD workflow.

```bash
# Run all tests
docker compose exec nuxt npm test

# Run specific test file
docker compose exec nuxt npm test -- MonsterCard.test.ts

# Run tests in watch mode
docker compose exec nuxt npm run test:watch

# Generate coverage report
docker compose exec nuxt npm run test:coverage
```

**Current Test Stats:**
- **Tests:** 2,848 passing (100% pass rate)
- **Test Files:** 193 (consolidated from 207)
- **Test Helpers:** 10 reusable helpers (pickerCardBehavior, badgeVisibilityBehavior, mockFactories, etc.)

## 🎨 Component Patterns

### Entity Cards (List Pages)

```vue
<MonsterCard :monster="monster" />
<SpellCard :spell="spell" />
<ItemCard :item="item" />
```

**Features:**
- Color-coded badges (semantic colors)
- Hover effects
- Source footer
- Description truncation (150 chars)
- Links to detail pages

### Accordion Components (Detail Pages)

```vue
<UiAccordionTraits :traits="traits" title="Special Abilities" />
<UiAccordionActions :actions="actions" title="Actions" />
```

**Features:**
- Reusable across entities
- Custom titles
- Expandable/collapsible
- Dark mode support

## 🔄 API Integration

**Backend:** Laravel API at `http://localhost:8080/api/v1`

**Type Generation:**
```bash
# Sync types from backend OpenAPI spec
docker compose exec -e NUXT_API_SPEC_URL=http://host.docker.internal:8080/docs/api.json nuxt npm run types:sync
```

**Architecture:**
- OpenAPI-generated base types (`app/types/api/generated.ts`)
- Application-specific extensions (`app/types/api/entities.ts`)
- Type-safe API calls via composables (`useEntityList`, `useEntityDetail`)

## 📦 Building for Production

```bash
# Build the application
docker compose exec nuxt npm run build

# Preview production build
docker compose exec nuxt npm run preview
```

**Deployment:** See [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment)

## 🤝 Contributing

### Development Workflow

1. **Read Documentation:**
   - Start with [CLAUDE.md](./CLAUDE.md) for project guidelines
   - Review [CURRENT_STATUS.md](./docs/CURRENT_STATUS.md) for architecture

2. **Follow TDD:**
   - Write tests FIRST (RED phase)
   - Implement minimal code (GREEN phase)
   - Refactor (REFACTOR phase)
   - See [CLAUDE.md](./CLAUDE.md) for detailed TDD mandate

3. **Maintain Quality:**
   - All tests must pass (611/611)
   - No ESLint errors
   - TypeScript errors ≤ 13 (current baseline)
   - Browser verification required

4. **Commit Guidelines:**
   - Conventional commits format (`feat:`, `fix:`, `refactor:`, etc.)
   - Descriptive commit messages
   - Commit immediately after task completion
   - Include Claude Code attribution

### Code Reviews

All features must pass:
- ✅ Tests written first (TDD)
- ✅ All tests passing
- ✅ TypeScript type-safe
- ✅ ESLint clean
- ✅ Browser verified
- ✅ Dark mode support
- ✅ Mobile responsive

## 🤖 Parallel Agent Development

Run multiple Claude Code agents simultaneously on different features using Git worktrees:

```bash
# Create isolated environment for agent work
./scripts/create-agent-worktree.sh 1 feature/issue-130-race-subrace
./scripts/create-agent-worktree.sh 2 feature/issue-131-languages

# Start the environment
cd ../frontend-agent-1
./start-env.sh
./run.sh dev

# List all active agent environments
./scripts/list-agent-worktrees.sh

# Clean up when done
./scripts/remove-agent-worktree.sh 1
```

**Port assignments:**
| Instance | Nuxt | Nginx |
|----------|------|-------|
| Main | 4000 | 8081 |
| Agent 1 | 4001 | 8082 |
| Agent 2 | 4002 | 8083 |

**Full documentation:** [docs/reference/parallel-agent-development.md](./docs/reference/parallel-agent-development.md)

## 📊 Project Status

**Current Version:** 7 of 7 entity types complete

**Entity Types:**
- ✅ Spells (Level/School filtering, ritual/concentration badges)
- ✅ Items (Rarity colors, magic/attunement, weapon/armor stats)
- ✅ Races (Traits, ability modifiers, languages, size/speed)
- ✅ Classes (Features, proficiencies, subclasses, hit die)
- ✅ Backgrounds (Personality traits, ideals, bonds, flaws)
- ✅ Feats (Prerequisites, modifiers, conditions)
- ✅ **Monsters (CR/Type filtering, full stat blocks, legendary actions)** ⭐ NEW

**Reference Pages (10/10):**
Ability Scores, Conditions, Damage Types, Item Types, Languages, Proficiency Types, Sizes, Skills, Spell Schools, Sources

**Quality Metrics:**
- Tests: 2,848 passing across 193 files (100%)
- TypeScript: Strict mode enabled
- ESLint: 0 errors
- Dark Mode: Full support
- Responsive: 375px - 1440px+

## 🔮 Roadmap

### Completed ✅
- [x] 7 entity types with full feature parity
- [x] 10 reference pages
- [x] OpenAPI type generation
- [x] Dark mode support
- [x] Mobile responsive design
- [x] Comprehensive test coverage

### Future Enhancements
- [ ] Parse monster attack data into structured damage display
- [ ] Stat block alternative view (printable format)
- [ ] Ability score modifier calculator
- [ ] Encounter builder (multi-monster selection with CR balancing)
- [ ] Comparison views (side-by-side monster comparison)
- [ ] Advanced filters (size, alignment, environment)
- [ ] E2E testing with Playwright
- [ ] Performance optimization (if needed)

## 📝 License

See the LICENSE file in the repository root.

---

**Built with ❤️ for D&D 5e players and DMs**

🎲 Ready to explore 1,400+ D&D resources!
