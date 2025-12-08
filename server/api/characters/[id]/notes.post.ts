// server/api/characters/[id]/notes.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/notes`, {
    method: 'POST',
    body
  })
  return data
})
