import type { Config } from 'tailwindcss';
import { getColors } from 'theme-colors';

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        main: {
          ...getColors('#74bbf2'),
          DEFAULT: '#74bbf2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  }
};
