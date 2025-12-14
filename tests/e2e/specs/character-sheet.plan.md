# Character Sheet Test Plan

## Application Overview

The D&D 5e character sheet is a comprehensive multi-tab interface for viewing and managing character information. It includes interactive features like HP management, death saves, conditions, rest mechanics, inventory management, spell tracking, and notes. The interface has two modes: View Mode (read-only) and Play Mode (interactive), controlled by a toggle switch. The character sheet is accessed at /characters/{publicId} with navigation tabs for Overview, Inventory, Spells (if spellcaster), Features, and Notes.

## Test Scenarios

### 1. Character List and Navigation

**Seed:** `tests/seed.spec.ts`

#### 1.1. Navigate from character list to character sheet

**File:** `tests/e2e/character-sheet/navigation.spec.ts`

**Steps:**
  1. Navigate to http://localhost:4002/characters
  2. Wait for character list to load
  3. Verify at least one character card is visible
  4. Click on the first character card
  5. Wait for navigation to character sheet page
  6. Verify URL matches /characters/{publicId} pattern
  7. Verify character name is displayed in the header
  8. Verify character info (race, class, background) is displayed

**Expected Results:**
  - Character list page loads successfully
  - Character cards display with names and basic info
  - Clicking a character navigates to their sheet
  - Character sheet displays correct character information
  - Back button returns to character list

#### 1.2. Tab navigation between character views

**File:** `tests/e2e/character-sheet/tab-navigation.spec.ts`

**Steps:**
  1. Navigate to a character sheet at /characters/{publicId}
  2. Verify Overview tab is active (highlighted)
  3. Click on 'Inventory' tab
  4. Verify URL changes to /characters/{publicId}/inventory
  5. Verify inventory content is displayed
  6. Click on 'Features' tab
  7. Verify URL changes to /characters/{publicId}/features
  8. Verify features accordion is displayed
  9. Click on 'Notes' tab
  10. Verify URL changes to /characters/{publicId}/notes
  11. Verify notes panel is displayed
  12. If character is a spellcaster, click on 'Spells' tab
  13. Verify spells page displays spell list and stats
  14. Click 'Back to Character' button
  15. Verify navigation returns to character list

**Expected Results:**
  - All tabs are visible in the navigation bar
  - Active tab is highlighted with primary color border
  - Clicking tabs changes URL and displays correct content
  - Spells tab only appears for spellcaster characters
  - Tab state persists across page refreshes
  - Back button navigates correctly

### 2. Play Mode Toggle and Character Actions

**Seed:** `tests/seed.spec.ts`

#### 2.1. Toggle Play Mode on and off

**File:** `tests/e2e/character-sheet/play-mode-toggle.spec.ts`

**Steps:**
  1. Navigate to a complete (non-draft) character sheet
  2. Verify Play Mode toggle switch is visible in header
  3. Verify toggle is initially OFF
  4. Click the Play Mode toggle to enable it
  5. Verify toggle state changes to ON
  6. Verify interactive elements become enabled (HP click, death saves if at 0 HP)
  7. Click the toggle again to disable Play Mode
  8. Verify toggle state changes to OFF
  9. Verify interactive elements become disabled

**Expected Results:**
  - Play Mode toggle is only visible for complete characters
  - Toggle state persists when navigating between tabs
  - Toggle state is saved to localStorage
  - Enabling Play Mode activates interactive features
  - Disabling Play Mode locks all interactive features

#### 2.2. Inspiration toggle via portrait click

**File:** `tests/e2e/character-sheet/inspiration-toggle.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Enable Play Mode
  3. Verify character portrait is visible
  4. If character does not have inspiration, click the portrait
  5. Verify 'Inspired' badge appears with golden star icon
  6. Verify portrait has golden glow animation
  7. Verify toast notification appears: 'Inspiration granted!'
  8. Click portrait again
  9. Verify 'Inspired' badge disappears
  10. Verify golden glow animation stops
  11. Verify toast notification: 'Inspiration spent'

**Expected Results:**
  - Portrait is clickable only in Play Mode when character is alive
  - Clicking portrait toggles inspiration state
  - Visual feedback (glow, badge) updates immediately
  - Toast notifications confirm the action
  - Inspiration state persists across page refreshes

#### 2.3. Actions dropdown menu

**File:** `tests/e2e/character-sheet/actions-menu.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Click 'Actions' dropdown button in header
  3. Verify dropdown menu opens
  4. Verify menu items vary based on character state:
  5. - Complete characters: 'Add Condition', 'Level Up' (if under level 20), 'Edit Character', 'Export Character'
  6. - Draft characters: 'Continue Editing', 'Export Character'
  7. - Dead characters in Play Mode: 'Revive Character'
  8. Click 'Export Character'
  9. Verify file download is triggered with format: {publicId}-{timestamp}.json
  10. Verify toast notification: 'Character exported'

**Expected Results:**
  - Actions dropdown displays appropriate options based on character state
  - Export generates valid JSON file with character data
  - Level Up option only appears for characters under level 20
  - Continue Editing navigates to /characters/{publicId}/edit for drafts
  - All actions provide feedback via toast notifications

#### 2.4. Edit character modal

**File:** `tests/e2e/character-sheet/edit-character.spec.ts`

**Steps:**
  1. Navigate to a complete character sheet
  2. Click 'Actions' dropdown
  3. Click 'Edit Character'
  4. Verify edit modal opens
  5. Verify modal shows current name and alignment
  6. Change character name to a new value
  7. Change alignment to a different value
  8. Click 'Save'
  9. Verify modal closes
  10. Verify toast notification: 'Character updated'
  11. Verify character header shows updated name
  12. Refresh page
  13. Verify changes persist

**Expected Results:**
  - Edit modal displays current character information
  - Name and alignment can be updated
  - Portrait can be uploaded or removed
  - Validation errors are displayed for invalid inputs
  - Changes are saved and reflected immediately
  - Changes persist across page refreshes

