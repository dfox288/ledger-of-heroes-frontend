/**
 * Get character classes - Proxies to Laravel backend
 *
 * @example GET /api/characters/1/classes
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/classes`)
  return data
})
