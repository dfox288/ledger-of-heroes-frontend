interface CreatureType {
  id: number
  name: string
  slug: string
  description: string
  typically_immune_to_poison: boolean
  typically_immune_to_charmed: boolean
  typically_immune_to_frightened: boolean
  typically_immune_to_exhaustion: boolean
  requires_sustenance: boolean
  requires_sleep: boolean
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  // Fetch raw data from backend (no pagination metadata)
  const response = await $fetch<{ data: CreatureType[] }>(`${config.apiBaseServer}/lookups/creature-types`)
  let items = response.data || []

  // Handle search filtering (backend may not support it)
  const searchQuery = query.q as string | undefined
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
    )
  }

  const total = items.length

  // Return with pagination metadata wrapper (expected by useEntityList)
  return {
    data: items,
    meta: {
      current_page: 1,
      from: total > 0 ? 1 : 0,
      last_page: 1,
      per_page: total,
      to: total,
      total
    }
  }
})
