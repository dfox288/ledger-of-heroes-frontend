/**
 * Get single monster endpoint - Proxies to Laravel backend
 *
 * Supports both numeric ID and slug routing
 *
 * @example GET /api/monsters/123
 * @example GET /api/monsters/ancient-red-dragon
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Monster slug or ID is required'
    })
  }

  try {
    const data = await $fetch(`${config.apiBaseServer}/monsters/${slug}`)
    return data
  } catch (error) {
    const err = error as { response?: { status?: number }, message?: string }
    throw createError({
      statusCode: err.response?.status || 404,
      statusMessage: err.message || 'Monster not found'
    })
  }
})
