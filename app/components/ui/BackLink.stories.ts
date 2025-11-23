import type { Meta, StoryObj } from '@storybook/vue3'
import BackLink from './BackLink.vue'

// Mock NuxtLink as a simple anchor
const NuxtLinkStub = {
  name: 'NuxtLink',
  props: ['to'],
  template: '<a :href="to" class="inline-block"><slot /></a>'
}

// Mock UButton from NuxtUI
const UButtonStub = {
  name: 'UButton',
  props: ['color', 'variant', 'icon'],
  template: `
    <button 
      :class="[
        'inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors',
        'text-neutral-700 dark:text-neutral-200',
        'bg-neutral-100 dark:bg-neutral-800',
        'hover:bg-neutral-200 dark:hover:bg-neutral-700'
      ]"
    >
      <span v-if="icon" :class="icon" class="w-5 h-5"></span>
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