### 3. Overview Tab - Hit Points Management

**Seed:** `tests/seed.spec.ts`

#### 3.1. View current HP and max HP

**File:** `tests/e2e/character-sheet/hp-display.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Locate the Hit Points stat box
  3. Verify current HP is displayed
  4. Verify max HP is displayed
  5. Verify HP is shown as 'Current / Max' format
  6. If character has temporary HP, verify it is displayed separately

**Expected Results:**
  - HP display shows both current and maximum values
  - Temporary HP is displayed distinctly (if present)
  - HP box is clearly labeled
  - Dead characters show HP as 0 with visual indicator

#### 3.2. Heal character (increase HP)

**File:** `tests/e2e/character-sheet/hp-heal.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Enable Play Mode
  3. Click on the HP stat box
  4. Verify HP Edit Modal opens
  5. Note the current HP value
  6. Click the 'Heal' tab
  7. Enter a healing amount (e.g., 5)
  8. Click 'Apply'
  9. Verify modal closes
  10. Verify HP increased by the healing amount
  11. Verify HP does not exceed max HP
  12. Try healing when at max HP
  13. Verify HP stays at max HP

**Expected Results:**
  - HP edit modal opens when clicking HP box in Play Mode
  - Heal tab allows entering positive HP values
  - HP increases correctly but cannot exceed max HP
  - Modal closes and updates are reflected immediately
  - Toast notification confirms the healing

#### 3.3. Damage character (decrease HP)

**File:** `tests/e2e/character-sheet/hp-damage.spec.ts`

**Steps:**
  1. Navigate to character sheet with Play Mode enabled
  2. Click on HP stat box to open modal
  3. Click the 'Damage' tab
  4. Enter damage amount less than current HP
  5. Click 'Apply'
  6. Verify HP decreased by damage amount
  7. Enter damage that would reduce HP below 0
  8. Click 'Apply'
  9. Verify HP is set to 0
  10. Verify death saves UI becomes visible
  11. Verify character is not marked as dead yet (0 HP but conscious)

**Expected Results:**
  - Damage tab subtracts HP correctly
  - HP can be reduced to 0 but not negative
  - Reaching 0 HP triggers death save mechanics
  - Temporary HP is consumed before regular HP (if present)
  - Toast notification confirms damage taken

#### 3.4. Set temporary HP

**File:** `tests/e2e/character-sheet/temp-hp.spec.ts`

**Steps:**
  1. Navigate to character sheet with Play Mode enabled
  2. Click on HP stat box
  3. Verify modal has a 'Temporary HP' section
  4. Enter a temporary HP value (e.g., 10)
  5. Click 'Set Temp HP' button
  6. Verify modal closes
  7. Verify temporary HP is displayed separately
  8. Take damage
  9. Verify temporary HP is consumed first
  10. Clear temporary HP by clicking 'Clear Temp HP' button
  11. Verify temporary HP is removed

