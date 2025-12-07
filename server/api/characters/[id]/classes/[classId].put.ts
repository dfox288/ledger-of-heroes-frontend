/**
 * Replace character class - Proxies to Laravel backend
 * Used when user goes back in wizard and selects a different class
 *
 * @example PUT /api/characters/1/classes/2
 * Body: { class_slug: "phb:cleric" }
 * @see #318 - Slug-based character references
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const classId = getRouterParam(event, 'classId')
  const body = await readBody(event)

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/classes/${classId}`, {
    method: 'PUT',
    body
  })
  return data
})
