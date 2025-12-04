/**
 * Remove class from character - Proxies to Laravel backend
 *
 * @example DELETE /api/characters/1/classes/2
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const classId = getRouterParam(event, 'classId')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/classes/${classId}`, {
    method: 'DELETE'
  })
  return data
})
