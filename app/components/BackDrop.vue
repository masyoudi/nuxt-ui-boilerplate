<script setup lang="ts">
import { tv } from 'tailwind-variants';
import type { TransitionProps } from 'vue-demi';

interface Props {
  teleport?: boolean;
  class?: string;
  wrapper?: string;
  displayDirective?: 'if' | 'show';
  transition?: TransitionProps;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  teleport: true,
  displayDirective: 'if',
  transition: () => ({
    enterActiveClass: 'animate-[fade-in_150ms_ease-out]',
    leaveActiveClass: 'animate-[fade-out_150ms_ease-in]'
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

const open = defineModel<boolean>({ default: false, required: false });
const isEntered = ref(open.value);

const isDisplayIf = computed(() => open.value || props.displayDirective !== 'if');
const isDisplayShow = computed(() => open.value || props.displayDirective !== 'show');

const attrs: Record<string, any> = useAttrs();
const attributes = computed(() => {
  const { class: _, ...parts } = attrs ?? {};

  return parts;
});

const theme = tv({
  slots: {
    base: 'fixed inset-0 flex bg-black/30 z-50',
    wrapper: 'fixed inset-0'
  }
});
const ui = theme();

function onAfterEnter() {
  emits('afterEnter');
  nextTick(() => {
    isEntered.value = true;
  });
}

function onBeforeLeave() {
  emits('beforeLeave');
  isEntered.value = false;
}
</script>

<template>
  <Teleport
    to="#teleports"
    :disabled="!props.teleport"
  >
    <Transition
      v-bind="props.transition"
      @before-enter="emits('beforeEnter')"
      @before-leave="onBeforeLeave"
      @after-enter="onAfterEnter"
      @after-leave="emits('afterLeave')"
    >
      <div
        v-if="isDisplayIf"
        v-show="isDisplayShow"
        v-bind="attributes"
        :class="ui.base({ class: props.class })"
      >
        <div :class="ui.wrapper({ class: props.wrapper })">
          <slot
            :entered="isEntered"
            :is-display-if="isDisplayIf"
            :is-display-show="isDisplayShow"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
