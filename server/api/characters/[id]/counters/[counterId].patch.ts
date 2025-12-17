/**
 * Counter update endpoint - Proxies to Laravel backend
 *
 * Updates counter usage via action:
 * - "use": Decrements current (spends one use)
 * - "restore": Increments current (recovers one use)
 * - "reset": Sets current to max
 *
 * @example PATCH /api/characters/1/counters/123 { "action": "use" }
 *
 * @see #632 - Class resources
 * @see #725 - Counter system refactor (changed from slug to numeric ID)
 */
const VALID_ACTIONS = ['use', 'restore', 'reset'] as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const counterId = getRouterParam(event, 'counterId')
  const body = await readBody(event)

  // Validate required parameters
  if (!id || !counterId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: id and counterId'
    })
  }

  // Validate action
  if (!body?.action || !VALID_ACTIONS.includes(body.action)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`
    })
  }

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/counters/${counterId}`,
      { method: 'PATCH', body }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update counter',
      data: err.data
    })
  }
})
