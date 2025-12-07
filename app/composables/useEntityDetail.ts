import { computed, isRef, ref, toValue, type ComputedRef, type MaybeRef, type Ref } from 'vue'

/**
 * Configuration for useEntityDetail composable
 */
export interface UseEntityDetailConfig {
  /** Entity slug from route params - can be reactive or static */
  slug: MaybeRef<string>

  /** API endpoint (e.g., '/spells', '/items') */
  endpoint: string

  /** Cache key for useAsyncData (e.g., 'spell', 'item') */
  cacheKey: string

  /** SEO metadata */
  seo: {
    /** Title template - receives entity name as parameter */
    titleTemplate: (name: string) => string

    /** Description extractor - receives full entity data */
    descriptionExtractor: (entity: unknown) => string

    /** Fallback title when no data */
    fallbackTitle: string
  }
}

/**
 * Return type for useEntityDetail composable
 */
export interface UseEntityDetailReturn<T = unknown> {
  /** Entity data from API */
  data: ComputedRef<T | null>

  /** Loading state */
  loading: Ref<boolean>

  /** Error state */
  error: Ref<unknown>

  /** Refresh data */
  refresh: () => Promise<void>
}

/**
 * Generic detail page composable
 *
 * Handles data fetching and SEO setup for entity detail pages.
 * Pages provide entity-specific rendering logic.
 *
 * @example
 * ```typescript
 * const { data: spell, loading, error } = useEntityDetail({
 *   slug: route.params.slug as string,
 *   endpoint: '/spells',
 *   cacheKey: 'spell',
 *   seo: {
 *     titleTemplate: (name) => `${name} - D&D 5e Spell`,
 *     descriptionExtractor: (spell) => spell.description?.substring(0, 160),
 *     fallbackTitle: 'Spell - D&D 5e Compendium'
 *   }
 * })
 * ```
 */
export function useEntityDetail<T = unknown>(config: UseEntityDetailConfig): UseEntityDetailReturn<T> {
  const { apiFetch } = useApi()

  // Ensure slug is reactive for watch to work
  const slugRef = isRef(config.slug) ? config.slug : ref(config.slug)

  // Fetch entity data using useAsyncData for SSR support
  // watch: [slugRef] enables automatic refetch when slug changes (e.g., navigation)
  const { data: response, pending: loading, error, refresh } = useAsyncData(
    () => `${config.cacheKey}-${toValue(slugRef)}`,
    async () => {
      const result = await apiFetch(`${config.endpoint}/${toValue(slugRef)}`)
      return result?.data || null
    },
    { watch: [slugRef] }
  )

  // Entity data accessor
  const data = computed(() => response.value as T | null)

  // SEO setup
  useSeoMeta({
    title: computed(() =>
      data.value && typeof data.value === 'object' && 'name' in data.value
        ? config.seo.titleTemplate(data.value.name as string)
        : config.seo.fallbackTitle
    ),
    description: computed(() =>
      data.value ? config.seo.descriptionExtractor(data.value) : undefined
    )
  })

  useHead({
    title: computed(() =>
      data.value && typeof data.value === 'object' && 'name' in data.value
        ? config.seo.titleTemplate(data.value.name as string)
        : config.seo.fallbackTitle
    )
  })

  return {
    data,
    loading,
    error,
    refresh
  }
}
