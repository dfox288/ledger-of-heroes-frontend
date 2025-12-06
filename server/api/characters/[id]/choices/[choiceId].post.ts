/**
 * Resolve character choice endpoint - Proxies to Laravel backend
 *
 * @example POST /api/characters/1/choices/42 { "selected": [1, 2, 3] }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const choiceId = getRouterParam(event, 'choiceId')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/choices/${choiceId}`, {
    method: 'POST',
    body
  })
  return data
})
