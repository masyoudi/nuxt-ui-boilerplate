import { useMode, modeOklch, parseHex, formatCss } from 'culori/fn';
import type { Rgb } from 'culori';

/**
 * Math rounding
 * @param value - Value to parse
 * @param precision - Precision trailing number
 * @returns number
 */
function round(value: number, precision = 3) {
  return (
    Math.round(parseFloat((value * 10 ** precision).toFixed(precision)))
    / 10 ** precision
  );
}

/**
 * Get formatted css color in oklch
 * @param hex - Hex color value
 * @returns string
 */
export function getCssColorOklch(hex: string) {
  const oklch = useMode(modeOklch);
  const color = oklch(parseHex(hex) as Rgb);
  return formatCss({
    mode: color.mode,
    l: round(color.l),
    c: round(color.c),
    h: round(color.h ?? 0)
  });
}
