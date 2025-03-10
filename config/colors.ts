import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getColors } from 'theme-colors';
import { getCssColorOklch } from '../shared/utils/color';

export const colors = {
  primary: '#3e58d2',
  secondary: '#496aeb',
  info: '#5793eb',
  success: '#03c948',
  warning: '#ffbb00',
  danger: '#fe1616'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create tailwind color shades
 * @param color - Hex color value
 * @param variant - Variant name
 * @returns string
 */
function getThemeColors(color: string, variant: string) {
  const result = getColors(color);
  const arr = [
    `--color-${variant}: ${getCssColorOklch(color)};`,
    ...Object.entries(result).map(([key, val]) => `--color-${variant}-${key}: ${getCssColorOklch(val)};`)
  ];

  return arr.map((val) => `  ${val}`).join('\n');
};

/**
 * Generate asset colors css
 */
export const createAssetColors = (): void => {
  try {
    const comment = '/* Don\'t modify this file */\n/* This file is generated from /config/colors.ts */\n';
    const _colors = Object.entries(colors).map(([variant, color]) => getThemeColors(color, variant));
    const content = `${comment}\n@theme static {\n${_colors.join('\n\n')}\n}\n`;
    const filePath = '../app/assets/css/colors.css';

    writeFileSync(resolve(__dirname, filePath), content);
    console.info('Color variables has been generated');
  }
  catch {
    console.error('Failed generate color variables');
  }
};
