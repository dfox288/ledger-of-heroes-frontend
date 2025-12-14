/**
 * Remove character from party endpoint - Proxies to Laravel backend
 *
 * @example DELETE /api/parties/1/characters/123
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const characterId = getRouterParam(event, 'characterId')

  const data = await $fetch(`${config.apiBaseServer}/parties/${id}/characters/${characterId}`, {
    method: 'DELETE'
  })
  return data
})
