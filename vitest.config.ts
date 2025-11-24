import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000, // Increase timeout from 5s to 10s
    environmentOptions: {
      nuxt: {
        mock: {
          indexHtml: false
        },
        overrides: {
          appManifest: false // Disable app manifest to prevent fetch errors
        }
      }
    }
  }
})
