/**
 * List spells endpoint - Proxies to Laravel backend
 *
 * Supports searching, filtering by level/school, pagination
 *
 * @example GET /api/spells?q=fire&level=3&school=1&page=1&per_page=24
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/spells`, { query })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch spells',
      data: err.data
    })
  }
})
