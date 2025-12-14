// server/api/parties/[id]/monsters/[monsterId].patch.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const monsterId = getRouterParam(event, 'monsterId')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties/${id}/monsters/${monsterId}`, {
      method: 'PATCH',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update monster',
      data: err.data
    })
  }
})
