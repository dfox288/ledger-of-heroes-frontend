/**
 * Delete party endpoint - Proxies to Laravel backend
 *
 * @example DELETE /api/parties/1
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/parties/${id}`, {
    method: 'DELETE'
  })
  return data
})
