/**
 * Delete a character note - Proxies to Laravel backend
 *
 * Permanently removes a note from the character.
 *
 * @example DELETE /api/characters/1/notes/5
 * @example DELETE /api/characters/shadow-warden-q3x9/notes/5
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const noteId = getRouterParam(event, 'noteId')

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/notes/${noteId}`,
      { method: 'DELETE' }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to delete note',
      data: err.data
    })
  }
})
