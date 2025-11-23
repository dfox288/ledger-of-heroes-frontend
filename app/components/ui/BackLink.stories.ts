import type { Meta, StoryObj } from '@storybook/vue3'
import BackLink from './BackLink.vue'

// Mock NuxtLink as a simple anchor
const NuxtLinkStub = {
  name: 'NuxtLink',
  props: ['to'],
  template: '<a :href="to" class="inline-block"><slot /></a>'
}

// Mock UButton from NuxtUI with proper Tailwind styling
const UButtonStub = {
  name: 'UButton',
  props: ['color', 'variant', 'icon'],
  template: `
    <button
      class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
    >
      <span v-if="icon" class="w-4 h-4 opacity-70">←</span>
      <slot />
    </button>
  `
}

const meta: Meta<typeof BackLink> = {
  title: 'UI/Navigation/BackLink',
  component: BackLink,
  tags: ['autodocs'],
  argTypes: {
    to: {
      control: 'text',
      description: 'Destination route path'
    },
    label: {
      control: 'text',
      description: 'Link text to display'
    },
    icon: {
      control: 'text',
      description: 'Heroicons icon class'
    }
  },
  // Provide stubs for Nuxt components
  render: (args) => ({
    components: { BackLink, NuxtLink: NuxtLinkStub, UButton: UButtonStub },
    setup() {
      return { args }
    },
    template: '<BackLink v-bind="args" />'
  })
}

export default meta
type Story = StoryObj<typeof BackLink>

/**
 * Default back link with standard styling
 */
export const Default: Story = {
  args: {
    to: '/spells',
    label: 'Back to Spells'
  }
}

/**
 * Link to homepage with home icon
 */
export const HomePage: Story = {
  args: {
    to: '/',
    label: 'Home',
    icon: 'i-heroicons-home'
  }
}

/**
 * Link with a very long label to test text wrapping
 */
export const LongLabel: Story = {
  args: {
    to: '/spell-schools',
    label: 'Back to Spell Schools and Arcane Magical Disciplines'
  }
}

/**
 * Back link using default label (derived from props)
 */
export const DefaultLabel: Story = {
  args: {
    to: '/items'
    // label omitted - should use default "Back to Home"
  }
}
