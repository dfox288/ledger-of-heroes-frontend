/**
 * Delete character choice endpoint - Proxies to Laravel backend
 *
 * @example DELETE /api/characters/1/choices/abc-123
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const choiceId = getRouterParam(event, 'choiceId')

  const data = await $fetch(
    `${config.apiBaseServer}/characters/${id}/choices/${choiceId}`,
    {
      method: 'DELETE'
    }
  )
  return data
})
