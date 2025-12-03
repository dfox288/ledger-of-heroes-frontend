/**
 * Get character equipment - Proxies to Laravel backend
 *
 * @example GET /api/characters/1/equipment
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/equipment`)
  return data
})
