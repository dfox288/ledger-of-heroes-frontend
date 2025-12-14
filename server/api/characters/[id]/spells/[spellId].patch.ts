/**
 * Toggle spell preparation for a character - Proxies to Laravel backend
 *
 * Updates the is_prepared status of a spell in the character's spell list.
 *
 * @example PATCH /api/characters/1/spells/42
 * Body: { "is_prepared": true }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const spellId = getRouterParam(event, 'spellId')
  const body = await readBody(event)

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/spells/${spellId}`,
      { method: 'PATCH', body }
    )
    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update spell preparation',
      data: error.data
    })
  }
})
