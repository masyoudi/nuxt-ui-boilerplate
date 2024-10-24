import { colors, createAssetColors } from './config/colors';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  devtools: {
    enabled: true
  },

  app: {
    buildAssetsDir: '/_assets/'
  },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: false,
    theme: {
      colors: Object.keys(colors)
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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (['echarts', 'zrender'].includes(id)) {
              return 'echarts';
            }
          }
        }
      }
    }
  },

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        types: ['./shared/types/app']
      }
    }
  },

  telemetry: false,

  hooks: {
    'build:before': () => createAssetColors(),
    'pages:extend': (pages) => {
      const ignorePaths = ['_components', '_utils'];
      const pagesToRemove = pages.filter((page) => page.path.split('/').some((path) => ignorePaths.includes(path)));

      pagesToRemove.forEach((page) => {
        pages.splice(pages.findIndex((p) => p.path === page.path), 1);
      });
    }
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
