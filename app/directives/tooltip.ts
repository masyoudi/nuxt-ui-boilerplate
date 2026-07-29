import type { Directive } from 'vue';
import type { TooltipProps } from '@nuxt/ui/components/Tooltip.vue';

export interface TooltipOptions extends Omit<TooltipProps, 'text' | 'defaultOpen' | 'open'> {
  text: string;
  getReference?: (el: any) => HTMLElement | null;
}

function init(el: HTMLElement, binding: DirectiveBinding<string | TooltipOptions>) {
  const options: TooltipOptions | undefined = typeof binding.value === 'object' ? binding.value : undefined;
  const reference = options?.getReference?.(el) ?? el;
  if (!(reference instanceof HTMLElement)) {
    return;
  }

  const state = useStateAppTooltip();

  const onEnter = () => {
    state.value.kbds = options?.kbds;
    state.value.content = options?.content;
    state.value.arrow = options?.arrow ?? true;
    state.value.portal = options?.portal;
    state.value.class = options?.class;
    state.value.delayDuration = options?.delayDuration ?? 250;
    state.value.disableHoverableContent = options?.disableHoverableContent;
    state.value.disableClosingTrigger = options?.disableClosingTrigger;
    state.value.disabled = options?.disabled ?? false;
    state.value.ignoreNonKeyboardFocus = options?.ignoreNonKeyboardFocus;
    state.value.ui = options?.ui;

    state.value.reference = reference;
    state.value.text = options?.text ?? (typeof binding.value === 'string' ? binding.value : '');

    nextTick(() => {
      state.value.open = true;
    });
  };

  const onLeave = () => {
    state.value.open = false;
  };

  const events = {
    pointermove: onEnter,
    pointerleave: onLeave,
    mouseenter: onEnter,
    mouseleave: onLeave,
    pointerdown: onEnter,
    focus: onEnter,
    blur: onLeave
  };

  keysOf(events).forEach((e) => {
    el.addEventListener(e, events[e]);
  });

  el.__tooltipCleanup = () => {
    state.value.open = false;
    keysOf(events).forEach((e) => {
      el.removeEventListener(e, events[e]);
    });
  };
}

export const vTooltip: Directive<HTMLElement, string | TooltipOptions> = {
  mounted: init,
  updated: init,

  beforeUnmount(el) {
    el.__tooltipCleanup?.();
  }
};
