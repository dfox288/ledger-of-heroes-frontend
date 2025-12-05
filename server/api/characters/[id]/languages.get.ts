/**
 * Get character languages endpoint - Proxies to Laravel backend
 *
 * @example GET /api/characters/1/languages
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/languages`)
  return data
})
