/**
 * Import character endpoint - Proxies to Laravel backend
 *
 * Creates a new character from exported JSON data.
 * Accepts the portable format from /export endpoint.
 *
 * @example POST /api/characters/import { format_version: "1.1", character: {...} }
 * @returns { data: { id, public_id, name } }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters/import`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to import character',
      data: err.data
    })
  }
})
