/**
 * Level up character in a class - Proxies to Laravel backend
 *
 * @example POST /api/characters/arcane-phoenix-M7k2/classes/phb:fighter/level-up
 * @returns LevelUpResult with previous_level, new_level, features_gained, etc.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const classId = getRouterParam(event, 'classId')

  const data = await $fetch(
    `${config.apiBaseServer}/characters/${id}/classes/${classId}/level-up`,
    { method: 'POST' }
  )
  return data
})
