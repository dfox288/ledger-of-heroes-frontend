// GET /api/characters/[id]/language-choices
// Proxies to backend endpoint (Issue #139)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/language-choices`)
  return data
})
