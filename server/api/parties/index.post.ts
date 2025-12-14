/**
 * Create party endpoint - Proxies to Laravel backend
 *
 * @example POST /api/parties { name: "Dragon Heist" }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/parties`, {
    method: 'POST',
    body
  })
  return data
})
