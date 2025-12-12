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

```
server/api/
├── spells/
│   ├── index.get.ts          # GET /api/spells
│   └── [slug].get.ts         # GET /api/spells/:slug
├── characters/
│   ├── index.get.ts          # GET /api/characters
│   ├── index.post.ts         # POST /api/characters
│   ├── [id].get.ts           # GET /api/characters/:id (accepts id or publicId)
│   ├── [id].patch.ts         # PATCH /api/characters/:id
│   ├── [id].delete.ts        # DELETE /api/characters/:id
│   └── [id]/
│       ├── stats.get.ts      # GET /api/characters/:id/stats
│       ├── pending-choices.get.ts   # GET /api/characters/:id/pending-choices
│       ├── summary.get.ts    # GET /api/characters/:id/summary
│       └── choices/
│           └── [choiceId].post.ts   # POST /api/characters/:id/choices/:choiceId
```

**Note:** Character routes accept both numeric IDs and public IDs (e.g., `arcane-phoenix-M7k2`). Frontend pages use `/characters/[publicId]/` for human-readable URLs.

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
