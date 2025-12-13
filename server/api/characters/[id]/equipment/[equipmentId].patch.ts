/**
 * Update equipment for character - Proxies to Laravel backend
 *
 * Used for equip/unequip actions by changing location:
 * - 'main_hand', 'off_hand' - wielded weapons/shields
 * - 'head', 'neck', 'cloak', 'armor', 'belt', 'hands', 'feet' - body slots
 * - 'ring_1', 'ring_2' - ring slots
 * - 'backpack' - stored/unequipped
 *
 * Attunement is handled separately via 'is_attuned' boolean field.
 *
 * @example PATCH /api/characters/1/equipment/5
 * Body: { location: 'armor' }
 * Body: { location: 'ring_1', is_attuned: true }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const equipmentId = getRouterParam(event, 'equipmentId')
  const body = await readBody(event)

  try {
    const data = await $fetch(
      `${config.apiBaseServer}/characters/${id}/equipment/${equipmentId}`,
      { method: 'PATCH', body }
    )
    return data
  } catch (error: unknown) {
    const err = error as { statusCode?: number, statusMessage?: string, data?: unknown }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update equipment',
      data: err.data
    })
  }
})
