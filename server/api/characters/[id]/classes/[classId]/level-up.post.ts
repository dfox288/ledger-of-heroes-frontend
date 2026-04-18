/**
 * Level up character in a class - Proxies to Laravel backend
 *
 * @example POST /api/characters/arcane-phoenix-M7k2/classes/phb:fighter/level-up
 * @returns LevelUpResult with previous_level, new_level, features_gained, etc.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const classId = getRouterParam(event, 'classId')

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/classes/${classId}/level-up`,
      { method: 'POST' }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to level up',
      data: err.data
    })
  }
})
