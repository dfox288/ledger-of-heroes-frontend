# Code Patterns

## List Page Pattern

All 7 entity list pages use `useEntityList` composable:

```typescript
const { searchQuery, currentPage, data, meta, totalResults, loading, error } =
  useEntityList({
    endpoint: '/spells',
    cacheKey: 'spells-list',
    queryBuilder,  // From useMeilisearchFilters
    perPage: 24,
    seo: { title: 'Spells', description: '...' }
  })
```

**Required components:** `<UiListPageHeader>`, `<UiListSkeletonCards>`, `<UiListErrorState>`, `<UiListEmptyState>`, `<UiListResultsCount>`, `<UiListPagination>`

**Gold Standard:** `app/pages/spells/index.vue`

## Detail Page Pattern

```typescript
// app/pages/spells/[slug].vue
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: spell, pending, error } = await useAsyncData(
  `spell-${slug.value}`,
  () => apiFetch<{ data: Spell }>(`/spells/${slug.value}`)
)

useSeoMeta({
  title: () => spell.value?.data.name || 'Loading...',
})
```

**Gold Standard:** `app/pages/spells/[slug].vue`, `app/pages/classes/[slug].vue`

## Filter Composables

```typescript
// 1. useMeilisearchFilters - Build filter query
const { queryParams } = useMeilisearchFilters([
  { ref: selectedLevel, field: 'level' },
  { ref: concentrationFilter, field: 'concentration', type: 'boolean' },
  { ref: selectedDamageTypes, field: 'damage_types', type: 'in' }
])

// 2. useReferenceData - Fetch lookup data
const { data: schools } = useReferenceData<SpellSchool>('/spell-schools')

// 3. useFilterCount - Badge count
const activeFilterCount = useFilterCount(selectedLevel, selectedSchool)
```

**Filter types:** `equals` (default), `boolean`, `in`, `range`, `isEmpty`, `greaterThan`

**Gold Standard:** `app/pages/spells/index.vue` (10 filters)

## Pinia Filter Stores

All 7 entity pages use Pinia stores with IndexedDB persistence:

```typescript
import { storeToRefs } from 'pinia'
import { useSpellFiltersStore } from '~/stores/spellFilters'

const store = useSpellFiltersStore()
const { searchQuery, selectedLevels } = storeToRefs(store)

// URL sync setup (handles mount + debounced store->URL sync)
const { clearFilters } = usePageFilterSetup(store)
```

**Available stores:** `useSpellFiltersStore`, `useItemFiltersStore`, `useMonsterFiltersStore`, `useClassFiltersStore`, `useRaceFiltersStore`, `useBackgroundFiltersStore`, `useFeatFiltersStore`

## Page Filter Setup (URL Sync)

The `usePageFilterSetup` composable handles all URL synchronization for filter pages:

```typescript
// Side-effect pattern - auto-syncs on call (like useHead)
const { clearFilters } = usePageFilterSetup(store)

// Handles:
// 1. onMounted: URL params -> store (if URL has params)
// 2. watch: store changes -> URL (debounced 300ms)
// 3. clearFilters(): resets store AND clears URL
```

**Interface requirement:** Store must implement `toUrlQuery`, `setFromUrlQuery()`, `clearAll()`

## Component Auto-Import

Naming based on folder structure:
- `components/Foo.vue` -> `<Foo>`
- `components/ui/Bar.vue` -> `<UiBar>` (NOT `<Bar>`)
- `components/spell/Card.vue` -> `<SpellCard>`

**Critical:** Nested components MUST use folder prefix!

## NuxtUI Color System

**3-step process (must follow exactly):**

1. **Register in `nuxt.config.ts`:**
   ```typescript
   ui: { theme: { colors: ['spell', 'item', 'monster', ...] } }
   ```

2. **Define palette in `app/assets/css/main.css`:**
   ```css
   @theme static {
     --color-arcane-50: #f5f3ff;
     /* ... all 11 levels: 50-950 */
   }
   ```

3. **Map in `app/app.config.ts`:**
   ```typescript
   export default defineAppConfig({
     ui: { colors: { spell: 'arcane' } }
   })
   ```

**Common pitfall:** `app.config.ts` goes in `app/` directory (Nuxt 4), NOT root!

## Modal Pattern

All modals use Vue 3.4+ `defineModel` for open state management:

```typescript
// Open state via defineModel (replaces prop + emit pattern)
const open = defineModel<boolean>('open', { default: false })

// Other props (data the modal needs)
const props = defineProps<{
  characterId: string
  currentHp: number
}>()

// Action emits only (no 'update:open')
const emit = defineEmits<{
  apply: [value: number]
}>()

// Action handlers close after success
function handleApply() {
  emit('apply', result)
  open.value = false
}
```

**Template:**
```vue
<UModal v-model:open="open">
  <!-- content -->
</UModal>
```

**Parent usage:**
```vue
<MyModal v-model:open="showModal" @apply="handleApply" />
```

**Key rules:**
- Use `defineModel<boolean>('open')` instead of prop + `update:open` emit
- Watch `open` directly, not `() => props.open`
- Close with `open.value = false`, not `emit('update:open', false)`

**Gold Standard:** `app/components/character/sheet/HpEditModal.vue`
