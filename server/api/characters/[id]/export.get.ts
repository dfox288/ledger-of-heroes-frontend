/**
 * Export character endpoint - Proxies to Laravel backend
 *
 * Returns portable JSON format for character backup/sharing.
 * Format includes all character data: race, class, spells, equipment, etc.
 *
 * @example GET /api/characters/arcane-grove-10QL/export
 * @returns { data: { format_version, exported_at, character: {...} } }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/${id}/export`)
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to export character'
    })
  }
})
