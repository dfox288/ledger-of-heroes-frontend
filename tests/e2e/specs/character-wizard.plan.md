# Character Creation Wizard E2E Test Plan

## Application Overview

The D&D 5e character creation wizard is a multi-step flow that guides users through creating a playable character. The wizard dynamically shows/hides steps based on user selections (e.g., subrace only appears if the selected race has subraces, spells only for spellcasters). The wizard uses URL-based navigation and persists character state after race selection, transitioning from /characters/new/ to /characters/{publicId}/edit/.

## Test Scenarios

### 1. Human Fighter (Simple Path)

**Seed:** `tests/e2e/seed.spec.ts`

#### 1.1. Complete Happy Path - Human Fighter

**File:** `tests/e2e/character-wizard/human-fighter-happy-path.spec.ts`

**Steps:**
  1. Navigate to /characters/new/sourcebooks
  2. Accept default sourcebooks (PHB selected)
  3. Click Continue to proceed to race selection
  4. Search for 'Human' in race list
  5. Click 'Human' card to select
  6. Verify race details panel appears
  7. Click 'Confirm' to save race selection
  8. Verify URL changes from /characters/new/race to /characters/{publicId}/edit/size
  9. Verify character publicId appears in URL (format: {adjective}-{noun}-{code})
  10. Select 'Medium' size
  11. Click Continue to proceed to class
  12. Search for 'Fighter' in class list
  13. Click 'Fighter' card
  14. Verify class details panel shows hit die (d10), proficiencies
  15. Click 'Confirm' to save class
  16. Verify subclass step NOT visible in sidebar (fighter gets subclass at level 3)
  17. Search for 'Soldier' in background list
  18. Click 'Soldier' card
  19. Click 'Confirm' to save background
  20. Select ability score method: 'Standard Array'
  21. Assign scores: STR=15, DEX=14, CON=13, INT=12, WIS=10, CHA=8
  22. Click Continue (may need to assign racial bonuses if prompted)
  23. At proficiencies step, select 2 skills: 'Athletics' and 'Perception'
  24. Click Continue
  25. Complete language choices if prompted (or auto-skip)
  26. At equipment step, make all equipment choices (armor, weapons, pack)
  27. Verify Continue button disabled until all choices made
  28. Click Continue when all equipment selected
  29. Verify spells step NOT visible (Fighter not a spellcaster)
  30. At details step, enter character name: 'Thorin Ironforge'
  31. Select alignment: 'Lawful Good'
  32. Click Continue to review step
  33. Verify review displays complete character sheet preview
  34. Verify Finish button enabled
  35. Click Finish
  36. Verify redirect to character sheet page /characters/{publicId}
  37. Verify character sheet displays correctly

**Expected Results:**
  - Character created successfully with publicId in URL
  - All required fields populated
  - No pending choices remain (pending_choices.total === 0)
  - Character status: complete
  - Character sheet accessible at permanent URL
  - Subrace step not shown for Human
  - Spells step not shown for Fighter
  - Equipment validation works (cannot proceed until all choices made)
  - URL transitions from /new/ to /{publicId}/edit/ after race selection

#### 1.2. Back Button Navigation

**File:** `tests/e2e/character-wizard/back-navigation.spec.ts`

**Steps:**
  1. Complete wizard up to abilities step (race: Human, class: Fighter, background: Soldier)
  2. Verify current step is 'Abilities'
  3. Click 'Back' button
  4. Verify navigates to 'Background' step
  5. Verify selected background still shown (Soldier)
  6. Click 'Back' again
  7. Verify navigates to 'Class' step
  8. Verify selected class still shown (Fighter)
  9. Click 'Continue'
  10. Verify returns to 'Background' step
  11. Change background to 'Folk Hero'
  12. Click 'Confirm'
  13. Click 'Continue' to abilities
  14. Complete wizard normally

**Expected Results:**
  - Back navigation works at every step
  - Selections persist when navigating back
  - Can modify previous selections
  - Can continue forward after going back
  - Auto-skipped steps (feats, languages) skipped in both directions

#### 1.3. Sidebar Step Navigation

**File:** `tests/e2e/character-wizard/sidebar-navigation.spec.ts`

