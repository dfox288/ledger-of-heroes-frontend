/**
 * List parties endpoint - Proxies to Laravel backend
 *
 * @example GET /api/parties
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const url = queryString
    ? `${config.apiBaseServer}/parties?${queryString}`
    : `${config.apiBaseServer}/parties`

  try {
    const data = await $fetch(url)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch parties',
      data: err.data
    })
  }
})
