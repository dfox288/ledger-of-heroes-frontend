/**
 * Remove equipment from character - Proxies to Laravel backend
 *
 * @example DELETE /api/characters/1/equipment/5
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const equipmentId = getRouterParam(event, 'equipmentId')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/equipment/${equipmentId}`, {
      method: 'DELETE'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to remove equipment',
      data: err.data
    })
  }
})
