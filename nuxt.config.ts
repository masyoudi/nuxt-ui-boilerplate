import { colors, createAssetColors } from './config/colors';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],

  pages: {
    pattern: ['**/*.vue', '!**/_components/**', '!**/*/_utils/**']
  },

  devtools: {
    enabled: true
  },

  app: {
    buildAssetsDir: '/_assets/'
  },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: true,
    theme: {
      colors: [...Object.keys(colors), 'error']
    }
  },

  srcDir: 'app/',
  serverDir: 'server/',

  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-11-01',

  nitro: {
    typescript: {
      strict: true,
      tsConfig: {
        compilerOptions: {
          types: ['./server/types/h3']
        }
      }
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@internationalized/date',
        '@tanstack/vue-table',
        '@tanstack/vue-virtual',
        '@vueuse/core',
        '@vueuse/components',
        '@unovis/ts',
        '@unovis/vue',
        '@tiptap/core',
        '@tiptap/extension-subscript',
        '@tiptap/extension-superscript',
        '@tiptap/extension-table',
        '@tiptap/extension-text-align',
        '@tiptap/extension-text-style',
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor',
        'chroma-js',
        'object-to-formdata',
        'tailwind-variants',
        'theme-colors',
        'vue-imask',
        'zod'
      ]
    }
  },

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        allowArbitraryExtensions: true,
        types: ['./app/types/app.d.ts']
      }
    }
  },

  telemetry: false,

  hooks: {
    'build:before': () => createAssetColors()
  },

  eslint: {
    config: {
      formatters: true,
      stylistic: {
        semi: true,
        quotes: 'single',
        commaDangle: 'never',
        arrowParens: true
      }
    }
  }
});
