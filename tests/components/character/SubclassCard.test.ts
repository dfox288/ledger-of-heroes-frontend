// tests/components/character/SubclassCard.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SubclassCard from '~/components/character/SubclassCard.vue'
import { testPickerCardBehavior } from '#tests/helpers/pickerCardBehavior'
import { createMockClass, mockSource } from '#tests/helpers/mockFactories'

// Subclass has 'source' (singular) instead of 'sources' array - extend base mock
const mockSubclass = {
  ...createMockClass({
    id: 20,
    name: 'Knowledge Domain',
    slug: 'cleric-knowledge-domain',
    is_base_class: false,
    parent_class_id: 13, // Cleric
    description: 'The gods of knowledge value learning and understanding above all.'
  }),
  source: mockSource // SubclassCard expects 'source' singular
}

describe('SubclassCard', () => {
  // Test common picker card behavior
  testPickerCardBehavior({
    component: SubclassCard,
    mockEntity: mockSubclass,
    entityName: 'Knowledge Domain',
    propName: 'subclass'
  })

  it('shows source badge when source is provided', async () => {
    const wrapper = await mountSuspended(SubclassCard, {
      props: { subclass: mockSubclass, selected: false }
    })
    expect(wrapper.text()).toContain('PHB')
  })

  it('shows description when provided', async () => {
    const wrapper = await mountSuspended(SubclassCard, {
      props: { subclass: mockSubclass, selected: false }
    })
    expect(wrapper.text()).toContain('The gods of knowledge')
  })

  it('handles missing source gracefully', async () => {
    const subclassWithoutSource = { ...mockSubclass, source: undefined }
    const wrapper = await mountSuspended(SubclassCard, {
      props: { subclass: subclassWithoutSource, selected: false }
    })
    expect(wrapper.html()).toBeTruthy()
  })

  it('handles missing description gracefully', async () => {
    const subclassWithoutDescription = { ...mockSubclass, description: undefined }
    const wrapper = await mountSuspended(SubclassCard, {
      props: { subclass: subclassWithoutDescription, selected: false }
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
