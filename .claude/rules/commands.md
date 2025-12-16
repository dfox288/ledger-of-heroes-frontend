# Commands Reference

**All commands use `just`.** Run `just` or `just --list` to see available recipes.

## Quick Reference

```bash
just                  # List all available commands
just up               # Start Docker environment
just dev              # Start dev server
just test             # Run full test suite
just typecheck        # TypeScript checking
just lint-fix         # Auto-fix linting issues
just types-sync       # Sync API types from backend
just inbox            # Check handoffs + issues
just gs               # Quick git status
```

## Test Suites by Domain

Use domain-specific test suites during development - they're much faster than the full suite.

| Working On | Command |
|------------|---------|
| **Character builder, wizard steps** | `just test-character` |
| Spells page, SpellCard, filters | `just test-spells` |
| Items page, ItemCard, filters | `just test-items` |
| Monsters page, filters | `just test-monsters` |
| Classes page, filters | `just test-classes` |
| Races page, filters | `just test-races` |
| Backgrounds page, filters | `just test-backgrounds` |
| Feats page, filters | `just test-feats` |
| Reference entities (sizes, skills) | `just test-reference` |
| Shared UI components, cards | `just test-ui-components` |
| Composables, utils, server API | `just test-core` |
| All page tests | `just test-pages` |
| All Pinia stores | `just test-stores` |
| CI, pre-commit, final check | `just test` |

## Test Strategies

| Strategy | Command | Use Case |
|----------|---------|----------|
| Domain suite | `just test-spells` | Working on specific feature |
| Watch mode | `just test-watch` | TDD, iterating on tests |
| Watch specific path | `just test-watch-path tests/components/spell/` | Focus on one area |
| Single file | `just test-file tests/path/to/file.test.ts` | Debugging one test |
| Pattern match | `just test-filter "displays spell name"` | Run tests matching name |
| Vitest UI | `just test-ui` | Interactive browser UI |
| Coverage | `just test-coverage` | Generate coverage report |
| Full suite | `just test` | Pre-commit, before PR |

## E2E Tests (Playwright)

```bash
just e2e              # Run E2E tests headless
just e2e-ui           # Interactive UI mode
just e2e-headed       # Visible browser
just e2e-file tests/e2e/example.spec.ts  # Run specific test
just e2e-report       # View HTML report
just e2e-install      # Install browsers
```

## Character Stress Test

Rapidly creates N characters via API to test the character builder:

```bash
just stress           # Create 10 characters (default)
just stress 20        # Create 20 characters
just stress-verbose 3 # Watch choices being made
just stress-dry       # Preview without API calls
just stress-cleanup 5 # Create and delete after test
```

**What it tests:** Character creation -> class -> background -> ability scores -> all pending choices (proficiencies, languages, equipment, spells) -> validation.

**Test pool:** 5 races x 5 classes x 4 backgrounds = 100 unique combinations (PHB-focused).

## Docker Management

```bash
just up               # Start Docker environment
just down             # Stop Docker environment
just restart          # Restart containers
just logs             # Follow container logs
just logs-tail 50     # Last 50 lines of logs
just shell            # Open shell in container
just status           # Check container status
just rebuild          # Rebuild container (after Dockerfile changes)
just exec <cmd>       # Run arbitrary command in container
```

## Scaffolding (Nuxi)

```bash
just add component MyComponent    # Add component
just add-page users/[id]          # Add page
just add-composable useMyFeature  # Add composable
just add-store myStore            # Add Pinia store
just add-api users/index          # Add API route
just add-layout admin             # Add layout
just add-middleware auth          # Add middleware
```

## Dependencies

```bash
just install          # Install dependencies
just update           # Update dependencies
just clean-install    # Clean reinstall (rm node_modules)
just prepare          # Run nuxt prepare
```

## Utility

```bash
just clean-nuxt       # Clear .nuxt cache
just clean            # Clear all caches
just analyze          # Analyze bundle size
just check            # Run lint + typecheck + test
just check-quick      # Run lint-fix + typecheck only
just info             # Show environment info
just outdated         # Show outdated dependencies
```

## GitHub Issues & Inbox

```bash
just inbox               # Check handoffs + frontend + both issues
just issues              # List frontend issues (default label)
just issues both         # List issues for both teams
just issue-view <num>    # View specific issue details
```

## Git Workflow

```bash
just gs                           # Quick status + recent commits
just branches                     # Show local branches with tracking
just branches-clean               # Delete merged branches (except main)
just push                         # Push current branch, set upstream

# Branch creation
just branch <num> <desc>          # feature/issue-N-description
just branch-fix <num> <desc>      # fix/issue-N-description
just branch-chore <num> <desc>    # chore/issue-N-description

# Commits
just commit <type> <msg>          # Quick conventional commit

# Pull Requests
just pr                           # Create PR with auto-fill
just prs                          # List open PRs
just pr-checks <num>              # View PR checks status
```

## Agent Worktrees

```bash
just worktree-create agent-1      # Create agent worktree
just worktree-list                # List worktrees
just worktree-remove agent-1      # Remove worktree
```
