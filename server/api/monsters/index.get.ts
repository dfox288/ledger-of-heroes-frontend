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

  const data = await $fetch(`${config.apiBaseServer}/monsters`, { query })
  return data
})
