/**
 * MSW Request Handlers
 *
 * Central export for all API endpoint handlers.
 * Handlers are organized by domain (characters, spells, etc.)
 */

import { characterHandlers } from './characters'
import { referenceHandlers } from './reference'
import { classHandlers } from './classes'

// Combine all handlers for the MSW server
export const handlers = [
  ...characterHandlers,
  ...referenceHandlers,
  ...classHandlers
]
