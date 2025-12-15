// server/api/parties/[id]/encounter-presets/[presetId]/load.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const presetId = getRouterParam(event, 'presetId')

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties/${id}/encounter-presets/${presetId}/load`, {
      method: 'POST'
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to load encounter preset',
      data: err.data
    })
  }
})
