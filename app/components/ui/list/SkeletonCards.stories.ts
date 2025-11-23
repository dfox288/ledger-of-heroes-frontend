import type { Meta, StoryObj } from '@storybook/vue3'
import UiListSkeletonCards from './SkeletonCards.vue'

// Mock UCard from NuxtUI
const UCardStub = {
  name: 'UCard',
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <slot />
    </div>
  `
}

const meta: Meta<typeof UiListSkeletonCards> = {
  title: 'UI/List/SkeletonCards',
  component: UiListSkeletonCards,
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Number of skeleton cards to display'
    }
  },
  render: (args) => ({
    components: { UiListSkeletonCards, UCard: UCardStub },
    setup() {
      return { args }
    },
    template: '<UiListSkeletonCards v-bind="args" />'
  })
}

export default meta
type Story = StoryObj<typeof UiListSkeletonCards>

/**
 * Default loading state with 6 skeleton cards
 */
export const Default: Story = {
  args: {
    count: 6
  }
}

/**
 * Minimal loading with 3 cards
 */
export const ThreeCards: Story = {
  args: {
    count: 3
  }
}

/**
 * Full grid with 9 cards
 */
export const NineCards: Story = {
  args: {
    count: 9
  }
}

/**
 * Large loading state with 12 cards
 */
export const TwelveCards: Story = {
  args: {
    count: 12
  }
}

/**
 * Single skeleton card
 */
export const SingleCard: Story = {
  args: {
    count: 1
  }
}
