import { getColors } from 'theme-colors';
import { getCssColorOklch } from '~~/shared/utils/color';

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', async (html, { event }) => {
    const defaults = '#0084ff';
    const themeColor = getCookie(event, '__themecolor');
    const isValidColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColor ?? '');
    const color = getColors(isValidColor ? themeColor! : defaults);

    const colors = Object.entries(color).reduce((prev: string[], [key, value]) => {
      if (key === '500') {
        prev.push(`--color-primary: ${getCssColorOklch(value)};`);
      }

      prev.push(`--color-primary-${key}: ${getCssColorOklch(value)};`);

      return prev;
    }, []);

    html.head.push(`<style>:root {${colors.join('\n')}}</style>`);
  });
});
