# Testing Guide

This guide covers unit tests (Vitest), integration tests (MSW), and E2E tests (Playwright).

---

## What Makes a Good Test

### Test Behavior, Not Implementation

```typescript
// GOOD - Tests what the user sees/does
it('displays spell level and school', async () => {
  const wrapper = await mountSuspended(SpellCard, { props: { spell: mockSpell } })
  expect(wrapper.text()).toContain('Level 3')
  expect(wrapper.text()).toContain('Evocation')
})

// BAD - Tests implementation details
it('calls the formatLevel method', async () => {
  const wrapper = await mountSuspended(SpellCard, { props: { spell: mockSpell } })
  expect(wrapper.vm.formatLevel).toHaveBeenCalled() // Fragile!
})
```

### One Assertion Per Concept

```typescript
// GOOD - Clear what failed
it('shows error state when fetch fails', async () => {
  // Arrange: Set up error condition
  server.use(http.get('/api/spells', () => HttpResponse.error()))

  // Act: Mount and trigger
  const wrapper = await mountSuspended(SpellList)
  await flushPromises()

  // Assert: One concept
  expect(wrapper.text()).toContain('Failed to load spells')
})

// BAD - Multiple unrelated assertions
it('handles everything', async () => {
  expect(wrapper.find('.header')).toBeDefined()
  expect(wrapper.text()).toContain('Spells')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(wrapper.vm.isLoading).toBe(false)
})
```

### Arrange-Act-Assert Pattern

```typescript
it('filters spells by level when level is selected', async () => {
  // ARRANGE - Set up test conditions
  const wrapper = await mountSuspended(SpellList)
  const levelFilter = wrapper.find('[data-testid="level-filter"]')

  // ACT - Perform the action being tested
  await levelFilter.setValue('3')
  await flushPromises()

  // ASSERT - Verify the outcome
  expect(wrapper.findAll('.spell-card')).toHaveLength(5)
})
```

### Avoid Test Interdependence

Each test should be independent. Never rely on state from previous tests:

```typescript
// GOOD - Each test sets up its own state
describe('SpellFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia()) // Fresh store each test
  })

  it('test one', () => { /* ... */ })
  it('test two', () => { /* ... */ }) // Doesn't depend on test one
})
```

---

## Test Import Alias

Use the `#tests` alias for all test imports. This is configured in `vitest.config.ts`:

```typescript
// CORRECT - Use #tests alias
import { mockSpell } from '#tests/fixtures/spells'
import { setupWizardStore } from '#tests/helpers/wizardTestSetup'
import { server, http, HttpResponse } from '#tests/msw/server'

// WRONG - Relative imports
import { mockSpell } from '../../fixtures/spells'
import { server } from '../msw/server'
```

**Directory structure:**
- `#tests/helpers/` - Test utilities and setup functions
- `#tests/fixtures/` - Static fixture data (spells, equipment, etc.)
- `#tests/msw/fixtures/` - Character and party fixtures for MSW
- `#tests/msw/handlers/` - MSW request handlers
- `#tests/msw/server` - MSW server setup

---

## Unit Testing (Vitest)

### Basic Component Test

```typescript
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'
import SpellCard from '~/components/spell/Card.vue'
import { createMockSpell } from '#tests/helpers/mockFactories'

describe('SpellCard', () => {
  it('displays spell name and level', async () => {
    const wrapper = await mountSuspended(SpellCard, {
      props: { spell: mockSpell }
    })

    expect(wrapper.text()).toContain('Fireball')
    expect(wrapper.text()).toContain('Level 3')
  })
})
```

### Testing with Pinia Stores

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useSpellFiltersStore } from '~/stores/spellFilters'

describe('SpellFiltersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useSpellFiltersStore()
    expect(store.selectedLevels).toEqual([])
    expect(store.searchQuery).toBe('')
  })

  it('updates filters correctly', () => {
    const store = useSpellFiltersStore()
    store.setLevels([1, 2, 3])
    expect(store.selectedLevels).toEqual([1, 2, 3])
  })
})
```

### Mock Composable Pattern (Nuxt)

For Nuxt components, use `mockNuxtImport` at module level:

```typescript
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// Module-level mock (required for Nuxt auto-imports)
const toastMock = { add: vi.fn() }
mockNuxtImport('useToast', () => () => toastMock)

