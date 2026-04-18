/**
 * Set character subclass - Proxies to Laravel backend
 *
 * @example PUT /api/characters/1/classes/2/subclass
 * Body: { subclass_slug: "phb:life-domain" }
 * @see #318 - Slug-based character references
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const classId = getRouterParam(event, 'classId')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/classes/${classId}/subclass`, {
      method: 'PUT',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update subclass',
      data: err.data
    })
  }
})
