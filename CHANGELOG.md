# Changelog

All notable changes to the D&D 5e Compendium Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Class filter on Spells page** - Filter spells by character class (Wizard, Cleric, etc.) with base classes sorted alphabetically (2025-11-24)
- **Quick stats panel on backgrounds detail page** - Shows actual proficiency/language/equipment data at a glance (2/3 layout) (2025-11-24)
- **useBackgroundStats composable** - Extracts skill/tool proficiency names, language names, equipment count, and starting gold from Background entities (2025-11-24)
- **UiFilterCollapse component** - Collapsible filter section with badge count for active filters (2025-11-23)
- **UiFilterToggle component** - Reusable tri-state toggle filter component (All/Yes/No) with improved styling (2025-11-23)
- **Concentration filter on Spells page** - Filter spells by concentration requirement (218 concentration spells) (2025-11-23)
- **Ritual filter on Spells page** - Filter spells by ritual casting capability (33 ritual spells) (2025-11-23)
- **Collapsible filters on Spells page** - Search-first design with filters hidden by default, expandable with badge showing active count (2025-11-23)

### Changed
- **Background detail page image resized** from full-width to 1/3 width for consistency with classes/races pages (2025-11-24)
- **BackgroundCard refactored** to use useBackgroundStats composable (reduces code duplication) (2025-11-24)
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
