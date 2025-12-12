#!/usr/bin/env npx tsx

/**
 * Character Stress Test Script
 *
 * Creates N characters with random valid choices to stress-test the character builder API.
 * Uses a curated pool of PHB races/classes/backgrounds for reliable testing.
 *
 * Usage:
 *   npm run test:character-stress -- --count=10
 *   npm run test:character-stress -- --count=5 --verbose
 *   npm run test:character-stress -- --count=1 --dry-run
 *   npm run test:character-stress -- --count=20 --cleanup
 *
 * Options:
 *   --count=N    Number of characters to create (default: 10)
 *   --verbose    Show detailed output for each step
 *   --dry-run    Show what would happen without making API calls
 *   --cleanup    Delete characters after creation (default: keep them)
 *   --help       Show help message
 *
 * Environment:
 *   API_BASE_URL  Override API base URL (default: http://host.docker.internal:8080/api/v1)
 *
 * Test Pool:
 *   Races: human, elf, dwarf, half-elf, tiefling (5)
 *   Classes: fighter, wizard, rogue, bard, ranger (5)
 *   Backgrounds: acolyte, soldier, sage, criminal (4)
 *   = 100 unique combinations
 *
 * What it tests:
 *   - Character creation with race
 *   - Adding a class
 *   - Setting background and ability scores
 *   - Resolving all pending choices (proficiencies, languages, equipment, spells, ability scores)
 *   - Stats calculation endpoint
 *   - Summary/validation endpoint
 *
 * Known limitations:
 *   - Level 1 subclass selection (Cleric, Sorcerer, Warlock) not yet implemented
 *   - Subrace selection not yet implemented
 *   - Some optional_feature choices may show warnings but don't block completion
 *   - Ability score choices (Half-Elf) require backend support (#161, #352)
 *
 * @see docs/plans/2025-12-07-character-stress-test-script.md
 */

// ════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════

// Use host.docker.internal when running inside Docker container
const API_BASE = process.env.API_BASE_URL || 'http://host.docker.internal:8080/api/v1'

interface CliOptions {
  count: number
  verbose: boolean
  dryRun: boolean
  cleanup: boolean
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    count: 10,
    verbose: false,
    dryRun: false,
    cleanup: false
  }

  for (const arg of args) {
    if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1], 10)
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--cleanup') {
      options.cleanup = true
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Character Stress Test Script

Usage: npm run test:character-stress -- [options]

Options:
  --count=N    Number of characters to create (default: 10)
  --verbose    Show detailed output for each step
  --dry-run    Show what would happen without making API calls
  --cleanup    Delete characters after creation (default: keep them)
  --help       Show this help message
`)
      process.exit(0)
    }
  }

  return options
}

// ════════════════════════════════════════════════════════════════
// TEST POOL
// ════════════════════════════════════════════════════════════════

const TEST_POOL = {
  races: [
    'phb:human', // Simple, 1 language choice
    'phb:elf', // Has subraces (will use base for now)
    'phb:dwarf', // Has subraces (will use base for now)
    'phb:half-elf', // Multiple choices (skills, languages)
    'phb:tiefling' // No subraces, racial spells
  ],
  classes: [
    'phb:fighter', // Fighting style, multiple equipment choices
    'phb:wizard', // Spellcaster with spell selection
    'phb:rogue', // Expertise choices
    'phb:bard', // Jack of all trades, spells
    'phb:ranger' // Fighting style, spells
  ],
  backgrounds: [
    'phb:acolyte', // Languages
    'phb:soldier', // Gaming set choice
    'phb:sage', // Languages
    'phb:criminal' // Tool proficiency
  ]
}

// ════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function generateCharacterName(): string {
  const prefixes = ['Thorin', 'Lyria', 'Grok', 'Elara', 'Vex', 'Zara', 'Kael', 'Mira', 'Drax', 'Nova']
  const suffixes = ['Stoneshield', 'Moonwhisper', 'Ironfist', 'Shadowstep', 'Brightblade', 'Darkhollow']
  return `${pickRandom(prefixes)} ${pickRandom(suffixes)}`
}

function generatePublicId(): string {
  const adjectives = ['swift', 'brave', 'shadow', 'iron', 'storm', 'frost', 'flame', 'wild']
  const nouns = ['wolf', 'hawk', 'bear', 'dragon', 'phoenix', 'raven', 'tiger', 'serpent']
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${pickRandom(adjectives)}-${pickRandom(nouns)}-${suffix}`
}

