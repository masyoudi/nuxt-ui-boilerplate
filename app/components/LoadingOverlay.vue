<script setup lang="ts">
import { tv } from 'tailwind-variants';

interface Props {
  teleport?: boolean;
  class?: string;
  ui?: Partial<Record<keyof ReturnType<typeof theme>, string>>;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  teleport: true
});

const open = defineModel<boolean>({ default: false, required: false });

const theme = tv({
  slots: {
    base: 'justify-center items-center backdrop-blur-xs z-[1000]',
    loading: 'border-x-white border-b-white'
  }
});

const classes = theme();

const attrs: Record<string, any> = useAttrs();
const attributes = computed(() => {
  const { class: _, ...parts } = attrs ?? {};

  return parts;
});
</script>

<template>
  <BackDrop
    v-model="open"
    v-bind="attributes"
    :class="classes.base({ class: props.class })"
    :teleport="props.teleport"
  >
    <slot>
      <LoadingSpinner :class="classes.loading({ class: props.ui?.loading })" />
    </slot>
  </BackDrop>
</template>
