// app/composables/useBuildStepEntityFetch.ts
import { storeToRefs } from 'pinia'
import { useCharacterBuilderStore } from '~/stores/characterBuilder'

interface FetchOptions {
  /** Number of items per page (default: 100) */
  perPage?: number
  /** Additional Meilisearch filter to combine with source filter */
  additionalFilter?: string
}

/**
 * Composable for fetching entities in character builder wizard steps
 * Automatically includes source filter based on selected sourcebooks
 *
 * @param entityEndpoint - API endpoint name (e.g., 'races', 'classes', 'backgrounds')
 * @param options - Optional fetch configuration
 *
 * @example
 * // Basic usage - fetch races filtered by selected sourcebooks
 * const { data: races, pending } = await useBuildStepEntityFetch<Race>('races')
 *
 * // With additional filter
 * const { data: classes, pending } = await useBuildStepEntityFetch<CharacterClass>('classes', {
 *   additionalFilter: 'is_base_class=true'
 * })
 */
export async function useBuildStepEntityFetch<T extends { id: number }>(
  entityEndpoint: string,
  options: FetchOptions = {}
) {
  const { perPage = 100, additionalFilter } = options

  const store = useCharacterBuilderStore()
  const { sourceFilterString } = storeToRefs(store)
  const { apiFetch } = useApi()

  const buildUrl = () => {
    // Combine additional filter with source filter
    let filter = ''
    if (additionalFilter && sourceFilterString.value) {
      filter = `${additionalFilter} AND ${sourceFilterString.value}`
    } else if (additionalFilter) {
      filter = additionalFilter
    } else if (sourceFilterString.value) {
      filter = sourceFilterString.value
    }

    const baseUrl = `/${entityEndpoint}?per_page=${perPage}`
    return filter
      ? `${baseUrl}&filter=${encodeURIComponent(filter)}`
      : baseUrl
  }

  const { data, pending, refresh } = await useAsyncData(
    `builder-${entityEndpoint}-${sourceFilterString.value}`,
    () => apiFetch<{ data: T[] }>(buildUrl()),
    {
      transform: (response: { data: T[] }) => response.data,
      watch: [sourceFilterString]
    }
  )

  return {
    data,
    pending,
    refresh
  }
}
