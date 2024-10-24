import { getColors } from 'theme-colors';
import { getCssColorOklch } from '~~/shared/utils/color';

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', async (html, { event }) => {
    const defaults = '#0084ff';
    const themeColor = getCookie(event, '__themecolor');
    const color = getColors(themeColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColor) ? themeColor : defaults);

    const colors = Object.entries(color).reduce((prev: string[], [key, value]) => {
      prev.push(`--ui-color-primary-${key}: ${getCssColorOklch(value)};`);
      return prev;
    }, []);

    html.htmlAttrs.push(' data-root=""');
    html.head.push(`<style>:root[data-root] {${colors.join('\n')}}</style>`);
  });
});
