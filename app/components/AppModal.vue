<script setup lang="ts">
import { useMotion } from '@vueuse/motion';
import { vOnKeyStroke } from '@vueuse/components';
import { tv } from 'tailwind-variants';

interface UIElements {
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
  close?: boolean;
  ui?: UIElements;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  teleport: true,
  displayDirective: 'if',
  dismissable: true,
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

const contentRef = ref<HTMLElement>();
const id = ref(`modal-${useId()}`);

const theme = tv({
  slots: {
    base: 'backdrop-blur-sm',
    wrapper: 'overflow-y-auto',
    inner: 'relative flex w-full min-h-screen justify-center items-center py-3 px-4',
    content: 'relative w-full max-w-xl bg-(--ui-bg) ring ring-transparent dark:ring-(--ui-border) rounded-xl shadow shadow-black/8 outline-none p-5',
    close: 'absolute inline-flex justify-center items-center top-2 right-2'
  }
});

const classes = theme();

const { apply: applyMotionContent } = useMotion(contentRef, {
  init: {
    opacity: 0,
    scale: 0.95
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0,
      duration: 200
    }
  },
  close: {
    opacity: 0,
    scale: 0.95,
    transition: {
      delay: 50,
      duration: 200
    }
  }
});

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

  applyMotionContent('enter');
  if (import.meta.client) {
    setTimeout(() => trapFocus(contentRef.value!), 150);
  }
}

/**
 * Handler before modal leave
 */
function onBeforeLeave() {
  emits('beforeLeave');

  applyMotionContent('close');
  if (!import.meta.client) {
    return;
  }

  const modals = Array(...document.querySelectorAll('[data-modal="true"]'));
  const lastModal = modals[modals.length - 1]?.querySelector('[data-modal-content][role="dialog"]:is([tabindex="-1"])');
  (lastModal as HTMLDivElement)?.focus({ preventScroll: true });

  nextTick(() => applyMotionContent('init'));
}

onMounted(() => {
  if (!open.value) {
    applyMotionContent('init');
  }
});
</script>

<template>
  <BackDrop
    :id="id"
    v-model="open"
    :display-directive="props.displayDirective"
    :teleport="props.teleport"
    :wrapper="classes.wrapper({ class: props.ui?.wrapper })"
    :class="classes.base({ class: props.class })"
    :duration="{ enter: 0, leave: 150 }"
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
      <div
        ref="contentRef"
        v-on-key-stroke:Escape="onEscape"
        :class="classes.content({ class: props.ui?.content })"
        role="dialog"
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
    </div>
  </BackDrop>
</template>
