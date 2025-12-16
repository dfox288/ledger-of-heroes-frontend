# ============================================================================
# Ledger of Heroes Frontend - Justfile
# ============================================================================
# Run `just` or `just --list` to see all available commands
# Most commands run inside the Docker container automatically
# ============================================================================

# Docker service name
service := "nuxt"

# Docker compose exec shorthand
dc := "docker compose exec " + service

# Default recipe: show available commands
default:
    @just --list

# ============================================================================
# Docker Management
# ============================================================================

# Start the Docker environment
up:
    docker compose up -d

# Stop the Docker environment
down:
    docker compose down

# Restart the Docker environment
restart:
    docker compose restart

# View container logs (follow mode)
logs:
    docker compose logs -f {{service}}

# View last N lines of logs
logs-tail lines="100":
    docker compose logs --tail={{lines}} {{service}}

# Open a shell in the container
shell:
    {{dc}} sh

# Check container status
status:
    docker compose ps

# Run arbitrary command in container
exec +args:
    {{dc}} {{args}}

# Rebuild the container (use after Dockerfile changes)
rebuild:
    docker compose build --no-cache
    docker compose up -d

# ============================================================================
# Development
# ============================================================================

# Start the dev server (runs inside container)
dev:
    {{dc}} npm run dev

# Build for production
build:
    {{dc}} npm run build

# Preview production build
preview:
    {{dc}} npm run preview

# Generate static site
generate:
    {{dc}} npm run generate

# Start Storybook
storybook:
    {{dc}} npm run storybook

# Build Storybook
storybook-build:
    {{dc}} npm run build-storybook

# ============================================================================
# Code Quality
# ============================================================================

# Run TypeScript type checking
typecheck:
    {{dc}} npm run typecheck

# Run ESLint
lint:
    {{dc}} npm run lint

# Run ESLint with auto-fix
lint-fix:
    {{dc}} npm run lint:fix

# Sync API types from backend (runs on HOST, not Docker)
types-sync:
    node scripts/sync-api-types.js

# ============================================================================
# Unit Tests (Vitest)
# ============================================================================

# Run full test suite
test:
    {{dc}} npm run test

# Run tests in watch mode
test-watch:
    {{dc}} npm run test:watch

# Run tests with Vitest UI (interactive browser interface)
test-ui:
    {{dc}} npm run test:vitest-ui

# Run tests with filter pattern
test-filter pattern:
    {{dc}} npm run test -- -t "{{pattern}}"

# Run tests for a specific file
test-file file:
    {{dc}} npm run test -- {{file}}

# Run tests in watch mode for specific path
test-watch-path path:
    {{dc}} npm run test -- --watch {{path}}

# Run tests with coverage report
test-coverage:
    {{dc}} npm run test -- --coverage

# ============================================================================
# Domain Test Suites (faster than full suite)
# ============================================================================

# Test character builder/wizard
test-character:
    {{dc}} npm run test:character

# Test spells (page, card, filters)
test-spells:
    {{dc}} npm run test:spells

# Test items (page, card, filters)
test-items:
    {{dc}} npm run test:items

# Test monsters (page, filters)
test-monsters:
    {{dc}} npm run test:monsters

# Test classes (page, filters)
test-classes:
    {{dc}} npm run test:classes

# Test races (page, filters)
test-races:
    {{dc}} npm run test:races

# Test backgrounds (page, filters)
test-backgrounds:
    {{dc}} npm run test:backgrounds

# Test feats (page, filters)
test-feats:
    {{dc}} npm run test:feats

# Test reference entities (sizes, skills, etc.)
test-reference:
    {{dc}} npm run test:reference

# Test shared UI components
test-ui-components:
    {{dc}} npm run test:ui

# Test core (composables, utils, server)
test-core:
    {{dc}} npm run test:core

# Test all pages
test-pages:
    {{dc}} npm run test:pages

# Test all Pinia stores
test-stores:
    {{dc}} npm run test:stores

# ============================================================================
# E2E Tests (Playwright)
# ============================================================================

# Run E2E tests (headless)
e2e:
    npx playwright test

# Run E2E tests with UI mode
e2e-ui:
    npx playwright test --ui

# Run E2E tests in headed browser
e2e-headed:
    npx playwright test --headed

# Run E2E tests for specific file
e2e-file file:
    npx playwright test {{file}}

# Run E2E tests with specific browser
e2e-browser browser:
    npx playwright test --project={{browser}}

# Show E2E test report
e2e-report:
    npx playwright show-report

# Install Playwright browsers
e2e-install:
    npx playwright install

# ============================================================================
# Character Stress Test
# ============================================================================

# Run character stress test (default 10 characters)
stress count="10":
    {{dc}} npm run test:character-stress -- --count={{count}}

# Run stress test with verbose output
stress-verbose count="3":
    {{dc}} npm run test:character-stress -- --count={{count}} --verbose

# Run stress test dry-run (no API calls)
stress-dry:
    {{dc}} npm run test:character-stress -- --dry-run

# Run stress test with cleanup
stress-cleanup count="5":
    {{dc}} npm run test:character-stress -- --count={{count}} --cleanup

