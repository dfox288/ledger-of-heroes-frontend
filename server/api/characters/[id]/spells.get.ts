/**
 * Get character's known/prepared spells - Proxies to Laravel backend
 *
 * @example GET /api/characters/1/spells
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/spells`)
  return data
})
