import type { Meta, StoryObj } from '@storybook/vue3'
import UiListResultsCount from './ResultsCount.vue'

const meta: Meta<typeof UiListResultsCount> = {
  title: 'UI/List/ResultsCount',
  component: UiListResultsCount,
  tags: ['autodocs'],
  argTypes: {
    from: {
      control: 'number',
      description: 'Starting index of current page'
    },
    to: {
      control: 'number',
      description: 'Ending index of current page'
    },
    total: {
      control: 'number',
      description: 'Total number of items'
    },
    entityName: {
      control: 'text',
      description: 'Entity type name (automatically pluralized)'
    }
  }
}

export default meta
type Story = StoryObj<typeof UiListResultsCount>

/**
 * First page of results
 */
export const FirstPage: Story = {
  args: {
    from: 1,
    to: 24,
    total: 350,
    entityName: 'spell'
  }
}

/**
 * Middle page of results
 */
export const MiddlePage: Story = {
  args: {
    from: 25,
    to: 48,
    total: 350,
    entityName: 'spell'
  }
}

/**
 * Last page with fewer items
 */
export const LastPage: Story = {
  args: {
    from: 337,
    to: 350,
    total: 350,
    entityName: 'spell'
  }
}

/**
 * Single page of results (all items fit)
 */
export const SinglePage: Story = {
  args: {
    from: 1,
    to: 12,
    total: 12,
    entityName: 'language'
  }
}

/**
 * Without entity name - uses "results"
 */
export const Generic: Story = {
  args: {
    from: 1,
    to: 24,
    total: 156
  }
}

/**
 * Large numbers - thousands of results
 */
export const LargeDataset: Story = {
  args: {
    from: 9001,
    to: 9024,
    total: 15432,
    entityName: 'record'
  }
}

/**
 * Entity name already plural
 */
export const AlreadyPlural: Story = {
  args: {
    from: 1,
    to: 15,
    total: 30,
    entityName: 'proficiency types'
  }
}
