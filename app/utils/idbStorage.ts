import { get, set, del } from 'idb-keyval'

/**
 * IndexedDB storage adapter for pinia-plugin-persistedstate.
 *
 * Uses idb-keyval for simple key-value storage in IndexedDB.
 * All methods are async but the plugin handles this internally.
 * Errors are caught and logged to prevent app crashes.
 */
export const idbStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await get<string>(key)
      return value ?? null
    } catch (e) {
      console.warn(`[idbStorage] Failed to get "${key}":`, e)
      return null
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await set(key, value)
    } catch (e) {
      console.warn(`[idbStorage] Failed to set "${key}":`, e)
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await del(key)
    } catch (e) {
      console.warn(`[idbStorage] Failed to remove "${key}":`, e)
    }
  }
}