**Expected Results:**
  - Temporary HP can be set to any positive value
  - Temporary HP is displayed distinctly from regular HP
  - Damage depletes temporary HP before regular HP
  - Setting new temp HP replaces old temp HP (doesn't stack)
  - Temp HP can be manually cleared

### 4. Overview Tab - Death Saves

**Seed:** `tests/seed.spec.ts`

#### 4.1. Track death saving throws

**File:** `tests/e2e/character-sheet/death-saves.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Enable Play Mode
  3. Reduce character HP to 0 (via HP modal damage)
  4. Verify death saves UI appears
  5. Verify 3 empty circles for successes
  6. Verify 3 empty circles for failures
  7. Click a success circle to mark it
  8. Verify circle becomes filled
  9. Click two more success circles
  10. Verify character stabilizes (success message/state)
  11. Reset death saves by healing above 0 HP
  12. Reduce to 0 HP again
  13. Click three failure circles
  14. Verify character dies (is_dead = true)
  15. Verify death visual indicator appears
  16. Verify Play Mode interactive features become disabled

**Expected Results:**
  - Death saves only editable when HP = 0 and not dead
  - Marking 3 successes stabilizes the character
  - Marking 3 failures kills the character
  - Healing above 0 HP clears death saves
  - Dead characters show visual death indicator
  - Death save state persists across page refreshes

#### 4.2. Revive dead character

**File:** `tests/e2e/character-sheet/revive.spec.ts`

**Steps:**
  1. Navigate to a character sheet where character is dead
  2. Enable Play Mode
  3. Click 'Actions' dropdown
  4. Verify 'Revive Character' option appears
  5. Click 'Revive Character'
  6. Verify toast notification: 'Character revived! ... has been brought back with 1 HP'
  7. Verify HP is set to 1
  8. Verify death saves are cleared (all circles empty)
  9. Verify is_dead flag is false
  10. Verify interactive features are re-enabled
  11. Verify 'Add Condition' option reappears in Actions menu

**Expected Results:**
  - Revive option only appears for dead characters in Play Mode
  - Reviving sets HP to 1
  - Death saves are reset to 0/0
  - Character is marked as alive
  - All Play Mode features become available again
  - Revive action is confirmed with toast notification

### 5. Overview Tab - Rests and Hit Dice

**Seed:** `tests/seed.spec.ts`

#### 5.1. Spend hit dice during rest

**File:** `tests/e2e/character-sheet/hit-dice.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Enable Play Mode
  3. Locate the Hit Dice panel in the sidebar
  4. Verify current and total hit dice are displayed (e.g., '2/2 d8')
  5. Click 'Spend' button next to a hit die type
  6. Verify hit die count decreases (e.g., '1/2 d8')
  7. Verify toast notification confirms the action
  8. Spend all available hit dice
  9. Verify 'Spend' button becomes disabled when none remain

**Expected Results:**
  - Hit dice display shows current/total for each die type
  - Spend button decreases current hit dice count
  - Cannot spend more hit dice than available
  - Hit dice state persists across page refreshes
  - Each class's hit dice are tracked separately for multiclass characters

#### 5.2. Take short rest

**File:** `tests/e2e/character-sheet/short-rest.spec.ts`

**Steps:**
  1. Navigate to character sheet with Play Mode enabled
  2. Locate the 'Short Rest' button in hit dice panel
  3. Click 'Short Rest'
  4. Verify toast notification: 'Short rest complete' or '{N} features reset'
  5. Verify pact magic slots are restored (for Warlocks)
  6. Verify short-rest features are reset (e.g., Action Surge for Fighters)
  7. Verify hit dice are NOT restored
  8. Verify HP is NOT automatically restored

**Expected Results:**
  - Short rest restores pact magic spell slots
  - Short rest resets short-rest-based features
  - Hit dice and regular spell slots are not affected
  - Toast notification confirms features reset
  - Short rest can be taken multiple times per day

#### 5.3. Take long rest

**File:** `tests/e2e/character-sheet/long-rest.spec.ts`

**Steps:**
  1. Navigate to character sheet with Play Mode enabled
  2. Reduce character HP below max
  3. Spend some hit dice
  4. Click 'Long Rest' button
  5. Verify confirmation modal appears
  6. Click 'Confirm' in the modal
  7. Verify toast notification shows: 'Long rest complete' with details (HP restored, hit dice recovered, spell slots reset)
  8. Verify HP is restored to maximum
  9. Verify at least half of spent hit dice are recovered
  10. Verify all spell slots are restored
  11. Verify death saves are cleared (if any)
  12. Verify temporary HP is removed

**Expected Results:**
  - Long rest confirmation modal prevents accidental rests
  - HP is fully restored
  - Half of maximum hit dice are recovered (rounded down, minimum 1)
  - All spell slots are restored
  - Death saves are cleared
  - Temporary HP is removed
  - Long rest features are reset
  - Toast shows detailed summary of what was restored

### 6. Overview Tab - Conditions

**Seed:** `tests/seed.spec.ts`

#### 6.1. Add condition to character

**File:** `tests/e2e/character-sheet/add-condition.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Enable Play Mode
  3. Click 'Actions' dropdown
  4. Click 'Add Condition'
  5. Verify Add Condition modal opens
  6. Select a condition from dropdown (e.g., 'Poisoned')
  7. Enter source (e.g., 'Spider bite')
  8. Enter duration (e.g., '1 hour')
  9. For Exhaustion, set level (1-6)
  10. Click 'Add'
  11. Verify modal closes
  12. Verify condition appears in Conditions section
  13. Verify condition shows name, source, and duration
  14. Verify toast notification: 'Condition added'

**Expected Results:**
  - Add Condition option only available in Play Mode when alive
  - Modal displays all available conditions
  - Exhaustion requires level selection (1-6)
  - Source and duration are required fields
  - Added conditions appear immediately in the conditions panel
  - Conditions persist across page refreshes

#### 6.2. Remove condition from character

**File:** `tests/e2e/character-sheet/remove-condition.spec.ts`

**Steps:**
  1. Navigate to character sheet with at least one active condition
  2. Enable Play Mode
  3. Locate the Conditions section
  4. Verify condition is displayed with name, source, duration
  5. Click the 'X' or remove button on the condition
  6. Verify condition is removed immediately
  7. Verify toast notification confirms removal
  8. Refresh page
  9. Verify condition remains removed

**Expected Results:**
  - Each condition has a visible remove button
  - Removing a condition updates immediately
  - Toast notification confirms the action
  - Removal persists across page refreshes
  - Multiple conditions can be active simultaneously

#### 6.3. Exhaustion level warnings

**File:** `tests/e2e/character-sheet/exhaustion.spec.ts`

**Steps:**
  1. Navigate to character sheet with Play Mode enabled
  2. Add Exhaustion condition at level 5
  3. Verify warning message about exhaustion effects
  4. Add another level of exhaustion (total 6)
  5. Verify critical warning: 'Exhaustion level 6 causes death'
  6. Verify confirmation modal appears before adding level 6
  7. Confirm the deadly exhaustion
  8. Verify character dies (is_dead = true)
  9. Verify Play Mode features become disabled

**Expected Results:**
  - Exhaustion levels 1-5 show appropriate warnings
  - Level 6 exhaustion triggers death confirmation modal
  - Confirming level 6 kills the character
  - Exhaustion effects are clearly communicated
  - Removing exhaustion decreases level or removes condition

### 7. Overview Tab - Stats and Skills Display

**Seed:** `tests/seed.spec.ts`

#### 7.1. View ability scores and modifiers

**File:** `tests/e2e/character-sheet/ability-scores.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Locate the Ability Scores section in left sidebar
  3. Verify all 6 ability scores are displayed (STR, DEX, CON, INT, WIS, CHA)
  4. For each ability score:
  5. - Verify score value is displayed (e.g., 16)
  6. - Verify modifier is displayed (e.g., +3)
  7. - Verify modifier is calculated correctly: (score - 10) / 2, rounded down
  8. Verify ability scores are read-only (not editable in any mode)

**Expected Results:**
  - All six ability scores are visible
  - Modifiers are calculated correctly
  - Ability scores display prominently in the sidebar
  - Values match character's actual stats

#### 7.2. View saving throws

**File:** `tests/e2e/character-sheet/saving-throws.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Locate the Saving Throws section
  3. Verify all 6 saving throws are listed (STR, DEX, CON, INT, WIS, CHA)
  4. For each saving throw:
  5. - Verify modifier is displayed (e.g., +5)
  6. - Verify proficiency indicator (filled circle or star icon) appears for proficient saves
  7. Verify saving throw modifiers include ability modifier + proficiency bonus (if proficient)
  8. Verify non-proficient saves show only ability modifier

**Expected Results:**
  - All saving throws are visible
  - Proficient saves are clearly marked
  - Modifiers are calculated correctly
  - Display matches character's class proficiencies

#### 7.3. View skills list with proficiencies

**File:** `tests/e2e/character-sheet/skills-list.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Locate the Skills section
  3. Verify all 18 D&D skills are listed alphabetically
  4. For each skill:
  5. - Verify skill name and associated ability are shown (e.g., 'Stealth (DEX)')
  6. - Verify modifier is displayed (e.g., +7)
  7. - Verify proficiency level indicator (none, proficient, expertise, half-proficiency)
  8. - Verify advantage indicator if character has advantage on that skill
  9. Check a proficient skill: verify modifier = ability mod + proficiency bonus
  10. Check an expertise skill: verify modifier = ability mod + (2 × proficiency bonus)
  11. Check a non-proficient skill: verify modifier = ability mod only

**Expected Results:**
  - All 18 skills are listed with correct ability associations
  - Proficiency levels are clearly indicated
  - Advantage on skills is visually indicated
  - Modifiers are calculated correctly for each proficiency level
  - Jack of All Trades applies half-proficiency to non-proficient skills (for Bards)

#### 7.4. View passive scores

**File:** `tests/e2e/character-sheet/passive-scores.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Locate the Passive Scores section in sidebar
  3. Verify Passive Perception is displayed
  4. Verify Passive Investigation is displayed
  5. Verify Passive Insight is displayed
  6. For each passive score:
  7. - Verify it equals 10 + skill modifier
  8. - If character has advantage on the skill, verify +5 is added
  9. - If character has disadvantage, verify -5 is applied

**Expected Results:**
  - All three passive scores are visible
  - Values are calculated as 10 + skill modifier
  - Advantage/disadvantage bonuses are applied correctly
  - Passive scores update if skills change

#### 7.5. View combat stats

**File:** `tests/e2e/character-sheet/combat-stats.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Locate the Combat Stats section
  3. Verify Armor Class (AC) is displayed
  4. Verify Initiative modifier is displayed
  5. Verify Speed is displayed (e.g., '30 ft.')
  6. Verify Proficiency Bonus is displayed
  7. Verify all values are read-only
  8. If character has multiple movement types (fly, swim, climb), verify they are all shown

**Expected Results:**
  - All combat stats are clearly displayed
  - AC reflects armor and dexterity bonuses
  - Initiative equals dexterity modifier
  - Speed shows all movement types
  - Proficiency bonus matches character level

### 8. Inventory Tab

**Seed:** `tests/seed.spec.ts`

#### 8.1. View inventory items

**File:** `tests/e2e/character-sheet/inventory-view.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Click 'Inventory' tab
  3. Verify inventory layout with two columns:
  4. - Left: Item table
  5. - Right: Equipment status and currency
  6. Verify item count is displayed (e.g., 'Items (12)')
  7. Verify search bar is present
  8. Verify items are grouped by category (Weapons, Armor, Equipment, etc.)
  9. For each item, verify:
  10. - Item name
  11. - Quantity
  12. - Weight
  13. - Equipped status (if applicable)
  14. - Attunement indicator (if attuned)

**Expected Results:**
  - All inventory items are displayed
  - Items are grouped logically by type
  - Equipped items show visual indicator
  - Attuned items show attunement icon
  - Item quantities are accurate

#### 8.2. Search and filter inventory

**File:** `tests/e2e/character-sheet/inventory-search.spec.ts`

**Steps:**
  1. Navigate to Inventory tab
  2. Enter a search term in the search bar (e.g., 'sword')
  3. Verify only items matching the search are displayed
  4. Clear the search
  5. Verify all items are displayed again
  6. Search for an item that doesn't exist
  7. Verify empty state message appears

**Expected Results:**
  - Search filters items by name in real-time
  - Search is case-insensitive
  - Clearing search restores full list
  - Empty state shows helpful message when no matches

#### 8.3. Add loot to inventory

**File:** `tests/e2e/character-sheet/add-loot.spec.ts`

**Steps:**
  1. Navigate to Inventory tab
  2. Enable Play Mode
  3. Click 'Add Loot' button
  4. Verify Add Loot modal opens
  5. Search for an item (e.g., 'Potion of Healing')
  6. Select the item from results
  7. Set quantity (e.g., 3)
  8. Click 'Add'
  9. Verify modal closes
  10. Verify item appears in inventory with correct quantity
  11. Verify toast notification: 'Item Added! Added 3x potion-of-healing to inventory'
  12. Test adding custom item:
  13. - Enter custom name
  14. - Enter custom description
  15. - Set quantity
  16. - Verify custom item is added

**Expected Results:**
  - Add Loot button only visible in Play Mode
  - Modal provides item search
  - Can add items from compendium
  - Can add custom items with name and description
  - Quantity can be set before adding
  - Added items appear immediately in inventory

#### 8.4. Purchase items from shop

**File:** `tests/e2e/character-sheet/shop.spec.ts`

**Steps:**
  1. Navigate to Inventory tab with Play Mode enabled
  2. Note current currency amount
  3. Click 'Shop' button
  4. Verify Shop modal opens
  5. Search for an item to purchase
  6. Select item from results
  7. Set quantity
  8. Verify total cost is calculated and displayed
  9. Verify sufficient funds indicator
  10. Click 'Purchase'
  11. Verify modal closes
  12. Verify item is added to inventory
  13. Verify currency is deducted correctly
  14. Verify toast notification confirms purchase
  15. Test insufficient funds:
  16. - Try to buy expensive item without enough gold
  17. - Verify error toast: 'Purchase failed - Insufficient funds'

**Expected Results:**
  - Shop modal displays searchable item catalog
  - Total cost is calculated correctly (item price × quantity)
  - Purchase button disabled if insufficient funds
  - Currency is deducted and item is added on successful purchase
  - Error message shown when funds insufficient
  - Prices match item definitions

#### 8.5. Equip and unequip items

**File:** `tests/e2e/character-sheet/equip-items.spec.ts`

**Steps:**
  1. Navigate to Inventory tab with Play Mode enabled
  2. Locate an equippable item (weapon, armor, shield)
  3. Click the equip button next to the item
  4. If item has multiple valid slots, verify slot picker modal appears
  5. Select an equipment slot
  6. Verify item is marked as equipped
  7. Verify item appears in Equipment Status sidebar
  8. Verify toast notification: 'Item equipped!'
  9. Click the unequip button on an equipped item
  10. Verify item is no longer equipped
  11. Verify item is removed from Equipment Status sidebar
  12. Verify toast notification: 'Item unequipped'

**Expected Results:**
  - Equip button only available for equippable items
  - Slot picker appears for items with multiple valid slots
  - Equipped items show visual indicator
  - Equipment Status sidebar updates in real-time
  - Equipping item in occupied slot unequips previous item
  - Two-handed weapons unequip off-hand items

#### 8.6. Attune to magic items

**File:** `tests/e2e/character-sheet/attunement.spec.ts`

**Steps:**
  1. Navigate to Inventory tab with Play Mode enabled
  2. Locate a magic item requiring attunement
  3. Equip the item (if not already equipped)
  4. Click 'Attune' button
  5. Verify item shows attuned indicator
  6. Verify toast notification: 'Item attuned!'
  7. Verify Equipment Status shows attunement count (e.g., '2/3 attuned')
  8. Attune to 3 items (maximum)
  9. Try to attune to a 4th item
  10. Verify error toast: 'Cannot attune - Maximum attunement slots reached'
  11. Click 'Break Attunement' on an attuned item
  12. Verify attunement is removed
  13. Verify toast notification: 'Attunement broken'

**Expected Results:**
  - Only magic items requiring attunement show attune button
  - Maximum 3 items can be attuned simultaneously
  - Attunement status is clearly indicated
  - Breaking attunement frees up a slot
  - Error message when trying to exceed attunement limit

#### 8.7. Adjust item quantity

**File:** `tests/e2e/character-sheet/item-quantity.spec.ts`

**Steps:**
  1. Navigate to Inventory tab with Play Mode enabled
  2. Locate an item with quantity > 1
  3. Click the increment (+) button
  4. Verify quantity increases by 1
  5. Click the decrement (-) button
  6. Verify quantity decreases by 1
  7. Click 'Edit Qty' button
  8. Verify quantity modal opens
  9. Enter a new quantity value
  10. Click 'Save'
  11. Verify quantity is updated
  12. Try to set quantity to 0
  13. Verify validation prevents saving 0 quantity

**Expected Results:**
  - Increment/decrement buttons work correctly
  - Decrement button disabled when quantity = 1
  - Edit modal allows setting exact quantity
  - Quantity cannot be set to 0 (must drop/sell instead)
  - Weight calculations update with quantity changes

#### 8.8. Sell items

**File:** `tests/e2e/character-sheet/sell-items.spec.ts`

**Steps:**
  1. Navigate to Inventory tab with Play Mode enabled
  2. Note current gold amount
  3. Click sell button on an item
  4. Verify sell modal opens
  5. Verify item name, quantity, and sell price are shown
  6. Set quantity to sell (can be partial)
  7. Verify total sell price is calculated (50% of purchase price)
  8. Click 'Sell'
  9. Verify modal closes
  10. If sold all, verify item is removed from inventory
  11. If sold partial, verify quantity decreased
  12. Verify currency increased by sell price
  13. Verify toast notification: 'Item sold! Received {X} gp'

**Expected Results:**
  - Sell modal displays item info and pricing
  - Sell price is 50% of purchase price
  - Can sell partial quantities
  - Selling all removes item completely
  - Currency is updated correctly
  - Toast confirms sale with amount received

#### 8.9. Drop items

**File:** `tests/e2e/character-sheet/drop-items.spec.ts`

**Steps:**
  1. Navigate to Inventory tab with Play Mode enabled
  2. Click drop button on an item
  3. Verify confirmation modal appears: 'Are you sure you want to drop {item name}?'
  4. Click 'Cancel'
  5. Verify modal closes and item remains
  6. Click drop button again
  7. Click 'Confirm'
  8. Verify item is removed from inventory
  9. Verify toast notification: 'Item dropped'
  10. Verify no currency is gained (unlike selling)

**Expected Results:**
  - Drop action requires confirmation
  - Dropping removes item completely (full quantity)
  - No currency is gained from dropping
  - Equipped items are unequipped before dropping
  - Toast confirms the drop action

#### 8.10. View equipment status sidebar

**File:** `tests/e2e/character-sheet/equipment-status.spec.ts`

**Steps:**
  1. Navigate to Inventory tab
  2. Locate Equipment Status panel in right sidebar
  3. Verify all equipment slots are displayed:
  4. - Head, Eyes, Neck, Chest, Back, Hands, Ring (2 slots), Waist, Feet, Main Hand, Off Hand
  5. For each slot:
  6. - If empty, verify it shows 'Empty' or placeholder
  7. - If equipped, verify item name is shown
  8. - Click on equipped item name
  9. - Verify page scrolls to that item in the table
  10. Verify attunement counter shows '{X}/3 attuned'
  11. Equip an item requiring attunement
  12. Verify attunement counter updates

**Expected Results:**
  - All equipment slots are visible
  - Empty slots are clearly indicated
  - Equipped items show in correct slots
  - Clicking item name scrolls to it in the table
  - Attunement counter is accurate
  - Two-handed weapons occupy both Main Hand and Off Hand

#### 8.11. View encumbrance tracking

**File:** `tests/e2e/character-sheet/encumbrance.spec.ts`

**Steps:**
  1. Navigate to Inventory tab
  2. Locate Encumbrance bar in right sidebar
  3. Verify current weight is displayed (e.g., '45.5 lb')
  4. Verify carrying capacity is displayed (e.g., '150 lb')
  5. Verify visual progress bar shows weight/capacity ratio
  6. Add heavy items to inventory
  7. Verify current weight increases
  8. Verify progress bar updates
  9. If weight exceeds capacity:
  10. - Verify warning color (yellow or red)
  11. - Verify warning message about encumbrance
  12. Remove items to reduce weight
  13. Verify bar and totals update

**Expected Results:**
  - Current weight is calculated correctly (sum of all item weights × quantities)
  - Carrying capacity equals STR score × 15
  - Progress bar provides visual feedback
  - Encumbrance warnings appear when overloaded
  - Weight updates in real-time as items are added/removed

#### 8.12. Manage currency

**File:** `tests/e2e/character-sheet/currency-management.spec.ts`

**Steps:**
  1. Navigate to Inventory tab with Play Mode enabled
  2. Locate Currency Manager in right sidebar
  3. Verify all 5 currency types are displayed (PP, GP, EP, SP, CP)
  4. Note current amounts for each
  5. Click on currency display to open edit modal
  6. Verify modal shows current amounts
  7. Add gold: enter '+50' in GP field
  8. Click 'Save'
  9. Verify GP increased by 50
  10. Open modal again, subtract silver: enter '-20' in SP field
  11. Verify SP decreased by 20
  12. Test conversion: enter large CP value
  13. Verify automatic conversion to higher denominations (optional feature)
  14. Verify toast notification confirms changes

**Expected Results:**
  - All 5 currency types are tracked separately
  - Currency can be added or subtracted using +/- notation
  - Changes persist across page refreshes
  - Currency totals are accurate
  - Shop purchases deduct currency correctly
  - Selling items adds currency correctly

### 9. Spells Tab

**Seed:** `tests/seed.spec.ts`

#### 9.1. View spellcasting stats

**File:** `tests/e2e/character-sheet/spells-stats.spec.ts`

**Steps:**
  1. Navigate to a spellcaster character sheet
  2. Click 'Spells' tab
  3. Verify spellcasting stats bar is displayed
  4. Verify Spell Save DC is shown
  5. Verify Spell Attack Bonus is shown (with + prefix)
  6. Verify Spellcasting Ability is shown (e.g., 'INT', 'WIS', 'CHA')
  7. If character prepares spells, verify 'Prepared: {X}/{Y}' counter is shown
  8. Verify all values match character stats
  9. Navigate to non-spellcaster character
  10. Click where Spells tab would be
  11. Verify Spells tab is not present in navigation

**Expected Results:**
  - Spellcasting stats are prominently displayed
  - Spell DC, attack bonus, and ability are accurate
  - Prepared spell counter shown for prepared casters (Clerics, Wizards, etc.)
  - Spontaneous casters (Sorcerers, Bards) don't show preparation limit
  - Non-spellcasters have no Spells tab

#### 9.2. View spell slots

**File:** `tests/e2e/character-sheet/spell-slots.spec.ts`

**Steps:**
  1. Navigate to Spells tab of a spellcaster
  2. Verify spell slot section displays available slots by level
  3. For each spell level the character has:
  4. - Verify total slots are shown (e.g., '4 slots')
  5. - Verify available slots are shown (e.g., '3 available')
  6. - Verify spent slots are indicated (e.g., '1 spent')
  7. For Warlocks with Pact Magic:
  8. - Verify pact slots are displayed separately
  9. - Verify pact slot level is shown (e.g., '2nd-level Pact Slots')
  10. Verify empty slot levels are not displayed

**Expected Results:**
  - All spell levels with slots are displayed
  - Slot counts are accurate for character level and class
  - Spent vs available distinction is clear
  - Pact Magic slots display separately for Warlocks
  - Multiclass spellcasters show combined slot progression

#### 9.3. Spend and restore spell slots

**File:** `tests/e2e/character-sheet/spell-slot-tracking.spec.ts`

**Steps:**
  1. Navigate to Spells tab with Play Mode enabled
  2. Note available spell slots for level 1
  3. Click a slot circle to mark it as spent
  4. Verify slot changes to spent state (filled/darkened)
  5. Verify available count decreases
  6. Click the spent slot again to restore it
  7. Verify slot returns to available state
  8. Verify available count increases
  9. Spend all slots of a level
  10. Verify all circles are marked as spent
  11. Take a long rest (via Overview tab)
  12. Return to Spells tab
  13. Verify all spell slots are restored
  14. For Warlocks, take a short rest
  15. Verify pact magic slots are restored

**Expected Results:**
  - Clicking slots toggles spent/available state in Play Mode
  - Slot counts update immediately
  - Long rest restores all spell slots
  - Short rest restores Warlock pact magic slots only
  - Slot state persists across page refreshes
  - Cannot spend more slots than available

#### 9.4. View known spells by level

**File:** `tests/e2e/character-sheet/known-spells.spec.ts`

**Steps:**
  1. Navigate to Spells tab
  2. Verify cantrips section is displayed
  3. Verify each cantrip shows:
  4. - Spell name
  5. - Click to expand for details
  6. For each spell level (1-9) the character knows:
  7. - Verify level heading (e.g., '1st Level')
  8. - Verify spells are listed under that heading
  9. - Verify spells are sorted alphabetically
  10. Click on a spell to expand it
  11. Verify spell details appear:
  12. - Casting time
  13. - Range
  14. - Components
  15. - Duration
  16. - Description
  17. Verify spells can be collapsed again

**Expected Results:**
  - All known spells are displayed
  - Spells are grouped by level
  - Cantrips are listed separately at the top
  - Spells are alphabetically sorted within each level
  - Expandable cards show full spell details
  - Spell data matches compendium entries

#### 9.5. Toggle spell preparation

**File:** `tests/e2e/character-sheet/spell-preparation.spec.ts`

**Steps:**
  1. Navigate to Spells tab of a prepared caster (Cleric, Druid, Wizard)
  2. Enable Play Mode
  3. Note the preparation limit (e.g., 'Prepared: 5/8')
  4. Locate an unprepared spell
  5. Click the prepare toggle button
  6. Verify spell is marked as prepared (checkmark or visual indicator)
  7. Verify prepared count increases (e.g., '6/8')
  8. Prepare spells up to the limit
  9. Try to prepare another spell when at limit
  10. Verify toggle is disabled or shows warning
  11. Verify toast: 'At preparation limit'
  12. Unprepare a spell
  13. Verify prepared count decreases
  14. Verify the spell can now be re-prepared

**Expected Results:**
  - Preparation toggle only available for prepared casters
  - Prepared spells are visually distinct
  - Cannot prepare more spells than limit
  - Preparation limit based on spellcasting ability mod + class level
  - Unpreparing frees up a slot
  - Preparation state persists across page refreshes
  - Always-prepared spells (domain spells, etc.) cannot be unprepared

#### 9.6. Non-spellcaster shows appropriate message

**File:** `tests/e2e/character-sheet/non-spellcaster.spec.ts`

**Steps:**
  1. Navigate to a non-spellcaster character (Fighter, Barbarian, Rogue, Monk)
  2. Verify Spells tab does not appear in navigation
  3. Manually navigate to /characters/{publicId}/spells
  4. Verify page loads without error
  5. Verify message is displayed: 'This character cannot cast spells.'
  6. Verify link back to character sheet is provided

**Expected Results:**
  - Spells tab hidden for non-spellcasters
  - Direct URL access shows friendly message
  - No errors or broken UI
  - Clear path back to main character sheet

### 10. Features Tab

**Seed:** `tests/seed.spec.ts`

#### 10.1. View features accordion

**File:** `tests/e2e/character-sheet/features-display.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Click 'Features' tab
  3. Verify features are displayed in an accordion layout
  4. Verify features are grouped by source (Class, Race, Background, Feats)
  5. For each feature:
  6. - Verify feature name is shown as accordion header
  7. - Click to expand the feature
  8. - Verify feature description is displayed
  9. - Verify source is indicated (e.g., 'From: Fighter (Champion)')
  10. Click another feature
  11. Verify first feature collapses and new one expands (optional behavior)

**Expected Results:**
  - All character features are listed
  - Features are grouped by source type
  - Accordion provides clean, scannable interface
  - Feature descriptions are complete
  - Sources are clearly attributed

#### 10.2. Search and filter features

**File:** `tests/e2e/character-sheet/features-search.spec.ts`

**Steps:**
  1. Navigate to Features tab
  2. Verify search bar is present
  3. Enter a search term (e.g., 'attack')
  4. Verify only features matching the term are displayed
  5. Verify matching features remain grouped by source
  6. Clear search
  7. Verify all features are displayed again
  8. Click 'Expand All' button (if present)
  9. Verify all features expand simultaneously
  10. Click 'Collapse All' button
  11. Verify all features collapse

**Expected Results:**
  - Search filters features by name and description
  - Filtered results maintain grouping
  - Expand/Collapse All buttons toggle all accordions
  - Search is case-insensitive
  - Empty search shows helpful message

### 11. Notes Tab

**Seed:** `tests/seed.spec.ts`

#### 11.1. View character notes

**File:** `tests/e2e/character-sheet/notes-view.spec.ts`

**Steps:**
  1. Navigate to character sheet
  2. Click 'Notes' tab
  3. Verify notes are displayed grouped by category
  4. Verify category headings (Campaign, Session, Backstory, etc.)
  5. For each note:
  6. - Verify note title is displayed
  7. - Verify note content is displayed
  8. - Verify category is indicated
  9. Verify empty state when no notes exist: 'No notes yet'

**Expected Results:**
  - Notes are organized by category
  - Each note shows title and content
  - Categories are clearly labeled
  - Empty state provides helpful message
  - Add Note button is visible

#### 11.2. Create a new note

**File:** `tests/e2e/character-sheet/notes-create.spec.ts`

**Steps:**
  1. Navigate to Notes tab
  2. Enable Play Mode
  3. Click 'Add Note' button
  4. Verify note edit modal opens
  5. Select a category (e.g., 'Session Notes')
  6. Enter a note title (e.g., 'Session 12 - The Dragon\'s Lair')
  7. Enter note content in the text area
  8. Click 'Save'
  9. Verify modal closes immediately (optimistic update)
  10. Verify note appears in the appropriate category section
  11. Verify toast notification: 'Note saved!'
  12. Refresh page
  13. Verify note persists

**Expected Results:**
  - Add Note button visible only when not in read-only mode
  - Modal provides category selection
  - Title is optional for some note types
  - Content field is required
  - Note appears immediately after saving (optimistic UI)
  - Notes persist across page refreshes
  - Toast confirms save action

#### 11.3. Edit an existing note

**File:** `tests/e2e/character-sheet/notes-edit.spec.ts`

**Steps:**
  1. Navigate to Notes tab with existing notes
  2. Enable Play Mode
  3. Hover over a note
  4. Verify edit button appears (or is always visible)
  5. Click edit button
  6. Verify note edit modal opens
  7. Verify current title and content are pre-filled
  8. Modify the title
  9. Modify the content
  10. Click 'Save'
  11. Verify modal closes
  12. Verify note displays updated title and content
  13. Verify toast notification confirms save

**Expected Results:**
  - Edit button accessible on each note
  - Modal pre-populates with current note data
  - Changes are saved correctly
  - Optimistic update shows changes immediately
  - Toast confirms the edit
  - Edits persist across page refreshes

#### 11.4. Delete a note

**File:** `tests/e2e/character-sheet/notes-delete.spec.ts`

**Steps:**
  1. Navigate to Notes tab with existing notes
  2. Enable Play Mode
  3. Locate a note to delete
  4. Click delete button (X icon or trash icon)
  5. Verify delete confirmation modal appears
  6. Click 'Cancel'
  7. Verify modal closes and note remains
  8. Click delete button again
  9. Click 'Confirm' in the modal
  10. Verify note is removed immediately from the list
  11. Verify toast notification: 'Note deleted'
  12. Refresh page
  13. Verify note remains deleted

**Expected Results:**
  - Delete button visible on each note
  - Confirmation modal prevents accidental deletion
  - Canceling preserves the note
  - Confirming removes the note immediately (optimistic update)
  - Toast confirms deletion
  - Deletion persists across page refreshes

### 12. Cross-Tab State Persistence

**Seed:** `tests/seed.spec.ts`

#### 12.1. Play Mode persists across tabs

**File:** `tests/e2e/character-sheet/play-mode-persistence.spec.ts`

**Steps:**
  1. Navigate to character sheet Overview tab
  2. Enable Play Mode via toggle
  3. Navigate to Inventory tab
  4. Verify Play Mode is still enabled (interactive buttons visible)
  5. Navigate to Spells tab
  6. Verify Play Mode is still enabled (spell slots are interactive)
  7. Navigate to Notes tab
  8. Verify Play Mode is still enabled (edit/delete buttons visible)
  9. Disable Play Mode
  10. Navigate back to Overview
  11. Verify Play Mode is disabled
  12. Refresh the page
  13. Verify Play Mode state persists (localStorage)

**Expected Results:**
  - Play Mode state is shared across all tabs
  - Enabling/disabling affects all tabs immediately
  - State persists in localStorage
  - State survives page refresh
  - State is character-specific (different characters can have different modes)

#### 12.2. HP and currency sync across tabs

**File:** `tests/e2e/character-sheet/state-sync.spec.ts`

**Steps:**
  1. Navigate to Overview tab with Play Mode enabled
  2. Note current HP and currency values
  3. Take damage to reduce HP
  4. Navigate to Inventory tab
  5. Verify HP display shows updated value
  6. Purchase an item from shop
  7. Verify currency decreases
  8. Navigate back to Overview tab
  9. Verify currency display shows updated value
  10. Navigate to Spells tab
  11. Verify HP display is consistent

**Expected Results:**
  - HP changes on Overview reflect on all other tabs
  - Currency changes on Inventory reflect on Overview
  - All tabs read from same centralized store (characterPlayState)
  - No stale data is displayed
  - Changes are immediate without refresh

### 13. Draft vs Complete Character Differences

**Seed:** `tests/seed.spec.ts`

#### 13.1. Draft character limitations

**File:** `tests/e2e/character-sheet/draft-character.spec.ts`

**Steps:**
  1. Navigate to a draft character sheet
  2. Verify 'Draft' badge is displayed in header
  3. Verify Play Mode toggle is NOT present
  4. Verify all interactive features are disabled:
  5. - HP cannot be edited
  6. - Death saves are not interactive
  7. - Cannot add/remove conditions
  8. - Inventory actions are disabled
  9. - Spell slots cannot be spent
  10. - Notes cannot be added/edited/deleted
  11. Click 'Actions' dropdown
  12. Verify 'Continue Editing' option is available
  13. Click 'Continue Editing'
  14. Verify navigation to /characters/{publicId}/edit

**Expected Results:**
  - Draft badge is prominently displayed
  - Play Mode is not available for drafts
  - All interactive features are disabled
  - Character data is viewable but not editable
  - Continue Editing navigates to character builder
  - Export is still available for drafts

#### 13.2. Complete character from wizard

**File:** `tests/e2e/character-sheet/complete-character.spec.ts`

**Steps:**
  1. Navigate to a complete character sheet
  2. Verify NO 'Draft' badge is displayed
  3. Verify Play Mode toggle IS present
  4. Enable Play Mode
  5. Verify all interactive features are available
  6. Verify 'Continue Editing' is NOT in Actions menu
  7. Verify 'Edit Character' IS in Actions menu (for name/portrait/alignment only)
  8. Verify 'Level Up' option is available (if under level 20)

**Expected Results:**
  - Complete characters have full functionality
  - Play Mode enables interactive features
  - Edit Character only allows limited edits (not rebuild)
  - Level Up is available for progression
  - No draft restrictions apply

### 14. Dead Character State

**Seed:** `tests/seed.spec.ts`

#### 14.1. Dead character restrictions

**File:** `tests/e2e/character-sheet/dead-character.spec.ts`

**Steps:**
  1. Navigate to a character sheet
  2. Enable Play Mode
  3. Mark 3 death save failures to kill the character
  4. Verify visual death indicator appears (e.g., skull icon, red border, 'DEAD' badge)
  5. Verify HP is set to 0
  6. Verify Play Mode interactive features become disabled:
  7. - HP cannot be edited
  8. - Death saves are locked
  9. - Cannot add conditions
  10. - Hit dice cannot be spent
  11. - Short/Long rest buttons are disabled
  12. - Spell slots cannot be spent
  13. - Inventory actions are disabled
  14. Click 'Actions' dropdown
  15. Verify 'Revive Character' option is available
  16. Verify 'Add Condition' is NOT available

**Expected Results:**
  - Death is clearly visually indicated
  - Dead characters cannot use Play Mode features
  - Death state persists across tabs
  - Revive option is prominently available
  - Data is still viewable but not editable
  - Export is still available for dead characters
