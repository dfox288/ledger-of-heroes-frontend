/**
 * Update party endpoint - Proxies to Laravel backend
 *
 * @example PUT /api/parties/1 { name: "Updated Name" }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties/${id}`, {
      method: 'PUT',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update party',
      data: err.data
    })
  }
})
