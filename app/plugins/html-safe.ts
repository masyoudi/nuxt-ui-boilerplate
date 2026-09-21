import { vHtmlSafe } from '~/directives/html-safe';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('html-safe', vHtmlSafe);
});
