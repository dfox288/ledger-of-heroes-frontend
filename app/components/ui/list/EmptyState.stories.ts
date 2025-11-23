import type { Meta, StoryObj } from '@storybook/vue3'
import UiListEmptyState from './EmptyState.vue'

// Mock UCard from NuxtUI with proper Tailwind styling
const UCardStub = {
  name: 'UCard',
  template: '<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"><slot /></div>'
}

// Mock UIcon from NuxtUI with proper styling
const UIconStub = {
  name: 'UIcon',
  props: ['name'],
  template: '<div class="inline-flex items-center justify-center" :class="$attrs.class"><svg class="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>'
}

// Mock UButton from NuxtUI with proper Tailwind styling
const UButtonStub = {
  name: 'UButton',
  props: ['color'],
  template: `
    <button
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `
}

const meta: Meta<typeof UiListEmptyState> = {
  title: 'UI/List/EmptyState',
  component: UiListEmptyState,
  tags: ['autodocs'],
  argTypes: {
    entityName: {
      control: 'text',
      description: 'Name of entity type (e.g., "spells", "items")'
    },
    message: {
      control: 'text',
      description: 'Custom message (overrides entityName)'
    },
    hasFilters: {
      control: 'boolean',
      description: 'Whether to show "Clear All Filters" button'
    },
    onClearFilters: {
      action: 'clearFilters',
      description: 'Emitted when clear filters button clicked'
    }
  },
  render: (args) => ({
    components: { UiListEmptyState, UCard: UCardStub, UIcon: UIconStub, UButton: UButtonStub },
    setup() {
      return { args }
    },
    template: '<UiListEmptyState v-bind="args" @clearFilters="args.onClearFilters" />'
  })
}

export default meta
type Story = StoryObj<typeof UiListEmptyState>

/**
 * Default empty state with entity name
 */
export const Default: Story = {
  args: {
    entityName: 'spells'
  }
}

/**
 * Empty state with active filters - shows clear button
 */
export const WithFilters: Story = {
  args: {
    entityName: 'items',
    hasFilters: true
  }
}

/**
 * Custom message instead of entity-based message
 */
export const CustomMessage: Story = {
  args: {
    message: 'Your search didn\'t match any monsters',
    hasFilters: true
  }
}

/**
 * Generic empty state (no entity name)
 */
export const Generic: Story = {
  args: {}
}

/**
 * With filters but custom message
 */
export const CustomWithFilters: Story = {
  args: {
    message: 'No legendary weapons found matching your criteria',
    hasFilters: true
  }
}
