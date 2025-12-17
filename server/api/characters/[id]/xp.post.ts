/**
 * Update character XP endpoint - Proxies to Laravel backend
 *
 * Sets the character's experience points to the provided value.
 * Backend handles level calculation and validation.
 *
 * @example POST /api/characters/1/xp { "experience_points": 7000 }
 *
 * @see #653 - XP progress display
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/xp`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update XP',
      data: err.data
    })
  }
})
