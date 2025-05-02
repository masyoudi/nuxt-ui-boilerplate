<script setup lang="ts">
import { tv } from 'tailwind-variants';
import type { TransitionProps } from 'vue-demi';

interface TransitionClass {
  enterFromClass?: string;
  enterActiveClass?: string;
  enterToClass?: string;
  appearFromClass?: string;
  appearActiveClass?: string;
  appearToClass?: string;
  leaveFromClass?: string;
  leaveActiveClass?: string;
  leaveToClass?: string;
}

interface Props {
  teleport?: boolean;
  class?: string;
  wrapper?: string;
  displayDirective?: 'if' | 'show';
  transition?: TransitionClass;
  duration?: TransitionProps['duration'];
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

const displayIf = computed(() => open.value || props.displayDirective !== 'if');
const displayShow = computed(() => open.value || props.displayDirective !== 'show');

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
</script>

<template>
  <Teleport
    to="#teleports"
    :disabled="!props.teleport"
  >
    <Transition
      v-bind="props.transition"
      @before-enter="emits('beforeEnter')"
      @before-leave="emits('beforeLeave')"
      @after-enter="emits('afterEnter')"
      @after-leave="emits('afterLeave')"
    >
      <div
        v-if="displayIf"
        v-show="displayShow"
        v-bind="attributes"
        :class="ui.base({ class: props.class })"
      >
        <div :class="ui.wrapper({ class: props.wrapper })">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
