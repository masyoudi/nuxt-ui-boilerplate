import type { Directive, DirectiveBinding } from 'vue';
import { filterXSS } from 'xss';

export type HtmlSafeValue = string | null | undefined;

function renderHtmlSafe(el: HTMLElement, binding: DirectiveBinding<HtmlSafeValue>) {
  el.innerHTML = filterXSS(binding.value ?? '');
}

export const vHtmlSafe: Directive<HTMLElement, HtmlSafeValue> = {
  getSSRProps(binding) {
    return {
      innerHTML: filterXSS(binding.value ?? '')
    };
  },

  mounted: renderHtmlSafe,

  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      renderHtmlSafe(el, binding);
    }
  }
};
