<script setup lang="ts">
import { tv } from 'tailwind-variants';

interface Props {
  class?: string | string[];
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {});

const ui = tv({
  base: 'inline-flex size-10 animate-spin rounded-full border-5 border-x-slate-300 border-b-slate-300 border-t-(--ui-color-primary-500)'
});

const attrs: Record<string, any> = useAttrs();
const attributes = computed(() => {
  const { class: _, ...parts } = attrs ?? {};

  return parts;
});
</script>

<template>
  <div
    v-bind="attributes"
    :class="ui({ class: props.class })"
  />
</template>
