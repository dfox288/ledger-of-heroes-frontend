# Level-Up Wizard Test Plan

## Application Overview

This test plan validates the character level-up wizard, which allows players to progress their D&D 5e characters from level N to N+1. The wizard handles various progression scenarios including hit point increases, ability score improvements, feat selection, subclass selection, spell learning, and feature choices. The test plan covers three critical level-up scenarios: basic progression (level 1→2), subclass selection (level 2→3 for Fighter), and ASI/Feat choice (level 3→4).

## Test Scenarios

### 1. Level 1 to 2 Progression - Basic HP Increase

**Seed:** `tests/e2e/seed.spec.ts`

#### 1.1. Level up from 1 to 2 using HP roll

**File:** `tests/e2e/level-up/level-1-to-2-roll.spec.ts`

**Steps:**
  1. Navigate to http://localhost:4000/characters
  2. Click on a level 1 character card to view their character sheet (or create a new level 1 Fighter if none exists)
  3. Note the character's current max HP displayed on the sheet
  4. Click the 'Level Up' button in the character sheet header
  5. Verify the level-up preview page displays character name, current level (1), target level (2), and 'What's ahead' section showing HP choice
  6. Click 'Begin Level Up' button
  7. Verify navigation to hit-points step at /characters/{publicId}/level-up/hit-points
  8. Verify the hit die size is displayed correctly (d10 for Fighter)
  9. Verify the Constitution modifier is displayed
  10. Click the 'Roll d10' button to roll for HP
  11. Verify a die animation plays and displays a random result between 1 and die size
  12. Verify the total HP calculation is shown as: roll result + CON modifier
  13. Click 'Confirm HP Increase' button
  14. Verify navigation to summary step at /characters/{publicId}/level-up/summary
  15. Verify confetti animation plays on the summary page
  16. Verify summary displays level transition (Fighter 1 → Fighter 2)
  17. Verify summary shows HP gained amount and new max HP total
  18. Click 'View Character Sheet' button
  19. Verify navigation back to character sheet
  20. Verify the character now shows level 2
  21. Verify the max HP has increased by the gained amount

**Expected Results:**
  - Preview page shows correct current and target levels
  - HP step allows rolling the appropriate hit die for the class
  - Die roll produces a value between 1 and the hit die maximum
  - Total HP calculation correctly includes CON modifier
  - Summary shows correct level transition and HP increase
  - Character sheet reflects the new level and updated max HP
  - Level-up completes successfully with all data persisted

#### 1.2. Level up from 1 to 2 using average HP

**File:** `tests/e2e/level-up/level-1-to-2-average.spec.ts`

**Steps:**
  1. Navigate to http://localhost:4000/characters
  2. Click on a level 1 character card or create a new level 1 Wizard
  3. Note the character's current max HP
  4. Click 'Level Up' button
  5. Verify level-up preview shows level 1 → 2 transition
  6. Click 'Begin Level Up' button
  7. Verify navigation to hit-points step
  8. Verify hit die and CON modifier are displayed
  9. Click the 'Take Average' button
  10. Verify the average value is calculated correctly using ceiling((die + 1) / 2) - e.g., d6=4, d8=5, d10=6
  11. Verify total HP shows average value + CON modifier
  12. Click 'Confirm HP Increase' button
  13. Verify navigation to summary step
  14. Verify summary shows the HP increase using average value
  15. Click 'View Character Sheet' button
  16. Verify character is now level 2 with correct HP increase

**Expected Results:**
  - Average HP option calculates the correct value for the class hit die
  - Average value follows D&D 5e rules: ceiling((die + 1) / 2)
  - Total HP includes the CON modifier
  - Summary correctly reflects the average HP choice
  - Character sheet shows updated level and HP after completion

### 2. Level 2 to 3 Progression - Subclass Selection

**Seed:** `tests/e2e/seed.spec.ts`

#### 2.1. Level up from 2 to 3 and select subclass

**File:** `tests/e2e/level-up/level-2-to-3-subclass.spec.ts`

**Steps:**
  1. Navigate to http://localhost:4000/characters
  2. Find or create a level 2 Fighter character without a subclass
  3. Click the character card to view their sheet
  4. Verify the character shows Fighter level 2 with no subclass
  5. Click 'Level Up' button
  6. Verify preview shows level 2 → 3 transition
  7. Click 'Begin Level Up' button
  8. Verify navigation to subclass step at /characters/{publicId}/level-up/subclass
  9. Verify the page shows 'Choose Your Subclass' heading
  10. Verify subclass options are displayed (Champion, Battle Master, Eldritch Knight for Fighter)
  11. Click on a subclass card (e.g., Champion)
  12. Verify the selected card has a highlighted border and check icon
  13. Click 'Continue' button
  14. Verify navigation to hit-points step
  15. Select HP choice (roll or average)
  16. Confirm HP increase
  17. Verify navigation to summary step
  18. Verify summary shows level 2 → 3 transition, subclass name, and HP gained
  19. Click 'View Character Sheet' button
  20. Verify character sheet now shows Fighter 3 with selected subclass name and updated HP