**Steps:**
  1. Complete wizard up to equipment step
  2. Verify sidebar shows all visible steps with checkmarks for completed steps
  3. Click 'Race' in sidebar
  4. Verify jumps to race step
  5. Verify URL changes to /characters/{publicId}/edit/race
  6. Verify selected race still shown (Human)
  7. Click 'Details' in sidebar
  8. Verify jumps to details step
  9. Verify can enter character name
  10. Click 'Abilities' in sidebar
  11. Verify jumps to abilities step
  12. Complete wizard from current position

**Expected Results:**
  - Can jump to any visible step via sidebar
  - URL updates correctly on sidebar navigation
  - Selections persist when jumping between steps
  - Can complete wizard after jumping around
  - Invisible/conditional steps not shown in sidebar

#### 1.4. Validation Blocks Navigation

**File:** `tests/e2e/character-wizard/validation.spec.ts`

**Steps:**
  1. Navigate to /characters/new/sourcebooks
  2. Click Continue to race
  3. Verify Continue button disabled (no race selected)
  4. Click a race card to select
  5. Verify Confirm button appears
  6. DO NOT click Confirm
  7. Verify Continue button still disabled (race not confirmed)
  8. Click Confirm to save race
  9. Verify Continue button now enabled
  10. Click Continue to proceed
  11. At class step, verify Continue disabled until class selected and confirmed
  12. At details step, verify Continue disabled until name entered
  13. Try entering empty string or only spaces for name
  14. Verify validation fails (name required)
  15. Enter valid name
  16. Verify Continue enabled

**Expected Results:**
  - Cannot proceed without required selections
  - Validation enforced at each step
  - Clear visual feedback (disabled button state)
  - Selection AND confirmation both required for entity steps
  - Name trimming works (spaces-only rejected)

#### 1.5. Browser Back/Forward Navigation

**File:** `tests/e2e/character-wizard/browser-navigation.spec.ts`

**Steps:**
  1. Complete wizard up to class step (race: Human, class: Fighter selected)
  2. Verify at class step, Fighter selected
  3. Click browser back button
  4. Verify navigates to race step
  5. Verify URL is /characters/{publicId}/edit/race
  6. Click browser forward button
  7. Verify returns to class step
  8. Verify Fighter still selected
  9. Click browser back twice
  10. Verify navigates to race step
  11. Click Continue to go forward through wizard normally
  12. Verify wizard flow continues correctly

**Expected Results:**
  - Browser back/forward buttons work correctly
  - URL updates reflect current step
  - Selections persist through browser navigation
  - Can resume wizard flow after using browser navigation

### 2. Elf Wizard (Spellcaster with Subrace)

**Seed:** `tests/e2e/seed.spec.ts`

#### 2.1. Complete Spellcaster Flow - High Elf Wizard

**File:** `tests/e2e/character-wizard/elf-wizard-spellcaster.spec.ts`

**Steps:**
  1. Navigate to /characters/new/sourcebooks
  2. Click Continue to race selection
  3. Search for 'Elf'
  4. Select 'Elf' race
  5. Click Confirm
  6. Verify URL changes to /characters/{publicId}/edit/subrace
  7. Verify subrace step IS visible in sidebar
  8. Verify subrace options shown: High Elf, Wood Elf, Drow
  9. Select 'High Elf'
  10. Click Confirm
  11. Select size 'Medium'
  12. Click Continue
  13. Search for 'Wizard' in class list
  14. Select 'Wizard'
  15. Verify spellcasting details shown in class description
  16. Click Confirm
  17. Verify subclass step NOT visible (wizard gets subclass at level 2)
  18. Select background: 'Sage'
  19. Click Confirm
  20. At abilities step, select 'Standard Array'
  21. Assign scores prioritizing Intelligence: INT=15, DEX=14, CON=13, WIS=12, STR=10, CHA=8
  22. Apply racial bonuses if prompted: High Elf gets +2 INT, +1 DEX
  23. Click Continue
  24. At proficiencies, select 2 skills from wizard list (Arcana, History)
  25. Click Continue
  26. If language choices from High Elf, select language
  27. Click Continue through equipment
  28. Make equipment choices for wizard (staff, component pouch, etc.)
  29. Click Continue
  30. Verify spells step IS visible in sidebar
  31. Verify URL is /characters/{publicId}/edit/spells
  32. Verify cantrip selection UI appears
  33. Verify shows 'Select 3 cantrips' (wizard gets 3 at level 1)
  34. Select 3 cantrips: 'Fire Bolt', 'Mage Hand', 'Prestidigitation'
  35. Verify 1st level spell selection appears
  36. Verify shows 'Select 6 spells' (wizard gets INT modifier + 6 at level 1)
  37. Select 6 first-level spells
  38. Verify Continue disabled until all spell selections made
  39. When all spells selected, click Continue
  40. Enter name: 'Elara Moonwhisper'
  41. Select alignment: 'Neutral Good'
  42. Click Continue to review
  43. Verify review shows spells section
  44. Verify cantrips and prepared spells listed
  45. Click Finish
  46. Verify character sheet shows spellcasting section
  47. Verify spell slots displayed (2 first-level slots)

