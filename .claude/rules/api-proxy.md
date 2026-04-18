# Nitro Server Routes (API Proxy)

**CRITICAL:** All API calls go through Nitro server routes, NOT directly to the Laravel backend!

## How It Works

```
Frontend Component -> /api/spells -> Nitro Route -> Laravel Backend
                     (port 4000)   (server/api/)   (port 8080)
```

The `useApi` composable provides `apiFetch` with `baseURL: '/api'`. This means:
- `apiFetch('/spells')` -> calls `/api/spells` -> Nitro proxies to Laravel

## When Adding New API Endpoints

**If the backend has an endpoint, you MUST create a matching Nitro route!**

```bash
# Backend endpoint:
GET http://localhost:8080/api/v1/characters/1/available-spells

# Requires Nitro route at:
server/api/characters/[id]/available-spells.get.ts
```

## Route File Structure

`server/api/` currently exposes ~106 Nitro proxy routes. Group by domain:

### Entity list/detail proxies

```
server/api/
├── spells/{index,[slug]}.get.ts
├── items/{index,[slug]}.get.ts
├── monsters/{index,[slug]}.get.ts
├── races/{index,[slug]}.get.ts
├── classes/{index,[slug]}.get.ts
├── classes/[slug]/subclasses.get.ts
├── backgrounds/{index,[slug]}.get.ts
├── feats/{index,[slug]}.get.ts
└── search.get.ts
```

### Reference / lookup data (GET-only, non-paginated)

```
server/api/
├── ability-scores/index.get.ts
├── alignments/index.get.ts
├── armor-types/index.get.ts
├── conditions/index.get.ts
├── creature-types/index.get.ts
├── damage-types/index.get.ts
├── item-properties/index.get.ts
├── item-types/index.get.ts
├── languages/index.get.ts
├── lookups/proficiency-types.get.ts
├── monster-types/index.get.ts
├── proficiency-types/index.get.ts
├── rarities/index.get.ts
├── sizes/index.get.ts
├── skills/index.get.ts
├── sources/index.get.ts
└── spell-schools/index.get.ts
```

### Characters (CRUD + play mode + builder)

```
server/api/characters/
├── {index,[id]}.{get,post,patch,delete}.ts
├── import.post.ts
├── [id]/
│   ├── {stats,summary,pending-choices,validate}.get.ts
│   ├── {ability-bonuses,available-feats,available-spells}.get.ts
│   ├── {proficiencies,features,languages}.get.ts
│   ├── {export}.get.ts
│   ├── hp.patch.ts
│   ├── currency.patch.ts
│   ├── {short-rest,long-rest,revive}.post.ts
│   ├── hit-dice/{index.get,spend.post}.ts
│   ├── spell-slots/{index.get,[level].patch}.ts
│   ├── xp.{get,post}.ts
│   ├── media/portrait.{get,post,delete}.ts
│   ├── classes/{index.get,index.post,[classId].put,[classId].delete}.ts
│   ├── classes/[classId]/{subclass.put,level-up.post}.ts
│   ├── choices/[choiceId].{post,delete}.ts
│   ├── equipment.{get,post}.ts
│   ├── equipment/[equipmentId].{patch,delete}.ts
│   ├── spells.{get,post}.ts
│   ├── spells/[spellId].{patch,delete}.ts
│   ├── spells/[spellSlug]/{prepare,unprepare}.patch.ts
│   ├── conditions/{index.get,index.post,[slug].delete}.ts
│   ├── counters/[counterId].patch.ts
│   ├── notes.{get,post}.ts
│   ├── notes/[noteId].{patch,delete}.ts
│   └── languages/sync.post.ts
```

### Parties & DM screen

```
server/api/parties/
├── {index.get,index.post,[id].get,[id].put,[id].delete}.ts
├── [id]/{stats.get}.ts
├── [id]/characters/{index.post,[characterId].delete}.ts
├── [id]/monsters/{index.get,index.post,index.delete,[monsterId].patch,[monsterId].delete}.ts
└── [id]/encounter-presets/{index.get,index.post,[presetId].patch,[presetId].delete,[presetId]/load.post}.ts
```

