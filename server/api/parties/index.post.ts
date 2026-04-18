/**
 * Create party endpoint - Proxies to Laravel backend
 *
 * @example POST /api/parties { name: "Dragon Heist" }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/parties`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to create party',
      data: err.data
    })
  }
})
