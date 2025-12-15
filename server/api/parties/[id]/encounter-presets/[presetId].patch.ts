// server/api/parties/[id]/encounter-presets/[presetId].patch.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const presetId = getRouterParam(event, 'presetId')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties/${id}/encounter-presets/${presetId}`, {
      method: 'PATCH',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update encounter preset',
      data: err.data
    })
  }
})
