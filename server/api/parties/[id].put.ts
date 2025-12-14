/**
 * Update party endpoint - Proxies to Laravel backend
 *
 * @example PUT /api/parties/1 { name: "Updated Name" }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/parties/${id}`, {
    method: 'PUT',
    body
  })
  return data
})
