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

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
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
