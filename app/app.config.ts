export default defineAppConfig({
    ui: {
        colors: {
            // Main entity types (7) - D&D thematic colors
            spell: 'arcane',        // Mystical purple - magical energy
            item: 'treasure',       // Rich gold - valuable treasures
            race: 'emerald',        // Natural green - diversity of peoples
            class: 'red',           // Heroic red - martial prowess
            background: 'lore',     // Warm brown - history and origins
            feat: 'glory',          // Bright blue - achievement
            monster: 'danger',      // Vibrant orange - combat threat

            // Reference entity types (10) - Tailwind defaults
            ability: 'indigo',      // Core stats
            condition: 'rose',      // Status effects
            damage: 'slate',        // Mechanical data
            itemtype: 'teal',       // Categorization
            language: 'cyan',       // Communication
            proficiency: 'lime',    // Training
            size: 'zinc',           // Physical properties
            skill: 'yellow',        // Expertise
            school: 'fuchsia',      // Arcane categories
            source: 'neutral'       // Books, references
        }
    }
})