**Expected Results:**
  - Subrace step appears and is required for Elf
  - Spells step appears for wizard
  - Correct number of cantrips (3) and spells (6) required
  - Cannot proceed until all spells selected
  - Spells appear on character sheet
  - Spell slots calculated correctly (2x 1st level)
  - pending_choices.spells decrements as spells selected

#### 2.2. Subrace Step Conditional Visibility

**File:** `tests/e2e/character-wizard/subrace-conditional.spec.ts`

**Steps:**
  1. Start wizard, select 'Human' race
  2. Verify subrace step NOT visible in sidebar
  3. Navigate back to race step
  4. Change selection to 'Elf'
  5. Confirm elf selection
  6. Verify subrace step NOW visible in sidebar
  7. Verify navigates to subrace step automatically
  8. Select 'Wood Elf'
  9. Confirm selection
  10. Complete wizard as Wood Elf Ranger
  11. Verify character created successfully with Wood Elf subrace

**Expected Results:**
  - Subrace step only appears for races with subraces
  - Sidebar updates dynamically when race changes
  - Can switch from race without subrace to race with subrace
  - Subrace selection persists

#### 2.3. Spell Selection Validation

**File:** `tests/e2e/character-wizard/spell-validation.spec.ts`

**Steps:**
  1. Complete wizard up to spells step as Wizard
  2. Verify at spells step
  3. Select only 2 cantrips (need 3)
  4. Attempt to click Continue
  5. Verify button disabled (not all cantrips selected)
  6. Select 3rd cantrip
  7. Verify cantrip counter shows 3/3
  8. Select only 4 first-level spells (need 6)
  9. Verify Continue still disabled
  10. Select 2 more first-level spells
  11. Verify counter shows 6/6
  12. Verify Continue now enabled
  13. Click Continue
  14. Verify navigates to details step

**Expected Results:**
  - Cannot proceed until all required spells selected
  - Clear counter shows progress (X/Y selected)
  - Validation enforced separately for cantrips and leveled spells
  - Must meet exact requirement

### 3. Half-Elf Bard (Complex Choices)

**Seed:** `tests/e2e/seed.spec.ts`

#### 3.1. Multiple Choice Steps - Half-Elf Bard

**File:** `tests/e2e/character-wizard/half-elf-bard-complex.spec.ts`

**Steps:**
  1. Navigate to /characters/new/sourcebooks
  2. Continue to race, select 'Half-Elf'
  3. Confirm selection
  4. Verify subrace step NOT visible (half-elf has no subraces)
  5. Select size 'Medium'
  6. Click Continue
  7. Select 'Bard' class
  8. Confirm selection
  9. Select 'Entertainer' background
  10. Confirm selection
  11. At abilities step, prioritize CHA: CHA=15, DEX=14, CON=13, INT=12, WIS=10, STR=8
  12. Apply Half-Elf racial bonuses: +2 CHA, +1 to two others
  13. Click Continue
  14. At proficiencies step, verify FOUR skill choices required (2 from Bard, 2 from Half-Elf)
  15. Select all 4 skills
  16. Verify pending_choices.proficiencies counts down correctly
  17. Click Continue
  18. At languages step, verify language choice required (Half-Elf gets 1 extra)
  19. Select a language
  20. Verify pending_choices.languages decrements
  21. Click Continue
  22. At equipment step, select musical instrument
  23. Select other starting equipment
  24. Click Continue
  25. At spells step, select Bard cantrips (2 at level 1)
  26. Select Bard 1st-level spells (4 known at level 1)
  27. Click Continue
  28. Complete details: name and alignment
  29. Complete review and finish

