<script setup lang="ts">
import { tv } from 'tailwind-variants';

interface UIElements {
  wrapper?: string;
  loading?: string;
}

interface Props {
  modelValue?: boolean;
  teleport?: boolean;
  class?: string;
  ui?: UIElements;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  teleport: true
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const _open = ref(false);
const open = computed({
  get: () => props.modelValue ?? _open.value,
  set: (val) => {
    _open.value = val;
    emits('update:modelValue', val);
  }
});

const theme = tv({
  slots: {
    base: 'backdrop-blur-xs z-[1000]',
    wrapper: 'flex justify-center items-center',
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
    :wrapper="classes.wrapper({ class: props.ui?.wrapper })"
    :teleport="props.teleport"
  >
    <slot>
      <LoadingSpinner :class="classes.loading({ class: props.ui?.loading })" />
    </slot>
  </BackDrop>
</template>