// ════════════════════════════════════════════════════════════════
// API HELPERS
// ════════════════════════════════════════════════════════════════

interface ApiError extends Error {
  status?: number
  body?: unknown
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    let errorBody: unknown
    let errorMessage = `API error: ${response.status} ${response.statusText}`

    try {
      errorBody = await response.json()
      // Extract Laravel validation errors
      if (errorBody && typeof errorBody === 'object' && 'message' in errorBody) {
        errorMessage = (errorBody as { message: string }).message
      }
      if (errorBody && typeof errorBody === 'object' && 'errors' in errorBody) {
        const errors = (errorBody as { errors: Record<string, string[]> }).errors
        const firstError = Object.values(errors)[0]?.[0]
        if (firstError) errorMessage = firstError
      }
    } catch {
      // Response wasn't JSON
    }

    const error: ApiError = new Error(errorMessage)
    error.status = response.status
    error.body = errorBody
    throw error
  }

  return response.json()
}

async function createCharacter(name: string, publicId: string, raceSlug: string): Promise<{ id: number, public_id: string }> {
  const response = await apiFetch<{ data: { id: number, public_id: string } }>('/characters', {
    method: 'POST',
    body: JSON.stringify({
      name,
      public_id: publicId,
      race_slug: raceSlug
    })
  })
  return response.data
}

async function addClass(characterId: number, classSlug: string): Promise<void> {
  await apiFetch(`/characters/${characterId}/classes`, {
    method: 'POST',
    body: JSON.stringify({
      class_slug: classSlug,
      force: true // Skip multiclass prereqs for initial class
    })
  })
}

