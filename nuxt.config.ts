import type { NuxtPage } from 'nuxt/schema';

// let reload = 0;

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

  modules: ['@nuxt/fonts', '@nuxt/ui'],

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

  icon: {
    provider: 'server',
    serverBundle: {
      collections: ['heroicons']
    },
    clientBundle: {
      icons: [
        'heroicons:chevron-double-left-16-solid',
        'heroicons:chevron-double-right-16-solid',
        'heroicons:chevron-right-20-solid',
        'heroicons:ellipsis-horizontal-circle',
        'heroicons:moon-20-solid',
        'heroicons:sun-20-solid',
        'heroicons:magnifying-glass-20-solid',
        'heroicons:arrow-up',
        'heroicons:arrow-down',
        'heroicons:pencil-square',
        'heroicons:calendar',
        'heroicons:trash',
        'heroicons:x-mark'
      ],
      scan: true,
      includeCustomCollections: true,
      sizeLimitKb: 256
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

  ssr: false,

  devtools: {
    enabled: true
  },

  telemetry: {
    enabled: false
  }
});
