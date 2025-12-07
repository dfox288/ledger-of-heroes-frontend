/**
 * Validate character references endpoint - Proxies to Laravel backend
 *
 * Returns validation status for all character references, identifying any
 * "dangling" references where the referenced entity no longer exists
 * (e.g., a sourcebook was removed after the character was created).
 *
 * @example GET /api/characters/1/validate
 * @returns { data: { valid: boolean, dangling_references: Array, summary: Object } }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  const data = await $fetch(`${config.apiBaseServer}/characters/${id}/validate`)
  return data
})
