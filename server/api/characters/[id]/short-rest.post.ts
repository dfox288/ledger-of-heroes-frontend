/**
 * Short rest endpoint - Proxies to Laravel backend
 *
 * Performs a short rest (1+ hours):
 * - Resets short-rest features (Action Surge, Second Wind, etc.)
 * - Resets Warlock pact slots
 * - Hit dice spending handled separately via hit-dice/spend
 *
 * @example POST /api/characters/1/short-rest
 *
 * @see #534 - Rest Actions
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/short-rest`, {
      method: 'POST'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to take short rest',
      data: err.data
    })
  }
})
