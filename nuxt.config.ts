let reload = 0;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/fonts', '@nuxt/ui'],

  devtools: {
    enabled: true
  },
  app: {
    rootId: '__app',
    head: {
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },
    buildAssetsDir: '/__assets/'
  },

  colorMode: {
    preference: 'light'
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-28',

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

  vite: {
    clearScreen: false
  },

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUnusedParameters: true,
        noUnusedLocals: true,
        verbatimModuleSyntax: true,
        types: ['./types/app']
      }
    }
  },

  telemetry: {
    enabled: false
  },

  hooks: {
    'pages:extend': (pages) => {
      const pagesToRemove = pages.filter((page) => page.path.includes('_components'));

      pagesToRemove.forEach((page) => {
        pages.splice(pages.indexOf(page), 1);
      });
    }
  },

  icon: {
    serverBundle: {
      collections: ['heroicons']
    }
  }
});
