# Development Workflow

## Every Feature/Fix

```
1. Check skills           -> Use Superpower skills (NOT superpowers-laravel)
2. Check GitHub Issues    -> gh issue list for assigned tasks
3. Create feature branch  -> git checkout -b feature/issue-N-short-description
4. Write tests FIRST      -> Watch them fail (TDD mandatory)
5. Write minimal code     -> Make tests pass
6. Refactor while green   -> Clean up
7. Run test suite         -> just test-{domain} (smallest relevant suite)
8. Run just lint-fix      -> Fix linting
9. Update CHANGELOG.md    -> If user-facing
10. Commit + Push         -> Clear message, push to feature branch
11. Create PR             -> gh pr create with issue reference
12. Close GitHub Issue    -> Closes automatically via PR merge (or manual close)
```

## Bug Fix Workflow (When Tests Already Exist)

When fixing bugs in code that has existing tests:

```
1. Reproduce the bug      -> Understand what's broken
2. Check existing tests   -> Do they test the buggy behavior?
3. UPDATE TESTS FIRST     -> Write/modify tests for CORRECT behavior
4. Watch tests FAIL       -> Confirms test catches the bug
5. Fix the code           -> Make tests pass
6. Run test suite         -> just test (verify no regressions)
7. Commit + Push          -> Include "fix:" prefix
```

**Critical:** When fixing bugs, do NOT just make existing tests pass. If tests pass with buggy code, the tests are wrong. Update tests to verify the correct behavior BEFORE fixing the code.

**Anti-pattern to avoid:**
- Code doesn't match tests -> Rewrite code to match tests
- Tests pass but behavior is wrong -> "Tests pass, ship it"
- Code doesn't match tests -> Determine correct behavior -> Update tests -> Fix code (CORRECT)

## Branch Naming Convention

```bash
# Format: feature/issue-{number}-{short-description}
git checkout -b feature/issue-42-monster-encounter-builder
git checkout -b fix/issue-99-filter-url-sync-bug
git checkout -b chore/issue-13-storybook-setup
```

**Prefixes:**
- `feature/` - New functionality
- `fix/` - Bug fixes
- `chore/` - Maintenance, docs, refactoring

## For Filter Changes (Additional)

- Add field to Pinia store (`app/stores/{entity}Filters.ts`)
- Update `useMeilisearchFilters` config in page
- Add filter UI component in page
- Test URL sync works

## For New Entity Pages (Additional)

- Create Pinia filter store
- Create list page with `useEntityList` composable
- Create detail page with `useAsyncData`
- Create card component
- Add domain test suite to `package.json`

## For API Type Changes (Additional)

- Run `just types-sync` (requires backend running)
- Run `just typecheck`
- Update component props if needed

## Success Checklist

Before creating a PR:

- [ ] Working on feature branch (`feature/issue-N-*`)
- [ ] Tests written FIRST (TDD mandate)
- [ ] All tests pass (`just test-{domain}` + `just test`)
- [ ] TypeScript compiles (`just typecheck`)
- [ ] ESLint passes (`just lint`)
- [ ] Browser verification (light/dark mode)
- [ ] Mobile-responsive
- [ ] CHANGELOG.md updated (if user-facing)
- [ ] Commits pushed to feature branch
- [ ] **PR created with issue reference** (`Closes #N`)

**If ANY checkbox is unchecked, work is NOT done.**
