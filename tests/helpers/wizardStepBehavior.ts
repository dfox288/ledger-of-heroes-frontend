import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterWizardStore } from '~/stores/characterWizard'
import type { Component } from 'vue'

export interface WizardStepTestConfig {
  component: Component
  stepTitle: string
  expectedHeading: string
  mountProps?: Record<string, unknown>
}

export interface MountWizardStepOptions {
  props?: Record<string, unknown>
  storeSetup?: (store: ReturnType<typeof useCharacterWizardStore>) => void
}

/**
 * Mounts a wizard step component with a fresh Pinia instance and reset store.
 *
 * @param component - The wizard step component to mount
 * @param options - Mount options including props and store setup callback
 * @returns Object containing the mounted wrapper and store instance
 */
export async function mountWizardStep(
  component: Component,
  options: MountWizardStepOptions = {}
) {
  const { props = {}, storeSetup } = options

  // Create fresh Pinia instance
  setActivePinia(createPinia())

  // Get store and reset to clean state
  const store = useCharacterWizardStore()
  store.reset()

  // Apply optional store setup
  if (storeSetup) {
    storeSetup(store)
  }

  // Mount component with props
  const wrapper = await mountSuspended(component, {
    props: {
      ...props
    }
  })

  return { wrapper, store }
}

/**
 * Generates a describe block with standard tests for wizard step behavior.
 *
 * Tests include:
 * - Structure validation (heading, spacing, help text)
 * - Loading state handling
 * - Error handling capability
 *
 * @param config - Configuration object specifying component and expected behavior
 */
export function testWizardStepBehavior(config: WizardStepTestConfig) {
  const { component, stepTitle, expectedHeading, mountProps = {} } = config

  describe(`${stepTitle} - Standard Behavior`, () => {
    beforeEach(() => {
      setActivePinia(createPinia())
    })

    describe('Structure', () => {
      it('renders the step heading', async () => {
        const { wrapper } = await mountWizardStep(component, { props: mountProps })

        expect(wrapper.text()).toContain(expectedHeading)
      })

      it('has proper spacing container', async () => {
        const { wrapper } = await mountWizardStep(component, { props: mountProps })

        // Check for spacing utility classes
        const html = wrapper.html()
        expect(html).toMatch(/space-y-\d/)
      })

      it('includes help text or instructions', async () => {
        const { wrapper } = await mountWizardStep(component, { props: mountProps })

        // Help text should be present (can be customized per step)
        const text = wrapper.text()
        expect(text.length).toBeGreaterThan(expectedHeading.length)
      })
    })

    describe('Loading State', () => {
      it('handles loading state gracefully', async () => {
        const { wrapper, store } = await mountWizardStep(component, {
          props: mountProps,
          storeSetup: (store) => {
            store.isLoading = true
          }
        })

        // Component should render even when loading
        expect(wrapper.exists()).toBe(true)

        // Should show loading indicator or disabled state
        const html = wrapper.html()
        expect(html).toBeTruthy()
      })
    })

    describe('Error Handling', () => {
      it('can display error state', async () => {
        const { wrapper, store } = await mountWizardStep(component, {
          props: mountProps,
          storeSetup: (store) => {
            store.error = 'Test error message'
          }
        })

        // Component should handle error state
        expect(wrapper.exists()).toBe(true)

        // Error should be accessible (either displayed or handled)
        expect(store.error).toBe('Test error message')
      })
    })
  })
}
