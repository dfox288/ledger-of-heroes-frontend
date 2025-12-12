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
    // Determine backend URL from environment profile
    apiBaseServer: (() => {
      const env = process.env.NUXT_BACKEND_ENV || 'dev'
      const urls: Record<string, string> = {
        dev: 'http://host.docker.internal:8080/api/v1',
        stable: 'http://host.docker.internal:8081/api/v1'
      }
      return urls[env] || urls.dev
    })(),

    // Public keys (exposed to client)
    public: {
      backendEnv: process.env.NUXT_BACKEND_ENV || 'dev',
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