**Expected Results:**
  - Multiple proficiency sources stack correctly (class + race = 4 total)
  - Language choice step appears and is required
  - Skill selection validates total count (4 skills required)
  - Cannot proceed until ALL choices from ALL sources complete
  - Character sheet shows all proficiencies from all sources

#### 3.2. Language Choice Step Auto-Skip

**File:** `tests/e2e/character-wizard/language-auto-skip.spec.ts`

**Steps:**
  1. Start wizard
  2. Select 'Dwarf' race (no extra language choice)
  3. Select 'Fighter' class (no extra language choice)
  4. Select 'Soldier' background (no extra language choice)
  5. Continue through wizard
  6. Verify languages step is auto-skipped
  7. Verify navigates directly from proficiencies to equipment
  8. Verify languages step NOT in sidebar
  9. Navigate back to race
  10. Change to 'Half-Elf' (has language choice)
  11. Continue through wizard
  12. Verify languages step NOW appears
  13. Verify required to select language

**Expected Results:**
  - Languages step auto-skips when no choices available
  - Step becomes visible when switching to race with language choice
  - Navigation skips invisible steps automatically
  - Sidebar reflects current step visibility

### 4. Edge Cases and Error Handling

**Seed:** `tests/e2e/seed.spec.ts`

#### 4.1. Direct URL Navigation

**File:** `tests/e2e/character-wizard/direct-url-navigation.spec.ts`

**Steps:**
  1. Navigate directly to /characters/new/class (skipping sourcebooks and race)
  2. Verify behavior (redirect to first step or show error)
  3. Select race through normal flow
  4. Note the publicId from URL
  5. Complete wizard up to spells step
  6. Copy spells step URL
  7. Navigate away to homepage
  8. Paste spells step URL into browser
  9. Verify returns to spells step with selections intact
  10. Complete wizard from that point

**Expected Results:**
  - Graceful handling of incomplete wizard state
  - Can resume wizard from URL if character exists
  - Invalid URLs redirect appropriately
  - Selections persist when using direct URLs

#### 4.2. Sourcebook Filtering

**File:** `tests/e2e/character-wizard/sourcebook-filtering.spec.ts`

**Steps:**
  1. Navigate to /characters/new/sourcebooks
  2. Verify PHB selected by default
  3. Deselect PHB
  4. Verify warning or validation (need at least one source)
  5. Select only 'Xanathar's Guide to Everything'
  6. Click Continue to race
  7. Verify only races from XGE shown
  8. Navigate back to sourcebooks
  9. Select both PHB and XGE
  10. Click Continue to race
  11. Verify races from both sources shown
  12. Select a race and continue wizard
  13. Verify class list filtered by selected sources
  14. Verify background list filtered by selected sources

**Expected Results:**
  - Sourcebook filtering works across all entity lists
  - At least one source must be selected
  - Can combine multiple sources
  - Filtering persists throughout wizard
  - Only entities from selected sources appear

#### 4.3. Ability Score Edge Cases

**File:** `tests/e2e/character-wizard/ability-score-validation.spec.ts`

**Steps:**
  1. Complete wizard to abilities step
  2. Select 'Point Buy' method
  3. Verify point buy calculator appears
  4. Attempt to exceed point buy limit (27 points)
  5. Verify validation prevents overspending
  6. Attempt to set score below 8 or above 15
  7. Verify validation prevents invalid scores
  8. Successfully allocate all 27 points
  9. Click Continue
  10. Verify racial bonuses applied correctly
  11. Navigate back to abilities
  12. Switch to 'Standard Array' method
  13. Verify point buy selections cleared
  14. Assign standard array values
  15. Verify cannot assign same value twice
  16. Complete ability assignment
  17. Click Continue

**Expected Results:**
  - Point buy validation prevents invalid states
  - Standard array enforces unique assignments
  - Can switch between methods
  - Racial bonuses apply correctly
  - Final scores validated

#### 4.4. Equipment Choice Validation

**File:** `tests/e2e/character-wizard/equipment-validation.spec.ts`

