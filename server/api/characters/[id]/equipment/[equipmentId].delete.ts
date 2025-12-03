/**
 * Remove equipment from character - Proxies to Laravel backend
 *
 * @example DELETE /api/characters/1/equipment/5
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const equipmentId = getRouterParam(event, 'equipmentId')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/equipment/${equipmentId}`, {
    method: 'DELETE'
  })
  return data
})
