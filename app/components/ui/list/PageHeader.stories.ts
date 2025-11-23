import type { Meta, StoryObj } from '@storybook/vue3'
import UiListPageHeader from './PageHeader.vue'

const meta: Meta<typeof UiListPageHeader> = {
  title: 'UI/List/PageHeader',
  component: UiListPageHeader,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Page title'
    },
    total: {
      control: 'number',
      description: 'Total number of items'
    },
    description: {
      control: 'text',
      description: 'Page description text'
    },
    loading: {
      control: 'boolean',
      description: 'Whether data is currently loading'
    },
    hasActiveFilters: {
      control: 'boolean',
      description: 'Whether filters are currently active'
    }
  }
}

export default meta
type Story = StoryObj<typeof UiListPageHeader>

/**
 * Default header with count displayed
 */
export const Default: Story = {
  args: {
    title: 'Spells',
    total: 350,
    description: 'Browse and search D&D 5e spells'
  }
}

/**
 * Header while loading - count is hidden
 */
export const Loading: Story = {
  args: {
    title: 'Spells',
    total: 350,
    description: 'Browse and search D&D 5e spells',
    loading: true
  }
}

/**
 * Header with active filters - shows "filtered" label
 */
export const WithActiveFilters: Story = {
  args: {
    title: 'Spells',
    total: 42,
    description: 'Browse and search D&D 5e spells',
    hasActiveFilters: true
  }
}

/**
 * Header without description
 */
export const NoDescription: Story = {
  args: {
    title: 'Magic Items',
    total: 523
  }
}

/**
 * Header without count - useful for non-paginated pages
 */
export const NoCount: Story = {
  args: {
    title: 'Reference Tables',
    description: 'Quick reference for game mechanics'
  }
}

/**
 * Very large count - tests number formatting
 */
export const LargeCount: Story = {
  args: {
    title: 'Database Records',
    total: 999999,
    description: 'Complete dataset'
  }
}
