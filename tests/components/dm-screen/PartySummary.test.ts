// tests/components/dm-screen/PartySummary.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PartySummary from '~/components/dm-screen/PartySummary.vue'
import type { DmScreenPartySummary } from '~/types/dm-screen'

const mockSummary: DmScreenPartySummary = {
  all_languages: ['Common', 'Elvish', 'Dwarvish', 'Undercommon', 'Draconic'],
  darkvision_count: 3,
  no_darkvision: ['Aldric the Human'],
  has_healer: true,
  healers: ['Mira (Cleric)', 'Finn (Druid)'],
  has_detect_magic: true,
  has_dispel_magic: false,
  has_counterspell: true
}

describe('DmScreenPartySummary', () => {
  it('displays languages section', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Languages')
    expect(wrapper.text()).toContain('Common')
  })

  it('shows "+N more" when many languages', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    // Default shows 3 languages, rest as "+N more"
    expect(wrapper.text()).toMatch(/\+\d+ more/)
  })

  it('displays darkvision count', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Darkvision')
    expect(wrapper.text()).toContain('3')
  })

  it('shows warning for characters without darkvision', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Aldric')
  })

  it('displays healers when present', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Healers')
    expect(wrapper.text()).toContain('Mira')
  })

  it('shows warning when no healers', async () => {
    const noHealerSummary = { ...mockSummary, has_healer: false, healers: [] }
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: noHealerSummary }
    })
    expect(wrapper.text()).toMatch(/no healer|none/i)
  })

  it('displays utility spell coverage', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    expect(wrapper.text()).toContain('Utility')
    expect(wrapper.text()).toContain('Detect Magic')
  })

  it('shows checkmark for available utility spells', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    // Detect Magic has checkmark
    const detectSection = wrapper.find('[data-testid="utility-detect-magic"]')
    expect(detectSection.text()).toContain('✓')
  })

  it('shows X for missing utility spells', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary }
    })
    // Dispel Magic is missing
    const dispelSection = wrapper.find('[data-testid="utility-dispel-magic"]')
    expect(dispelSection.classes().join(' ')).toMatch(/muted|neutral|gray/)
  })

  it('is collapsible', async () => {
    const wrapper = await mountSuspended(PartySummary, {
      props: { summary: mockSummary, collapsed: false }
    })
    const toggle = wrapper.find('[data-testid="summary-toggle"]')
    expect(toggle.exists()).toBe(true)
  })
})
