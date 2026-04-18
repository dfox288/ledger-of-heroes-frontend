/**
 * List items endpoint - Proxies to Laravel backend
 *
 * Supports searching, filtering by type/rarity/magic, pagination
 *
 * @example GET /api/items?q=sword&type=1&rarity=rare&is_magic=true
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/items`, { query })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch items',
      data: err.data
    })
  }
})
