import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ItemsIndexPage from '~/pages/items/index.vue'

describe('Items Strength Requirement Filter', () => {
  it('has strength requirement filter state', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have selectedStrengthReq ref
    expect(component.selectedStrengthReq).toBeDefined()
    expect(component.selectedStrengthReq).toBeNull()
  })

  it('has correct strength requirement options', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have strengthReqOptions
    expect(component.strengthReqOptions).toBeDefined()
    expect(Array.isArray(component.strengthReqOptions)).toBe(true)
    expect(component.strengthReqOptions.length).toBe(3)

    // Verify option labels
    const labels = component.strengthReqOptions.map((o: any) => o.label)
    expect(labels).toContain('Any')
    expect(labels).toContain('STR 13+')
    expect(labels).toContain('STR 15+')
  })

  it('shows strength requirement filter chip when selected', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedStrengthReq = '13'
    await wrapper.vm.$nextTick()

    const chips = wrapper.findAll('button').filter(btn =>
      btn.text().includes('STR 13+') && btn.text().includes('✕')
    )
    expect(chips.length).toBeGreaterThan(0)
  })

  it('clicking strength requirement chip clears the filter', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedStrengthReq = '15'
    await wrapper.vm.$nextTick()

    const chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('STR 15+') && btn.text().includes('✕')
    )
    expect(chip).toBeDefined()
    await chip!.trigger('click')

    expect(component.selectedStrengthReq).toBeNull()
  })

  it('generates correct filter for STR 13+', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedStrengthReq = '13'
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('strength_requirement > 13')
  })

  it('generates correct filter for STR 15+', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedStrengthReq = '15'
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('strength_requirement > 15')
  })
})

describe('Items Damage Dice Filter', () => {
  it('has damage dice filter state', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have selectedDamageDice ref
    expect(component.selectedDamageDice).toBeDefined()
    expect(Array.isArray(component.selectedDamageDice)).toBe(true)
  })

  it('has correct damage dice options', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have damageDiceOptions
    expect(component.damageDiceOptions).toBeDefined()
    expect(Array.isArray(component.damageDiceOptions)).toBe(true)
    expect(component.damageDiceOptions.length).toBeGreaterThan(0)

    // Verify common dice options
    const values = component.damageDiceOptions.map((o: any) => o.value)
    expect(values).toContain('1d4')
    expect(values).toContain('1d6')
    expect(values).toContain('1d8')
    expect(values).toContain('1d10')
    expect(values).toContain('1d12')
    expect(values).toContain('2d6')
  })

  it('shows damage dice filter chips when selected', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedDamageDice = ['1d6', '1d8']
    await wrapper.vm.$nextTick()

    const d6Chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('1d6') && btn.text().includes('✕')
    )
    const d8Chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('1d8') && btn.text().includes('✕')
    )

    expect(d6Chip).toBeDefined()
    expect(d8Chip).toBeDefined()
  })

  it('clicking damage dice chip removes that die from filter', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedDamageDice = ['1d6', '1d8']
    await wrapper.vm.$nextTick()

    const chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('1d6') && btn.text().includes('✕')
    )
    expect(chip).toBeDefined()
    await chip!.trigger('click')

    expect(component.selectedDamageDice).toEqual(['1d8'])
  })

  it('generates correct filter for damage dice', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedDamageDice = ['1d6', '1d8']
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('damage_dice')
    expect(queryParams.filter).toContain('1d6')
    expect(queryParams.filter).toContain('1d8')
  })
})

describe('Items Versatile Damage Filter', () => {
  it('has versatile damage filter state', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have selectedVersatileDamage ref
    expect(component.selectedVersatileDamage).toBeDefined()
    expect(Array.isArray(component.selectedVersatileDamage)).toBe(true)
  })

  it('has correct versatile damage options', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have versatileDamageOptions
    expect(component.versatileDamageOptions).toBeDefined()
    expect(Array.isArray(component.versatileDamageOptions)).toBe(true)

    // Verify versatile damage options (1d8, 1d10, 1d12)
    const values = component.versatileDamageOptions.map((o: any) => o.value)
    expect(values).toContain('1d8')
    expect(values).toContain('1d10')
    expect(values).toContain('1d12')
  })

  it('shows versatile damage filter chips when selected', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedVersatileDamage = ['1d8', '1d10']
    await wrapper.vm.$nextTick()

    const d8Chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('Versatile') && btn.text().includes('1d8') && btn.text().includes('✕')
    )
    const d10Chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('Versatile') && btn.text().includes('1d10') && btn.text().includes('✕')
    )

    expect(d8Chip).toBeDefined()
    expect(d10Chip).toBeDefined()
  })

  it('clicking versatile damage chip removes that die from filter', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedVersatileDamage = ['1d8', '1d10']
    await wrapper.vm.$nextTick()

    const chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('Versatile') && btn.text().includes('1d8') && btn.text().includes('✕')
    )
    expect(chip).toBeDefined()
    await chip!.trigger('click')

    expect(component.selectedVersatileDamage).toEqual(['1d10'])
  })

  it('generates correct filter for versatile damage', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedVersatileDamage = ['1d8', '1d10']
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('versatile_damage')
    expect(queryParams.filter).toContain('1d8')
    expect(queryParams.filter).toContain('1d10')
  })
})

