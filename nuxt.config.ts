import type { NuxtPage } from 'nuxt/schema';

let reload = 0;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    rootId: '__app',
    head: {
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },
    buildAssetsDir: '/__assets/'
  },

  hooks: {
    'pages:extend': (pages) => {
      const pagesToRemove: NuxtPage[] = [];
      pages.forEach((page) => {
        if (page.path.includes('_components')) {
          pagesToRemove.push(page);
        }
      });

      pagesToRemove.forEach((page) => {
        pages.splice(pages.indexOf(page), 1);
      });
    }
  },

  nitro: {
    hooks: {
      'dev:reload': () => {
        reload++;
        console.info('App is', reload === 1 ? 'running' : 'reloaded');
      }
    },
    typescript: {
      strict: true,
      tsConfig: {
        compilerOptions: {
          noUnusedParameters: true,
          noUnusedLocals: true,
          verbatimModuleSyntax: true
        }
      }
    }
  },

  modules: ['@nuxt/ui'],

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUnusedParameters: true,
        noUnusedLocals: true,
        verbatimModuleSyntax: true
      }
    }
  },

  vite: {
    clearScreen: false
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-28',

  colorMode: {
    preference: 'light'
  },

  devtools: {
    enabled: true
  },

  telemetry: {
    enabled: false
  }
});
