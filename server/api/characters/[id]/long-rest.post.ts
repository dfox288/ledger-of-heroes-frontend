/**
 * Long rest endpoint - Proxies to Laravel backend
 *
 * Performs a long rest (8+ hours):
 * - Restores HP to maximum
 * - Resets all spell slots
 * - Recovers half of max hit dice (rounded down, minimum 1)
 * - Clears death saves
 * - Resets all features (short and long rest)
 *
 * @example POST /api/characters/1/long-rest
 *
 * @see #534 - Rest Actions
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/long-rest`, {
      method: 'POST'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to take long rest',
      data: err.data
    })
  }
})
