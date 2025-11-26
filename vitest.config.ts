import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,

    // ==========================================================================
    // EXCLUDE E2E TESTS - They use Playwright and require a browser
    // ==========================================================================
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // Playwright E2E tests
      '**/*.spec.ts' // E2E tests use .spec.ts convention
    ],

    // ==========================================================================
    // RESOURCE MANAGEMENT - Prevents CPU spikes in Docker
    // ==========================================================================
    // Each test file creates a Nuxt environment. Too many parallel workers
    // overwhelm Docker's memory, causing swap thrashing and CPU spikes.
    // ==========================================================================

    // Use 'forks' pool for better isolation (each test file in separate process)
    pool: 'forks',
    poolOptions: {
      forks: {
        // Limit concurrent test files to prevent memory explosion
        // Adjust based on available Docker memory (2 is safe for 4GB)
        maxForks: 2,
        minForks: 1
      }
    },

    // Ensure tests within a file run sequentially (not concurrently)
    sequence: {
      concurrent: false
    },

    // Isolate each test file for cleaner state
    isolate: true,

    // ==========================================================================

    environmentOptions: {
      nuxt: {
        mock: {
          indexHtml: false
        },
        overrides: {
          appManifest: false,
          routeRules: {}
        }
      }
    }
  }
})
