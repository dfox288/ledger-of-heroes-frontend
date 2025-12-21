/**
 * Currency Configuration
 *
 * Centralized configuration for D&D currency display.
 * Used by StatCurrency (coin display) and CurrencyEditModal (edit form).
 *
 * Currency order follows D&D convention: highest to lowest value.
 * - PP (Platinum): 10 GP
 * - GP (Gold): base unit
 * - EP (Electrum): 0.5 GP (rarely used)
 * - SP (Silver): 0.1 GP
 * - CP (Copper): 0.01 GP
 */

/**
 * Currency configuration with display properties
 */
export const CURRENCY_CONFIG = [
  {
    key: 'pp',
    /** Single letter abbreviation for coin display */
    abbrev: 'P',
    /** Two-letter label for forms */
    label: 'PP',
    /** Full name */
    name: 'Platinum',
    /** Background color classes for coin circle */
    bg: 'bg-gray-300 dark:bg-gray-500',
    /** Text color classes for coin circle letter */
    coinText: 'text-gray-700 dark:text-gray-200',
    /** Text color classes for form labels */
    labelText: 'text-gray-400 dark:text-gray-300'
  },
  {
    key: 'gp',
    abbrev: 'G',
    label: 'GP',
    name: 'Gold',
    bg: 'bg-yellow-400 dark:bg-yellow-500',
    coinText: 'text-yellow-800 dark:text-yellow-900',
    labelText: 'text-yellow-600 dark:text-yellow-500'
  },
  {
    key: 'ep',
    abbrev: 'E',
    label: 'EP',
    name: 'Electrum',
    bg: 'bg-gray-200 dark:bg-gray-400',
    coinText: 'text-gray-600 dark:text-gray-700',
    labelText: 'text-gray-500 dark:text-gray-400'
  },
  {
    key: 'sp',
    abbrev: 'S',
    label: 'SP',
    name: 'Silver',
    bg: 'bg-slate-300 dark:bg-slate-400',
    coinText: 'text-slate-700 dark:text-slate-800',
    labelText: 'text-slate-400 dark:text-slate-300'
  },
  {
    key: 'cp',
    abbrev: 'C',
    label: 'CP',
    name: 'Copper',
    bg: 'bg-orange-400 dark:bg-orange-500',
    coinText: 'text-orange-800 dark:text-orange-900',
    labelText: 'text-orange-700 dark:text-orange-500'
  }
] as const

/**
 * Currency key type derived from config
 */
export type CurrencyKey = typeof CURRENCY_CONFIG[number]['key']

/**
 * Currency config item type
 */
export type CurrencyConfigItem = typeof CURRENCY_CONFIG[number]
