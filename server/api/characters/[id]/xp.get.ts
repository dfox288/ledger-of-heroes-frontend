/**
 * Get character XP endpoint - Proxies to Laravel backend
 *
 * Returns current XP, level progress, and next level threshold.
 *
 * @example GET /api/characters/1/xp
 *
 * @see #653 - XP progress display
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/xp`)
  return data
})
