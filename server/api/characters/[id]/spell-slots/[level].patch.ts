/**
 * Spell slot usage endpoint - Proxies to Laravel backend
 *
 * Updates spell slot usage for a specific slot level via action:
 * - "use": Increments spent count (casts a spell)
 * - "restore": Decrements spent count (recovers a slot)
 *
 * @example PATCH /api/characters/1/spell-slots/1 { "action": "use" }
 * @example PATCH /api/characters/1/spell-slots/3 { "action": "restore" }
 *
 * @see #616 - Spell slot tracking
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const level = getRouterParam(event, 'level')
  const body = await readBody(event)

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/spell-slots/${level}`,
      { method: 'PATCH', body }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update spell slot',
      data: err.data
    })
  }
})
