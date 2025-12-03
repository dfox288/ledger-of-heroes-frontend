// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/image',
    '@nuxt/fonts'
  ],

  devtools: {
    enabled: true
  },

  css: ['./app/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },

  ui: {
    theme: {
      colors: [
        // Standard semantic colors
        'primary', 'secondary', 'info', 'success', 'warning', 'error',
        // Main entity types (7) - semantic names
        'spell', 'item', 'race', 'class', 'background', 'feat', 'monster',
        // Reference entity types (10)
        'ability', 'condition', 'damage', 'itemtype', 'language',
        'proficiency', 'size', 'skill', 'school', 'source'
      ]
    }
  },

  runtimeConfig: {
    // Server-side only (NEVER exposed to client)
    // This is used by Nitro API routes to proxy to Laravel backend
    apiBaseServer: process.env.NUXT_API_BASE_SERVER || 'http://localhost:8080/api/v1',

    // Public keys (exposed to client)
    public: {
      // apiBase no longer needed - frontend uses /api/* (Nitro routes)
      apiDocsUrl: process.env.NUXT_PUBLIC_API_DOCS_URL || 'http://localhost:8080/docs/api',
      imageProvider: process.env.NUXT_PUBLIC_IMAGE_PROVIDER || 'stability-ai'
    }
  },

  experimental: {
    // Disable app manifest in test environment to prevent fetch errors
    appManifest: process.env.NODE_ENV === 'test' ? false : true
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      {
        name: 'Crimson Pro',
        provider: 'google',
        weights: ['200..900'], // Variable font - all weights
        styles: ['normal', 'italic']
      }
    ]
  }
})
