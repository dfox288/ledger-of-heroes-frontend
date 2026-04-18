/**
 * Add or update a condition on a character - Proxies to Laravel backend
 *
 * Uses upsert logic: if condition exists, updates source/duration/level.
 *
 * @example POST /api/characters/1/conditions
 * Body: { condition: "poisoned", source: "Giant Spider", duration: "1 hour" }
 * Body: { condition: "exhaustion", level: 2 }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/conditions`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to apply condition',
      data: err.data
    })
  }
})
