import type { Directive } from 'vue';
import type { TooltipProps } from '@nuxt/ui/components/Tooltip.vue';

type TooltipValue = string | TooltipOptions;

interface TooltipController {
  cleanup: () => void;
  update: (value: TooltipValue) => boolean;
}

export interface TooltipOptions extends Omit<
  TooltipProps,
  'text' | 'defaultOpen' | 'open' | 'reference' | 'disableHoverableContent'
> {
  text: string;
  getReference?: (el: HTMLElement) => HTMLElement | null;
}

const controllers = new WeakMap<HTMLElement, TooltipController>();
let activeOwner: symbol | undefined;
let openTimer: ReturnType<typeof setTimeout> | undefined;

function clearOpenTimer() {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = undefined;
  }
}

function getOptions(value: TooltipValue) {
  return typeof value === 'object' ? value : undefined;
}

function getText(value: TooltipValue) {
  return typeof value === 'string' ? value : value.text;
}

function hasContent(value: TooltipValue) {
  return !!getText(value) || !!getOptions(value)?.kbds?.length;
}

function getReference(el: HTMLElement, value: TooltipValue) {
  return getOptions(value)?.getReference?.(el) ?? el;
}

function init(el: HTMLElement, binding: DirectiveBinding<TooltipValue>) {
  let value = binding.value;
  const reference = getReference(el, value);
  if (!(reference instanceof HTMLElement)) {
    return;
  }

  const owner = Symbol('tooltip:owner');
  const state = useStateAppTooltip();
  let pointerActive = false;
  let pointerDown = false;
  let focusActive = false;
  let addedAriaLabel = false;
  let pointerUpTimer: ReturnType<typeof setTimeout> | undefined;

  function syncState() {
    const options = getOptions(value);
    const text = getText(value);

    Object.assign(state.value, {
      kbds: options?.kbds,
      content: options?.content,
      arrow: options?.arrow ?? true,
      portal: options?.portal,
      class: options?.class,
      delayDuration: options?.delayDuration ?? 250,
      disableClosingTrigger: options?.disableClosingTrigger,
      disabled: options?.disabled ?? false,
      ignoreNonKeyboardFocus: options?.ignoreNonKeyboardFocus,
      ui: options?.ui,
      reference,
      text
    });

    const hasAccessibleName = reference.hasAttribute('aria-label')
      || reference.hasAttribute('aria-labelledby')
      || !!reference.textContent?.trim();

    if (addedAriaLabel && text) {
      reference.setAttribute('aria-label', text);
    }
    else if (addedAriaLabel) {
      reference.removeAttribute('aria-label');
      addedAriaLabel = false;
    }
    else if (!hasAccessibleName && text) {
      reference.setAttribute('aria-label', text);
      addedAriaLabel = true;
    }
  }

  function close() {
    if (activeOwner !== owner) {
      return;
    }

    clearOpenTimer();
    activeOwner = undefined;
    state.value.open = false;
  }

  function open(immediate = false) {
    const options = getOptions(value);
    if (options?.disabled || !hasContent(value)) {
      close();
      return;
    }

    clearOpenTimer();
    activeOwner = owner;
    state.value.open = false;
    syncState();

    const delay = immediate ? 0 : options?.delayDuration ?? 250;
    if (delay <= 0) {
      state.value.open = true;
      return;
    }

    openTimer = setTimeout(() => {
      openTimer = undefined;
      if (activeOwner === owner && (pointerActive || focusActive)) {
        state.value.open = true;
      }
    }, delay);
  }

  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') {
      return;
    }

    pointerActive = true;
    open();
  }

  function onPointerLeave() {
    pointerActive = false;
    if (!focusActive) {
      close();
    }
  }

  function onPointerDown() {
    pointerDown = true;
    document.addEventListener('pointerup', onPointerUp, { once: true });

    if (!getOptions(value)?.disableClosingTrigger) {
      close();
    }
  }

  function onPointerUp() {
    pointerUpTimer = setTimeout(() => {
      pointerDown = false;
      pointerUpTimer = undefined;
    }, 1);
  }

  function onFocusIn(event: FocusEvent) {
    if (pointerDown) {
      return;
    }

    const options = getOptions(value);
    const target = event.target;
    if (options?.ignoreNonKeyboardFocus && target instanceof HTMLElement && !target.matches(':focus-visible')) {
      return;
    }

    focusActive = true;
    open(true);
  }

  function onFocusOut(event: FocusEvent) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && reference.contains(nextTarget)) {
      return;
    }

    focusActive = false;
    if (!pointerActive) {
      close();
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      pointerActive = false;
      focusActive = false;
      close();
    }
  }

  reference.addEventListener('pointerenter', onPointerEnter);
  reference.addEventListener('pointerleave', onPointerLeave);
  reference.addEventListener('pointerdown', onPointerDown);
  reference.addEventListener('focusin', onFocusIn);
  reference.addEventListener('focusout', onFocusOut);
  reference.addEventListener('keydown', onKeydown);

  const controller: TooltipController = {
    update(nextValue) {
      if (getReference(el, nextValue) !== reference) {
        return false;
      }

      value = nextValue;
      if (activeOwner === owner) {
        if (getOptions(value)?.disabled || !hasContent(value)) {
          close();
        }
        else {
          syncState();
        }
      }
      return true;
    },
    cleanup() {
      close();
      reference.removeEventListener('pointerenter', onPointerEnter);
      reference.removeEventListener('pointerleave', onPointerLeave);
      reference.removeEventListener('pointerdown', onPointerDown);
      reference.removeEventListener('focusin', onFocusIn);
      reference.removeEventListener('focusout', onFocusOut);
      reference.removeEventListener('keydown', onKeydown);
      document.removeEventListener('pointerup', onPointerUp);

      if (pointerUpTimer) {
        clearTimeout(pointerUpTimer);
      }

      if (addedAriaLabel) {
        reference.removeAttribute('aria-label');
      }
    }
  };

  controllers.set(el, controller);
}

export const vTooltip: Directive<HTMLElement, TooltipValue> = {
  mounted: init,

  updated(el, binding) {
    const controller = controllers.get(el);
    if (controller?.update(binding.value)) {
      return;
    }

    controller?.cleanup();
    controllers.delete(el);
    init(el, binding);
  },

  beforeUnmount(el) {
    controllers.get(el)?.cleanup();
    controllers.delete(el);
  }
};
