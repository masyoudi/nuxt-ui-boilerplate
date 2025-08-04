<script setup lang="ts">
import { vOnKeyStroke } from '@vueuse/components';
import { tv } from 'tailwind-variants';
import type { TransitionProps } from 'vue-demi';

interface Props {
  teleport?: boolean;
  class?: string;
  displayDirective?: 'if' | 'show';
  dismissable?: boolean;
  fullscreen?: boolean;
  transition?: TransitionProps;
  close?: boolean;
  ui?: Partial<Record<keyof ReturnType<typeof theme>, string>>;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  teleport: true,
  displayDirective: 'if',
  dismissable: true,
  fullscreen: false,
  close: true,
  transition: () => ({
    enterActiveClass: 'animate-[fade-in_200ms_ease-out] [&_[data-modal-content]]:animate-[scale-in_200ms_ease-out]',
    leaveActiveClass: 'animate-[fade-out_200ms_ease-in] [&_[data-modal-content]]:animate-[scale-out_200ms_ease-in]'
  })
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

const slots = defineSlots<{
  default: () => VNode[];
  header: (slotProps: {
    close: () => void;
  }) => VNode[];
  body: () => VNode[];
  footer: (slotProps: {
    close: () => void;
  }) => VNode[];
  close: () => VNode[];
}>();

const open = defineModel<boolean>({ default: false, required: false });

const contentRef = useTemplateRef('contentRef');
const id = ref(`modal-${useId()}`);

const theme = tv({
  slots: {
    base: 'block backdrop-blur-sm',
    wrapper: 'relative flex w-full min-h-screen justify-center items-center',
    content: 'relative w-full bg-(--ui-bg) ring ring-transparent dark:ring-accented rounded-xl shadow shadow-black/8 outline-none',
    card: 'ring-0',
    header: 'sm:px-6',
    body: 'sm:p-6',
    footer: 'flex justify-end gap-x-4 sm:px-6',
    close: 'absolute inline-flex justify-center items-center top-2 right-2'
  },
  variants: {
    fullscreen: {
      true: {
        base: 'overflow-y-hidden',
        wrapper: 'overflow-hidden px-0 py-0',
        content: 'max-w-full h-screen rounded-none p-0'
      },
      false: {
        base: 'overflow-y-auto',
        wrapper: 'py-3 px-4',
        content: 'max-w-xl p-5'
      }
    },
    asCard: {
      true: {
        content: 'p-0'
      },
      false: {

      }
    }
  },
  compoundVariants: [
    {
      fullscreen: true,
      asCard: true,
      class: {
        card: 'flex flex-col h-screen rounded-none',
        header: 'grow-0 shrink-0',
        body: 'grow shrink overflow-y-auto',
        footer: 'grow-0 shrink-0'
      }
    }
  ]
});

const classes = computed(() => theme({
  fullscreen: props.fullscreen,
  asCard: !slots.default
}));

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
 * Handler after modal leave
 */
function onAfterLeave() {
  emits('afterLeave');

  if (!import.meta.client) {
    return;
  }

  const modals = Array(...document.querySelectorAll('[data-modal="true"]'));
  const lastModal = modals.at(-1)?.querySelector('[data-modal-content][role="dialog"]:is([tabindex="-1"])') as HTMLDivElement;
  setTimeout(() => lastModal?.focus({ preventScroll: true }), 150);
}

function onClose() {
  open.value = false;
}
</script>

<template>
  <BackDrop
    :id="id"
    v-model="open"
    :display-directive="props.displayDirective"
    :transition="props.transition"
    :teleport="props.teleport"
    :class="classes.base({ class: props.class })"
    :data-modal="open"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
    @before-enter="emits('beforeEnter')"
    @before-leave="emits('beforeLeave')"
  >
    <div
      :class="classes.wrapper({ class: props.ui?.wrapper })"
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
              class="p-1"
              size="md"
              icon="lucide:x"
              @click="onClose"
            />
          </slot>
        </div>

        <slot />

        <UCard
          v-if="!slots.default"
          :ui="{
            root: classes.card({ class: props.ui?.card }),
            header: classes.header({ class: props.ui?.header }),
            body: classes.body({ class: props.ui?.body }),
            footer: classes.footer({ class: props.ui?.footer })
          }"
        >
          <template
            v-if="!!slots.header"
            #header
          >
            <slot
              name="header"
              :close="onClose"
            />
          </template>

          <slot name="body" />

          <template
            v-if="!!slots.footer"
            #footer
          >
            <slot
              name="footer"
              :close="onClose"
            />
          </template>
        </UCard>
      </div>
    </div>
  </BackDrop>
</template>
