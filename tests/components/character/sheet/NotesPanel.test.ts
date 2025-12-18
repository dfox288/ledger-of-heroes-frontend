// tests/components/character/sheet/NotesPanel.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import NotesPanel from '~/components/character/sheet/NotesPanel.vue'
import type { CharacterNote } from '~/types/character'

// =============================================================================
// Test Fixtures
// =============================================================================

function createMockNote(overrides: Partial<CharacterNote> = {}): CharacterNote {
  return {
    id: 1,
    category: 'custom',
    category_label: 'Custom',
    title: 'Test Note',
    content: 'Test content',
    sort_order: 0,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}

// Character trait categories (should appear first, in order)
const personalityNote = createMockNote({
  id: 1,
  category: 'personality_trait',
  category_label: 'Personality Trait',
  title: null,
  content: 'I am fiercely loyal to my friends.'
})

const idealNote = createMockNote({
  id: 2,
  category: 'ideal',
  category_label: 'Ideal',
  title: null,
  content: 'Freedom. Tyrants must not be allowed to oppress the people.'
})

const bondNote = createMockNote({
  id: 3,
  category: 'bond',
  category_label: 'Bond',
  title: null,
  content: 'I will protect my village at all costs.'
})

const flawNote = createMockNote({
  id: 4,
  category: 'flaw',
  category_label: 'Flaw',
  title: null,
  content: 'I am quick to anger.'
})

// Character description categories
const backstoryNote = createMockNote({
  id: 5,
  category: 'backstory',
  category_label: 'Backstory',
  title: 'Origin',
  content: 'Born in a small village...'
})

const appearanceNote = createMockNote({
  id: 6,
  category: 'appearance',
  category_label: 'Appearance',
  title: null,
  content: 'Tall with dark hair and green eyes.'
})

// Gameplay categories
const sessionNote = createMockNote({
  id: 7,
  category: 'session',
  category_label: 'Session',
  title: 'Session 5',
  content: 'We fought the dragon and won.'
})

const questNote = createMockNote({
  id: 8,
  category: 'quest',
  category_label: 'Quest',
  title: 'Find the artifact',
  content: 'Must locate the hidden temple.'
})

const campaignNote = createMockNote({
  id: 9,
  category: 'campaign',
  category_label: 'Campaign',
  title: 'Campaign Notes',
  content: 'The kingdom is in turmoil.'
})

// World-building categories
const npcNote = createMockNote({
  id: 10,
  category: 'npc',
  category_label: 'NPC',
  title: 'Bartender Bob',
  content: 'Friendly tavern owner who knows secrets.'
})

const locationNote = createMockNote({
  id: 11,
  category: 'location',
  category_label: 'Location',
  title: 'The Rusty Anchor',
  content: 'A seedy tavern near the docks.'
})

const loreNote = createMockNote({
  id: 12,
  category: 'lore',
  category_label: 'Lore',
  title: 'The Ancient War',
  content: 'A thousand years ago, the gods fought.'
})

const itemNote = createMockNote({
  id: 13,
  category: 'item',
  category_label: 'Item',
  title: 'Mysterious Amulet',
  content: 'Found in the crypt, unknown power.'
})

// Custom category (should appear last)
const customNote = createMockNote({
  id: 14,
  category: 'custom',
  category_label: 'Custom',
  title: 'Random Thoughts',
  content: 'Need to check back on this later.'
})

const anotherCustomNote = createMockNote({
  id: 15,
  category: 'zebra',
  category_label: 'Zebra',
  title: 'Zebra Category',
  content: 'This should sort alphabetically after known categories.'
})

// =============================================================================
// Category Ordering Tests (#798)
// =============================================================================

describe('NotesPanel', () => {
  describe('category ordering (#798)', () => {
    it('displays character trait categories in correct order', async () => {
      const notes = {
        flaw: [flawNote],
        personality_trait: [personalityNote],
        bond: [bondNote],
        ideal: [idealNote]
      }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const html = wrapper.html()
      const personalityIndex = html.indexOf('Personality Trait')
      const idealIndex = html.indexOf('Ideal')
      const bondIndex = html.indexOf('Bond')
      const flawIndex = html.indexOf('Flaw')

      // Order should be: Personality Trait -> Ideal -> Bond -> Flaw
      expect(personalityIndex).toBeLessThan(idealIndex)
      expect(idealIndex).toBeLessThan(bondIndex)
      expect(bondIndex).toBeLessThan(flawIndex)
    })

    it('displays backstory before appearance', async () => {
      const notes = {
        appearance: [appearanceNote],
        backstory: [backstoryNote]
      }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const html = wrapper.html()
      const backstoryIndex = html.indexOf('Backstory')
      const appearanceIndex = html.indexOf('Appearance')

      expect(backstoryIndex).toBeLessThan(appearanceIndex)
    })

    it('displays gameplay categories in correct order', async () => {
      const notes = {
        quest: [questNote],
        campaign: [campaignNote],
        session: [sessionNote]
      }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const html = wrapper.html()
      const campaignIndex = html.indexOf('Campaign')
      const sessionIndex = html.indexOf('Session')
      const questIndex = html.indexOf('Quest')

      // Order should be: Campaign -> Session -> Quest
      expect(campaignIndex).toBeLessThan(sessionIndex)
      expect(sessionIndex).toBeLessThan(questIndex)
    })

    it('displays world-building categories in correct order', async () => {
      const notes = {
        lore: [loreNote],
        item: [itemNote],
        npc: [npcNote],
        location: [locationNote]
      }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const html = wrapper.html()
      const npcIndex = html.indexOf('NPC')
      const locationIndex = html.indexOf('Location')
      const loreIndex = html.indexOf('Lore')
      const itemIndex = html.indexOf('Item')

      // Order should be: NPC -> Location -> Lore -> Item
      expect(npcIndex).toBeLessThan(locationIndex)
      expect(locationIndex).toBeLessThan(loreIndex)
      expect(loreIndex).toBeLessThan(itemIndex)
    })

    it('displays predefined categories before custom ones', async () => {
      const notes = {
        custom: [customNote],
        personality_trait: [personalityNote]
      }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const html = wrapper.html()
      const personalityIndex = html.indexOf('Personality Trait')
      const customIndex = html.indexOf('Custom')

      expect(personalityIndex).toBeLessThan(customIndex)
    })

    it('sorts custom categories alphabetically', async () => {
      const alphaNote = createMockNote({
        id: 16,
        category: 'alpha',
        category_label: 'Alpha',
        content: 'Alpha content'
      })

      const notes = {
        zebra: [anotherCustomNote],
        alpha: [alphaNote]
      }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const html = wrapper.html()
      const alphaIndex = html.indexOf('Alpha')
      const zebraIndex = html.indexOf('Zebra')

      expect(alphaIndex).toBeLessThan(zebraIndex)
    })

    it('maintains consistent order with full set of categories', async () => {
      const notes = {
        // Deliberately out of order
        item: [itemNote],
        flaw: [flawNote],
        session: [sessionNote],
        backstory: [backstoryNote],
        npc: [npcNote],
        personality_trait: [personalityNote],
        ideal: [idealNote],
        bond: [bondNote]
      }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const html = wrapper.html()

      // Check all are in expected order
      const positions = [
        { name: 'Personality Trait', index: html.indexOf('Personality Trait') },
        { name: 'Ideal', index: html.indexOf('Ideal') },
        { name: 'Bond', index: html.indexOf('Bond') },
        { name: 'Flaw', index: html.indexOf('Flaw') },
        { name: 'Backstory', index: html.indexOf('Backstory') },
        { name: 'Session', index: html.indexOf('Session') },
        { name: 'NPC', index: html.indexOf('NPC') },
        { name: 'Item', index: html.indexOf('Item') }
      ]

      // Verify each subsequent item appears after the previous
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i].index).toBeGreaterThan(positions[i - 1].index)
      }
    })
  })

  // =============================================================================
  // Search Functionality Tests (#799)
  // =============================================================================

  describe('search functionality (#799)', () => {
    it('displays search input in header', async () => {
      const notes = { session: [sessionNote] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const searchInput = wrapper.find('[data-testid="note-search"]')
      expect(searchInput.exists()).toBe(true)
    })

    it('filters notes by title', async () => {
      const note1 = createMockNote({ id: 1, category: 'session', category_label: 'Session', title: 'Dragon Fight', content: 'We fought.' })
      const note2 = createMockNote({ id: 2, category: 'session', category_label: 'Session', title: 'Town Visit', content: 'We shopped.' })

      const notes = { session: [note1, note2] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      // Both notes visible initially
      expect(wrapper.text()).toContain('Dragon Fight')
      expect(wrapper.text()).toContain('Town Visit')

      // Type in search
      const searchInput = wrapper.find('[data-testid="note-search"]')
      await searchInput.setValue('Dragon')

      // Only Dragon Fight should be visible
      expect(wrapper.text()).toContain('Dragon Fight')
      expect(wrapper.text()).not.toContain('Town Visit')
    })

    it('filters notes by content', async () => {
      const note1 = createMockNote({ id: 1, category: 'npc', category_label: 'NPC', title: 'Bob', content: 'A friendly wizard.' })
      const note2 = createMockNote({ id: 2, category: 'npc', category_label: 'NPC', title: 'Alice', content: 'A mysterious rogue.' })

      const notes = { npc: [note1, note2] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const searchInput = wrapper.find('[data-testid="note-search"]')
      await searchInput.setValue('wizard')

      expect(wrapper.text()).toContain('Bob')
      expect(wrapper.text()).not.toContain('Alice')
    })

    it('search is case-insensitive', async () => {
      const note = createMockNote({ id: 1, category: 'quest', category_label: 'Quest', title: 'Find the ARTIFACT', content: 'Must search.' })

      const notes = { quest: [note] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const searchInput = wrapper.find('[data-testid="note-search"]')
      await searchInput.setValue('artifact')

      expect(wrapper.text()).toContain('Find the ARTIFACT')
    })

    it('shows count of matching notes', async () => {
      const note1 = createMockNote({ id: 1, category: 'session', category_label: 'Session', title: 'Session 1', content: 'First session' })
      const note2 = createMockNote({ id: 2, category: 'session', category_label: 'Session', title: 'Session 2', content: 'Second session' })
      const note3 = createMockNote({ id: 3, category: 'npc', category_label: 'NPC', title: 'Bob', content: 'NPC bob' })

      const notes = { session: [note1, note2], npc: [note3] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const searchInput = wrapper.find('[data-testid="note-search"]')
      await searchInput.setValue('session')

      // Should show "2 of 3 notes" or similar
      expect(wrapper.text()).toMatch(/2\s*(of|\/)\s*3/)
    })

    it('shows no results state when search matches nothing', async () => {
      const note = createMockNote({ id: 1, category: 'session', category_label: 'Session', title: 'Session 1', content: 'First session' })

      const notes = { session: [note] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const searchInput = wrapper.find('[data-testid="note-search"]')
      await searchInput.setValue('xyznonexistent')

      expect(wrapper.text()).toContain('No notes match')
    })

    it('hides empty categories when all notes are filtered out', async () => {
      const note1 = createMockNote({ id: 1, category: 'session', category_label: 'Session', title: 'Session Notes', content: 'gaming stuff' })
      const note2 = createMockNote({ id: 2, category: 'npc', category_label: 'NPC', title: 'Bob the Wizard', content: 'magic guy' })

      const notes = { session: [note1], npc: [note2] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      // Both categories visible initially
      expect(wrapper.text()).toContain('Session')
      expect(wrapper.text()).toContain('NPC')

      const searchInput = wrapper.find('[data-testid="note-search"]')
      await searchInput.setValue('Wizard')

      // Only NPC category should be visible
      expect(wrapper.text()).toContain('NPC')
      // The session note should not be visible
      expect(wrapper.text()).not.toContain('Session Notes')
    })

    it('clears search shows all notes again', async () => {
      const note1 = createMockNote({ id: 1, category: 'session', category_label: 'Session', title: 'Session 1', content: 'content' })
      const note2 = createMockNote({ id: 2, category: 'npc', category_label: 'NPC', title: 'Bob', content: 'content' })

      const notes = { session: [note1], npc: [note2] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const searchInput = wrapper.find('[data-testid="note-search"]')

      // Filter to show only one
      await searchInput.setValue('Bob')
      expect(wrapper.text()).not.toContain('Session 1')

      // Clear search
      await searchInput.setValue('')
      expect(wrapper.text()).toContain('Session 1')
      expect(wrapper.text()).toContain('Bob')
    })
  })

  // =============================================================================
  // Basic Functionality Tests
  // =============================================================================

  describe('basic functionality', () => {
    it('displays note content', async () => {
      const notes = { session: [sessionNote] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      expect(wrapper.text()).toContain('We fought the dragon and won.')
    })

    it('displays note title when present', async () => {
      const notes = { session: [sessionNote] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      expect(wrapper.text()).toContain('Session 5')
    })

    it('shows empty state when no notes', async () => {
      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes: {} }
      })

      expect(wrapper.text()).toContain('No notes yet')
    })

    it('emits add event when add button clicked', async () => {
      const notes = { session: [sessionNote] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const addButton = wrapper.find('[data-testid="add-note-btn"]')
      await addButton.trigger('click')

      expect(wrapper.emitted('add')).toHaveLength(1)
    })

    it('emits edit event when edit button clicked', async () => {
      const notes = { session: [sessionNote] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const editButton = wrapper.find(`[data-testid="edit-note-${sessionNote.id}"]`)
      await editButton.trigger('click')

      expect(wrapper.emitted('edit')).toHaveLength(1)
      expect(wrapper.emitted('edit')![0]).toEqual([sessionNote])
    })

    it('emits delete event when delete button clicked', async () => {
      const notes = { session: [sessionNote] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes }
      })

      const deleteButton = wrapper.find(`[data-testid="delete-note-${sessionNote.id}"]`)
      await deleteButton.trigger('click')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')![0]).toEqual([sessionNote])
    })

    it('hides action buttons when readonly', async () => {
      const notes = { session: [sessionNote] }

      const wrapper = await mountSuspended(NotesPanel, {
        props: { notes, readonly: true }
      })

      expect(wrapper.find('[data-testid="add-note-btn"]').exists()).toBe(false)
      expect(wrapper.find(`[data-testid="edit-note-${sessionNote.id}"]`).exists()).toBe(false)
      expect(wrapper.find(`[data-testid="delete-note-${sessionNote.id}"]`).exists()).toBe(false)
    })
  })
})
