/**
 * Spend hit dice endpoint - Proxies to Laravel backend
 *
 * Marks hit dice as spent (used during short rest to heal).
 * Player rolls physical dice and adds HP separately.
 *
 * @example POST /api/characters/1/hit-dice/spend { die_type: "d8", quantity: 1 }
 *
 * @see #534 - Rest Actions
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Validate required fields before proxying to backend
  if (!body?.die_type || typeof body.die_type !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid required field: die_type'
    })
  }
  if (body.quantity === undefined || typeof body.quantity !== 'number' || body.quantity < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid required field: quantity (must be a positive number)'
    })
  }

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/hit-dice/spend`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to spend hit dice',
      data: err.data
    })
  }
})
