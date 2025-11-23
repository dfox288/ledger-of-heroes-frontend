import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'

// Import Tailwind CSS
import '../app/assets/css/main.css'

// Setup Vue app (for global plugins, components, etc.)
setup((app) => {
  // NuxtUI components will be imported explicitly in stories
  // This keeps stories self-contained and easier to understand
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' }
      ]
    }
  },
  // Global decorator to add padding around stories
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-8 min-h-screen"><story /></div>'
    })
  ]
}

export default preview
