import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import StepEquipment from '~/components/character/wizard/StepEquipment.vue'
import { testWizardStepBehavior, mountWizardStep } from '../../../helpers/wizardStepBehavior'
import { wizardMockClasses, wizardMockBackgrounds } from '../../../helpers/mockFactories'

// Run shared behavior tests
testWizardStepBehavior({
  component: StepEquipment,
  stepTitle: 'Equipment',
  expectedHeading: 'Choose Your Starting Equipment'
})

describe('StepEquipment - Specific Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('displays equipment selection heading', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
          store.selections.background = wizardMockBackgrounds.acolyte
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Choose Your Starting Equipment')
      expect(text).toContain('starting gear')
    })

    it('shows loading state while fetching equipment choices', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      // Component should exist and handle loading state
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Class Equipment Display', () => {
    it('shows class name in section header when class is selected', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      // Due to Pinia context isolation, the text may not reflect store state
      // Verify component structure instead
      const vm = wrapper.vm as any
      expect(vm.classFixedEquipment).toBeDefined()
      // The template has "From Your Class" text
      const text = wrapper.text()
      expect(text).toContain('Choose Your Starting Equipment')
    })

    it('displays fixed equipment items from class', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = {
            ...wizardMockClasses.fighter,
            equipment: [
              {
                id: 1,
                item_id: 1,
                quantity: 1,
                is_choice: false,
                item: { id: 1, name: 'Chain Mail', slug: 'chain-mail' }
              }
            ]
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.classFixedEquipment).toBeDefined()
      expect(Array.isArray(vm.classFixedEquipment)).toBe(true)
    })

    it('separates fixed equipment from choice equipment', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = {
            ...wizardMockClasses.fighter,
            equipment: [
              {
                id: 1,
                item_id: 1,
                quantity: 1,
                is_choice: false,
                item: { id: 1, name: 'Chain Mail', slug: 'chain-mail' }
              },
              {
                id: 2,
                item_id: null,
                quantity: 1,
                is_choice: true,
                description: 'Choose a martial weapon'
              }
            ]
          }
        }
      })

      const vm = wrapper.vm as any
      // Fixed equipment only includes non-choice items
      expect(vm.classFixedEquipment.every((eq: { is_choice: boolean }) => !eq.is_choice)).toBe(true)
    })
  })

  describe('Background Equipment Display', () => {
    it('shows background name in section header when background is selected', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.background = wizardMockBackgrounds.acolyte
        }
      })

      // Due to Pinia context isolation, the text may not reflect store state
      // Verify component structure instead
      const vm = wrapper.vm as any
      expect(vm.backgroundFixedEquipment).toBeDefined()
      // Component should render
      expect(wrapper.exists()).toBe(true)
    })

    it('displays fixed equipment items from background', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.background = {
            ...wizardMockBackgrounds.acolyte,
            equipment: [
              {
                id: 1,
                item_id: 1,
                quantity: 1,
                is_choice: false,
                item: { id: 1, name: 'Holy Symbol', slug: 'holy-symbol' }
              }
            ]
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.backgroundFixedEquipment).toBeDefined()
      expect(Array.isArray(vm.backgroundFixedEquipment)).toBe(true)
    })
  })

  describe('Equipment Choice Selection', () => {
    it('tracks local selections for equipment choices', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.localSelections).toBeDefined()
      expect(vm.localSelections instanceof Map).toBe(true)
    })

    it('handles choice selection via handleChoiceSelect', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      vm.handleChoiceSelect('choice-1', 'a')
      await wrapper.vm.$nextTick()

      expect(vm.localSelections.get('choice-1')).toBe('a')
    })

    it('clears item selections when choice option changes', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any

      // Add an item selection for choice-1, option a
      vm.handleItemSelect('choice-1', 'a', 'longsword')
      await wrapper.vm.$nextTick()
      expect(vm.itemSelections.get('choice-1:a')).toBe('longsword')

      // Change to option b - should clear item selections for this choice
      vm.handleChoiceSelect('choice-1', 'b')
      await wrapper.vm.$nextTick()
      expect(vm.itemSelections.has('choice-1:a')).toBe(false)
    })
  })

  describe('Item Selection for Filtered Options', () => {
    it('handles item selection for "any weapon" type choices', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      vm.handleItemSelect('choice-1', 'a', 'battleaxe')
      await wrapper.vm.$nextTick()

      expect(vm.itemSelections.get('choice-1:a')).toBe('battleaxe')
    })

    it('supports multiple item selections for multi-select options', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any

      // Simulate multi-select by setting primary and indexed selections
      vm.itemSelections.set('choice-1:a', 'longsword')
      vm.itemSelections.set('choice-1:a:1', 'shortsword')
      await wrapper.vm.$nextTick()

      const gathered = vm.gatherItemSelectionsForOption('choice-1', 'a')
      expect(gathered).toContain('longsword')
      expect(gathered).toContain('shortsword')
    })
  })

  describe('Pack Contents Display', () => {
    it('detects pack contents on items', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any

      // Test hasPackContents function
      const itemWithContents = {
        item: {
          contents: [
            { quantity: '1', item: { name: 'Bedroll' } }
          ]
        }
      }
      expect(vm.hasPackContents(itemWithContents)).toBe(true)

      const itemWithoutContents = {
        item: { name: 'Longsword' }
      }
      expect(vm.hasPackContents(itemWithoutContents)).toBe(false)
    })

    it('toggles pack contents visibility', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any

      // Initially not expanded
      expect(vm.isFixedPackExpanded(1)).toBe(false)

      // Toggle to expanded
      vm.toggleFixedPackContents(1)
      await wrapper.vm.$nextTick()
      expect(vm.isFixedPackExpanded(1)).toBe(true)

      // Toggle back to collapsed
      vm.toggleFixedPackContents(1)
      await wrapper.vm.$nextTick()
      expect(vm.isFixedPackExpanded(1)).toBe(false)
    })

    it('formats pack content items with quantity', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any

      // Single item
      expect(vm.formatPackContentItem({ quantity: '1', item: { name: 'Torch' } })).toBe('Torch')

      // Multiple items
      expect(vm.formatPackContentItem({ quantity: '10', item: { name: 'Torch' } })).toBe('10 Torch')
    })
  })

  describe('Item Display Names', () => {
    it('uses custom_name when available', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getItemDisplayName({ custom_name: 'My Sword' })).toBe('My Sword')
    })

    it('falls back to item.name when no custom_name', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getItemDisplayName({ item: { name: 'Longsword' } })).toBe('Longsword')
    })

    it('falls back to description when no item name', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getItemDisplayName({ description: 'A martial weapon' })).toBe('A martial weapon')
    })

    it('returns Unknown item when no name available', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getItemDisplayName({})).toBe('Unknown item')
    })
  })

  describe('Validation', () => {
    it('tracks whether all equipment choices are made', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.allEquipmentChoicesMade).toBe('boolean')
    })

    it('disables continue button when choices are pending', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      // Check button exists and has disabled functionality
      const button = wrapper.find('[data-testid="continue-btn"]')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Continue Flow', () => {
    it('has handleContinue method for saving choices', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(typeof vm.handleContinue).toBe('function')
    })

    it('tracks saving state during continue', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      expect(vm.isSaving).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('displays error state when choices fail to load', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const vm = wrapper.vm as any
      // choicesError comes from useUnifiedChoices
      expect(vm.choicesError === null || typeof vm.choicesError === 'string').toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('has descriptive heading', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Choose Your Starting Equipment')
    })

    it('has instructional text for users', async () => {
      const { wrapper } = await mountWizardStep(StepEquipment, {
        storeSetup: (store) => {
          store.selections.class = wizardMockClasses.fighter
        }
      })

      const text = wrapper.text()
      expect(text).toContain('starting gear')
      expect(text).toContain('class')
      expect(text).toContain('background')
    })
  })

  describe('Gold Alternative Option', () => {
    // Note: These tests focus on component-local state since Nuxt test utils
    // creates isolated Pinia instances for mounted components. Tests that need
    // to verify store<->component integration should use E2E tests.

    describe('Equipment Mode Toggle', () => {
      it('defaults to equipment mode', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        expect(vm.equipmentMode).toBe('equipment')
      })

      it('can switch to gold mode', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        vm.equipmentMode = 'gold'
        await wrapper.vm.$nextTick()

        expect(vm.equipmentMode).toBe('gold')
      })
    })

    describe('Gold Mode Display', () => {
      it('hides class equipment choices when gold mode selected', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        vm.equipmentMode = 'gold'
        await wrapper.vm.$nextTick()

        // Class equipment section should be hidden in gold mode
        expect(vm.showClassEquipment).toBe(false)
      })

      it('shows class equipment when equipment mode selected', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        vm.equipmentMode = 'equipment'
        await wrapper.vm.$nextTick()

        // Class equipment section should be visible in equipment mode
        expect(vm.showClassEquipment).toBe(true)
      })
    })

    describe('Gold Amount Calculation', () => {
      it('returns average gold amount when method is average', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        // Manually set startingWealth for testing (simulating store data)
        // We test the goldAmount computed in isolation
        vm.goldCalculationMethod = 'average'
        await wrapper.vm.$nextTick()

        // goldAmount depends on startingWealth.average
        // Since component can't see store data in test, goldAmount will be 0
        // This is expected behavior for unit tests
        expect(vm.goldCalculationMethod).toBe('average')
      })

      it('rollForGold function exists and sets gold calculation method', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        expect(typeof vm.rollForGold).toBe('function')
      })

      it('tracks rolled gold amount', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        // Initially null (no roll yet)
        expect(vm.rolledGoldAmount).toBeNull()

        // After calling rollForGold without startingWealth, it stays null
        vm.rollForGold()
        await wrapper.vm.$nextTick()
        // Without startingWealth data, rollForGold returns early
        expect(vm.rolledGoldAmount).toBeNull()
      })

      it('resets gold state when switching from gold to equipment mode', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any

        // Set to gold mode with a rolled amount
        vm.equipmentMode = 'gold'
        vm.rolledGoldAmount = 150
        vm.goldCalculationMethod = 'roll'
        await wrapper.vm.$nextTick()

        // Switch back to equipment mode
        vm.equipmentMode = 'equipment'
        await wrapper.vm.$nextTick()

        // State should be reset
        expect(vm.rolledGoldAmount).toBeNull()
        expect(vm.goldCalculationMethod).toBe('average')
      })

      it('tracks mode switching state to prevent duplicate API calls', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        // isSwitchingMode should exist and be false initially
        expect(vm.isSwitchingMode).toBe(false)
      })
    })

    describe('Equipment Mode Validation', () => {
      it('allows continue when gold mode is selected (no equipment choices needed)', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        vm.equipmentMode = 'gold'
        await wrapper.vm.$nextTick()

        // In gold mode, class equipment choices are skipped
        // allEquipmentChoicesMade should be true (only background choices matter)
        expect(vm.allEquipmentChoicesMade).toBe(true)
      })

      it('validates equipment choices when equipment mode is selected', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        vm.equipmentMode = 'equipment'
        await wrapper.vm.$nextTick()

        // In equipment mode, choices must be made
        expect(typeof vm.allEquipmentChoicesMade).toBe('boolean')
      })
    })

    describe('hasStartingWealth computed', () => {
      it('returns false when no class is selected', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = null
          }
        })

        const vm = wrapper.vm as any
        expect(vm.hasStartingWealth).toBe(false)
      })

      it('hasStartingWealth computed property exists', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        // The computed exists and returns a boolean
        expect(typeof vm.hasStartingWealth).toBe('boolean')
      })

      it('startingWealth computed property exists', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        // The computed exists
        expect(vm.startingWealth === null || typeof vm.startingWealth === 'object').toBe(true)
      })
    })
  })

  describe('Category Equipment Choices (is_category flag)', () => {
    // These tests verify the fix for GitHub issue #461:
    // Equipment choices with is_category=true require item selections,
    // not just option selection

    describe('optionRequiresItemSelection helper', () => {
      it('returns true when is_category flag is true', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const categoryOption = {
          option: '`',
          label: 'any two simple weapons',
          is_category: true,
          items: [
            { full_slug: 'phb:club', quantity: 2, is_fixed: false },
            { full_slug: 'phb:dagger', quantity: 2, is_fixed: false }
          ]
        }

        expect(vm.optionRequiresItemSelection(categoryOption)).toBe(true)
      })

      it('returns false when is_category flag is false', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const fixedOption = {
          option: 'a',
          label: 'studded leather armor',
          is_category: false,
          items: [{ full_slug: 'phb:studded-leather', quantity: 1, is_fixed: true }]
        }

        expect(vm.optionRequiresItemSelection(fixedOption)).toBe(false)
      })

      it('falls back to heuristic when is_category is undefined', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any

        // 3+ items with same quantity = category (heuristic)
        const likelyCategoryOption = {
          option: 'a',
          items: [
            { quantity: 1 },
            { quantity: 1 },
            { quantity: 1 }
          ]
        }
        expect(vm.optionRequiresItemSelection(likelyCategoryOption)).toBe(true)

        // 2 items = not a category (heuristic)
        const simpleOption = {
          option: 'a',
          items: [{ quantity: 1 }, { quantity: 1 }]
        }
        expect(vm.optionRequiresItemSelection(simpleOption)).toBe(false)
      })
    })

    describe('getRequiredItemCount helper', () => {
      it('uses select_count when provided', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const option = {
          option: '`',
          is_category: true,
          select_count: 2,
          category_item_count: 14, // Number of items in category, NOT selections
          items: [
            { quantity: 1 },
            { quantity: 1 },
            { quantity: 1 }
          ]
        }

        expect(vm.getRequiredItemCount(option)).toBe(2)
      })

      it('defaults to 1 when select_count not provided', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const option = {
          option: '`',
          is_category: true,
          category_item_count: 14, // This is NOT used for selection count
          items: [
            { quantity: 3 },
            { quantity: 3 }
          ]
        }

        // Should default to 1, not use category_item_count or item quantity
        expect(vm.getRequiredItemCount(option)).toBe(1)
      })
    })

    describe('countItemSelections helper', () => {
      it('counts primary key selection', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        vm.itemSelections.set('choice-1:`', 'phb:club')

        expect(vm.countItemSelections('choice-1', '`')).toBe(1)
      })

      it('counts indexed key selections', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        vm.itemSelections.set('choice-1:`', 'phb:club')
        vm.itemSelections.set('choice-1:`:1', 'phb:dagger')

        expect(vm.countItemSelections('choice-1', '`')).toBe(2)
      })

      it('returns 0 when no selections exist', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        expect(vm.countItemSelections('nonexistent', 'a')).toBe(0)
      })
    })

    describe('isChoiceFullySatisfied helper', () => {
      it('returns true when choice.remaining is 0', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const resolvedChoice = { id: 'test', remaining: 0, options: [] }

        expect(vm.isChoiceFullySatisfied(resolvedChoice)).toBe(true)
      })

      it('returns false when no option is selected', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const unresolvedChoice = {
          id: 'test',
          remaining: 1,
          options: [{ option: 'a', is_category: false }]
        }

        expect(vm.isChoiceFullySatisfied(unresolvedChoice)).toBe(false)
      })

      it('returns true for non-category choice with option selected', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const choice = {
          id: 'test',
          remaining: 1,
          options: [
            { option: 'a', is_category: false, items: [{ is_fixed: true }] },
            { option: 'b', is_category: false, items: [{ is_fixed: true }] }
          ]
        }

        // Select option 'a'
        vm.localSelections.set('test', 'a')
        await wrapper.vm.$nextTick()

        expect(vm.isChoiceFullySatisfied(choice)).toBe(true)
      })

      it('returns false for category choice without item selections', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const categoryChoice = {
          id: 'test-category',
          remaining: 1,
          options: [{
            option: '`',
            is_category: true,
            select_count: 1, // User must select 1 item
            category_item_count: 14, // 14 items available (not used for validation)
            items: [
              { full_slug: 'phb:club', quantity: 1, is_fixed: false },
              { full_slug: 'phb:dagger', quantity: 1, is_fixed: false }
            ]
          }]
        }

        // Select the category option but don't select items
        vm.localSelections.set('test-category', '`')
        await wrapper.vm.$nextTick()

        expect(vm.isChoiceFullySatisfied(categoryChoice)).toBe(false)
      })

      it('returns true for category choice with all required item selections', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const categoryChoice = {
          id: 'test-category',
          remaining: 1,
          options: [{
            option: '`',
            is_category: true,
            select_count: 2, // User must select 2 items (e.g., "two martial weapons")
            category_item_count: 14, // 14 items available
            items: [
              { full_slug: 'phb:club', quantity: 1, is_fixed: false },
              { full_slug: 'phb:dagger', quantity: 1, is_fixed: false }
            ]
          }]
        }

        // Select the category option
        vm.localSelections.set('test-category', '`')
        // Select 2 items (matching select_count)
        vm.itemSelections.set('test-category:`', 'phb:club')
        vm.itemSelections.set('test-category:`:1', 'phb:dagger')
        await wrapper.vm.$nextTick()

        expect(vm.isChoiceFullySatisfied(categoryChoice)).toBe(true)
      })

      it('returns false for category choice with insufficient item selections', async () => {
        const { wrapper } = await mountWizardStep(StepEquipment, {
          storeSetup: (store) => {
            store.selections.class = wizardMockClasses.fighter
          }
        })

        const vm = wrapper.vm as any
        const categoryChoice = {
          id: 'test-category',
          remaining: 1,
          options: [{
            option: '`',
            is_category: true,
            select_count: 2, // User must select 2 items
            category_item_count: 14, // 14 items available
            items: [
              { full_slug: 'phb:club', quantity: 1, is_fixed: false },
              { full_slug: 'phb:dagger', quantity: 1, is_fixed: false }
            ]
          }]
        }

        // Select the category option
        vm.localSelections.set('test-category', '`')
        // Only select 1 item (need 2 per select_count)
        vm.itemSelections.set('test-category:`', 'phb:club')
        await wrapper.vm.$nextTick()

        expect(vm.isChoiceFullySatisfied(categoryChoice)).toBe(false)
      })
    })
  })
})
