/**
 * Get character notes endpoint - Proxies to Laravel backend
 *
 * Returns notes organized by category for the character sheet Notes tab.
 *
 * @example GET /api/characters/1/notes
 * @example GET /api/characters/shadow-warden-q3x9/notes
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/notes`)
  return data
})
