/**
 * Update a character note - Proxies to Laravel backend
 *
 * Updates title and/or content of an existing note.
 * Category cannot be changed after creation.
 *
 * @example PATCH /api/characters/1/notes/5
 * @example PATCH /api/characters/shadow-warden-q3x9/notes/5
 * Body: { title: "Updated Title", content: "Updated content" }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const noteId = getRouterParam(event, 'noteId')
  const body = await readBody(event)

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/notes/${noteId}`,
      { method: 'PATCH', body }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update note',
      data: err.data
    })
  }
})
