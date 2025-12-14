// server/api/parties/[id]/monsters/index.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties/${id}/monsters`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to add monster',
      data: err.data
    })
  }
})
