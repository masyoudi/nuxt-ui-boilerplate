<script setup lang="ts">
import type { Column } from '@tanstack/vue-table';

interface Props {
  label?: string;
  column: Column<any>;
  multiple?: boolean;
}

defineOptions({
  name: 'TableHeaderSorting',
  inheritAttrs: false
});

const props = defineProps<Props>();
const isSorted = computed(() => props.column?.getIsSorted?.() ?? false);

function onSorting() {
  if (!isSorted.value) {
    props.column?.toggleSorting?.(false, props.multiple);
    return;
  }

  if (isSorted.value === 'asc') {
    props.column?.toggleSorting?.(true, props.multiple);
    return;
  }

  props.column?.clearSorting?.();
}
</script>

<template>
  <slot
    :is-sorted="isSorted"
    :onsorting="onSorting"
  >
    <UButton
      :label="props.label"
      :icon="isSorted ? isSorted === 'asc' ? 'lucide:arrow-up-narrow-wide' : 'lucide:arrow-down-wide-narrow' : 'lucide:arrow-up-down'"
      color="neutral"
      variant="ghost"
      class="-mx-2.5"
      @click="onSorting"
    />
  </slot>
</template>
