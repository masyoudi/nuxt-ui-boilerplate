import type { TooltipOptions } from '~/directives/tooltip';

declare module '#app' {
  interface PageMeta {
    activeMenu?: string | string[];
  }
}

declare module 'vue' {
  interface GlobalDirectives {
    vTooltip: Directive<HTMLElement, string | TooltipOptions>;
  }
}

declare global {
  interface HTMLElement {
    __tooltipCleanup?: () => void;
  }
}

export {};
