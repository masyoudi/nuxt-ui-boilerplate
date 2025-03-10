import type { Config } from 'tailwindcss';

const config: Partial<Config> = {
  theme: {
    extend: {
      typography: {
        sm: {
          css: {
            p: {
              marginTop: '0.5em',
              marginBottom: '0.5em'
            }
          }
        }
      }
    }
  }
};

export default config;