# ============================================================================
# Dependencies
# ============================================================================

# Install dependencies
install:
    {{dc}} npm install

# Update dependencies
update:
    {{dc}} npm update

# Clean node_modules and reinstall
clean-install:
    {{dc}} rm -rf node_modules
    {{dc}} npm install

# Run postinstall (nuxt prepare)
prepare:
    {{dc}} npm run postinstall

# ============================================================================
# Nuxi Scaffolding
# ============================================================================

# Add a new component: just add component MyComponent
add type name:
    {{dc}} npx nuxi add {{type}} {{name}}

# Add a new page: just add-page users/[id]
add-page path:
    {{dc}} npx nuxi add page {{path}}

# Add a new composable: just add-composable useMyFeature
add-composable name:
    {{dc}} npx nuxi add composable {{name}}

# Add a new component: just add-component MyComponent
add-component name:
    {{dc}} npx nuxi add component {{name}}

# Add a new store: just add-store myStore
add-store name:
    {{dc}} npx nuxi add store {{name}}

# Add a new layout: just add-layout admin
add-layout name:
    {{dc}} npx nuxi add layout {{name}}

# Add a new middleware: just add-middleware auth
add-middleware name:
    {{dc}} npx nuxi add middleware {{name}}

# Add a new API route: just add-api users/index
add-api path:
    {{dc}} npx nuxi add api {{path}}

# ============================================================================
# Utility
# ============================================================================

# Clean Nuxt cache
clean-nuxt:
    {{dc}} rm -rf .nuxt

# Full clean (Nuxt cache + node_modules cache)
clean:
    {{dc}} rm -rf .nuxt node_modules/.cache

# Analyze bundle size
analyze:
    {{dc}} npx nuxi analyze

# Cleanup unused auto-imports
cleanup:
    {{dc}} npx nuxi cleanup

# ============================================================================
# Agent Worktrees (for parallel Claude agents)
# ============================================================================

# Create a new agent worktree
worktree-create name:
    ./scripts/create-agent-worktree.sh {{name}}

# List agent worktrees
worktree-list:
    ./scripts/list-agent-worktrees.sh

# Remove an agent worktree
worktree-remove name:
    ./scripts/remove-agent-worktree.sh {{name}}

# ============================================================================
# Pre-commit / CI Checks
# ============================================================================

# Run all checks (lint, typecheck, test)
check: lint typecheck test
    @echo "All checks passed!"

# Quick check (lint-fix + typecheck only, no tests)
check-quick: lint-fix typecheck
    @echo "Quick checks passed!"

# ============================================================================
# Information
# ============================================================================

# Show environment info
info:
    @echo "=== Docker Status ==="
    @docker compose ps
    @echo ""
    @echo "=== Node Version ==="
    @{{dc}} node --version
    @echo ""
    @echo "=== NPM Version ==="
    @{{dc}} npm --version
    @echo ""
    @echo "=== Frontend URL ==="
    @echo "http://localhost:4000"

# Show outdated dependencies
outdated:
    {{dc}} npm outdated || true

# ============================================================================
# GitHub Issues & Inbox
# ============================================================================

# Check inbox for handoffs and frontend issues
inbox:
    @echo "=== Checking Handoffs ==="
    @grep -A 100 "## For: frontend" ../wrapper/.claude/handoffs.md 2>/dev/null | head -80 || echo "No frontend handoffs pending"
    @echo ""
    @echo "=== GitHub Issues (frontend) ==="
    @gh issue list --repo dfox288/ledger-of-heroes --label "frontend" --state open
    @echo ""
    @echo "=== GitHub Issues (both teams) ==="
    @gh issue list --repo dfox288/ledger-of-heroes --label "both" --state open

# View a specific issue
issue-view num:
    gh issue view {{num}} --repo dfox288/ledger-of-heroes

# List issues by label (default: frontend)
issues label="frontend":
    gh issue list --repo dfox288/ledger-of-heroes --label "{{label}}" --state open

# ============================================================================
# Git Workflow
# ============================================================================

# Create feature branch: just branch 42 monster-filters
branch issue description:
    git checkout -b feature/issue-{{issue}}-{{description}}

# Create fix branch: just branch-fix 99 url-sync-bug
branch-fix issue description:
    git checkout -b fix/issue-{{issue}}-{{description}}

# Create chore branch: just branch-chore 13 docs-update
branch-chore issue description:
    git checkout -b chore/issue-{{issue}}-{{description}}

# Quick conventional commit
commit type message:
    git commit -m "{{type}}: {{message}}"

# Quick git status overview
gs:
    @git status -sb
    @echo ""
    @git log --oneline -5

# Show local branches with tracking info
branches:
    @git branch -vv

# Delete merged branches (except main)
branches-clean:
    git branch --merged main | grep -v "main" | xargs -r git branch -d

# Push current branch and set upstream
push:
    git push -u origin $(git rev-parse --abbrev-ref HEAD)

# Create PR with auto-fill from commits
pr:
    gh pr create --fill

# List open PRs
prs:
    gh pr list

# View PR checks status
pr-checks num:
    gh pr checks {{num}}
