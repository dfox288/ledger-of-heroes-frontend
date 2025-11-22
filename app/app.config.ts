export default defineAppConfig({
        ui: {
            colors: {
                primary: 'dndtest',
                secondary: 'emerald',
                tertiary: 'stone'            }
        },

        // Global component overrides for proper styling
        selectMenu: {
            // Ensure dropdown content has proper background in both modes
            content: 'bg-white dark:bg-gray-900'
        },

        card: {
            // Ensure cards have proper backgrounds
            background: 'bg-white dark:bg-gray-900'
        }
    }
)
