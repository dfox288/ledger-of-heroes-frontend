import { defineNuxtPlugin } from '#app'
import type { Pinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/**
 * Client-side only Pinia persistence plugin.
 *
 * This plugin configures pinia-plugin-persistedstate to work with
 * our IndexedDB adapter. The .client.ts suffix ensures this only
 * runs in the browser (IndexedDB is not available during SSR).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as Pinia
  pinia.use(piniaPluginPersistedstate)
})