**Expected Results:**
  - Subclass step appears before HP step for level 3 progression
  - Available subclass options are displayed correctly for the class
  - Subclass selection is required before proceeding
  - Subclass choice is saved and reflected in character summary
  - Character sheet displays the chosen subclass after level-up completion
  - All steps complete in correct order: subclass → HP → summary

#### 2.2. Resume incomplete level-up with pending subclass choice

**File:** `tests/e2e/level-up/resume-subclass-choice.spec.ts`

**Steps:**
  1. Start with a level 2 Fighter character
  2. Begin level-up process and navigate to subclass step
  3. Do NOT select a subclass - leave the page
  4. Navigate away from the level-up wizard (go to /characters)
  5. Return to the character's level-up page at /characters/{publicId}/level-up
  6. Verify the wizard auto-resumes and navigates directly to the subclass step (skipping preview)
  7. Verify the subclass selection UI is displayed
  8. Select a subclass and click 'Continue'
  9. Complete the HP step
  10. Verify the level-up completes successfully

**Expected Results:**
  - Incomplete level-up is detected when returning to level-up page
  - Wizard resumes at the first pending choice (subclass)
  - User does not need to restart the level-up process
  - All pending choices can be completed from the resume point
  - Level-up completes successfully after resolving pending choices

### 3. Level 3 to 4 Progression - ASI or Feat Choice

**Seed:** `tests/e2e/seed.spec.ts`

#### 3.1. Level up from 3 to 4 and choose Ability Score Improvement

**File:** `tests/e2e/level-up/level-3-to-4-asi.spec.ts`

**Steps:**
  1. Navigate to http://localhost:4000/characters
  2. Find or create a level 3 Fighter character
  3. Note the character's current ability scores (especially STR and DEX)
  4. Click 'Level Up' button
  5. Verify preview shows level 3 → 4 transition
  6. Verify preview 'What's ahead' section includes 'Ability Score Improvement or Feat' item
  7. Click 'Begin Level Up' button
  8. Complete the HP step (roll or average)
  9. Verify navigation to asi-feat step at /characters/{publicId}/level-up/asi-feat
  10. Verify the page shows 'Ability Score Improvement' and 'Choose Feat' options
  11. Click the 'Ability Score Improvement' option
  12. Verify ability score selection UI appears with increment controls
  13. Increase two ability scores by +1 each (or one score by +2) within the limits
  14. Verify scores cannot exceed 20 via ASI
  15. Click 'Confirm' or 'Continue' button
  16. Verify navigation to summary step
  17. Verify summary displays level 3 → 4 transition, HP gained, and ASI choices shown
  18. Click 'View Character Sheet' button
  19. Verify character sheet shows level 4
  20. Verify the selected ability scores have increased correctly

**Expected Results:**
  - ASI/Feat step appears after HP step for level 4 progression
  - User can choose between ASI and Feat
  - ASI allows distributing +2 points across ability scores (+2 to one or +1 to two)
  - ASI enforces the 20-point maximum for ability scores
  - Selected ASI is reflected in the summary
  - Character sheet displays updated ability scores after completion
  - Ability score modifiers update if scores cross thresholds

#### 3.2. Level up from 3 to 4 and choose a Feat

**File:** `tests/e2e/level-up/level-3-to-4-feat.spec.ts`

**Steps:**
  1. Navigate to http://localhost:4000/characters
  2. Find or create a level 3 Rogue character
  3. Click 'Level Up' button
  4. Verify preview shows level 3 → 4 with ASI/Feat option
  5. Click 'Begin Level Up'
  6. Complete HP step
  7. Verify navigation to asi-feat step
  8. Click the 'Choose Feat' option
  9. Verify feat selection interface appears (search/filter, feat list)
  10. Search or browse for a feat (e.g., 'Alert')
  11. Click on a feat card to select it
  12. Verify feat details are displayed (description, benefits)
  13. Click 'Confirm' or 'Continue' button
  14. Verify navigation to summary step
  15. Verify summary shows level 3 → 4, HP gained, and Feat name displayed
  16. Click 'View Character Sheet' button
  17. Verify character sheet shows level 4
  18. Navigate to the character's features or feats section
  19. Verify the selected feat appears in the character's feat list

**Expected Results:**
  - User can choose Feat instead of ASI at level 4
  - Feat selection UI allows browsing/searching available feats
  - Selected feat is displayed in the summary
  - Feat is added to the character's feat list after completion
  - Character sheet reflects level 4 with the new feat

#### 3.3. Resume incomplete level-up with pending ASI choice

**File:** `tests/e2e/level-up/resume-asi-pending.spec.ts`

**Steps:**
  1. Start with a level 3 character
  2. Begin level-up to level 4
  3. Complete HP step but do NOT complete ASI/Feat step
  4. Navigate away from the wizard
  5. Return to /characters/{publicId}/level-up
  6. Verify wizard auto-resumes at the asi-feat step (HP already resolved)
  7. Complete the ASI or Feat choice
  8. Verify level-up completes successfully
  9. Verify character shows level 4 with correct ASI/Feat applied

**Expected Results:**
  - Wizard resumes at the first unresolved choice (asi-feat)
  - Previously completed choices (HP) are not repeated
  - ASI/Feat choice can be completed from resume point
  - Level-up completes and persists correctly
