# Troubleshooting Guide

Common issues and how to debug them.

---

## Quick Diagnostics

### Check Service Health

```bash
just status           # Check container status
just logs-tail 50     # Last 50 lines of logs
curl http://localhost:8080/api/v1/health  # Backend accessible?
```

### Check for TypeScript Errors

```bash
just typecheck
```

### Check for Lint Errors

```bash
just lint
```

---

## Common Issues

### "Cannot find module" or Import Errors

**Symptoms:** TypeScript can't find a module, red squiggles in IDE

**Fixes:**
1. Restart TypeScript server in IDE (VS Code: Cmd+Shift+P -> "Restart TS Server")
2. Check import path - use `~/` prefix for app directory
3. For auto-imported composables, check they're in `app/composables/`
4. Run `just typecheck` to see actual errors

```typescript
// WRONG
import { useApi } from '../composables/useApi'
import { Spell } from 'types'

// CORRECT
import { useApi } from '~/composables/useApi'
import type { Spell } from '~/types'
```

### API Returns 404 or CORS Error

**Symptoms:** Network tab shows 404, CORS errors in console

**Cause:** Missing Nitro server route or wrong endpoint

**Fix:**
1. Check backend endpoint exists: `curl http://localhost:8080/api/v1/your-endpoint`
2. Create matching Nitro route in `server/api/`
3. Never call backend directly from components

```typescript
// WRONG - Direct backend call
const data = await $fetch('http://localhost:8080/api/v1/spells')

// CORRECT - Use Nitro proxy
const { apiFetch } = useApi()
const data = await apiFetch('/spells')
```

### Pinia Store Not Updating

**Symptoms:** Store state changes but component doesn't re-render

**Fixes:**
1. Use `storeToRefs()` for reactive destructuring
2. Don't destructure store directly

```typescript
// WRONG - Not reactive
const store = useSpellFiltersStore()
const { selectedLevels } = store // Not reactive!

// CORRECT - Reactive
const store = useSpellFiltersStore()
const { selectedLevels } = storeToRefs(store)
```

### Tests Pass Locally, Fail in CI

**Common causes:**
1. **Timing issues** - Add `await flushPromises()` or `await nextTick()`
2. **State bleeding** - Add `beforeEach` to reset state
3. **Missing mocks** - CI doesn't have access to real APIs

```typescript
// Fix timing issues
it('loads data', async () => {
  const wrapper = await mountSuspended(Component)
  await flushPromises() // Wait for async operations
  expect(wrapper.text()).toContain('Data')
})

// Fix state bleeding
beforeEach(() => {
  setActivePinia(createPinia())
})
```

### Component Shows "Loading..." Forever

**Symptoms:** Suspense never resolves, loading state stuck

**Fixes:**
1. Check API is returning data (Network tab)
2. Check for errors in console
3. Ensure `useAsyncData` key is unique

```typescript
// WRONG - Non-unique key causes caching issues
const { data } = await useAsyncData('spell', () => apiFetch('/spells/fireball'))
const { data } = await useAsyncData('spell', () => apiFetch('/spells/magic-missile'))

// CORRECT - Unique keys
const { data } = await useAsyncData(`spell-${slug}`, () => apiFetch(`/spells/${slug}`))
```

### Filters Not Persisting

**Symptoms:** Filters reset on page refresh

**Fixes:**
1. Check Pinia store uses IndexedDB persistence
2. Check `usePageFilterSetup` is called in the page
3. Clear IndexedDB if corrupted: DevTools -> Application -> IndexedDB -> Delete

### Hot Reload Not Working

**Symptoms:** Changes don't appear without full refresh

**Fixes:**
1. Restart dev server: `just restart`
2. Check for syntax errors preventing HMR
3. Clear `.nuxt` cache: `just clean-nuxt && just dev`

---

## Debugging Techniques

### Console Logging (Dev Only)

```typescript
import { logger } from '~/utils/logger'

// Only logs in development
logger.debug('Current state:', store.$state)
logger.info('Selection made:', selection)
logger.error('API failed:', error)
```

### Vue DevTools

1. Install Vue DevTools browser extension
2. Open DevTools -> Vue tab
3. Inspect component state, Pinia stores, routes

### Network Tab

1. Open DevTools -> Network tab
2. Filter by "Fetch/XHR"
3. Check request/response for API calls
4. Look for 4xx/5xx errors

### Debugging Tests

```bash
just test-file tests/components/spell/Card.test.ts  # Single file
just test-filter "displays spell name"               # Pattern match
```

---

## Backend Issues

### API Returns Unexpected Data

```bash
# Test endpoint directly
curl "http://localhost:8080/api/v1/spells?filter=level=3" | jq

# Check API docs
open http://localhost:8080/docs/api
```

### Database Issues

```bash
# Reset backend database
cd ../backend
docker compose exec php php artisan migrate:fresh --seed
```

### Type Mismatch After Backend Changes

```bash
just types-sync       # Regenerate types from backend
just typecheck        # Verify
```

---

## Nuclear Options

When all else fails:

```bash
# Full rebuild
just down
just rebuild
just install
just dev

# Clear all caches
just clean
just dev
```
