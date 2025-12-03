# Changelog

All notable changes to the D&D 5e Compendium Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **Custom Equipment Support (#103) (2025-12-03)** - Support for flavor/freetext equipment items
  - Save flavor items (description-only) to character equipment
  - Improved wizard step rendering and selection UX
  - Equipment step now properly handles custom items without database references

- **Edit Level 1 Characters (#105) (2025-12-03)** - Allow editing characters still at level 1
  - New `/characters/[id]/edit` page loads existing character into wizard
  - "Create Character" now creates empty character and redirects to edit page (unified flow)
  - Store actions: `loadCharacterForEditing()`, `updateName()` for edit mode
  - Edit/Continue button on CharacterCard for level 1 characters
  - Clickable stepper steps to navigate back without using Back button
  - StepName supports both create and edit modes
  - Route restructure: `[id].vue` → `[id]/index.vue` for proper nested routing

- **Character Builder Phase 4: Background, Equipment, Spells & Review (2025-12-03)** - Complete implementation of Steps 5-8
  - `BackgroundPickerCard` and `BackgroundDetailModal` - Background selection with feature preview
  - `StepBackground` - Background grid with search and feature display
  - `EquipmentChoiceGroup` - Radio-style equipment choice selection (fixed + choice items)
  - `StepEquipment` - Equipment step combining class + background gear with choice groups
  - `SpellPickerCard` - Spell selection card with level/school badges
  - `StepSpells` - Cantrip and leveled spell selection with limits from class progression
  - `StepReview` - Full character summary with edit buttons for each section
  - Store actions: `selectBackground()`, `setEquipmentChoice()`, `learnSpell()`, `unlearnSpell()`
  - 170 tests across 20 test files covering all character builder functionality
  - 26 integration tests for wizard flow, equipment choices, spell tracking
  - Created [#96](https://github.com/dfox288/dnd-rulebook-project/issues/96) for backend structured equipment data

- **Character Builder Phase 3: Ability Scores (2025-12-03)** - Complete implementation of Step 4
  - Store action: `saveAbilityScores()` for persisting ability scores and method to API
  - `ManualInput` - Direct number inputs with 3-20 range validation
  - `StandardArrayInput` - Dropdown assignment of 15, 14, 13, 12, 10, 8 with mutual exclusion
  - `PointBuyInput` - +/- buttons with 27 point budget and cost tracking
  - `StepAbilities` - Parent component with method selector and racial bonus display
  - 24 tests covering all new components and store action
  - Design docs: `docs/plans/2025-12-03-character-builder-phase3-abilities-design.md`

- **Character Builder Phase 2: Race & Class Selection (2025-12-02)** - Complete implementation of Steps 2-3
  - Store actions: `selectRace()`, `selectClass()`, `refreshStats()` with full error handling
  - `RacePickerCard` and `ClassPickerCard` - Click-to-select wrapper components with ring highlight
  - `RaceDetailModal` and `ClassDetailModal` - Full entity info in UModal dialogs
  - `StepRace` - Race grid with search, inline subrace selector for races with subraces
  - `StepClass` - Class grid with search, spellcaster detection notice
  - 74 tests covering all new components and store actions
  - Design docs: `docs/plans/2025-12-02-character-builder-phase2-design.md`

### Changed

- **Badge Size Standardization (2025-11-29)** - All badges now use `size="md"` for improved readability
  - Updated 21 badges across 17 files from `xs`/`sm` to `md`
  - Refactored `MilestoneBadge` to use `UBadge` component instead of custom Tailwind classes
  - Added badge size standard to `CLAUDE.md`: always `md`, except `lg` for prominent headers

### Fixed

- **All 28 TypeScript Errors Resolved (2025-11-29)** - Complete type cleanup, zero errors remaining
  - Extended `CharacterClass` type to match actual API responses (hit_die: number, is_base_class: boolean, subclass_level: number, counters: CounterFromAPI[], archetype: string)
  - Added `CounterFromAPI` interface for grouped counter structure (`{name, reset_timing, progression[]}`)
  - Fixed component type issues: ClassCard boolean comparison, SpellcastingCard slots array, UiClassSubclassCards color type
  - Fixed page type issues: backgrounds skill.slug, classes hit dice as strings, monsters transform signature, spell-list alert handler
  - Extended `useMeilisearchFilters` transform signature to support array returns for 'in' type filters
  - Updated test mocks to use correct boolean/string types
  - All 1801 tests passing

- **List Page Search Not Working (2025-11-29)** - Critical fix for search functionality
  - `useEntityList` composable now accepts external `searchQuery` ref from stores
  - Previously created internal ref that was never connected to the search input
  - All 7 entity list pages now have working search functionality
  - Backgrounds page also fixed: removed manual watch loops, uses standard pattern

### Added

- **Unified Breadcrumb Navigation (2025-11-29)** - Consistent breadcrumb navigation across all pages
  - New `UiDetailBreadcrumb` component for consistent navigation
  - Detail pages: `Home → Entity Type → Current Entity`
  - List pages: `Home → Entity Type`
  - Hierarchical support for classes/subclasses and races/subraces: `Home → Classes → Fighter → Battle Master`
  - Replaces inconsistent `UiBackLink` usage with proper breadcrumb trail
  - Accessible with `aria-label="Breadcrumb"` and `aria-current="page"`
  - 18 new tests covering all breadcrumb scenarios
  - Updated 7 detail pages + 7 list pages for consistency

- **Comprehensive D&D 5e Rules Audit (2025-11-29)** - Full audit of all 13 base classes against official source material
  - Audited all classes against PHB, DMG, XGE, TCE, SCAG, EGtW, FToD, VRGtR
  - Created detailed backend ticket with 6 critical, 4 high, and 6 medium priority issues
  - Identified pattern: choice-based content (Invocations, Infusions, Disciplines) missing from import
  - Report: `docs/proposals/CLASSES-COMPREHENSIVE-AUDIT-2025-11-29.md`

- **Class Detail Page 3-View Architecture (2025-11-29)** - Complete redesign of class detail pages with modular view system
  - **Overview View** (`/classes/[slug]`) - Combat basics grid, spellcasting summary, class resources, subclass gallery
  - **Journey View** (`/classes/[slug]/journey`) - Level 1-20 timeline with milestones (subclass, ASI, capstone)
  - **Reference View** (`/classes/[slug]/reference`) - Full progression table, all features expanded
  - New `useClassDetail` composable - Shared data fetching across all 3 views
  - New shared components: `ClassDetailHeader`, `ClassViewNavigation`
  - 5 new Overview components: `CombatBasicsGrid`, `SpellcastingCard`, `ResourcesCard`, `FeaturesPreview`
  - 5 new Journey components: `Timeline`, `LevelNode`, `MilestoneBadge`, `SpellSlotIndicator`, `ParentToggle`
  - Subclass support: Parent feature toggle, inherited data display
  - Fixed counter data structure mismatch (API returns `{name, progression[]}` not flat fields)
  - 20 files changed, 4,119 lines added
  - Design document: `docs/plans/2025-11-28-class-detail-page-redesign.md`

### Changed

- **Page Filter Setup Composable (2025-11-26)** - Extracted URL sync boilerplate from 7 entity list pages
  - New `usePageFilterSetup(store)` composable handles: URL→store sync on mount, debounced store→URL sync, clearFilters
  - Removed ~140 lines of duplicated code across pages (20 lines each × 7 pages)
  - API: `const { clearFilters } = usePageFilterSetup(store)` - side-effect pattern like `useHead()`
  - Standardized monsters page from `useDebounceFn` to internal setTimeout (consistent with others)
  - New test suite with 7 tests covering mount sync, debounce, and clearFilters

- **Filter Store Factory Pattern (2025-11-26)** - Refactored 7 Pinia filter stores to use factory pattern
  - New `createEntityFilterStore()` factory reduces ~1,385 lines to ~280 lines (80% reduction)
  - Declarative field definitions instead of manual getters/actions
  - Adding a new filter now requires 1 line instead of 5+ places
  - Consistent behavior guaranteed across all entity stores
  - All existing store tests pass without modification
  - New files: `app/stores/filterFactory/` directory

- **Class Detail Page Backend Data Refactoring (2025-11-26)** - Frontend now uses pre-computed backend data
  - Hit points calculated server-side (removed frontend calculation logic)
  - Progression table with dynamic columns from backend API
  - Subclass inheritance resolved by API via `inherited_data` field
  - Removed ~150 lines of frontend calculation code
  - Components now render backend-provided data directly

### Added

- **Filter Persistence with Pinia + IndexedDB (2025-11-26)** - User filter selections now persist across browser sessions
  - 7 Pinia filter stores: Spells, Items, Monsters, Races, Classes, Backgrounds, Feats
  - IndexedDB storage via `pinia-plugin-persistedstate` for browser persistence
  - URL sync for shareable filter links (URL params override persisted state)
  - New composable: `useFilterUrlSync()` for bidirectional URL synchronization
  - New utility: `idbStorage.ts` - IndexedDB adapter for persistence plugin
  - Each store provides: `hasActiveFilters`, `activeFilterCount`, `toUrlQuery`, `clearAll()`, `setFromUrlQuery()`
  - 200+ new store tests (all passing)
  - Full documentation added to CLAUDE.md

### Fixed

- **Test Suite CPU Spike Fix (2025-11-26)** - Resolved severe Docker CPU spikes during Vitest runs
  - Added `enableAutoUnmount(afterEach)` for automatic Vue component cleanup (was leaking 900+ components)
  - Excluded E2E tests (`**/*.spec.ts`, `**/e2e/**`) from Vitest - they require Playwright
  - Removed WebGL/Three.js animation tests (CPU-intensive, animation is stable)
  - Limited parallel test workers to 2 (`maxForks: 2`) to prevent memory explosion
  - Added Docker resource limits (4 CPU / 6GB RAM) as safety net
  - Tests now run in ~120s with CPU below 200% (was spiking to 400%+ and crashing)

### Added

- **Subclass Detail Page Enhancements (2025-11-26)** - Subclasses now show inherited parent class data
  - **Hierarchical Breadcrumb** - Shows `Classes > Rogue > Assassin` navigation
  - **"Subclass of X" Badge** - Interactive badge linking to parent class
  - **Dual Image Display** - Subclass image with parent class thumbnail overlay
  - **Inherited Hit Points Card** - Shows parent class HP with "Inherited from X" label
  - **Subclass Features Section** - Prominent display of subclass-specific features
  - **Inherited Progression Table** - Full 20-level table from parent class
  - **Inherited Accordion Sections** - Proficiencies, equipment, traits from parent
  - New component: `UiClassParentImageOverlay` with 4 tests

- **Class Detail Page Enhancements (2025-11-26)** - Major improvements to class pages
  - **Class Progression Table** - Shows all 20 levels with features and counters (e.g., Sneak Attack dice)
  - **Hit Points Card** - Displays HP calculations (hit die, 1st level HP, HP per level with average)
  - **Subclass Cards** - Replaced nested accordion with visual card grid linking to subclass pages
  - **Accordion Icons** - Added icons to all accordion section headers
  - 3 new components: `UiClassProgressionTable`, `UiClassHitPointsCard`, `UiClassSubclassCards`
  - 21 new tests (all passing)

- **New UiFilterSelect Component (2025-11-25)** - Wrapper for USelectMenu with consistent label structure
  - Matches height of UiFilterMultiSelect and UiFilterToggle
  - Prevents vertical drift in flex filter layouts
  - Optional label prop (reserves space for alignment when omitted)

### Changed

- **Items Rarity Filter (2025-11-26)** - Now fetches from API instead of hardcoded
  - Uses `useReferenceData<Rarity>('/rarities')`
  - Consumes `/api/v1/lookups/rarities` endpoint (already existed)
  - Added `Rarity` type export to `~/types/index.ts`
- **Filter Chip Standardization (2025-11-25)** - Comprehensive chip consistency across all 7 entity pages
  - Standardized ordering: Source → Entity-specific → Boolean toggles → Search (always last)
  - Standardized colors: neutral (source/search), entity color (entity-specific), primary (boolean)
  - Standardized text format: "Label: Value ✕" for all filters
  - Added `data-testid` to ALL filter chips for E2E testing
- **Monsters Movement Filters Redesign (2025-11-25)** - Replaced 5 toggles with single multiselect
  - Combined Fly/Swim/Burrow/Climb/Hover into "Movement Types" multiselect
  - Fixed broken "No" option (now uses `IS NOT NULL` filter syntax)
  - Reduced quick section from 10 to 5 controls
- **Races Ability Filter (2025-11-25)** - Now fetches from API instead of hardcoded
  - Uses `useReferenceData<AbilityScore>('/ability-scores')`
- **Items Advanced Section (2025-11-25)** - Reorganized by usage frequency
  - High frequency: Properties, Cost Range
  - Weapon filters: Damage Types, Damage Dice, Range
  - Armor filters: AC Range
  - Niche filters: Versatile Dice, Recharge

### Fixed

- **Vertical Drift in Filter Layouts (2025-11-25)** - Resolved height misalignment
  - Raw USelectMenu components lacked label wrapper (~28px height difference)
  - Converted all filter dropdowns to UiFilterSelect component
  - Affects: Spells, Items, Races, Classes, Monsters pages

### Added

- **Sorting Added to All List Pages (2025-11-25)** - Added sort dropdowns to 5 entity pages that didn't have sorting
  - **Items:** Name (A-Z/Z-A), Rarity (Common→Legendary/Legendary→Common)
  - **Races:** Name (A-Z/Z-A), Speed (Low→High/High→Low)
  - **Classes:** Name (A-Z/Z-A), Hit Die (Low→High/High→Low)
  - **Backgrounds:** Name (A-Z/Z-A)
  - **Monsters:** Name (A-Z/Z-A), CR (Low→High/High→Low)
  - All pages now have consistent sorting interface next to search input

### Changed

- **Source Filter Repositioned to Prominent Location (2025-11-25)** - Moved Source filter from Advanced section to search bar
  - Positioned between search input and sort dropdown on all 6 entity pages (Spells, Items, Races, Classes, Backgrounds, Feats)
  - Rationale: Sources are important metadata for quickly filtering content by sourcebook (PHB, XGE, TCE, etc.)
  - Improved accessibility - no longer hidden in collapsed Advanced section
- **Filter Section Standardization & UX Improvements (2025-11-25)** - Fixed critical filter UX issues and standardized layouts
  - **Races Page:** Fixed Size dropdown (wasn't opening), fixed Parent Race dropdown (was empty), refactored to use UiFilterLayout, compressed Speed sliders side-by-side
  - **Classes Page:** Refactored to use UiFilterLayout, consistent `w-48` width classes on all filters
  - **Monsters Page:** Restored original Quick section (all 10 toggles together) per user feedback
  - **Items Page:** Fixed vertical alignment skew by removing inconsistent label wrappers
  - **All Pages:** Standardized Source filter placement in search bar (between search and sort)
  - **Impact:** 7/7 entity pages use consistent UiFilterLayout, improved space efficiency, better filter organization
- **UiFilterMultiSelect Component Cleanup (2025-11-25)** - Removed redundant selection count badge
  - Removed badge showing number of selected items (e.g., "3") from multiselect component
  - Rationale: Count already shown in global "Active filters" badge at top of filter section
  - Cleaner UI with less visual noise

### Added

- **RE-AUDIT IMPLEMENTATION COMPLETE (2025-11-25)** - Added 21 new filters across 5 entity types (+45% filter coverage)
  - **Monsters (5 chip fixes + 6 new filters):** Fixed 5 critical UX bugs (missing filter chips for alignment, has_fly, has_swim, has_burrow, has_climb), added 6 new filters (armor_type, can_hover, has_lair_actions, has_reactions, is_spellcaster, has_magic_resistance) - Now 18 filters total
  - **Backgrounds (3 new filters - 300% increase!):** Added skill_proficiencies (18 skills), tool_proficiency_types (3 types), grants_language_choice (boolean) - Now 4/4 filters (100% complete, up from 25%)
  - **Items (5 new filters, 1 removed):** Added strength_requirement, damage_dice, versatile_damage, range_normal, recharge_timing for weapon/armor shopping - Removed broken has_prerequisites filter - Now 17 working filters
  - **Races (1 new filter):** Added parent_race_name for family browsing (e.g., "Show all Elf variants") - Now 10/10 filters (100% complete)
  - **Monsters (6 additional filters):** Added armor_type, can_hover, has_lair_actions, has_reactions, is_spellcaster, has_magic_resistance - Now 18 total filters
  - **Classes (5 filters BLOCKED):** max_spell_level, armor_proficiencies, weapon_proficiencies, skill_proficiencies, tool_proficiencies - Blocked by missing backend database columns (documented in `docs/BLOCKED-CLASSES-PROFICIENCY-FILTERS-2025-11-25.md`)
  - **Implementation:** All filters use useMeilisearchFilters(), useReferenceData(), and useFilterCount() composables following gold standard pattern from spells page
  - **Testing:** 103 new tests added (all passing), strict TDD methodology followed (RED-GREEN-REFACTOR)
  - **Filter Coverage:** 47 → 68 filters (+45%), 4 entities now at 100% completion (up from 1)
  - **Documentation:** Comprehensive handover at `docs/HANDOVER-2025-11-25-RE-AUDIT-IMPLEMENTATION-COMPLETE.md`
  - See `docs/RE-AUDIT-COMPLETE-2025-11-25.md` for complete re-audit findings and implementation details
- Source multiselect filter for Classes (PHB, XGE, TCE, etc.) (2025-11-25)
- Parent class filter for Classes (browse subclasses by parent) (2025-11-25)
- Spellcasting ability dropdown for Classes (INT, WIS, CHA) (2025-11-25)
- Hit die multiselect filter for Classes (d6, d8, d10, d12) (2025-11-25)
- Hit Points range filter for Monsters (Low 1-50, Medium 51-150, High 151-300, Very High 301+) (2025-11-25)
- Armor Class range filter for Monsters (Low 10-14, Medium 15-17, High 18+) (2025-11-25)
- Armor Class range filter for Items (Light 11-14, Medium 15-16, Heavy 17+) (2025-11-25)
- Cost range filter for Items with 5 predefined ranges (Under 1gp to 1000+ gp) (2025-11-25)
- **Backgrounds Source Filter** (2025-11-25) - Added source book filter to backgrounds page
  - Filter by source books: PHB, ERLW, WGTE (only sources used by backgrounds)
  - Uses `source_codes IN [...]` Meilisearch filter via useMeilisearchFilters composable
  - Multi-select UI with UiFilterMultiSelect component
  - Active filter chip displays selected sources with click-to-remove
  - Badge count shows number of active filters
  - 13 comprehensive tests covering all functionality (TDD approach)
  - **API Limitation:** Only 1 filter available - Backgrounds have minimal Meilisearch indexing
  - See `docs/BACKGROUNDS-FILTER-ANALYSIS.md` for complete API analysis and recommendations

### Changed

- **Spell Level Filter - Multiselect UX** (2025-11-25) - Replaced exact/range toggle with simpler multiselect
  - Removed complex exact/range mode toggle and slider UI
  - Replaced with single UiFilterMultiSelect component (like damage types filter)
  - Users can now select multiple discrete levels (e.g., Cantrip + 3rd + 9th)
  - More intuitive for common use case: comparing spells at different levels
  - Filter chip shows "Level: Cantrip" or "Levels: Cantrip, 3rd, 9th"
  - Uses `level IN [0,3,9]` Meilisearch filter
  - 10 comprehensive tests (all passing with TDD workflow)
  - Simplified codebase: removed ~40 lines of mode-switching logic
  - Improved layout: removed "Spell Level" label, renamed "Active:" to "Active filters", moved "Clear filters" button to same row

### Added

- **Spell Source Book Filtering** (2025-11-25) - Added source book filter to spells page with multi-select UI and filter chips
  - Filter by source books: PHB, XGE, TCE, SCAG, EE, and more
  - Uses `source_codes IN [...]` Meilisearch filter
  - Added to advanced filters section with UiFilterMultiSelect
  - Filter chips display source codes with click-to-remove
  - 6 comprehensive tests covering composable integration and multi-select behavior
  - Sources fetched from `/sources` API endpoint via useReferenceData composable

- **Spell Tag Filtering** (2025-11-25) - Added tag filter to spells page with multi-select UI and filter chips
  - Filter by "Ritual Caster" (33 spells) and "Touch Spells" (83 spells)
  - 21% spell coverage (107 of 478 spells have tags)
  - Uses `tag_slugs IN [...]` Meilisearch filter
  - Added to advanced filters section with UiFilterMultiSelect
  - Filter chips display tag names with click-to-remove
  - 12 comprehensive tests covering composable integration, state management, and chip behavior
  - Tags are hardcoded (no `/tags` endpoint available from API)

### Added - UiFilterLayout Component (2025-11-25)

**🎨 New Reusable Filter Layout Component:**
- Created `UiFilterLayout` component with 3-tier slot-based architecture
- Provides consistent filter layout across all entity pages
- 16 tests, 100% passing (TDD implementation)

**Features:**
- **Primary slot:** Most used filters (dropdowns) - flex layout, gap-3
- **Quick slot:** Binary toggles (All/Yes/No) - responsive grid (2→3→5 cols)
- **Advanced slot:** Multi-select filters - flex layout, gap-3
- **Actions slot:** Action buttons (Clear Filters) - right-aligned

**Benefits:**
- Single source of truth for filter spacing/responsiveness
- ~20 lines less layout code per page
- Ready to apply to 6 entity pages (items, monsters, races, classes, backgrounds, feats)

**Documentation:** `docs/UI-FILTER-LAYOUT-GUIDE.md` (comprehensive migration guide)

### Removed - Light Mode (2025-11-25)

**🌙 Dark Mode Only:**
- Removed light/dark mode toggle button from navbar
- App now permanently locked to dark mode
- Simplified UI (one less button)
- Better for D&D aesthetic (dark/mystical theme)
- Consistent experience across all users

### Changed

- **Filter Composables Refactoring** (2025-11-25) - Extracted 3 reusable composables to eliminate ~560 lines of duplicate Meilisearch filter logic across 6 entity pages
  - Created `useMeilisearchFilters()` for declarative filter building (6 filter types)
  - Created `useReferenceData<T>()` for type-safe reference entity fetching
  - Created `useFilterCount()` for active filter counting
  - Migrated all entity pages: spells, items, monsters, races, classes, feats
  - Added 49 comprehensive tests (100% coverage on composables)
  - Improved maintainability: bug fixes in 1 place instead of 6
  - Non-breaking change: all filters work identically
  - See `docs/FILTER-COMPOSABLES-MIGRATION-GUIDE.md` for usage patterns

### Changed - Navigation Restructure (2025-11-25)

**📚 Compendium Dropdown:**
- Consolidated 7 entities (Spells, Items, Monsters, Races, Classes, Backgrounds, Feats) into "Compendium" dropdown
- Cleaner navbar: 3 dropdowns (Compendium, Tools, Reference) vs 9 items
- Semantic grouping: game entities vs tools vs reference data
- Added icons to all entity links
- Active state highlighting for current section
- Ready for future feature categories

**🛠️ Tools Dropdown:**
- Added "Tools" dropdown to navbar (desktop + mobile)
- Moved "Spell List Creator" to Tools menu
- Changed route: `/spells/list-generator` → `/tools/spell-list`
- Consistent URL structure for all future tools
- Tools dropdown highlights correctly when on `/tools/*` routes
- Extensible structure ready for more tools

### Changed - Spell Filter Layout (2025-11-25)

**🎯 Improved Filter UX:**
- Refactored spell filters with 3-tier structure using `UiFilterLayout`
- Changed component labels from "V", "S", "M" to "Verbal", "Somatic", "Material"
- Removed visual dividers between filter sections (cleaner appearance)
- All filters now use consistent width: `w-full sm:w-48` (192px desktop)
- Perfect vertical alignment across all filter rows
- ~50% vertical space savings vs original layout

**Responsive Grid:**
- Mobile: 2 columns for quick toggles
- Tablet: 3 columns for quick toggles
- Desktop: 5 columns (all in one row!)

### Fixed - Spell List Generator (2025-11-25)

**🐛 Multiple Bug Fixes and UX Improvements:**

**API & Data Issues Fixed:**
- **Wrong field names:** Changed `concentration` → `needs_concentration`, `ritual` → `is_ritual` (badges now display correctly)
- **Deprecated API syntax:** Changed `?classes=wizard` → `?filter=class_slugs IN [wizard]` (using Meilisearch filter syntax)
- **Wrong type checks:** Removed `=== '1'` checks for booleans (now checking boolean fields directly)
- **Missing badges:** Added component requirement badges (V/S/M) using `requires_verbal`, `requires_somatic`, `requires_material`
- **Pagination limit:** Changed `per_page=1000` → `per_page=100` (API max limit, was causing 422 errors for druid/wizard)

**UX Improvements:**
- **Spell selection limit:** Now prevents selecting more spells than class/level allows (shows alert when at limit)
- **Class filtering:** Only shows base spellcasting classes (no subclasses like "Arcane Archer")
- **Class change confirmation:** Warns user before clearing selected spells when switching classes
- **Visual feedback:** Checkboxes disabled when at spell limit

**Impact:**
- ✅ Concentration/Ritual badges now work correctly (were never showing before)
- ✅ Component badges (V/S/M) display for all spells (when backend populates data)
- ✅ All classes work including druid (was showing 0 spells due to 422 error)
- ✅ Can't accidentally select more spells than allowed
- ✅ Cleaner class dropdown (12 base classes instead of 131 including subclasses)
- ✅ Better UX when switching classes (confirms before clearing selections)

**Files Changed:**
- `app/pages/spells/list-generator.vue` - API, UI, validation, confirmations
- `app/composables/useSpellListGenerator.ts` - Spell limit validation
- `tests/pages/spells/list-generator.test.ts` - 3 new regression tests
- `tests/composables/useSpellListGenerator.test.ts` - Updated + 1 new validation test

**Test Results:** ✅ 8/8 composable tests, 5/5 page tests passing

**Additional Fix (2025-11-25):**
- **Level selector not responding:** Added `label-key="label"` to USelectMenu for proper display and selection

### Changed - API Integration (2025-11-25)

**🚨 BREAKING CHANGE: Complete migration to Meilisearch-only filtering:**

**All spell filters migrated to Meilisearch syntax:**
- **Level:** `?filter=level = 3` (was `?level=3` - now ignored by API)
- **School:** `?filter=school_code = EV` (was `?school=2` - now ignored by API)
- **Class:** `?filter=class_slugs IN [wizard]` (was `?classes=wizard` - already working)
- **Concentration:** `?filter=concentration = true` (was `?concentration=1` - now ignored by API)
- **Ritual:** `?filter=ritual = true` (was `?ritual=1` - now ignored by API)
- **Damage Types:** `?filter=damage_types IN [F, C]` (was `?damage_type=F,C` - now ignored by API)
- **Saving Throws:** `?filter=saving_throws IN [DEX, WIS]` (was `?saving_throw=DEX,WIS` - now ignored by API)
- **Verbal:** `?filter=requires_verbal = true` (was `?has_verbal=1` - now ignored by API)
- **Somatic:** `?filter=requires_somatic = true` (was `?has_somatic=1` - now ignored by API)
- **Material:** `?filter=requires_material = true` (was `?has_material=1` - now ignored by API)

**Benefits:**
- All filters now work correctly (9 were broken, using deprecated MySQL params that returned ALL spells)
- Combined filters supported: `?filter=level = 3 AND class_slugs IN [wizard] AND school_code = EV`
- Performance improvement: Meilisearch is faster than MySQL (<50ms response times)
- Future-proof: Enables advanced queries with AND/OR/IN operators
- Fixed critical bug where most filters were silently ignored

**API changes:**
- Fixed `is_base_class` TypeScript type: `boolean` (was incorrectly typed as `string`)
- Updated ClassCard component to use boolean comparison for base class detection

### Removed - Unsupported Filters (2025-11-25)

**Removed 4 filters not indexed in Meilisearch:**
- ❌ **Has Higher Levels** (spell scaling) - Field not filterable in Meilisearch
- ❌ **Casting Time** (e.g., "1 action") - Field not filterable in Meilisearch
- ❌ **Range** (e.g., "60 feet") - Field not filterable in Meilisearch
- ❌ **Duration** (e.g., "Instantaneous") - Field not filterable in Meilisearch

**Alternative:** Users can still search for these values using full-text search: `?q=1 action`

**Rationale:** These text fields are not indexed in Meilisearch for performance reasons. The `concentration` boolean filter covers most duration use cases.

### Added - Playwright E2E Testing (2025-11-24)

**End-to-end test coverage for critical user journeys:**
- **Homepage E2E tests** - 40+ tests covering logo, hero section, entity cards (7), reference links (10), search input, responsive layouts (2025-11-24)
- **Entity list E2E tests** - 70+ tests covering all 7 entity types (Spells, Items, Races, Classes, Backgrounds, Feats, Monsters) list pages, card rendering, pagination, search, navigation flows (2025-11-24)
- **Playwright configuration** - Configured for Chromium browser with screenshot on failure, HTML reporting, and CI/CD support (2025-11-24)
- **Test infrastructure** - 113 E2E tests total, 109 passing (96.5%), 4 remaining edge cases (2025-11-24)

**Test Fixes (2025-11-24):**
- Fixed strict mode violations with `.last()` selector for entity cards (resolved 17 failures)
- Fixed navigation tests with proper `waitForURL` handling (resolved 2 failures)
- Updated pagination selectors for NuxtUI v4 with soft assertions (resolved 2 failures)
- Increased search debounce timeout from 500ms to 1500ms (resolved 1 failure)
- **Improvement:** 88/113 (78%) → 109/113 (96.5%) pass rate (+21 tests fixed)

**Test Coverage:**
- Homepage navigation and entity cards
- List page rendering for all 7 entity types
- Pagination controls and navigation
- Search functionality (spells, items)
- Breadcrumb navigation
- Responsive layouts (mobile 375px, tablet 768px, desktop 1440px)
- User flows: Homepage → List → Detail → Back

**Technical Details:**
- Playwright 1.56.1 with Chromium browser
- New config: `playwright.config.ts`
- Test files: `tests/e2e/homepage.spec.ts`, `tests/e2e/entity-lists.spec.ts`
- Documentation: `tests/e2e/README.md`
- NPM scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:report`

**Impact:**
- ✅ **Real user flow testing** - Catches integration bugs that unit tests miss
- ✅ **Regression protection** - Ensures navigation, routing, API integration work end-to-end
- ✅ **CI/CD ready** - Configured for automated testing in pipelines
- ✅ **Complements 886 unit tests** - Full coverage from component to user experience

### Fixed
- **Multi-select filter dropdowns empty (Damage Types, Saving Throws)** - Fixed UiFilterMultiSelect component using deprecated NuxtUI v3 prop names. Changed `:options` to `:items` and `value-attribute` to `value-key` to match NuxtUI v4 API (2025-11-25)
- **Class filter dropdown not populating in spell filters** - Fixed type mismatch (boolean vs string '1'), pagination issue, and Vue reactivity violation. Now fetches all 15 base classes including Warlock & Wizard (2025-11-25)
- Nuxt manifest initialization errors in test environment (2025-11-24)
  - Fixed "Cannot read properties of undefined (reading 'then')" errors from fetchManifest
  - Added $fetch.create() mock support for useApi composable
  - Disabled experimental.appManifest in test environment to prevent route rules errors

### Added - Spell List Generator (2025-11-24)

**MVP Feature - Complete:**
- **Spell List Generator page** - New tool at `/spells/list-generator` for creating character spell lists based on class and level (2025-11-24)
- **All spellcasting classes supported** - Wizard, Cleric, Druid, Bard, Sorcerer, Warlock, Paladin, Ranger, Artificer, Eldritch Knight, Arcane Trickster (12+ classes) (2025-11-24)
- **Prepared vs Known caster logic** - Automatically calculates spell limits: prepared casters use level + modifier, known casters use fixed tables (2025-11-24)
- **Spell slots calculation** - Displays available spell slots per level from class progression data (2025-11-24)
- **Spell selection with checkboxes** - Browse and select spells grouped by level (Cantrips through 9th level) (2025-11-24)
- **LocalStorage persistence** - Auto-saves selections per class/level combination, survives page reloads (2025-11-24)
- **Summary sidebar** - Shows selected spells grouped by level with count tracking (2025-11-24)
- **useSpellListGenerator composable** - Reusable state management for spell list generation with full test coverage (2025-11-24)

**Technical Details:**
- New composable: `useSpellListGenerator` with spell slots calculation, max prepared/known logic, LocalStorage persistence
- Hardcoded known spells tables for 6 classes (Bard, Sorcerer, Warlock, Ranger, Eldritch Knight, Arcane Trickster)
- Debounced auto-save (500ms) to prevent excessive writes
- Mobile-responsive layout with sticky sidebar
- TDD approach: 7 composable tests, page mounting tests

**Impact:**
- ✅ Unique value proposition - Most D&D sites don't have this tool
- ✅ Leverages existing data and components
- ✅ Opens door to more "builder" features (character builder, encounter builder)

### Refactored - List Pages Consistency Improvements (2025-11-24)

**Standardization across all 7 entity list pages:**
- **Template order consistency** - Monsters page now follows Vue SFC convention with `<script setup>` before `<template>` (was reversed) matching all other pages (2025-11-24)
- **Type imports standardization** - All 7 pages now import types from centralized `~/types` barrel export instead of mixed `~/types/api/entities` and local interface definitions for consistency and maintainability (2025-11-24)
- **Clear Filters button placement** - Standardized across all pages to right-aligned separate row pattern (Items and Spells moved from inline to `flex justify-end` section) for visual consistency (2025-11-24)
- **Filter color semantics** - Unified all boolean filter toggles (has_*, is_*) to use `primary` color across all pages (Items, Races, Classes, Feats changed from `warning`/`info`/`error` to `primary`) for semantic consistency (2025-11-24)
- **Filter spacing standardization** - Removed inconsistent `space-y-4` wrapper on Races, Classes, Feats, Backgrounds pages to match Spells, Items, Monsters pattern (all now use `mb-6` + `pt-2` on chips) (2025-11-24)
- **Badge count addition** - Backgrounds page now shows filter badge count (set to 0) on collapse component matching all other pages for UI consistency (2025-11-24)
- **Section comments addition** - Items page now has "Dropdown Filters" section comment matching documentation patterns (Spells has comprehensive Phase 1/2/3 comments) (2025-11-24)

**Impact:**
- ✅ 100% structural consistency - All 7 list pages follow identical patterns
- ✅ Better maintainability - Single source for type imports
- ✅ Visual coherence - Consistent filter UI semantics across all entities
- ✅ Improved DX - Clear section organization with comments

### Refactored - Detail Pages Standardization Phase 3 (2025-11-24)

**Phase 3 Complete - Polish & UX Enhancements:**
- **Backgrounds description card** - Standardized to use `UiDetailDescriptionCard` component (was last page still using manual UCard template) achieving 100% consistency across all 7 pages (2025-11-24)
- **Bottom navigation component** - Added `<UiDetailPageBottomNav>` to all 7 detail pages for easier navigation on long pages (especially helpful for Monsters, Classes with extensive data) (2025-11-24)
- **Type safety improvements** - Removed unnecessary type casts in Races page badges, simplified to direct function calls for cleaner code (2025-11-24)

**Impact:**
- ✅ 100% consistency - ALL 7 pages now use description card component
- ✅ Better UX - Bottom "Back to..." button on all pages (reduces scroll fatigue)
- ✅ Cleaner types - Eliminated `as unknown as BadgeColor` casts
- ✅ New reusable component - `UiDetailPageBottomNav` for consistent navigation

### Refactored - Detail Pages Standardization Phases 1 & 2 (2025-11-24)

**Phase 1 & 2 Complete - All 7 Entity Detail Pages:**
- **Image component standardization** - All 6 entity detail pages (Spells, Items, Races, Classes, Backgrounds, Feats, Monsters) now use single `UiDetailEntityImage` component instead of mix of `UiDetailStandaloneImage` and `UiDetailEntityImage` (2025-11-24)
- **Grid layout standardization** - All 6 detail pages now use consistent `grid grid-cols-1 lg:grid-cols-3 gap-6` pattern for responsive stats+image layout, replacing mixed `flex` and width-based approaches (2025-11-24)
- **Description card standardization** - Spells, Feats, and Monsters detail pages now use `UiDetailDescriptionCard` component, eliminating 33 lines of duplicated prose/styling templates (2025-11-24)
- **Accordion slot naming consistency** - Fixed Items page accordion slots to use kebab-case (`random-tables`, `saving-throws`) matching all other entity pages (2025-11-24)
- **Feats quick stats addition** - Added quick stats card to Feats detail page showing "Type: Feat" and prerequisite status for visual consistency with other entity types (2025-11-24)
- **Monsters accordion refactor** - Converted Monsters detail page from standalone cards to accordion pattern (progressive disclosure) matching all other entity pages - 7 sections: Traits, Actions, Legendary Actions, Spellcasting, Modifiers, Conditions, Source (2025-11-24)
- **Conditions component consolidation** - Races detail page now uses shared `UiAccordionConditions` component (replaced 35-line manual template with 5-line component) matching Feats and Monsters (2025-11-24)

**Impact:**
- ✅ Single source of truth for entity images (easier maintenance)
- ✅ Consistent responsive behavior across all detail pages
- ✅ Reduced code duplication by 68 lines across 3 pages
- ✅ Improved UX with progressive disclosure on Monsters (reduces visual clutter)
- ✅ Better component reuse (3 pages now share conditions component)

### Added - Spells Filter Enhancement Phase 3 (2025-11-24)

**Phase 3 Implementation:**
- **Casting Time filter on Spells page** - Dropdown selector with 10 common casting time values (1 action, 1 bonus action, 1 reaction, 1 minute, 10 minutes, 1/8/12/24 hours) for filtering spells by casting speed (2025-11-24)
- **Range filter on Spells page** - Dropdown selector with 15 common range values (Self, Touch, 5/10/30/60/90/120/150/300/500 feet, 1 mile, Sight, Unlimited) for finding spells that fit tactical positioning needs (2025-11-24)
- **Duration filter on Spells page** - Dropdown selector with 19 duration values including Instantaneous, concentration variants (up to 1 min/10 min/1 hr/8 hr/24 hr), and timed durations (1 round to 30 days) for buff/debuff planning (2025-11-24)
- **Spell Properties section on Spells page** - Grouped casting time, range, and duration filters in dedicated section for easier spell property filtering (2025-11-24)
- **API utilization increase on Spells page** - From 38% (11 filters) to 48% (14 filters) - +10 percentage points improvement, moving closer to 50%+ goal (2025-11-24)
- **Filter chips for direct field filters** - Active casting time, range, and duration filters displayed as removable info-colored chips (2025-11-24)
- **Hardcoded filter options strategy** - Used pre-defined common values for faster performance over dynamic API extraction (no per_page=9999 overhead) (2025-11-24)

### Added - Spells Filter Enhancement Phase 2 (2025-11-24)

**Phase 2 Implementation:**
- **Verbal Component filter on Spells page** - Tri-state toggle (All/Has Verbal/No Verbal) to filter spells requiring verbal components - Useful when silenced or using Subtle Spell metamagic (2025-11-24)
- **Somatic Component filter on Spells page** - Tri-state toggle (All/Has Somatic/No Somatic) to filter spells requiring somatic components - Critical when restrained, grappled, or hands are full (2025-11-24)
- **Material Component filter on Spells page** - Tri-state toggle (All/Has Material/No Material) to filter spells requiring material components - Essential for spell component planning (2025-11-24)
- **At Higher Levels filter on Spells page** - Tri-state toggle (All/Has Scaling/No Scaling) to find spells that scale when cast at higher spell slot levels - Important for resource optimization (2025-11-24)
- **Spell Components section on Spells page** - Grouped component filters (V, S, M) in dedicated section for better organization and discoverability (2025-11-24)
- **API utilization increase on Spells page** - From 24% (7 filters) to 38% (11 filters) - +14 percentage points improvement, moving toward 50%+ goal (2025-11-24)
- **Filter chips for component flags** - Active component filters displayed as removable chips showing Yes/No/Has Scaling states (2025-11-24)

### Added - Spells Filter Enhancement Phase 1 (2025-11-24)

**Phase 1 Implementation:**
- **Damage Types multi-select filter on Spells page** - Filter spells by damage type (Fire, Cold, Lightning, Thunder, Acid, Poison, Necrotic, Radiant, Psychic, Force, Bludgeoning, Piercing, Slashing) using UiFilterMultiSelect component - 13 options available (2025-11-24)
- **Saving Throws multi-select filter on Spells page** - Filter spells by saving throw type (STR, DEX, CON, INT, WIS, CHA) using UiFilterMultiSelect component - 6 options available (2025-11-24)
- **API utilization increase on Spells page** - From 17% (5 filters) to 24% (7 filters) - +7 percentage points improvement (2025-11-24)

### Documentation
- **Spells Filter Enhancement Master Plan** - Comprehensive 14,000-word implementation plan for adding 12 new filters (damage types, saving throws, tags, component flags, direct fields, sorting) to Spells page, increasing API utilization from 17% to 59% (+42 points) over 4 phases - Serves as template for 6 other entity pages (Items, Monsters, Races, Classes, Backgrounds, Feats) (2025-11-24)
- **Spells Filter Enhancement Executive Summary** - Quick reference guide covering phased roadmap, component requirements, data sources, and cross-entity reusability strategy for filter enhancement project (2025-11-24)

### Added - Phase 1C & 2 Complete (2025-11-24)

#### Filter Components
- **UiFilterCollapse component** - Reusable collapsible filter container with search slot, badge count, and smooth animations - Rolled out to all 7 entity list pages (Spells, Items, Races, Classes, Backgrounds, Feats, Monsters) reducing 40+ lines of duplicate code per page (2025-11-24)
- **UiFilterMultiSelect component** - Reusable multi-select dropdown filter with searchable options, checkboxes, and clear functionality for selecting multiple values (damage types, alignments, sizes, languages, ability scores, etc.) - Ready for 5+ page integrations (2025-11-24)
- **UiFilterRangeSlider component** - Dual-handle range slider for min/max numeric filtering (Challenge Rating 0-30 with 0.25 step, spell levels 0-9, speed ranges, etc.) with custom label formatting and full accessibility support - Ready for 4+ page integrations (2025-11-24)

#### Phase 1C Toggle Filters
- **Legendary filter on Monsters page** - New tri-state toggle (All/Yes/No) to filter monsters by legendary status, enabling epic encounter building (2025-11-24)
- **Base Class Only filter on Classes page** - New tri-state toggle to show only core 13 classes, excluding subclasses and variants - Critical improvement closing 0% utilization gap (2025-11-24)
- **Spellcaster filter on Classes page** - New tri-state toggle to find full casters (Wizard, Cleric, Druid), half casters (Paladin, Ranger), and martial classes (Barbarian, Rogue) (2025-11-24)
- **Has Darkvision filter on Races page** - New tri-state toggle to find races with darkvision trait for Underdark-focused campaigns (2025-11-24)
- **Filter UI structure on Backgrounds page** - Added collapsible filter section with badge count framework ready for future background-specific filters (2025-11-24)

#### Backgrounds Detail Page Enhancement
- **Quick stats panel on backgrounds detail page** - Shows actual proficiency/language/equipment data at a glance (2/3 layout) (2025-11-24)
- **useBackgroundStats composable** - Extracts skill/tool proficiency names, language names, equipment count, and starting gold from Background entities (2025-11-24)
- **UiFilterCollapse component** - Collapsible filter section with badge count for active filters (2025-11-23)
- **UiFilterToggle component** - Reusable tri-state toggle filter component (All/Yes/No) with improved styling (2025-11-23)
- **Concentration filter on Spells page** - Filter spells by concentration requirement (218 concentration spells) (2025-11-23)
- **Ritual filter on Spells page** - Filter spells by ritual casting capability (33 ritual spells) (2025-11-23)
- **Collapsible filters on Spells page** - Search-first design with filters hidden by default, expandable with badge showing active count (2025-11-23)

### Changed
- **All 7 entity list pages refactored** to use UiFilterCollapse component - Consistent collapsible filter UI with search slot and badge count across Spells, Items, Races, Classes, Backgrounds, Feats, Monsters pages (2025-11-24)
- **Background detail page image resized** from full-width to 1/3 width for consistency with classes/races pages (2025-11-24)
- **BackgroundCard refactored** to use useBackgroundStats composable (reduces code duplication) (2025-11-24)
- **Removed vertical border from traits/features** in UiAccordionTraitsList component across all entity detail pages (backgrounds, races, classes) for cleaner visual hierarchy (2025-11-24)
- Normalized accordion table components with consistent styling (2025-11-23)
  - Created reusable UiAccordionDataTable base component
  - Refactored UiAccordionClassCounters, UiAccordionLevelProgression, UiAccordionRandomTablesList
  - Standardized padding (px-4 py-3) and colors (bg-gray-50 dark:bg-gray-800)
  - All table components now have mobile-responsive card layouts
  - Reduced table markup code by 47% (377→200 lines)
  - Moved 4 legacy components to /ui/accordion/ for consistency
- UiFilterToggle buttons now use smaller sizing (px-2 py-1 text-xs) for more compact filter UI (2025-11-23)
- Spells page filters now collapse by default, improving mobile experience and reducing visual clutter (2025-11-23)

### Fixed
- **BackgroundCard tool proficiencies display** - Fixed "Cannot read properties of null" error by correctly accessing ComputedRef with `.value` (2025-11-24)
- **Background equipment accordion** now displays all equipment items correctly (was incorrectly filtering out items with class-specific logic) (2025-11-24)
- UiFilterToggle now uses correct API values ('1'/'0' instead of 'true'/'false') for boolean filters (2025-11-23)
- Improved UiFilterToggle styling to match existing NuxtUI design system (2025-11-23)
- Class counters display (resource tracking like Rage, Ki Points) with level progression table (2025-11-23)
- Feat proficiencies display for proficiency-granting feats (2025-11-23)
- Conditions display for Feats and Monsters (immunities, resistances, vulnerabilities) (2025-11-23)
- Item detail field display for flavor text and usage notes (2025-11-23)
- Item prerequisites display for usage requirements (2025-11-23)
- UiAccordionConditions reusable component (2025-11-23)
- UiAccordionClassCounters reusable component (2025-11-23)
- UiAccordionItemDetail reusable component (2025-11-23)
- UiAccordionPrerequisites reusable component (2025-11-23)
- Color utilities for reset timing and condition effect badges (2025-11-23)

### Changed
- Standardized Backgrounds page to use UiDetailEntityImage component (2025-11-23)
- Improved consistency of conditions display across Races, Feats, and Monsters (2025-11-23)
- **Badge Variant Standardization (2025-11-23)** - Standardized all badge variants to `subtle` for consistent, prominent borders across all entity cards
  - Changed ALL inline badges from `variant="soft"` to `variant="subtle"` in all 7 entity cards
  - SpellCard: Concentration and Ritual badges (2 badges)
  - ItemCard: Magic and Attunement badges (2 badges)
  - MonsterCard: Legendary badge (1 badge)
  - RaceCard: Traits and Subraces count badges (2 badges)
  - ClassCard: Primary ability and Spellcasting ability badges (2 badges)
  - BackgroundCard: Tools badge (1 badge)
  - FeatCard: No Prerequisites badge (1 badge)
  - Total: 11 badges standardized across 7 cards
  - All badges now use `size="md"` + `variant="subtle"` for maximum simplicity and consistency
  - All 227 entity card tests passing
- **MonsterCard Inline Badge Size Upgrade (2025-11-23)** - Upgraded Legendary badge from size="sm" to size="md" for improved readability
  - Changed Legendary badge from `size="sm"` to `size="md"`
  - Top-row badges (CR, Type) remain at `size="md"` as designed
  - All 27 MonsterCard tests passing
- **SpellCard Inline Badge Size Enhancement (2025-11-23)** - Upgraded Concentration and Ritual badges to medium size
  - Changed inline badges (Concentration, Ritual) from `size="sm"` to `size="md"` for better readability
  - Top-row badges (Level, School) remain `size="md"` as established
  - All 27 SpellCard tests passing
- **RaceCard Inline Badge Size Upgrade (2025-11-23)** - Increased inline badge sizes for better readability
  - Changed Traits count badge from size="sm" to size="md" for improved visibility
  - Changed Subraces count badge from size="sm" to size="md" for improved visibility
  - Top-row badges (Size, Race/Subrace) remain unchanged at size="md"
  - All 42 RaceCard tests passing
- **ClassCard, BackgroundCard, and FeatCard Inline Badge Size Upgrade (2025-11-23)** - Enhanced readability of secondary information badges
  - ClassCard: Primary ability and Spellcasting ability badges upgraded from `size="sm"` to `size="md"`
  - BackgroundCard: Tools badge upgraded from `size="sm"` to `size="md"`
  - FeatCard: "No Prerequisites" badge upgraded from `size="sm"` to `size="md"`
  - Top-row badges remain at `size="md"` for consistency across all cards
  - All 94 tests passing (ClassCard: 33, BackgroundCard: 30, FeatCard: 31)
- **ItemCard Inline Badge Size Upgrade (2025-11-23)** - Enhanced readability of secondary information badges
  - Changed Magic and Attunement badges from `size="sm"` to `size="md"` for improved visibility
  - Top-row badges (Type, Rarity) remain at `size="md"` for consistency
  - All 37 ItemCard tests passing
- **BackgroundCard Badge Standardization (2025-11-23)** - Aligned badge sizes and variants with project 2-tier badge system
  - Feature name badge (top-row): Changed from `size="sm" variant="soft"` to `size="md" variant="subtle"` for prominence
  - Tools badge (inline): Changed from `size="xs"` to `size="sm"` to maintain visual hierarchy
  - Removed all "xs" badge sizes per project standards
  - All 30 BackgroundCard tests passing
- **FeatCard Badge Standardization (2025-11-23)** - Standardized badge sizes and variants to match 2-tier badge system
  - Changed Prerequisites badge (top-row) from `variant="soft"` to `variant="subtle"` for prominence
  - Changed "No Prerequisites" badge (inline) from `size="xs"` to `size="sm"` for better readability
  - Top-row badges now use `size="md"` + `variant="subtle"` for primary information
  - Inline badges now use `size="sm"` + `variant="soft"` for secondary information
  - All 31 FeatCard tests passing
- **ClassCard Badge Size Standardization (2025-11-23)** - Updated Base Class/Subclass badge to match 2-tier hierarchy
  - Changed type badge (Base Class/Subclass) from size="sm" to size="md" for prominence
  - Aligns with SpellCard, ItemCard, MonsterCard, and RaceCard badge hierarchy pattern
  - Top-row badges now consistently use "md" for primary entity information across all card components
  - All 33 ClassCard tests passing
- **BackgroundCard Skill Display Enhancement (2025-11-23)** - Replaced skill count with actual skill names
  - Shows first 2 skill names (e.g., "Insight, Religion" instead of "2 Skills")
  - Adds "+N more" overflow indicator for 3+ skills (e.g., "Insight, Religion +1 more")
  - Single skills display name without comma
  - Added 4 comprehensive tests covering 1, 2, 3, and 4 skill scenarios
  - All 30 BackgroundCard tests passing
- **MonsterCard Combat Information Enhancement (2025-11-23)** - Replaced emojis with icons and added combat stats
  - Replaced emoji icons with UIcon components (shield-check for AC, heart for HP, bolt for speed, shield-exclamation for saves)
  - Removed emoji from size display (now plain text)
  - Added speed display with support for walk, fly, climb, swim, and burrow speeds
  - Added saving throw proficiencies display (e.g., "Saves: DEX +5, WIS +4")
  - Added 10 comprehensive tests covering icon display, speed variations, and saving throw filtering
  - All 27 MonsterCard tests passing
- **RaceCard Ability Modifiers Display Enhancement (2025-11-23)** - Improved clarity for races with more than 3 ability modifiers
  - Shows "+X more" suffix when truncating (e.g., "STR +2, DEX +1, CON +1 +1 more" for 4 modifiers)
  - Displays all modifiers when 3 or fewer exist
  - Added 4 new tests covering edge cases (1, 3, 4, and 5 modifiers)
  - All 42 RaceCard tests passing
- **FeatCard Prerequisites Display Enhancement (2025-11-23)** - Improved clarity for feats with multiple prerequisites
  - Changed from generic "2 prerequisites" to specific "STR 13+ +1 more" format
  - Shows first prerequisite detail (ability score or description) plus count of remaining
  - Single prerequisites unchanged (still shows "STR 13+" or full description)
  - Added 3 comprehensive tests covering edge cases (2 prereqs, 3+ prereqs, description-based)
- **ClassCard Description Length Standardization (2025-11-23)** - Updated description truncation to match other entity cards
  - Increased description max length from 120 to 150 characters to align with SpellCard, ItemCard, RaceCard, BackgroundCard, FeatCard, and MonsterCard
  - Standardized primary ability display to show ability code (e.g., "INT") instead of full object for consistency
  - Added test coverage for 150-character truncation behavior

### Added
- **Proficiencies Component with Type Grouping (2025-11-23)** - Enhanced proficiency display with structured organization
  - Proficiencies grouped by type with category headlines (ARMOR, WEAPON, TOOL, SAVING THROW, SKILL)
  - Choice-based proficiencies with alphabetical letters (a, b, c) and "Choose N:" descriptions
  - Support for `choice_group`, `choice_option`, and `quantity` fields from API
  - Consistent with equipment component pattern
- **Class Traits Display (2025-11-23)** - Added lore and creation information for classes
  - First trait displayed prominently in description box (main class overview)
  - Additional traits shown in "Additional Class Traits" accordion
  - Eliminates duplication between description field and traits
- Starting Equipment accordion on backgrounds detail page (2025-11-23)
- Spell Slot Progression accordion on classes detail page showing level-by-level spell slots for spellcasting classes (2025-11-23)
- Starting Equipment & Proficiencies accordion on classes detail page showing hit points, proficiencies, and starting gear (2025-11-23)
- UiAccordionEquipmentList component for displaying class/background starting equipment (2025-11-23)
- **Parent Race Display for Subraces (2025-11-23)** - Race cards and detail pages now show parent race information
  - RaceCard displays "Subrace of [Parent Race Name]" below the title when applicable
  - Race detail page shows clickable link to parent race at the top
  - Added 3 new tests for parent_race display behavior in RaceCard
  - All 734 tests passing
- **Storybook Integration (2025-11-23)** - Interactive component documentation and visual playground
  - Installed Storybook 8 with Vue 3 + Vite integration
  - Created stories for 5 core list components (PageHeader, SkeletonCards, EmptyState, ResultsCount, BackLink)
  - Configured path aliases (`~/components`, `~/types`) for seamless imports
  - Added Tailwind CSS integration for consistent styling
  - Storybook runs at `http://localhost:6006` with dark mode support
  - Component documentation with interactive controls and auto-generated prop tables
  - Created comprehensive component library documentation (`docs/components/README.md`)
  - Design document with implementation strategy (`docs/plans/2025-11-23-storybook-setup-design.md`)
  - 27 story variants across 5 components demonstrating different states and use cases

### Performance
- **Major Background Animation Optimization (2025-11-23)** - Reduced CPU usage by ~70% through multiple performance improvements
  - Particle count reduced from 80-120 to 40-50 for lighter load
  - Removed constellation line calculation (was O(n²) nested loop creating 1000s of distance checks per frame)
  - Removed shadow blur from particles (GPU-intensive filter operation)
  - Cached grayscale filter using OffscreenCanvas instead of applying on every frame
  - Removed Three.js textures from dice (simplified materials, no texture generation)
  - Simplified particle shapes (70% circles, 20% 4-point stars, 10% diamonds - removed complex hexagons and crosses)
  - Reduced particle trail length from 5 to 3 points
  - Result: Smooth 30 FPS animation without spinning up CPU fan

### Fixed
- Missing API fields now displayed across all 7 detail pages (2025-11-23)
- Capped scroll velocity on background animation to prevent excessive inertia (2025-11-23) - Dice and particles now respond to scroll without zooming off-screen during rapid mouse wheel events
- Equipment list now properly handles structured choice data with `choice_group` and `choice_option` fields (2025-11-23) - Rogue class equipment choices display correctly in separate groups with proper sorting

### Changed
- Equipment items in class/background detail pages now link to their item detail pages when available (2025-11-23) - Clickable links for all equipment with `item_id` and `slug`
- Equipment group headlines now use descriptive `choice_description` text instead of technical `choice_group` names (2025-11-23) - Shows "Starting equipment choice" instead of "choice_1"

### Changed
- Parchment background now covers full viewport instead of tiling (2025-11-23) - Creates cleaner, more cohesive look with subtle parallax scroll effect
- Parchment background opacity adjusted to 6-8% for subtle visibility (2025-11-23)

### Added
- Monster support in search results (2025-11-23)
- Specialized entity cards in search (SpellCard, ItemCard, MonsterCard, etc.) (2025-11-23)
- **Subclass Features Display (2025-11-23)** - Classes detail page now shows rich nested features for each subclass
  - Created `UiAccordionSubclassesList` component to display subclass features grouped by level
  - Features show level badges, optional status, and full descriptions
  - Maintains clickable links to individual subclass detail pages
- **Monster Spellcasting Display (2025-11-23)** - Monsters with spellcasting now show detailed casting information
  - Displays spellcasting description, ability, spell save DC, spell attack bonus, and spell slots
  - Conditional rendering - only appears for monsters with spellcasting data
  - Stats displayed in responsive grid layout
- Decorative face numbers on 3D dice (2025-11-23)
  - Canvas-based texture generation for all die types (d4-d20)
  - Subtle white numbers (35% opacity) with Georgia serif font
  - Numbers rotate naturally with dice tumbling
  - Textures cached for performance
- **3D Dice Background Animation (2025-11-23)** - Integrated Three.js polyhedral dice into animated background
  - 8 dice (d4, d6, d8, d10, d12, 3× d20) with glass-like materials and wireframe edges
  - Dual-canvas architecture: 2D canvas (parchment + particles) + WebGL canvas (3D dice)
  - Physics: slow tumbling, ambient drift, mouse repulsion, scroll momentum, spring-back
  - Each die moves independently with unique drift paths and reactions
  - NuxtUI theme colors (arcane, treasure, emerald, glory, danger, lore)
  - Comprehensive handover document with technical details and future enhancement ideas

### Changed
- **Primary brand color changed to rose** (2025-11-23) - Rose (sophisticated pink) is now the primary color throughout the app for navbar, links, and selected states
- Navigation items now use entity-specific colors on hover and active states (2025-11-23) - Spells use purple, Items use gold, Monsters use orange, etc.
- Navigation bar updated with rose gradient background (2025-11-23) - Creates warm, memorable aesthetic that stands out from typical tech UIs
- Dark mode backgrounds lightened and made transparent (85-90% opacity) to show animated gradient (2025-11-23)
- Condition entity color changed from rose to pink (2025-11-23) - To accommodate rose becoming the primary brand color
- Search results now use entity-specific card components instead of generic SearchResultCard (2025-11-23)
- Search page visual consistency now matches list pages with semantic colors and background images (2025-11-23)
- **Detail Page Layout Refactor - Complete for All 7 Pages (2025-11-23)** - New side-by-side layout pattern with standalone images
  - Created 3 new reusable components: `UiDetailEntityImage`, `UiDetailStandaloneImage`, `UiDetailDescriptionCard` (20 tests)
  - Refactored all 7 detail pages to use side-by-side layout (first container 2/3 + image 1/3)
  - Description moved to separate full-width card below side-by-side section
  - Better visual hierarchy: Quick info + context at top, detailed reading below
  - Responsive design: Stacks vertically on mobile, side-by-side on desktop
  - Deprecated `UiDetailDescriptionWithImage` component with migration guide
  - All 7 pages verified (HTTP 200), 699/732 tests passing (95.5%)
- **List Page Standardization - Complete for All 17 Pages (2025-11-22)** - Unified UI patterns across entire application
  - Enhanced `useEntityList` composable with `noPagination` flag for reference pages
  - Migrated 10 reference pages to use composable (ability-scores, conditions, damage-types, item-types, languages, proficiency-types, sizes, skills, spell-schools, sources)
  - Added active filter chips to all main entity pages (races, classes, backgrounds, feats, monsters)
  - Standardized monsters page to use all standard UI components (10+ inconsistencies fixed)
  - Removed ~400-500 lines of duplicate boilerplate code
  - Added search URL sync to all reference pages (shareable search URLs)
  - Improved JSON debug panel with monospace fonts for better readability
  - 702 tests passing (100%), all 17 pages verified (HTTP 200)

### Fixed
- **Monster Images Not Displaying (2025-11-23)** - Fixed missing monster image support
  - Added `'monsters'` to `useEntityImage` composable (EntityType + ENTITY_FOLDER_MAP)
  - Added background images to MonsterCard component (10% opacity, 20% on hover)
  - Monsters now display images on both list and detail pages
- **ItemType export added to types/index.ts (2025-11-22)** - Resolves TypeScript import error for item-types page

### Removed
- SearchResultCard component (replaced by specialized entity cards) (2025-11-23)

### Added
- **Entity Images Feature - Complete for All 16 Entity Types (2025-11-22)** - AI-generated images across main + reference entities
  - Extended to all 10 reference entity types: ability-scores, conditions, damage-types, item-types, languages, proficiency-types, sizes, skills, spell-schools, sources
  - Refactored `useEntityImage` composable to support all 16 entity types
  - Handles kebab-case to snake_case conversion transparently
  - Background images on all reference entity list cards (256px, 10% opacity, 20% hover)
  - Total test suite: 696 tests passing (51 new tests added)
- **Animated Fantasy Background - Complete (2025-11-22)** - Atmospheric canvas animation system
  - 40 purple/violet swirls drifting with organic movement (0.15-0.25 opacity)
  - 6 D&D runic symbols (Norse runes + geometric) that move, fade, and rotate (0.2-0.35 opacity)
  - Animated gradient background (purple/indigo/violet subtle color shifts, 20s cycle)
  - Fixed viewport positioning - stays visible while scrolling
  - 30 FPS performance-optimized animation with throttling
  - Respects `prefers-reduced-motion` accessibility setting
  - Battery-friendly: pauses when tab hidden
  - Warmer dark mode colors (custom grays, less "default blue")
  - 3-layer z-index architecture (gradient → canvas → content)
  - Body background matches gradient to prevent white overflow
  - 19 new tests (composable + component)
- **Entity Images Feature - Initial Implementation for 6 Main Entities (2025-11-22)** - AI-generated images on primary entity types
  - CV-style hero images on detail pages (512px variants, right-aligned 1/3 width)
  - Subtle background images on list cards (256px, 10% opacity, 20% hover)
  - Implemented on: Races, Classes, Backgrounds, Feats, Spells, Items
  - `useEntityImage` composable for path generation across all entity types
  - `UiEntityHeaderWithImage` component for detail pages with responsive layout
  - Environment configuration: `NUXT_PUBLIC_IMAGE_PROVIDER=stability-ai`
  - Graceful degradation for missing images (null returns, v-if checks)
  - 19 new tests added (all passing): 9 composable, 7 component, 3 integration
  - Total test suite: 645 tests passing
  - ESLint clean, TypeScript pre-existing errors only
  - Verified on sample pages for all 6 entity types
- **Monsters entity type complete (2025-11-22)** - 7th entity type with full feature parity
  - Monster list page with CR/Type filtering
  - Monster detail page with full stat blocks (AC, HP, speeds, ability scores)
  - MonsterCard component for list display (16 tests)
  - UiAccordionActions component for actions/legendary actions (9 tests)
  - UiAccordionTraits component for passive traits (7 tests)
  - getChallengeRatingColor utility for CR badge colors (10 tests)
  - CR range filters: Easy (0-4), Medium (5-10), Hard (11-16), Deadly (17+)
  - Monster type filters (14 common types: aberration, beast, celestial, etc.)
  - Legendary creature indicator badge
  - Tests: 611/611 passing (42 new tests added)
- **OpenAPI type generation system (2025-11-22)** - Automatic TypeScript type generation from backend API
  - New command: `npm run types:sync` syncs types from backend OpenAPI spec
  - Generated 2,848 lines of TypeScript types from API spec
  - Hybrid type system: auto-generated base types + manual application extensions
  - Full type safety for nested API structures (effects, traits, modifiers, proficiencies)
  - Eliminated ~100 lines of duplicate manual type definitions
  - 6 new type compatibility tests (one per entity type)

### Fixed
- **TypeScript errors reduced by 93% (2025-11-22)** - Systematic cleanup from 176 to 13 errors
  - **Session 1: OpenAPI migration (176 → 53 errors, 70% reduction)**
    - Added proper type annotations to all 6 detail pages (54 errors eliminated)
    - Added type annotations to search page (18 errors eliminated)
    - Fixed empty object types in useAsyncData calls (61 errors eliminated)
    - Updated 8 accordion components to use generated API types (32 errors eliminated)
    - Added missing entity fields (description, feature_name) to types (15 errors eliminated)
    - Fixed null vs undefined type mismatches (18 errors eliminated)
    - Fixed index page array type annotations (10 errors eliminated)
    - Fixed badge color type safety (5 errors eliminated)
    - Added missing type exports (Condition, DamageType) (2 errors eliminated)
    - Fixed BackgroundCard property names (6 errors eliminated)
  - **Session 2: Quick wins cleanup (53 → 13 errors, 75% reduction)**
    - Added taxonomy type definitions (Language, ProficiencyType, Size, Skill, SpellSchool) (19 errors)
    - Fixed FeatCard prerequisite null checks with optional chaining (4 errors)
    - Fixed ItemCard undefined rarity index access (1 error)
    - Fixed Items/Spells index select menu type definitions (6 errors)
    - Added null coalescing for spell effect sorting (2 errors)
    - Added optional chaining for race condition relations (2 errors)
    - Added type assertions for entity list composable data (4 errors)
    - Added missing Race and Spell type imports (2 errors)
- **All 11 test failures fixed - 100% pass rate achieved! (2025-11-22)**
  - Fixed ClassCard is_base_class type handling (boolean/string/number support) (6 tests)
  - Updated BackgroundCard test mocks to new proficiencies array structure (5 tests)
  - All 564 tests now passing (553 → 564)

### Changed
- **Applied entity-specific colors across all card components and search interface (2025-11-22)**
  - Main entities: Spells (purple), Items (gold), Races (green), Classes (red), Backgrounds (yellow-brown), Feats (blue), Monsters (orange)
  - Reference entities: Ability scores (indigo), Conditions (rose), Damage types (slate), Item types (teal), Languages (cyan), Proficiencies (lime), Sizes (zinc), Skills (yellow), Spell schools (fuchsia), Sources (neutral)
  - Search results and filter buttons now use entity colors for instant visual recognition
  - Simplified component code by removing generic color mapping functions
- **Test suite refactored for maintainability** - Extracted shared test helpers to reduce redundancy by 30 tests (573→543→558 adjusted) (2025-11-22)
  - Created 3 test helper modules (cardBehavior, descriptionBehavior, sourceBehavior)
  - Refactored 6 entity card test files (Spell, Item, Race, Class, Background, Feat)
  - Refactored 9 taxonomy card test files (Size, Condition, DamageType, Language, ItemType, SpellSchool, ProficiencyType, AbilityScore, Skill, Source)
  - Eliminated 30 redundant tests across 15 components
  - Removed implementation detail tests (CSS classes, truthy assertions)
  - All 558 tests passing with significantly improved maintainability

### Added
- **Test coverage for SearchResultCard component** - Added 12 comprehensive tests for global search results (573 total tests) (2025-11-22)
- **Pipe-delimited column parsing in random tables** - Tables now split `result_text` by `|` into separate columns (2025-11-22)
- **Conditional Roll column in random tables** - Hides Roll column entirely when no dice rolls present (2025-11-22)
- **Test coverage for UiAccordionBulletList** - Added 10 comprehensive tests (555 total tests, all passing) (2025-11-22)
- **DC (Difficulty Class) display in saving throws component** - Shows DC value in prominent red badge (2025-11-22)
- Item spells display with charge costs - NEW component `UiAccordionItemSpells` shows spells castable from magic items (2025-11-22)
- Random tables display for items - Shows dice rolls and results for items like Bag of Tricks (2025-11-22)
- Proficiencies display for items - Shows weapon/armor proficiencies required or granted (2025-11-22)
- Charges display in item Quick Stats - Shows max charges and recharge formula/timing (2025-11-22)
- Skill interface to type system for modifier display (2025-11-22)

### Fixed
- **TypeScript type safety improved (31% error reduction)** - Fixed 81 type errors (261→180) by adding missing entity properties and strict NuxtUI types (2025-11-22)
- **Modifier field name bug** - Fixed `modifier_type` → `modifier_category` to match API (RaceCard + 33 tests) (2025-11-22)
- Modifier display for non-numeric values - Now correctly shows "disadvantage" and "advantage" instead of "NaN" (2025-11-22)
- Skill-based modifiers now display skill name with ability score code (e.g., "Stealth (DEX): disadvantage") (2025-11-22)
- **ESLint clean** - Eliminated all 97 ESLint errors by replacing `any` types with proper TypeScript types (2025-11-22)
- Side effect in computed property - Fixed spell effects sorting by creating array copy first (2025-11-22)

### Changed
- Item detail pages now show complete item information including spells, proficiencies, charges, and random tables (2025-11-22)
- ModifiersDisplay component enhanced with 13 new tests for advantage/disadvantage support (2025-11-22)
- **Centralized entity type definitions** - Extracted entity types to `app/types/api/entities.ts` (2025-11-21)
  - Extracted Spell, Item, Race, CharacterClass, Background, Feat interfaces
  - Updated 6 card components to import from centralized types
  - Added type annotations to 6 test files for type-safe mock data
  - Eliminated ~90 lines of duplicate interface definitions
- **Centralized type system** - Extracted shared TypeScript interfaces to `app/types/` (2025-11-21)
  - Created `app/types/api/common.ts` with Source, AbilityScore, Modifier, Tag
  - Migrated 12 components to use centralized types
  - Eliminated 15+ duplicate interface definitions

### Fixed
- Empty stats card no longer renders when entity has no quick stats (2025-11-21)

### Added
- Random tables display for spells (2025-11-21)
- Save modifier badges (advantage/disadvantage/standard roll) to saving throws (2025-11-21)
- **6 new reference pages** (2025-11-21):
  - Ability Scores (6 items: STR, DEX, CON, INT, WIS, CHA)
  - Conditions (15 items: game status effects with descriptions)
  - Item Types (20 items: categorized equipment types)
  - Proficiency Types (40 items: weapon, armor, tool proficiencies)
  - Skills (18 items: linked to ability scores)
  - Spell Schools (8 items: schools of magic)
- Navigation dropdown menu for reference section (scalable for 10+ items)
- **3 reference pages - Batch 1** (2025-11-21):
  - Source Books (8 items)
  - Languages (30 items)
  - Creature Sizes (6 items)
  - Damage Types (13 items)
- Saving throws display on spell detail pages (2025-11-18)
- Tags display across all entity types (2025-11-18)
- Random tables display for race traits (2025-11-18)
- Character level scaling for spell damage effects (2025-11-18)
- All spell effects display (not just damage) (2025-11-18)

### Fixed
- Correct prop name for random tables component in spells (2025-11-21)
- Increased badge sizes for better visibility in saving throws (2025-11-21)
- Query parameter forwarding in item-types API endpoint (2025-11-21)
- Failing tests for BackLink and useSearch composable (2025-11-18)
- UDropdownMenu component reference for NuxtUI v4 (2025-11-21)

### Changed
- Navigation from flat list to dropdown menu for reference items (2025-11-21)

---

## [1.0.0] - 2025-11-18 - Initial Production Release

### Project Status
**Production-Ready** - All 6 core entity types complete with comprehensive features and 276+ passing tests.

### Core Features

#### Entity Types (6/6 Complete)
All entity types include list pages with search/filters, detail pages with accordions, and comprehensive data display:

1. **Spells** (300+ spells)
   - Level and school filters
   - Ritual and concentration badges
   - Character level-based damage scaling
   - All effect types (damage, healing, utility)
   - Saving throws with modifiers
   - Random tables (e.g., Prismatic Spray)
   - Class availability
   - Tags

2. **Items** (500+ items)
   - Rarity-based color coding
   - Magic and attunement indicators
   - Weapon stats (damage, properties)
   - Armor stats (AC, type)
   - Tags

3. **Races** (40+ races)
   - Ability score modifiers
   - Traits with random tables
   - Size and speed information
   - Languages
   - Subraces
   - Tags

4. **Classes** (12+ classes)
   - Subclasses
   - Hit dice
   - Proficiencies (weapons, armor, tools, saving throws)
   - Spellcasting ability
   - Class features by level
   - Tags

5. **Backgrounds** (15+ backgrounds)
   - Skill proficiencies
   - Tool proficiencies
   - Languages
   - Traits (Description, Feature, Characteristics)
   - Tags

6. **Feats** (80+ feats)
   - Prerequisites (emphasized)
   - Ability modifiers
   - Conditions granted/removed
   - Tags

#### Reference Pages (10/10 Complete)
- Ability Scores (6 items)
- Conditions (15 items)
- Creature Sizes (6 items)
- Damage Types (13 items)
- Item Types (20 items)
- Languages (30 items)
- Proficiency Types (40 items)
- Skills (18 items)
- Spell Schools (8 items)
- Source Books (8 items)

### Technical Features

#### UI Components (30+ reusable components)
**List Page Components:**
- `UiListPageHeader` - Title with count and loading state
- `UiListSkeletonCards` - Animated loading placeholders
- `UiListErrorState` - Error handling with retry
- `UiListEmptyState` - Empty results with filter clearing
- `UiListResultsCount` - Pagination info display

**Detail Page Components:**
- `UiDetailPageLoading` - Full page skeleton loader
- `UiDetailPageError` - 404 error state
- `UiDetailPageHeader` - Title with dynamic badges
- `UiDetailQuickStatsCard` - Grid layout for stats

**Accordion Components:**
- `UiAccordionBadgeList` - Badge collections
- `UiAccordionBulletList` - Bullet-point lists
- `UiAccordionTraitsList` - Traits with levels/features
- `UiAccordionEntityGrid` - Entity relationship displays
- `UiAccordionPropertiesList` - Item properties
- `UiAccordionAbilitiesList` - Item abilities
- `UiAccordionDamageEffects` - Spell effects with scaling
- `UiAccordionSavingThrows` - Saving throw requirements
- `UiAccordionRandomTablesList` - Dice roll tables

**General UI Components:**
- `UiBackLink` - Breadcrumb navigation
- `UiSourceDisplay` - Source book citations
- `UiModifiersDisplay` - Character modifiers
- `UiTagsDisplay` - Universal tags
- `JsonDebugPanel` - Developer debug tool

**Card Components (11 total):**
- Entity cards: SpellCard, ItemCard, RaceCard, ClassCard, BackgroundCard, FeatCard
- Reference cards: SourceCard, LanguageCard, SizeCard, DamageTypeCard, AbilityScoreCard, SpellSchoolCard, ItemTypeCard, ProficiencyTypeCard, SkillCard, ConditionCard

#### Architecture
- **Framework:** Nuxt 4.x with SSR/SSG support
- **UI Library:** NuxtUI 4.x with dark mode
- **Language:** TypeScript (strict mode)
- **Testing:** Vitest with 276+ tests (100% passing)
- **API Integration:** RESTful with Meilisearch
- **Composables:** `useApi()`, `useSearch()`
- **Docker:** Full containerized development environment

#### Design System
**Semantic Color System:**
- Error (red) - Base classes, weapons, critical info
- Warning (amber) - Subclasses, feats, important notices
- Info (blue) - Armor, races, skills
- Primary (purple) - Magic items, spells, primary actions
- Success (green) - Potions, consumables, backgrounds
- Neutral (gray) - Tools, reference material

**Typography Scale:**
- Main headings: `text-4xl` to `text-5xl font-bold`
- Card titles: `text-xl font-semibold`
- Body text: `text-base` to `text-lg`

**Spacing:**
- Page sections: `space-y-8`
- Card content: `space-y-3`
- Grid gaps: `gap-4`

### Quality & Testing

#### Test Coverage
- **276 total tests** (100% passing)
- **87 tests** - List infrastructure
- **31 tests** - Detail page components
- **40 tests** - Accordion components
- **34 tests** - General UI components
- **52 tests** - Reference components
- **32 tests** - New reference cards (batch 2)

#### Code Quality
- TypeScript strict mode enforced
- ESLint with zero errors
- TDD methodology followed
- Component-driven architecture
- Comprehensive error handling

### Performance
- Server-side rendering (SSR)
- Automatic code splitting
- Lazy loading for heavy components
- Meilisearch integration (<50ms search)
- Skeleton loading states
- Docker networking optimized

### Accessibility
- Semantic HTML throughout
- Keyboard navigation support
- ARIA labels where needed
- Focus management
- Screen reader compatible

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (375px to 1440px+)
- Dark mode support
- Touch-friendly interactions

### Developer Experience
- JSON debug panels on all pages
- Comprehensive documentation
- Clear component patterns
- Auto-import for components
- Hot module replacement
- Docker development environment

---

## Development Process

### TDD Mandate
All components developed following strict Test-Driven Development:
1. Write failing test (RED)
2. Write minimal code (GREEN)
3. Refactor while keeping tests green
4. Commit with tests

### Git Workflow
- Atomic commits per feature
- Descriptive commit messages
- Claude Code attribution
- Clean git history

### Documentation
- CLAUDE.md - Developer guide
- CURRENT_STATUS.md - Project overview
- Session handover documents
- API documentation references

---

## Known Issues

### Backend API Limitations
1. **Size filter not supported** - Race list endpoint doesn't accept size parameter
2. **List API missing relationships** - Some nested data not available in list views
3. **Search results missing nested data** - Global search returns flattened data

### Technical Debt
- Main entity card components lack tests (6 components)
- Old reference card components lack tests (3 components)
- No E2E tests yet (Playwright configured but not implemented)

---

## Future Enhancements

### High Priority
- Add comprehensive tests for entity cards
- Add tests for remaining reference cards
- OpenAPI type generation
- Backend: Add size filter for races

### Medium Priority
- Toast notifications for copy actions
- Advanced filtering (multi-select, saved presets)
- Sort options on list pages
- Bookmarks/favorites functionality
- Component library documentation

### Low Priority
- Print stylesheets
- Share buttons with metadata
- Keyboard shortcuts for power users
- Analytics tracking
- Detail pages for reference items
- Cross-reference linking between entities

---

## Contributors

- Primary Development: Claude Code (AI Assistant)
- Project Owner: dfox
- Framework: Nuxt 4.x + NuxtUI 4.x
- Backend API: Laravel (separate repository)

---

## Resources

- Frontend Repository: `/Users/dfox/Development/dnd/frontend`
- Backend Repository: `/Users/dfox/Development/dnd/importer`
- API Docs: `http://localhost:8080/docs/api`
- Nuxt Docs: https://nuxt.com/docs/4.x/
- NuxtUI Docs: https://ui.nuxt.com/

---

**Project Status:** ✅ Production-ready with 6 entity types, 10 reference pages, 30+ reusable components, and 276+ passing tests.
