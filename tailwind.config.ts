import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Crimson Pro', ...defaultTheme.fontFamily.sans]
      },
      fontSize: {
        // Increase base sizes by ~20%
        'xs': ['0.84rem', { lineHeight: '1.2rem' }],      // was 0.75rem
        'sm': ['0.96rem', { lineHeight: '1.44rem' }],     // was 0.875rem
        'base': ['1.125rem', { lineHeight: '1.875rem' }], // was 1rem
        'lg': ['1.25rem', { lineHeight: '2rem' }],        // was 1.125rem
        'xl': ['1.375rem', { lineHeight: '2.125rem' }],   // was 1.25rem
        '2xl': ['1.65rem', { lineHeight: '2.5rem' }],     // was 1.5rem
        '3xl': ['2.1rem', { lineHeight: '2.75rem' }],     // was 1.875rem
        '4xl': ['2.625rem', { lineHeight: '3.25rem' }],   // was 2.25rem
        '5xl': ['3.375rem', { lineHeight: '3.75rem' }],   // was 3rem
        '6xl': ['4.125rem', { lineHeight: '4.5rem' }],    // was 3.75rem
      }
    }
  }
} satisfies Config
