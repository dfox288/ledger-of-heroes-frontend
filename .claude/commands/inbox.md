---
description: Check frontend inbox for handoffs and assigned GitHub issues
---

# Check Frontend Inbox

Run these commands to check for pending work:

```bash
# 1. Check for handoffs from backend
echo "=== Checking Handoffs ===" && grep -A 100 "## For: frontend" ../wrapper/.claude/handoffs.md 2>/dev/null | head -80 || echo "No frontend handoffs pending"

# 2. Check GitHub issues assigned to frontend
echo "=== GitHub Issues ===" && gh issue list --repo dfox288/ledger-of-heroes --label "frontend" --state open
```

## After checking:

1. **If handoffs exist:** Read the full context in `../wrapper/.claude/handoffs.md`. Handoffs contain API response shapes, filter syntax, and test commands that GitHub issues don't capture.

2. **Process handoffs first:** They usually have richer context because backend already did the implementation work.

3. **After absorbing a handoff:** Delete that section from the handoffs file so it doesn't show up again.

4. **Report findings:** Summarize what's pending and recommend what to tackle.
