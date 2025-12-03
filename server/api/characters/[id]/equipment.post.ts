/**
 * Add equipment to character - Proxies to Laravel backend
 *
 * @example POST /api/characters/1/equipment
 * Body: { item_id: 42, quantity: 1 }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/equipment`, {
    method: 'POST',
    body
  })
  return data
})
