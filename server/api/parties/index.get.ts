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

  const data = await $fetch(url)
  return data
})
