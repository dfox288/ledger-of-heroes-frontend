import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpellSourceFooter from '~/components/spell/SpellSourceFooter.vue'
import { mockSource } from '#tests/helpers/mockFactories'
import type { EntitySource } from '~/types'

describe('SpellSourceFooter', () => {
  // Basic rendering

  it('renders single source with pages', async () => {
    const sources: EntitySource[] = [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '241' }
    ]
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources }
    })

    expect(wrapper.text()).toContain('Source:')
    expect(wrapper.text()).toContain('PHB p.241')
  })

  it('renders single source without pages', async () => {
    const sources: EntitySource[] = [
      { code: 'XGTE', name: 'Xanathar\'s Guide to Everything', pages: null }
    ]
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources }
    })

    expect(wrapper.text()).toContain('Source:')
    expect(wrapper.text()).toContain('XGTE')
    expect(wrapper.text()).not.toContain('p.')
  })

  // Multiple sources tests

  it('renders multiple sources comma-separated', async () => {
    const sources: EntitySource[] = [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '241' },
      { code: 'XGTE', name: 'Xanathar\'s Guide to Everything', pages: '157' }
    ]
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources }
    })

    const text = wrapper.text()
    expect(text).toContain('PHB p.241')
    expect(text).toContain('XGTE p.157')
    expect(text).toContain(',')
  })

  it('renders three sources correctly', async () => {
    const sources: EntitySource[] = [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '241' },
      { code: 'XGTE', name: 'Xanathar\'s Guide to Everything', pages: '157' },
      { code: 'TCE', name: 'Tasha\'s Cauldron of Everything', pages: '106' }
    ]
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources }
    })

    const text = wrapper.text()
    expect(text).toContain('PHB p.241')
    expect(text).toContain('XGTE p.157')
    expect(text).toContain('TCE p.106')
  })

  // Mixed pages scenarios

  it('handles mix of sources with and without pages', async () => {
    const sources: EntitySource[] = [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '241' },
      { code: 'XGTE', name: 'Xanathar\'s Guide to Everything', pages: null },
      { code: 'TCE', name: 'Tasha\'s Cauldron of Everything', pages: '106' }
    ]
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources }
    })

    const text = wrapper.text()
    expect(text).toContain('PHB p.241')
    expect(text).toContain('XGTE')
    expect(text).toContain('TCE p.106')
  })

  // Styling tests

  it('applies muted/secondary text styling', async () => {
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources: [mockSource] }
    })

    // Should have muted text color classes
    const element = wrapper.find('[class*="text-gray"]')
    expect(element.exists()).toBe(true)
  })

  it('renders as compact inline display', async () => {
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources: [mockSource] }
    })

    // Should use text-sm for compact display
    const element = wrapper.find('[class*="text-sm"]')
    expect(element.exists()).toBe(true)
  })

  // Edge cases

  it('handles empty sources array', async () => {
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources: [] }
    })

    // Should render "Source:" but no content
    const text = wrapper.text()
    expect(text).toContain('Source:')
  })

  it('handles source with page range', async () => {
    const sources: EntitySource[] = [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '241-243' }
    ]
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources }
    })

    expect(wrapper.text()).toContain('PHB p.241-243')
  })

  // Integration test

  it('renders complete footer with label and sources', async () => {
    const sources: EntitySource[] = [
      { code: 'PHB', name: 'Player\'s Handbook', pages: '241' },
      { code: 'XGTE', name: 'Xanathar\'s Guide to Everything', pages: '157' }
    ]
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources }
    })

    const text = wrapper.text()
    expect(text).toContain('Source:')
    expect(text).toContain('PHB p.241')
    expect(text).toContain('XGTE p.157')
  })

  // Mock factory usage

  it('works with mock factory source', async () => {
    const wrapper = await mountSuspended(SpellSourceFooter, {
      props: { sources: [mockSource] }
    })

    expect(wrapper.text()).toContain('PHB p.1')
  })
})
