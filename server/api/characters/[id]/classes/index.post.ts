/**
 * Add class to character - Proxies to Laravel backend
 *
 * @example POST /api/characters/1/classes
 * Body: { class_slug: "phb:fighter" }
 * @see #318 - Slug-based character references
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/classes`, {
    method: 'POST',
    body
  })
  return data
})
