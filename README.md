# D&D 5e Compendium - Frontend

**A production-ready D&D 5e reference application built with Nuxt 4 and NuxtUI 4.**

[![Tests](https://img.shields.io/badge/tests-611%20passing-success)](./tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](./tsconfig.json)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82)](https://nuxt.com)
[![NuxtUI](https://img.shields.io/badge/NuxtUI-4.x-00DC82)](https://ui.nuxt.com)

## 🎯 Project Overview

A comprehensive D&D 5th Edition reference tool featuring **7 complete entity types** with advanced search, filtering, and full stat block displays. Built with modern web technologies and following TDD best practices.

### ✨ Features

- **7 Entity Types:** Spells, Items, Races, Classes, Backgrounds, Feats, **Monsters**
- **10 Reference Pages:** Ability Scores, Conditions, Damage Types, Item Types, Languages, Proficiency Types, Sizes, Skills, Spell Schools, Sources
- **1,400+ D&D Resources:** Official sourcebooks (Monster Manual, Player's Handbook, etc.)
- **Advanced Filtering:** Search, pagination, entity-specific filters (spell level, CR range, item rarity)
- **Full Stat Blocks:** Complete monster stats, spell effects, item properties, character features
- **Dark Mode:** Complete dark theme support via NuxtUI
- **Mobile Responsive:** 375px - 1440px+ viewports
- **100% Test Coverage:** 611 passing tests (Vitest + @nuxt/test-utils)

### 🆕 Latest: Monsters Feature (2025-11-22)

The 7th entity type is now complete! Features include:
- **Color-coded CR badges:** Easy (green), Medium (blue), Hard (yellow), Deadly (red)
- **CR/Type filtering:** Filter by difficulty tier and creature type
- **Full stat blocks:** AC, HP, speeds, ability scores, traits, actions, legendary actions
- **598 monsters:** From official D&D sourcebooks

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guidelines and project setup
- **[CURRENT_STATUS.md](./docs/CURRENT_STATUS.md)** - Current project status and architecture
- **[Latest Handover](./docs/HANDOVER-2025-11-22-MONSTERS-FEATURE-COMPLETE.md)** - Monsters feature implementation
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

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
- **Tests:** 611/611 passing (100% pass rate)
- **Coverage:** Comprehensive component, composable, and utility coverage
- **Test Helpers:** Reusable helpers for card behavior, source display, descriptions

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
- Tests: 611/611 passing (100%)
- TypeScript: 13 errors (pre-existing, unrelated to features)
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
