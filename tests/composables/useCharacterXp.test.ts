// tests/composables/useCharacterXp.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'

// Import after mocks
import { useCharacterXp } from '~/composables/useCharacterXp'

// Mock useApi
const apiFetchMock = vi.fn()
mockNuxtImport('useApi', () => () => ({
  apiFetch: apiFetchMock
}))

const mockXpResponse = {
  data: {
    experience_points: 6500,
    level: 5,
    next_level_xp: 14000,
    xp_to_next_level: 7500,
    xp_progress_percent: 46.67,
    is_max_level: false
  }
}

const mockMaxLevelResponse = {
  data: {
    experience_points: 355000,
    level: 20,
    next_level_xp: null,
    xp_to_next_level: 0,
    xp_progress_percent: 100,
    is_max_level: true
  }
}

describe('useCharacterXp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiFetchMock.mockResolvedValue(mockXpResponse)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('fetches XP data on init when characterId is provided', async () => {
      const characterId = ref('abc-123')
      useCharacterXp(characterId)

      await flushPromises()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/abc-123/xp')
    })

    it('does not fetch when characterId is null', async () => {
      const characterId = ref<string | null>(null)
      useCharacterXp(characterId)

      await flushPromises()

      expect(apiFetchMock).not.toHaveBeenCalled()
    })

    it('fetches when characterId changes from null to value', async () => {
      const characterId = ref<string | null>(null)
      useCharacterXp(characterId)

      await flushPromises()
      expect(apiFetchMock).not.toHaveBeenCalled()

      characterId.value = 'new-char-id'
      await nextTick()
      await flushPromises()

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/new-char-id/xp')
    })
  })

  describe('reactive state', () => {
    it('returns correct xpData after fetch', async () => {
      const characterId = ref('abc-123')
      const { xpData } = useCharacterXp(characterId)

      await flushPromises()

      expect(xpData.value).toEqual(mockXpResponse.data)
    })

    it('sets pending to true during fetch', async () => {
      const characterId = ref('abc-123')
      apiFetchMock.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockXpResponse), 100)))

      const { pending } = useCharacterXp(characterId)

      expect(pending.value).toBe(true)

      await flushPromises()
    })

    it('sets pending to false after fetch completes', async () => {
      const characterId = ref('abc-123')
      const { pending } = useCharacterXp(characterId)

      await flushPromises()

      expect(pending.value).toBe(false)
    })

    it('sets error on fetch failure', async () => {
      const characterId = ref('abc-123')
      apiFetchMock.mockRejectedValue(new Error('Network error'))

      const { error } = useCharacterXp(characterId)

      await flushPromises()

      expect(error.value).toBe('Network error')
    })
  })

  describe('computed values', () => {
    it('returns formatted current XP with commas', async () => {
      const characterId = ref('abc-123')
      const { formattedCurrentXp } = useCharacterXp(characterId)

      await flushPromises()

      expect(formattedCurrentXp.value).toBe('6,500')
    })

    it('returns formatted next level XP with commas', async () => {
      const characterId = ref('abc-123')
      const { formattedNextLevelXp } = useCharacterXp(characterId)

      await flushPromises()

      expect(formattedNextLevelXp.value).toBe('14,000')
    })

    it('returns progress percent', async () => {
      const characterId = ref('abc-123')
      const { progressPercent } = useCharacterXp(characterId)

      await flushPromises()

      expect(progressPercent.value).toBe(46.67)
    })

    it('returns isMaxLevel correctly for non-max level', async () => {
      const characterId = ref('abc-123')
      const { isMaxLevel } = useCharacterXp(characterId)

      await flushPromises()

      expect(isMaxLevel.value).toBe(false)
    })

    it('returns isMaxLevel true for level 20', async () => {
      const characterId = ref('abc-123')
      apiFetchMock.mockResolvedValue(mockMaxLevelResponse)

      const { isMaxLevel } = useCharacterXp(characterId)

      await flushPromises()

      expect(isMaxLevel.value).toBe(true)
    })
  })

  describe('updateXp', () => {
    it('calls POST endpoint with new XP value', async () => {
      const characterId = ref('abc-123')
      apiFetchMock
        .mockResolvedValueOnce(mockXpResponse) // Initial fetch
        .mockResolvedValueOnce({ data: { ...mockXpResponse.data, experience_points: 7000 } }) // POST
        .mockResolvedValueOnce({ data: { ...mockXpResponse.data, experience_points: 7000 } }) // Refresh

      const { updateXp } = useCharacterXp(characterId)

      await flushPromises()

      await updateXp(7000)

      expect(apiFetchMock).toHaveBeenCalledWith('/characters/abc-123/xp', {
        method: 'POST',
        body: { experience_points: 7000 }
      })
    })

    it('refreshes XP data after successful update', async () => {
      const characterId = ref('abc-123')
      const updatedXpResponse = {
        data: { ...mockXpResponse.data, experience_points: 7000, xp_progress_percent: 50 }
      }
      apiFetchMock
        .mockResolvedValueOnce(mockXpResponse) // Initial fetch
        .mockResolvedValueOnce(updatedXpResponse) // POST returns updated data

      const { updateXp, xpData } = useCharacterXp(characterId)

      await flushPromises()
      expect(xpData.value?.experience_points).toBe(6500)

      await updateXp(7000)

      expect(xpData.value?.experience_points).toBe(7000)
    })

    it('throws error if update fails', async () => {
      const characterId = ref('abc-123')
      apiFetchMock
        .mockResolvedValueOnce(mockXpResponse)
        .mockRejectedValueOnce(new Error('Update failed'))

      const { updateXp } = useCharacterXp(characterId)

      await flushPromises()

      await expect(updateXp(7000)).rejects.toThrow('Update failed')
    })
  })

  describe('refresh', () => {
    it('re-fetches XP data', async () => {
      const characterId = ref('abc-123')
      const { refresh } = useCharacterXp(characterId)

      await flushPromises()
      expect(apiFetchMock).toHaveBeenCalledTimes(1)

      await refresh()

      expect(apiFetchMock).toHaveBeenCalledTimes(2)
    })
  })
})
