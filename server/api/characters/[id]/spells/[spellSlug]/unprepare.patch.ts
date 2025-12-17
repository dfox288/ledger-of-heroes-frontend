/**
 * Unprepare a spell for a character - Proxies to Laravel backend
 *
 * @example PATCH /api/characters/silent-knight-vWCB/spells/phb:bless/unprepare
 * Body (optional for multiclass): { "class_slug": "phb:cleric" }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const spellSlug = getRouterParam(event, 'spellSlug')
  const body = await readBody(event).catch(() => ({}))

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/spells/${spellSlug}/unprepare`,
      { method: 'PATCH', body }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to unprepare spell',
      data: err.data
    })
  }
})
