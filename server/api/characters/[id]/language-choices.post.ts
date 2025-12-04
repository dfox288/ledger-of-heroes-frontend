// POST /api/characters/[id]/language-choices
// Proxies to backend endpoint (Issue #139)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/language-choices`, {
    method: 'POST',
    body
  })
  return data
})
