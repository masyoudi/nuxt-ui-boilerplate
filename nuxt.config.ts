import { colors, createAssetColors } from './config/colors';
import { fakerGenerator } from './faker-generator';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/eslint'],

  ssr: false,
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

  future: {
    compatibilityVersion: 4
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },
  compatibilityDate: '2024-11-01',

  vite: {
    server: {
      open: true
    },
    plugins: [
      {
        name: 'api-dev',
        configureServer(server) {
          server.middlewares.use('/api-dev', (req, res, next) => {
            if (!req.url) {
              return next();
            }

            const q = new URLSearchParams(req.url?.split('?').at(1));
            const page = Number(q.get('page')) || 1;
            const perPage = Number.parseInt(String(q.get('perpage'))) || 10;
            const requestedModules = q.get('modules')?.split(',') ?? ['book', 'lorem'];

            const data: Record<string, any>[] = [...Array(!Number.isNaN(perPage) ? perPage : 10)].map((_, i) => ({
              id: page <= 1 ? (i + 1) : ((page - 1) * perPage) + (i + 1),
              ...fakerGenerator(requestedModules as any)
            }));

            res.writeHead(200, { 'content-type': 'application/json' });
            return res.end(JSON.stringify({ data }));
          });
        }
      }
    ]
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