**Steps:**
  1. Complete wizard to equipment step
  2. Verify multiple equipment choice groups shown
  3. Select first option from first group only
  4. Attempt to click Continue
  5. Verify button disabled (all groups required)
  6. Select options from all groups except last
  7. Verify Continue still disabled
  8. Select option from last group
  9. Verify all groups have selection
  10. Verify Continue now enabled
  11. Navigate back and forward
  12. Verify equipment selections persist
  13. Change one selection
  14. Verify other selections unchanged
  15. Complete wizard

**Expected Results:**
  - All equipment choice groups required
  - Cannot proceed until all choices made
  - Selections persist through navigation
  - Can modify individual choices
  - Visual feedback shows incomplete groups

#### 4.5. Review Step Completeness

**File:** `tests/e2e/character-wizard/review-completeness.spec.ts`

**Steps:**
  1. Complete wizard to review step
  2. Verify all sections displayed: header, abilities, saves, skills, proficiencies, equipment, features, spells (if caster)
  3. Verify values match selections made during wizard
  4. Verify proficiency bonus calculated correctly (+2 at level 1)
  5. Verify AC calculated if armor equipped
  6. Verify HP shows max hit points (hit die + CON modifier)
  7. Click Edit links (if present) to jump back to specific steps
  8. Make a change and return to review
  9. Verify review updates with changed values
  10. Click Finish

**Expected Results:**
  - Review shows complete character preview
  - All calculated stats correct
  - Can edit from review screen
  - Changes reflected when returning to review
  - All sections present and populated

### 5. Responsive and Accessibility

**Seed:** `tests/e2e/seed.spec.ts`

#### 5.1. Mobile Layout

**File:** `tests/e2e/character-wizard/mobile-responsive.spec.ts`

**Steps:**
  1. Set viewport to 375x667 (iPhone SE)
  2. Navigate to wizard
  3. Verify sidebar collapses to hamburger menu
  4. Click hamburger to open step navigation
  5. Verify step list readable and clickable
  6. Select a race
  7. Verify card layout stacks vertically
  8. Verify detail panel readable
  9. Complete wizard on mobile viewport
  10. Verify all buttons reachable and tappable
  11. Verify no horizontal scrolling required
  12. Verify text readable without zooming

**Expected Results:**
  - Responsive layout works on mobile
  - Navigation accessible via hamburger menu
  - Cards stack appropriately
  - All interactions work on touch
  - No layout breaking

#### 5.2. Tablet Layout

**File:** `tests/e2e/character-wizard/tablet-responsive.spec.ts`

**Steps:**
  1. Set viewport to 768x1024 (iPad)
  2. Navigate through wizard
  3. Verify sidebar visible but condensed
  4. Verify cards in 2-column grid
  5. Verify detail panels fit viewport
  6. Complete wizard on tablet viewport

**Expected Results:**
  - Tablet layout optimized for medium screens
  - Sidebar remains visible
  - Grid layout appropriate for width

#### 5.3. Keyboard Navigation

**File:** `tests/e2e/character-wizard/keyboard-navigation.spec.ts`

**Steps:**
  1. Navigate to wizard using only keyboard
  2. Tab through sourcebook selections
  3. Use Enter to toggle selections
  4. Tab to Continue button
  5. Press Enter to proceed
  6. At race step, Tab through race cards
  7. Press Enter to select race
  8. Tab to Confirm button
  9. Continue through wizard using only keyboard
  10. Verify can complete entire wizard without mouse

**Expected Results:**
  - All interactive elements keyboard accessible
  - Tab order logical
  - Enter/Space activate buttons
  - Focus indicators visible
  - No keyboard traps

#### 5.4. Screen Reader Support

**File:** `tests/e2e/character-wizard/screen-reader.spec.ts`

**Steps:**
  1. Enable screen reader
  2. Navigate to wizard
  3. Verify step progress announced
  4. Verify race cards have descriptive labels
  5. Verify form fields have labels
  6. Verify validation errors announced
  7. Verify disabled state announced
  8. Complete wizard with screen reader

**Expected Results:**
  - Semantic HTML structure
  - ARIA labels present where needed
  - State changes announced
  - Navigation landmarks clear
  - Form validation accessible
