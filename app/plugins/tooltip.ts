import { vTooltip } from '~/directives/tooltip';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('tooltip', vTooltip);
});
