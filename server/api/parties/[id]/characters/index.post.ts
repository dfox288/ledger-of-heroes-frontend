/**
 * Add character to party endpoint - Proxies to Laravel backend
 *
 * @example POST /api/parties/1/characters { character_id: 123 }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/parties/${id}/characters`, {
    method: 'POST',
    body
  })
  return data
})