describe('Items Range Filter', () => {
  it('has range filter state', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have selectedRange ref
    expect(component.selectedRange).toBeDefined()
    expect(component.selectedRange).toBeNull()
  })

  it('has correct range options', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have rangeOptions
    expect(component.rangeOptions).toBeDefined()
    expect(Array.isArray(component.rangeOptions)).toBe(true)

    // Verify range options
    const labels = component.rangeOptions.map((o: any) => o.label)
    expect(labels).toContain('Any')
    expect(labels).toContain('Short (<30ft)')
    expect(labels).toContain('Medium (30-80ft)')
    expect(labels).toContain('Long (80-150ft)')
    expect(labels).toContain('Very Long (>150ft)')
  })

  it('shows range filter chip when selected', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedRange = '30-80'
    await wrapper.vm.$nextTick()

    const chips = wrapper.findAll('button').filter(btn =>
      btn.text().includes('Range:') && btn.text().includes('Medium') && btn.text().includes('✕')
    )
    expect(chips.length).toBeGreaterThan(0)
  })

  it('clicking range chip clears the filter', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedRange = '80-150'
    await wrapper.vm.$nextTick()

    const chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('Range:') && btn.text().includes('Long') && btn.text().includes('✕')
    )
    expect(chip).toBeDefined()
    await chip!.trigger('click')

    expect(component.selectedRange).toBeNull()
  })

  it('generates correct filter for short range (<30ft)', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedRange = 'under-30'
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('range_normal < 30')
  })

  it('generates correct filter for medium range (30-80ft)', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedRange = '30-80'
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('range_normal >= 30 AND range_normal <= 80')
  })

  it('generates correct filter for very long range (>150ft)', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedRange = 'over-150'
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('range_normal > 150')
  })
})

describe('Items Recharge Timing Filter', () => {
  it('has recharge timing filter state', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have selectedRechargeTiming ref
    expect(component.selectedRechargeTiming).toBeDefined()
    expect(Array.isArray(component.selectedRechargeTiming)).toBe(true)
  })

  it('has correct recharge timing options', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any

    // Should have rechargeTimingOptions
    expect(component.rechargeTimingOptions).toBeDefined()
    expect(Array.isArray(component.rechargeTimingOptions)).toBe(true)

    // Verify recharge timing options
    const values = component.rechargeTimingOptions.map((o: any) => o.value)
    expect(values).toContain('dawn')
    expect(values).toContain('dusk')
  })

  it('shows recharge timing filter chips when selected', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedRechargeTiming = ['dawn', 'dusk']
    await wrapper.vm.$nextTick()

    const dawnChip = wrapper.findAll('button').find(btn =>
      btn.text().includes('Dawn') && btn.text().includes('✕')
    )
    const duskChip = wrapper.findAll('button').find(btn =>
      btn.text().includes('Dusk') && btn.text().includes('✕')
    )

    expect(dawnChip).toBeDefined()
    expect(duskChip).toBeDefined()
  })

  it('clicking recharge timing chip removes that timing from filter', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)

    const component = wrapper.vm as any
    component.selectedRechargeTiming = ['dawn', 'dusk']
    await wrapper.vm.$nextTick()

    const chip = wrapper.findAll('button').find(btn =>
      btn.text().includes('Dawn') && btn.text().includes('✕')
    )
    expect(chip).toBeDefined()
    await chip!.trigger('click')

    expect(component.selectedRechargeTiming).toEqual(['dusk'])
  })

  it('generates correct filter for recharge timing', async () => {
    const wrapper = await mountSuspended(ItemsIndexPage)
    const component = wrapper.vm as any

    component.selectedRechargeTiming = ['dawn']
    await wrapper.vm.$nextTick()

    const queryParams = component.queryBuilder
    expect(queryParams.filter).toContain('recharge_timing')
    expect(queryParams.filter).toContain('dawn')
  })
})
