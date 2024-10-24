<script setup lang="ts">
import { tv } from 'tailwind-variants';
import theme from '~~/app/utils/theme/tag-item';

import type { TagItemColor, TagItemSize, TagItemVariant } from '~~/app/utils/theme/tag-item';

interface UIElement {
  text: any;
  close: any;
  closeIcon: any;
}

interface Props {
  label?: string;
  color?: TagItemColor;
  variant?: TagItemVariant;
  size?: TagItemSize;
  class?: any;
  closable?: boolean;
  ui?: UIElement;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true
});
const emits = defineEmits<{
  (e: 'close', evt: Event): void;
}>();

const id = ref(useId());

const tagItem = tv(theme);
const classes = computed(() => tagItem({
  size: props.size,
  color: props.color,
  variant: props.variant
}));
</script>

<template>
  <div
    :aria-labelledby="id"
    :class="classes.base({ class: props.class })"
  >
    <span
      :id="id"
      :class="classes.text({ class: props.ui?.text })"
    >
      <slot>{{ props.label }}</slot>
    </span>
    <button
      v-if="props.closable"
      :tabindex="-1"
      :aria-labelledby="id"
      type="button"
      :class="classes.close({ class: props.ui?.text })"
      @click="(evt) => emits('close', evt)"
    >
      <UIcon
        name="lucide:x"
        :class="classes.closeIcon({ class: props.ui?.closeIcon })"
      />
    </button>
  </div>
</template>
