// server/api/parties/[id]/monsters/[monsterId].delete.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const monsterId = getRouterParam(event, 'monsterId')

  try {
    await $fetch(`${config.apiBaseServer}/parties/${id}/monsters/${monsterId}`, {
      method: 'DELETE'
    })
    return { success: true }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to remove monster',
      data: err.data
    })
  }
})
