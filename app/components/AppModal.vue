<script setup lang="ts">
import { vOnKeyStroke } from '@vueuse/components';
import { tv } from 'tailwind-variants';
import type { TransitionProps } from 'vue-demi';

interface UISlots {
  wrapper?: string;
  inner?: string;
  content?: string;
  close?: string;
}

interface Props {
  teleport?: boolean;
  class?: string;
  displayDirective?: 'if' | 'show';
  dismissable?: boolean;
  fullscreen?: boolean;
  transition?: TransitionProps;
  transitionOverlay?: TransitionProps;
  close?: boolean;
  ui?: UISlots;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  teleport: true,
  displayDirective: 'if',
  dismissable: true,
  transition: () => ({
    enterActiveClass: 'animate-[scale-in_200ms_ease-out]',
    leaveActiveClass: 'animate-[scale-out_200ms_ease-in]'
  }),
  close: true
});

const emits = defineEmits<{
  (e: 'beforeEnter'): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'beforeLeave'): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'afterEnter'): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'afterLeave'): void;
}>();

const open = defineModel<boolean>({ default: false, required: false });

const contentRef = useTemplateRef('contentRef');
const id = ref(`modal-${useId()}`);

const theme = tv({
  slots: {
    base: 'backdrop-blur-sm',
    wrapper: '',
    inner: 'relative flex w-full min-h-screen justify-center items-center',
    content: 'relative w-full bg-(--ui-bg) ring ring-accented rounded-xl shadow shadow-black/8 outline-none',
    close: 'absolute inline-flex justify-center items-center top-2 right-2'
  },
  variants: {
    fullscreen: {
      true: {
        wrapper: 'overflow-y-hidden',
        inner: 'overflow-hidden px-0 py-0',
        content: 'max-w-full h-screen rounded-none p-0'
      },
      false: {
        wrapper: 'overflow-y-auto',
        inner: 'py-3 px-4',
        content: 'max-w-xl p-5'
      }
    }
  }
});

const classes = theme();

/**
 * Handler click outside modal content
 */
function onClickOutside() {
  if (!props.dismissable) {
    contentRef.value?.focus({ preventScroll: true });
    return;
  }

  open.value = false;
}

/**
 * Handler escape keyboard
 */
function onEscape() {
  if (props.dismissable && open.value) {
    open.value = false;
  }
}

/**
 * Handler after modal enter
 */
function onAfterEnter() {
  emits('afterEnter');

  if (import.meta.client) {
    setTimeout(() => trapFocus(contentRef.value!), 150);
  }
}

/**
 * Handler before modal leave
 */
function onBeforeLeave() {
  emits('beforeLeave');

  if (!import.meta.client) {
    return;
  }

  const modals = Array(...document.querySelectorAll('[data-modal="true"]'));
  const lastModal = modals[modals.length - 1]?.querySelector('[data-modal-content][role="dialog"]:is([tabindex="-1"])');
  (lastModal as HTMLDivElement)?.focus({ preventScroll: true });
}
</script>

<template>
  <BackDrop
    :id="id"
    v-slot="{ entered, isDisplayIf, isDisplayShow }"
    v-model="open"
    :display-directive="props.displayDirective"
    :transition="props.transitionOverlay"
    :teleport="props.teleport"
    :wrapper="classes.wrapper({ class: props.ui?.wrapper })"
    :class="classes.base({ class: props.class })"
    :data-modal="open"
    @after-enter="onAfterEnter"
    @after-leave="emits('afterLeave')"
    @before-enter="emits('beforeEnter')"
    @before-leave="onBeforeLeave"
  >
    <div
      :class="classes.inner({ class: props.ui?.inner })"
      @click.self="onClickOutside"
    >
      <Transition v-bind="props.transition">
        <div
          v-if="isDisplayIf"
          v-show="isDisplayShow"
          ref="contentRef"
          v-on-key-stroke:Escape="onEscape"
          :class="classes.content({ class: props.ui?.content })"
          role="dialog"
          :data-open="entered ? 'true' : 'false'"
          :data-modal-content="id"
          :tabindex="-1"
          @focus.stop
        >
          <div
            v-if="props.close"
            :class="classes.close({ class: props.ui?.close })"
          >
            <slot name="close">
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                icon="lucide:x"
                @click="open = false"
              />
            </slot>
          </div>

          <slot />
        </div>
      </Transition>
    </div>
  </BackDrop>
</template>
