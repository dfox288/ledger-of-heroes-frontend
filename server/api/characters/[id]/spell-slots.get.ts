/**
 * Get character spell slots endpoint - Proxies to Laravel backend
 *
 * Returns spell slot information including total, spent, and available counts.
 *
 * @example GET /api/characters/1/spell-slots
 * @see Issue #556 - Spells Tab
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/spell-slots`)
  return data
})
