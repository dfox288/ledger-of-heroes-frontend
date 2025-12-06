/**
 * Lookup proficiency types - Proxies to Laravel backend
 *
 * This route mirrors the backend's /lookups/proficiency-types endpoint
 * for compatibility with dynamic options_endpoint values.
 *
 * @example GET /api/lookups/proficiency-types?category=tool&subcategory=musical_instrument
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const data = await $fetch(`${config.apiBaseServer}/lookups/proficiency-types`, { query })
  return data
})
