/**
 * Character Sheet Component Stubs
 *
 * Reusable component stubs for testing wizard steps that render CharacterSheet* components.
 * These stubs render meaningful content that can be tested while avoiding the complexity
 * of the actual components.
 *
 * Usage:
 * ```typescript
 * import { characterSheetStubs } from '@/tests/helpers/characterSheetStubs'
 *
 * const wrapper = await mountSuspended(StepReview, {
 *   global: { stubs: characterSheetStubs, plugins: [pinia] }
 * })
 * ```
 */

/**
 * Full set of CharacterSheet component stubs for wizard tests.
 * Each stub renders testable content with data-testid attributes.
 */
export const characterSheetStubs = {
  CharacterSheetHeader: {
    template: `<div data-testid="sheet-header">
      <h1>{{ character?.name }}</h1>
      <p>{{ character?.race?.name }} · {{ character?.classes?.[0]?.class?.name }} · {{ character?.background?.name }}</p>
    </div>`,
    props: ['character']
  },

  CharacterSheetAbilityScoreBlock: {
    template: `<div data-testid="ability-scores">
      <div v-for="(data, code) in stats?.ability_scores" :key="code">
        {{ code }}: {{ data?.score }} ({{ data?.modifier >= 0 ? '+' : '' }}{{ data?.modifier }})
      </div>
    </div>`,
    props: ['stats']
  },

  CharacterSheetCombatStatsGrid: {
    template: `<div data-testid="combat-stats">
      <span>HP: {{ stats?.hit_points?.max }}</span>
      <span>AC: {{ stats?.armor_class }}</span>
      <span>Speed: {{ character?.speed }}</span>
    </div>`,
    props: ['character', 'stats']
  },

  CharacterSheetSavingThrowsList: {
    template: `<div data-testid="saving-throws">
      <div v-for="save in savingThrows" :key="save?.ability">
        {{ save?.ability }}: {{ save?.modifier >= 0 ? '+' : '' }}{{ save?.modifier }}
        <span v-if="save?.proficient">●</span>
      </div>
    </div>`,
    props: ['savingThrows']
  },

  CharacterSheetSkillsList: {
    template: `<div data-testid="skills-list">
      <div v-for="skill in skills" :key="skill?.slug">
        {{ skill?.name }}: {{ skill?.modifier >= 0 ? '+' : '' }}{{ skill?.modifier }}
      </div>
    </div>`,
    props: ['skills']
  },

  CharacterSheetProficienciesPanel: {
    template: '<div data-testid="proficiencies"><span>Proficiencies ({{ proficiencies?.length ?? 0 }})</span></div>',
    props: ['proficiencies']
  },

  CharacterSheetLanguagesPanel: {
    template: '<div data-testid="languages"><span>Languages ({{ languages?.length ?? 0 }})</span></div>',
    props: ['languages']
  },

  CharacterSheetEquipmentPanel: {
    template: '<div data-testid="equipment"><span>Equipment ({{ equipment?.length ?? 0 }})</span></div>',
    props: ['equipment', 'carryingCapacity', 'pushDragLift']
  },

  CharacterSheetSpellsPanel: {
    template: '<div data-testid="spells"><span>Spells ({{ spells?.length ?? 0 }})</span></div>',
    props: ['spells', 'stats']
  },

  CharacterSheetFeaturesPanel: {
    template: '<div data-testid="features"><span>Features ({{ features?.length ?? 0 }})</span></div>',
    props: ['features']
  },

  CharacterSheetPassiveScores: {
    template: `<div data-testid="passive-scores">
      <span>Perception: {{ perception }}</span>
      <span>Investigation: {{ investigation }}</span>
      <span>Insight: {{ insight }}</span>
    </div>`,
    props: ['perception', 'investigation', 'insight']
  },

  CharacterSheetHitDice: {
    template: '<div data-testid="hit-dice"><span>Hit Dice ({{ hitDice?.length ?? 0 }})</span></div>',
    props: ['hitDice']
  },

  CharacterSheetDeathSaves: {
    template: `<div data-testid="death-saves">
      <span>Successes: {{ successes }}</span>
      <span>Failures: {{ failures }}</span>
    </div>`,
    props: ['successes', 'failures']
  }
}

/**
 * Minimal stubs - use when you don't need to test rendered content.
 * Faster and simpler, just verifies component presence.
 */
export const characterSheetMinimalStubs = {
  CharacterSheetHeader: { template: '<div data-testid="sheet-header" />' },
  CharacterSheetAbilityScoreBlock: { template: '<div data-testid="ability-scores" />' },
  CharacterSheetCombatStatsGrid: { template: '<div data-testid="combat-stats" />' },
  CharacterSheetSavingThrowsList: { template: '<div data-testid="saving-throws" />' },
  CharacterSheetSkillsList: { template: '<div data-testid="skills-list" />' },
  CharacterSheetProficienciesPanel: { template: '<div data-testid="proficiencies" />' },
  CharacterSheetLanguagesPanel: { template: '<div data-testid="languages" />' },
  CharacterSheetEquipmentPanel: { template: '<div data-testid="equipment" />' },
  CharacterSheetSpellsPanel: { template: '<div data-testid="spells" />' },
  CharacterSheetFeaturesPanel: { template: '<div data-testid="features" />' },
  CharacterSheetPassiveScores: { template: '<div data-testid="passive-scores" />' },
  CharacterSheetHitDice: { template: '<div data-testid="hit-dice" />' },
  CharacterSheetDeathSaves: { template: '<div data-testid="death-saves" />' }
}
