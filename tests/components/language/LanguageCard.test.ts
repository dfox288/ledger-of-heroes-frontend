import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LanguageCard from '~/components/language/LanguageCard.vue'
import { testCardHoverEffects, testCardBorderStyling } from '../../helpers/cardBehavior'

describe('LanguageCard', () => {
  const mockLanguage = {
    id: 1,
    name: 'Elvish',
    slug: 'elvish',
    script: 'Elvish',
    typical_speakers: 'Elves',
    description: 'Fluid and melodic language spoken by elves across the multiverse.'
  }

  const mountCard = () => mountSuspended(LanguageCard, {
    props: { language: mockLanguage }
  })

  testCardHoverEffects(mountCard)
  testCardBorderStyling(mountCard)

  it('renders language name', async () => {
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: mockLanguage }
    })

    expect(wrapper.text()).toContain('Elvish')
  })

  it('renders script information', async () => {
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: mockLanguage }
    })

    expect(wrapper.text()).toContain('Elvish Script')
  })

  it('renders typical speakers', async () => {
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: mockLanguage }
    })

    expect(wrapper.text()).toContain('Elves')
  })

  it('renders description when provided', async () => {
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: mockLanguage }
    })

    expect(wrapper.text()).toContain('Fluid and melodic language')
  })

  it('shows default description when not provided', async () => {
    const langWithoutDescription = { ...mockLanguage, description: undefined }
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: langWithoutDescription }
    })

    expect(wrapper.text()).toContain('A language spoken in the D&D multiverse')
  })

  it('truncates long descriptions', async () => {
    const longDescription = 'A'.repeat(200)
    const longLang = { ...mockLanguage, description: longDescription }
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: longLang }
    })

    const text = wrapper.text()
    expect(text).toContain('...')
  })

  it('does not truncate short descriptions', async () => {
    const shortDescription = 'Short language description'
    const shortLang = { ...mockLanguage, description: shortDescription }
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: shortLang }
    })

    expect(wrapper.text()).toContain(shortDescription)
    expect(wrapper.text()).not.toContain('...')
  })

  it.each([
    ['Common'],
    ['Dwarvish'],
    ['Draconic'],
    ['Infernal']
  ])('handles different script types: %s', async (script) => {
    const lang = { ...mockLanguage, script }
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: lang }
    })

    expect(wrapper.text()).toContain(`${script} Script`)
  })

  it('handles long language names', async () => {
    const longName = 'Very Long Language Name'
    const longNameLang = { ...mockLanguage, name: longName }
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: longNameLang }
    })

    expect(wrapper.text()).toContain(longName)
  })

  it('handles exotic languages', async () => {
    const exoticLang = {
      id: 2,
      name: 'Deep Speech',
      slug: 'deep-speech',
      script: 'None',
      typical_speakers: 'Mind Flayers, Beholders',
      description: 'An alien language spoken by aberrations.'
    }
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: exoticLang }
    })

    expect(wrapper.text()).toContain('Deep Speech')
    expect(wrapper.text()).toContain('None Script')
  })

  it('uses line clamp for description', async () => {
    const wrapper = await mountSuspended(LanguageCard, {
      props: { language: mockLanguage }
    })

    const html = wrapper.html()
    expect(html).toContain('line-clamp-2')
  })

  describe('background images', () => {
    it('computes background image URL correctly', async () => {
      const wrapper = await mountSuspended(LanguageCard, {
        props: {
          language: {
            id: 1,
            slug: 'common',
            name: 'Common',
            script: 'Common',
            typical_speakers: 'Humans',
            description: 'Test'
          }
        }
      })

      const url = wrapper.vm.backgroundImageUrl
      expect(url).toBe('/images/generated/conversions/256/languages/stability-ai/common.png')
    })
  })
})
