<script setup lang="ts">
import { useMotion } from '@vueuse/motion';
import { vOnKeyStroke } from '@vueuse/components';
import { tv } from 'tailwind-variants';

interface UIElements {
  wrapper?: string;
  inner?: string;
  content?: string;
  close?: string;
  closeIcon?: string;
}

interface Props {
  modelValue?: boolean;
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
  (e: 'update:modelValue', val: boolean): void;
}>();

const _open = ref(false);
const open = computed({
  get: () => props.modelValue ?? _open.value,
  set: (val) => {
    _open.value = val;
    emits('update:modelValue', val);
  }
});

const contentRef = ref<HTMLElement>();
const id = `modal-${useId()}`;

const theme = tv({
  slots: {
    base: 'backdrop-blur-sm',
    wrapper: 'overflow-y-auto',
    inner: 'relative flex w-full min-h-screen justify-center items-center py-3 px-4',
    content: 'relative w-full max-w-xl bg-white rounded-xl shadow shadow-black/8 outline-none p-5',
    close: 'absolute inline-flex justify-center items-center top-2 right-2 rounded-sm cursor-pointer select-none p-1 hover:bg-slate-100',
    closeIcon: 'size-4 text-slate-600'
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

function onOpen() {
  applyMotionContent('enter');
  if (import.meta.client) {
    setTimeout(() => trapFocus(contentRef.value!), 150);
  }
}

function onClosed() {
  applyMotionContent('close');
  if (!import.meta.client) {
    return;
  }

  const modals = Array(...document.querySelectorAll('[data-modal="true"]'));
  const lastModal = modals[modals.length - 1]?.querySelector('[data-modal-content][role="dialog"]:is([tabindex="-1"])');
  (lastModal as HTMLDivElement)?.focus({ preventScroll: true });

  nextTick(() => applyMotionContent('init'));
}

function onClickOutside() {
  if (!props.dismissable) {
    contentRef.value?.focus({ preventScroll: true });
    return;
  }

  open.value = false;
}

function onEscape() {
  if (props.dismissable && open.value) {
    open.value = false;
  }
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
    @after-enter="onOpen"
    @before-leave="onClosed"
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
        <slot
          v-if="props.close"
          name="close"
        >
          <button
            :class="classes.close({ class: props.ui?.close })"
            @click="open = false"
          >
            <UIcon
              name="lucide:x"
              :class="classes.closeIcon({ class: props.ui?.closeIcon })"
            />
          </button>
        </slot>

        <slot />
      </div>
    </div>
  </BackDrop>
</template>
