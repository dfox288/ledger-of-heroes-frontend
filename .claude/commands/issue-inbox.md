# Check Project Issues Inbox

Check for open issues assigned to this team (frontend).

## Instructions

Run this command to check your inbox:

```bash
gh issue list --repo dfox288/ledger-of-heroes --label "frontend" --state open
```

Also check issues assigned to "both" teams:

```bash
gh issue list --repo dfox288/ledger-of-heroes --label "both" --state open
```

Or use the justfile shortcut:

```bash
just inbox
```

Summarize:
- Total issues waiting
- Any urgent or old issues (created > 3 days ago)
- Quick recommendation on which to tackle first
