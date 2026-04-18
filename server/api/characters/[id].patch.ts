/**
 * Update character endpoint - Proxies to Laravel backend
 *
 * @example PATCH /api/characters/1 { race_slug: "phb:human" }
 * @example PATCH /api/characters/1 { background_slug: "phb:acolyte" }
 * @see #318 - Slug-based character references
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}`, {
      method: 'PATCH',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update character',
      data: err.data
    })
  }
})
