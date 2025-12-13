/**
 * Get character portrait - Proxies to Laravel backend
 *
 * Returns URLs for different portrait sizes:
 * - original: Full resolution upload
 * - thumb: Small thumbnail (64x64)
 * - medium: Medium size (256x256)
 *
 * @example GET /api/characters/1/media/portrait
 * @returns { data: { original: string, thumb: string, medium: string, is_uploaded: boolean } }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/media/portrait`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch portrait',
      data: err.data
    })
  }
})
