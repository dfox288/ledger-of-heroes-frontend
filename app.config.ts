export default defineAppConfig({
  ui: {
    // Color scheme
    primary: 'green',
    gray: 'slate',

    // Global component overrides for proper styling
    selectMenu: {
      // Ensure dropdown content has proper background in both modes
      content: 'bg-white dark:bg-gray-900',
    },

    card: {
      // Ensure cards have proper backgrounds
      background: 'bg-white dark:bg-gray-900',
    }
  }
})