async function updateCharacter(characterId: number, data: Record<string, unknown>): Promise<void> {
  await apiFetch(`/characters/${characterId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

async function deleteCharacter(characterId: number): Promise<void> {
  await apiFetch(`/characters/${characterId}`, {
    method: 'DELETE'
  })
}

async function getStats(characterId: number): Promise<Record<string, unknown>> {
  const response = await apiFetch<{ data: Record<string, unknown> }>(`/characters/${characterId}/stats`)
  return response.data
}

async function getSummary(characterId: number): Promise<{ creation_complete: boolean, missing_required: string[] }> {
  const response = await apiFetch<{ data: { creation_complete: boolean, missing_required: string[] } }>(
    `/characters/${characterId}/summary`
  )
  return response.data
}

async function checkApiConnectivity(): Promise<boolean> {
  try {
    await apiFetch('/races?per_page=1')
    return true
  } catch (err) {
    console.error('❌ Cannot connect to API at', API_BASE)
    console.error('')
    console.error('💡 Make sure the backend is running:')
    console.error('   cd ../importer && docker compose up -d')
    console.error('')
    return false
  }
}

// ════════════════════════════════════════════════════════════════
// CHOICE TYPES
// ════════════════════════════════════════════════════════════════

interface ChoiceOption {
  slug?: string // Source-prefixed (e.g., "phb:fireball") - see #506
  code?: string // For ability_score choices (STR, DEX, etc.)
  name: string
  option?: string // "a" or "b" for equipment
  items?: Array<{ slug: string, is_fixed: boolean }>
  is_category?: boolean
  is_fixed?: boolean
}

interface PendingChoice {
  id: string
  type: string
  subtype?: string
  source: string
  source_name: string
  required: boolean
  quantity: number
  remaining: number
  selected: string[]
  options: ChoiceOption[]
  options_endpoint?: string
  metadata?: {
    known_languages?: string[]
    choice_group?: string
  }
}

interface PendingChoicesResponse {
  data: {
    choices: PendingChoice[]
    summary: {
      total_pending: number
      required_pending: number
    }
  }
}

// ════════════════════════════════════════════════════════════════
// CHOICE RESOLUTION
// ════════════════════════════════════════════════════════════════

async function getPendingChoices(characterId: number): Promise<PendingChoice[]> {
  const response = await apiFetch<PendingChoicesResponse>(`/characters/${characterId}/pending-choices`)
  return response.data.choices
}

async function resolveChoice(
  characterId: number,
  choiceId: string,
  payload: { selected: string[], item_selections?: Record<string, string[]> }
): Promise<void> {
  const encodedId = encodeURIComponent(choiceId)
  await apiFetch(`/characters/${characterId}/choices/${encodedId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

async function fetchOptionsFromEndpoint(endpoint: string): Promise<Array<{ slug: string, name: string }>> {
  // The endpoint is relative to the API, e.g., "/api/v1/characters/13/available-spells"
  // We need to call it relative to our API_BASE
  const cleanEndpoint = endpoint.replace('/api/v1', '')

  const response = await apiFetch<{ data: Array<{ slug: string, name: string }> | null }>(cleanEndpoint)

  // Handle null/undefined data
  if (!response.data || !Array.isArray(response.data)) {
    return []
  }

  return response.data
}

async function pickRandomChoiceSelection(choice: PendingChoice): Promise<{ selected: string[], item_selections?: Record<string, string[]> }> {
  switch (choice.type) {
    case 'proficiency':
    case 'language':
    case 'expertise': {
      // Filter out already-known items if metadata provides them
      const known = choice.metadata?.known_languages || []
      const available = choice.options
        .map(o => o.slug)
        .filter((slug): slug is string => !!slug && !known.includes(slug))

      // Use quantity (total needed) not remaining (may be partially filled)
      const needed = choice.quantity

      if (available.length < needed) {
        console.warn(`    ⚠️  Not enough options for ${choice.type}: need ${needed}, have ${available.length}`)
        return { selected: pickRandomN(available, available.length) }
      }

      return { selected: pickRandomN(available, needed) }
    }

    case 'equipment': {
      // Equipment choices have options like {option: "a", items: [...]}
      const equipOption = pickRandom(choice.options)

      if (equipOption.is_category && equipOption.items) {
        // Need to pick specific items from category
        const selectableItems = equipOption.items.filter(i => !i.is_fixed)

        // Pick one item from the category
        const pickedItem = pickRandom(selectableItems.map(i => i.slug))

        // Backend expects item_selections as object keyed by option letter
        return {
          selected: [equipOption.option!],
          item_selections: { [equipOption.option!]: [pickedItem] }
        }
      }

      // Simple a/b/c choice - must be array
      return { selected: [equipOption.option!] }
    }

    case 'spell': {
      // Spells typically use options_endpoint for dynamic filtering
      if (choice.options_endpoint && (!choice.options || choice.options.length === 0)) {
        try {
          const spells = await fetchOptionsFromEndpoint(choice.options_endpoint)
          if (!spells || spells.length === 0) {
            console.warn(`    ⚠️  No spells available from endpoint`)
            return { selected: [] }
          }
          const spellSlugs = spells.map(s => s.slug).filter(Boolean)
          return { selected: pickRandomN(spellSlugs, Math.min(choice.quantity, spellSlugs.length)) }
        } catch (err) {
          console.warn(`    ⚠️  Failed to fetch spells: ${err instanceof Error ? err.message : String(err)}`)
          return { selected: [] }
        }
      }

      // Use inline options if provided
      const available = (choice.options || [])
        .map(o => o.slug)
        .filter((slug): slug is string => !!slug)

      if (available.length === 0) {
        console.warn(`    ⚠️  No spell options available`)
        return { selected: [] }
      }

      return { selected: pickRandomN(available, Math.min(choice.quantity, available.length)) }
    }

    case 'fighting_style':
    case 'optional_feature': {
      // These may also use options_endpoint
      if (choice.options_endpoint && (!choice.options || choice.options.length === 0)) {
        try {
          const features = await fetchOptionsFromEndpoint(choice.options_endpoint)
          if (features.length === 0) {
            console.warn(`    ⚠️  No options available from ${choice.options_endpoint}`)
            return { selected: [] }
          }
          return { selected: pickRandomN(features.map(f => f.slug), Math.min(choice.remaining, features.length)) }
        } catch (err) {
          console.warn(`    ⚠️  Failed to fetch options: ${err instanceof Error ? err.message : String(err)}`)
          return { selected: [] }
        }
      }

      const available = (choice.options || [])
        .map(o => o.slug)
        .filter((slug): slug is string => !!slug)

      return { selected: pickRandomN(available, Math.min(choice.quantity, available.length)) }
    }

    case 'ability_score': {
      // Ability score choices (e.g., Half-Elf +1 to two abilities)
      // Options have 'code' property (STR, DEX, CON, INT, WIS, CHA)
      const available = (choice.options || [])
        .map(o => o.code)
        .filter((code): code is string => !!code)

      if (available.length < choice.quantity) {
        console.warn(`    ⚠️  Not enough ability score options: need ${choice.quantity}, have ${available.length}`)
        return { selected: pickRandomN(available, available.length) }
      }

      return { selected: pickRandomN(available, choice.quantity) }
    }

    default:
      console.warn(`    ⚠️  Unknown choice type: ${choice.type}`)
      return { selected: [] }
  }
}

async function resolveAllChoices(characterId: number, verbose: boolean): Promise<number> {
  let resolved = 0
  let iterations = 0
  const maxIterations = 20 // Safety limit

  while (iterations < maxIterations) {
    iterations++
    const choices = await getPendingChoices(characterId)
    const pendingRequired = choices.filter(c => c.required && c.remaining > 0)

    if (pendingRequired.length === 0) {
      if (verbose) console.log(`    ✓ All choices resolved after ${iterations} iteration(s)`)
      break
    }

    if (verbose) {
      console.log(`    📋 Iteration ${iterations}: ${pendingRequired.length} choices remaining`)
    }

    for (const choice of pendingRequired) {
      try {
        const selection = await pickRandomChoiceSelection(choice)

        if (verbose) {
          const selStr = selection.selected.join(', ')
          console.log(`       → ${choice.type} (${choice.source_name}): ${selStr}`)
        }

        // Skip empty selections
        if (selection.selected.length === 0) {
          continue
        }

        await resolveChoice(characterId, choice.id, selection)
        resolved++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn(`    ⚠️  Failed to resolve ${choice.id}: ${msg}`)
      }
    }
  }

  if (iterations >= maxIterations) {
    console.warn(`    ⚠️  Hit max iterations (${maxIterations}) - some choices may be unresolved`)
  }

  return resolved
}

// ════════════════════════════════════════════════════════════════
// RESULT TRACKING
// ════════════════════════════════════════════════════════════════

interface CharacterResult {
  iteration: number
  name: string
  race: string
  class: string
  background: string
  status: 'success' | 'error'
  error?: string
  timing: {
    create: number
    choices: number
    validate: number
    total: number
  }
  validation: {
    isComplete: boolean
    missing: string[]
  }
}

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`
}

function printSummary(results: CharacterResult[]): void {
  const successful = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'error')
  const avgTime = results.reduce((sum, r) => sum + r.timing.total, 0) / results.length

  console.log('')
  console.log('═'.repeat(65))
  console.log(`Summary: ${successful.length}/${results.length} successful (${Math.round(successful.length / results.length * 100)}%)`)
  console.log(`Average time: ${formatDuration(avgTime)} per character`)

  if (failed.length > 0) {
    console.log('')
    console.log('Errors:')
    for (const result of failed) {
      console.log(`  - [${result.iteration}] ${result.race}/${result.class}/${result.background}: ${result.error}`)
    }
  }

  const incomplete = successful.filter(r => !r.validation.isComplete)
  if (incomplete.length > 0) {
    console.log('')
    console.log('Incomplete (missing required):')
    for (const result of incomplete) {
      console.log(`  - [${result.iteration}] ${result.name}: ${result.validation.missing.join(', ')}`)
    }
  }

  console.log('═'.repeat(65))
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════

async function main() {
  const options = parseArgs()

  console.log('🎲 Character Stress Test')
  console.log(`   Creating ${options.count} characters...`)
  console.log(`   API: ${API_BASE}`)
  if (options.dryRun) console.log('   (DRY RUN - no API calls)')
  if (options.cleanup) console.log('   (CLEANUP - characters will be deleted after creation)')
  console.log('')

  if (options.dryRun) {
    console.log('Dry run - showing what would be created:')
    for (let i = 1; i <= options.count; i++) {
      const race = pickRandom(TEST_POOL.races)
      const cls = pickRandom(TEST_POOL.classes)
      const bg = pickRandom(TEST_POOL.backgrounds)
      const name = generateCharacterName()
      console.log(`  [${i}] "${name}" (${race.split(':')[1]}/${cls.split(':')[1]}/${bg.split(':')[1]})`)
    }
    return
  }

  // Check API connectivity
  const connected = await checkApiConnectivity()
  if (!connected) {
    process.exit(1)
  }
  console.log('✓ API connected')
  console.log('')

  const results: CharacterResult[] = []

  for (let i = 1; i <= options.count; i++) {
    const race = pickRandom(TEST_POOL.races)
    const cls = pickRandom(TEST_POOL.classes)
    const background = pickRandom(TEST_POOL.backgrounds)
    const name = generateCharacterName()
    const publicId = generatePublicId()

    const result: CharacterResult = {
      iteration: i,
      name,
      race: race.split(':')[1],
      class: cls.split(':')[1],
      background: background.split(':')[1],
      status: 'success',
      timing: { create: 0, choices: 0, validate: 0, total: 0 },
      validation: { isComplete: false, missing: [] }
    }

    const startTotal = Date.now()
    let characterId: number | null = null

    try {
      // Step 1: Create character with race
      const startCreate = Date.now()
      const created = await createCharacter(name, publicId, race)
      characterId = created.id
      result.timing.create = Date.now() - startCreate

      if (options.verbose) {
        console.log(`[${i}/${options.count}] Creating "${name}" (${result.race}/${result.class}/${result.background})...`)
      }

      // Step 2: Add class
      await addClass(characterId, cls)

      // Step 3: Set background and ability scores
      await updateCharacter(characterId, {
        background_slug: background,
        ability_score_method: 'standard_array',
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      })

      // Step 4: Resolve all pending choices
      const startChoices = Date.now()
      await resolveAllChoices(characterId, options.verbose)
      result.timing.choices = Date.now() - startChoices

      // Step 5: Validate
      const startValidate = Date.now()
      const summary = await getSummary(characterId)
      result.validation.isComplete = summary.creation_complete
      result.validation.missing = summary.missing_required || []

      // Also get stats to verify calculations work
      await getStats(characterId)
      result.timing.validate = Date.now() - startValidate
    } catch (err) {
      result.status = 'error'
      result.error = err instanceof Error ? err.message : String(err)
    } finally {
      result.timing.total = Date.now() - startTotal

      // Cleanup: delete the character only if --cleanup flag is set
      if (options.cleanup && characterId) {
        try {
          await deleteCharacter(characterId)
        } catch {
          // Ignore cleanup errors
        }
      }
    }

    results.push(result)

    // Print result line
    const statusIcon = result.status === 'success'
      ? (result.validation.isComplete ? '✓' : '⚠')
      : '✗'
    const statusColor = result.status === 'success' ? '' : ' - ERROR'
    console.log(
      `[${i}/${options.count}] ${statusIcon} "${name}" (${result.race}/${result.class}/${result.background}) - ${formatDuration(result.timing.total)}${statusColor}`
    )

    if (result.status === 'error' && options.verbose) {
      console.log(`         ${result.error}`)
    }
  }

  printSummary(results)
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message)
  process.exit(1)
})