**Note:** Character routes accept both numeric IDs and public IDs (e.g., `arcane-phoenix-M7k2`). Frontend pages use `/characters/[publicId]/` for human-readable URLs.

**Audit status (2025-12-21):** Several proxy routes still pass through `$fetch` without a `try/catch` + `createError` wrapper, so Laravel validation payloads are not forwarded. If you touch one of these, add the error-forwarding wrapper shown below. Tracked in the audit report; notable offenders include `characters/index.post.ts` and `characters/[id]/choices/[choiceId].post.ts`.

## Route Template

```typescript
// server/api/characters/[id]/example.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  // Build query string if needed
  const queryString = query.param ? `?param=${query.param}` : ''

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/example${queryString}`)
  return data
})
```

## Common Mistake

```typescript
// WRONG - Direct backend call (fails in SSR, CORS issues)
const data = await $fetch('http://localhost:8080/api/v1/spells')

// CORRECT - Use Nitro proxy
const { apiFetch } = useApi()
const data = await apiFetch('/spells')
```

## Error Handling in Nitro Routes

### Basic Error Handling

Always handle errors gracefully in Nitro routes:

```typescript
// server/api/characters/[id].get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}`)
    return data
  } catch (error: any) {
    // Forward the backend's status code and message
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch character',
      data: error.data // Include validation errors if present
    })
  }
})
```

### Validation Error Forwarding

When the backend returns validation errors (422), forward them to the client:

```typescript
// server/api/characters/[id]/choices/[choiceId].post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const choiceId = getRouterParam(event, 'choiceId')
  const body = await readBody(event)

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/choices/${choiceId}`,
      { method: 'POST', body }
    )
    return data
  } catch (error: any) {
    // Preserve Laravel's validation error structure
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to submit choice',
      data: error.data // { message: '...', errors: { field: ['...'] } }
    })
  }
})
```

### Client-Side Error Handling

In components, handle API errors with proper user feedback:

```typescript
async function saveSelection() {
  try {
    await apiFetch(`/characters/${id}/choices/${choiceId}`, {
      method: 'POST',
      body: { selection: selectedItem.value }
    })
    toast.add({ title: 'Saved!', color: 'success' })
  } catch (error: any) {
    // Handle validation errors
    if (error.statusCode === 422) {
      const message = error.data?.message || 'Validation failed'
      toast.add({ title: message, color: 'error' })
      return
    }
    // Handle other errors
    toast.add({ title: 'Something went wrong', color: 'error' })
    logger.error('Save failed:', error)
  }
}
```

## API Reference

**Location:** `../backend` | **Base URL:** `http://localhost:8080/api/v1` | **Docs:** `http://localhost:8080/docs/api`

### Meilisearch Filter Syntax

```bash
# Correct - use filter parameter
curl "http://localhost:8080/api/v1/spells?filter=level=3"
curl "http://localhost:8080/api/v1/spells?filter=level IN [0,1,2]"
curl "http://localhost:8080/api/v1/spells?filter=concentration=true AND level>=3"

# Wrong - standard query params don't work for filtering
curl "http://localhost:8080/api/v1/spells?level=3"
```

**Operators:** `=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `AND`, `OR`, `IS EMPTY`, `IS NOT EMPTY`

### Key Endpoints

| Type | Endpoints |
|------|-----------|
| **Entities** | `/spells`, `/monsters`, `/items`, `/classes`, `/races`, `/backgrounds`, `/feats` |
| **Reference** | `/ability-scores`, `/conditions`, `/damage-types`, `/skills`, `/sizes`, `/languages`, `/spell-schools`, `/sources`, `/item-types`, `/proficiency-types` |
| **Other** | `/search` (global search) |
