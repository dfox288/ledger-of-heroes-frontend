/**
 * Remove class from character - Proxies to Laravel backend
 *
 * @example DELETE /api/characters/1/classes/2
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const classId = getRouterParam(event, 'classId')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/classes/${classId}`, {
      method: 'DELETE'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to remove class',
      data: err.data
    })
  }
})