describe('MyComponent', () => {
  beforeEach(() => {
    toastMock.add.mockClear()
  })

  it('shows toast on error', async () => {
    // ... trigger error ...
    expect(toastMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'error' })
    )
  })
})
```

### Vitest Expectations Quick Reference

```typescript
expect(value).toBe(expected)           // Strict equality (===)
expect(value).toEqual(expected)        // Deep equality
expect(array).toHaveLength(5)
expect(wrapper).toBeDefined()
expect(array).toContain('item')
expect(string).toMatch(/pattern/)
expect(fn).toHaveBeenCalledWith(arg)
expect(fn).toHaveBeenCalledTimes(2)
```

---

## Integration Testing (MSW)

MSW (Mock Service Worker) intercepts network requests for realistic API testing.

### When to Use MSW vs vi.mock()

| Approach | Use For |
|----------|---------|
| **vi.mock()** | Unit tests, isolated component logic |
| **MSW** | Integration tests, API flow testing, error handling |

### Basic MSW Setup

```typescript
import { server, http, HttpResponse } from '@/tests/msw/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('loads character data', async () => {
  const response = await fetch('/api/characters/1')
  const data = await response.json()
  expect(data.data.name).toBe('Thorin Ironforge')
})

// Override handler for specific test
it('handles API errors', async () => {
  server.use(
    http.get('/api/characters/:id', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    })
  )
  // Test error handling...
})
```

### MSW Directory Structure

```
tests/
├── msw/
│   ├── server.ts           # MSW server setup
│   ├── handlers/
│   │   ├── index.ts        # All handlers export
│   │   ├── characters.ts   # Character endpoints
│   │   └── reference.ts    # Reference data endpoints
│   └── fixtures/
│       └── characters/
│           ├── human-fighter-l1.ts
│           └── draft-cleric-l1.ts
└── integration/            # Tests using MSW
```

### Adding New Fixtures

1. Create fixture in `tests/msw/fixtures/` based on API types
2. Add handler in `tests/msw/handlers/` to serve fixture
3. Export from `handlers/index.ts`

---

## Wizard Test Helpers

Consolidated helpers for testing character wizard components in `tests/helpers/`.

| Helper | Purpose | Usage |
|--------|---------|-------|
| `wizardTestSetup.ts` | Store setup, mock factories | Component tests |
| `characterSheetStubs.ts` | CharacterSheet* component stubs | StepReview, level-up tests |
| `integrationSetup.ts` | MSW + Pinia lifecycle | Integration tests |

### Store Setup

```typescript
import { setupWizardStore } from '@/tests/helpers/wizardTestSetup'

const store = setupWizardStore({
  race: { id: 1, name: 'Human', slug: 'phb:human' },
  class: { id: 1, name: 'Fighter', slug: 'phb:fighter' }
})
```

### Character Sheet Stubs

```typescript
import { characterSheetStubs } from '@/tests/helpers/characterSheetStubs'

const wrapper = await mountSuspended(StepReview, {
  global: { stubs: characterSheetStubs, plugins: [pinia] }
})
```

### Integration Test Setup

```typescript
import { useIntegrationTestSetup } from '@/tests/helpers/integrationSetup'

describe('My Integration Test', () => {
  useIntegrationTestSetup() // Replaces ~15 lines of MSW/Pinia boilerplate

  it('tests something', async () => {
    // MSW server running, fresh Pinia each test
  })
})
```

---

## E2E Testing (Playwright)

### When to Write E2E vs Unit Tests

| Test Type | Use For | Examples |
|-----------|---------|----------|
| **Unit** | Component logic, store actions | SpellCard renders, filter store updates |
| **Integration** | API flows, error handling | Character save fails gracefully |
| **E2E** | Critical user journeys | Character creation wizard, login flow |

**Rule of thumb:** E2E tests are expensive. Use them for flows that cross multiple pages or require real browser behavior.

### Playwright AI Agents

Three AI-powered agents automate E2E test creation:

| Agent | Purpose | Output |
|-------|---------|--------|
| **Planner** | Explores app, identifies user flows | Markdown test plan in `specs/` |
| **Generator** | Converts plans to executable tests | Test files in `tests/e2e/` |
| **Healer** | Runs tests, auto-fixes failures | Updated test files |

### Agent Usage

```bash
# Plan tests for a feature
"Use the playwright-test-planner agent to create a test plan for the character wizard"

# Generate tests from a plan
"Use the playwright-test-generator agent to generate tests from specs/character-wizard.md"

# Fix failing tests
"Use the playwright-test-healer agent to fix the failing E2E tests"
```

### Agent Workflow

1. **Plan** -> Agent explores the app via browser, produces `specs/feature-name.md`
2. **Generate** -> Agent reads plan, executes steps live, writes test file
3. **Heal** -> Agent runs tests, debugs failures, patches locators/assertions

### Running E2E Tests Manually

```bash
npm run test:e2e           # Headless (CI)
npm run test:e2e:ui        # Interactive UI mode
npm run test:e2e:headed    # Visible browser
npm run test:e2e:report    # View HTML report
```

### Configuration Files

```
.claude/agents/
├── playwright-test-planner.md    # Test planning agent
├── playwright-test-generator.md  # Test generation agent
└── playwright-test-healer.md     # Test healing agent

.mcp.json                         # Playwright MCP server config
```

**Docs:** https://playwright.dev/docs/test-agents
