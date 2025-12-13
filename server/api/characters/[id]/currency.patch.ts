/**
 * Currency modification endpoint - Proxies to Laravel backend
 *
 * Sends currency deltas to backend which handles:
 * - Add (+), subtract (-), or set (no sign) operations
 * - Auto-conversion ("making change") when subtracting more than available
 * - Validation that sufficient funds exist after conversion
 *
 * @example PATCH /api/characters/1/currency { gp: "+10" }     // Add 10 gold
 * @example PATCH /api/characters/1/currency { cp: "-50" }     // Subtract 50 copper
 * @example PATCH /api/characters/1/currency { sp: "25" }      // Set silver to 25
 * @example PATCH /api/characters/1/currency { gp: "-5", sp: "+10" }  // Multiple ops
 *
 * @see #546 - Currency edit modal
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/currency`, {
      method: 'PATCH',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update currency',
      data: err.data
    })
  }
})
