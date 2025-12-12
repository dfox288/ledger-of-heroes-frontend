/**
 * HP modification endpoint - Proxies to Laravel backend
 *
 * Sends HP deltas to backend which handles all D&D 5e rules:
 * - Temp HP absorbs damage first
 * - Healing caps at max HP
 * - HP floors at 0
 * - Death saves auto-reset when healing from 0 HP
 * - Temp HP uses higher-wins rule
 *
 * @example PATCH /api/characters/1/hp { hp: "-12" }     // Damage
 * @example PATCH /api/characters/1/hp { hp: "+8" }      // Healing
 * @example PATCH /api/characters/1/hp { temp_hp: 10 }   // Set temp HP
 * @example PATCH /api/characters/1/hp { temp_hp: 0 }    // Clear temp HP
 *
 * @see #537 - HP endpoint integration
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/hp`, {
      method: 'PATCH',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update HP',
      data: err.data
    })
  }
})
