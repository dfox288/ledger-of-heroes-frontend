/**
 * Create a character note - Proxies to Laravel backend
 *
 * Creates a new note for the character.
 *
 * Categories: personality_trait, ideal, bond, flaw, backstory, custom
 * Title is required for backstory and custom categories.
 *
 * @example POST /api/characters/1/notes
 * @example POST /api/characters/shadow-warden-q3x9/notes
 * Body: { category: "custom", title: "Session Notes", content: "Met the dragon..." }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/notes`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to create note',
      data: err.data
    })
  }
})
