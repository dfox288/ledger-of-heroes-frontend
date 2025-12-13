# Cross-Project Coordination

Use GitHub Issues in `dfox288/ledger-of-heroes` for bugs, API issues, and cross-cutting concerns.

## Important: Where Things Live

| Resource | Location | Command |
|----------|----------|---------|
| **Issues** | Shared repo `dfox288/ledger-of-heroes` | `gh issue list --repo dfox288/ledger-of-heroes` |
| **Frontend PRs** | This repo (frontend) | `gh pr list` (no --repo flag needed) |
| **Backend PRs** | `dfox288/ledger-of-heroes-backend` | `gh pr list --repo dfox288/ledger-of-heroes-backend` |
| **Handoffs** | `../wrapper/.claude/handoffs.md` | Direct file read |

**CRITICAL:** Issues live in the shared `ledger-of-heroes` repo. PRs go to the respective project repo (frontend PRs here, backend PRs in `ledger-of-heroes-backend`).

## Session Start Checklist

**Do these in order at the start of every session:**

```bash
# 1. Check for handoffs from backend
echo "=== Checking Handoffs ===" && grep -A 100 "## For: frontend" ../wrapper/.claude/handoffs.md 2>/dev/null | head -50 || echo "No frontend handoffs pending"

# 2. Check GitHub issues assigned to frontend
echo "=== GitHub Issues ===" && gh issue list --repo dfox288/ledger-of-heroes --label "frontend" --state open
```

If there's a handoff for you:
1. Read the full context in `../wrapper/.claude/handoffs.md`
2. The handoff contains API contracts, response shapes, and test commands you need
3. After absorbing the context, delete that handoff section from the file
4. Start work on the related issue

## Create an Issue

```bash
# When you discover an API problem or need backend changes
gh issue create --repo dfox288/ledger-of-heroes --title "Brief description" --label "backend,bug,from:frontend" --body "Details here"
```

## Labels to Use

- **Assignee:** `frontend`, `backend`, `both`
- **Type:** `bug`, `feature`, `api-contract`, `data-issue`, `performance`
- **Source:** `from:frontend`, `from:backend`, `from:manual-testing`

## Write Handoffs (when creating backend work)

**After creating an issue that requires backend work, ALWAYS write a handoff.**

The handoff provides context that GitHub issues can't capture: reproduction steps, observed vs expected behavior, and specific use cases.

Append to `../wrapper/.claude/handoffs.md`:

```markdown
## For: backend
**From:** frontend | **Issue:** #NUMBER | **Created:** YYYY-MM-DD HH:MM

[Brief description of what's needed or broken]

**Context:**
- [What UI feature requires this]
- [User flow that triggers this]

**Observed behavior:**
- [What currently happens]
- [Error messages if any]

**Expected behavior:**
- [What should happen]
- [Expected response shape if requesting new endpoint]

**Reproduction:**
\`\`\`bash
curl "http://localhost:8080/api/v1/endpoint?filter=..."
# Returns: { unexpected data }
# Expected: { correct data }
\`\`\`

**Frontend is blocked on:**
- [Specific component/page waiting for this]
- [Workaround in place, if any]

**Related:**
- See component: `app/components/example/Card.vue`
- See page: `app/pages/example/index.vue`

---
```

**Key details to include:**
- The user flow that exposes the bug
- Exact API call that fails or returns wrong data
- What the frontend expects to receive
- Which components are blocked waiting for the fix

## Close When Fixed

Issues close automatically when PR merges if the PR body contains `Closes #N`. For manual closure:

```bash
gh issue close 42 --repo dfox288/ledger-of-heroes --comment "Fixed in PR #123"
```
