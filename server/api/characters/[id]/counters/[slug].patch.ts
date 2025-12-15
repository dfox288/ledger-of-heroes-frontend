/**
 * Counter update endpoint - Proxies to Laravel backend
 *
 * Updates counter usage via action:
 * - "use": Decrements current (spends one use)
 * - "restore": Increments current (recovers one use)
 * - "reset": Sets current to max
 *
 * @example PATCH /api/characters/1/counters/phb:bard:bardic-inspiration { "action": "use" }
 *
 * @see #632 - Class resources
 */
const VALID_ACTIONS = ['use', 'restore', 'reset'] as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)

  // Validate required parameters
  if (!id || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: id and slug'
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
      `${config.apiBaseServer}/characters/${id}/counters/${slug}`,
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
