/**
 * Create character endpoint - Proxies to Laravel backend
 *
 * @example POST /api/characters { name: "Gandalf" }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const data = await $fetch(`${config.apiBaseServer}/characters`, {
      method: 'POST',
      body
    })
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to create character',
      data: err.data
    })
  }
})
