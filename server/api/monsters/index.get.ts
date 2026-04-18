/**
 * List monsters endpoint - Proxies to Laravel backend
 *
 * Supports searching, filtering by CR/type, pagination
 *
 * @example GET /api/monsters?q=dragon&cr=5-10&type=dragon&page=1&per_page=15
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/monsters`, { query })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch monsters',
      data: err.data
    })
  }
})
