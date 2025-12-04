// app/middleware/wizard-step.ts
// Route guard that prevents access to conditional wizard steps when conditions aren't met
import { stepRegistry } from '~/composables/useWizardSteps'

/**
 * Extract step name from route path
 * Handles paths like /characters/42/edit/race
 */
function extractStepFromPath(path: string): string {
  const match = path.match(/\/characters\/\d+\/edit\/([^/?]+)/)
  return match?.[1] || ''
}

/**
 * Check if a step is accessible
 * Exported for testing purposes
 */
export function isStepAccessible(stepName: string): boolean {
  const step = stepRegistry.find(s => s.name === stepName)
  // Step exists AND is currently visible
  return !!step && step.visible()
}

export default defineNuxtRouteMiddleware((to) => {
  // Extract step name from path (works with static nested routes)
  const stepName = extractStepFromPath(to.path)
  const characterId = to.params.id

  if (!isStepAccessible(stepName)) {
    return navigateTo(`/characters/${characterId}/edit/name`)
  }

  // Step exists and is visible - allow navigation
})
