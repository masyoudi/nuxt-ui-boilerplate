<script setup lang="ts">
import type { Column } from '@tanstack/vue-table';

interface Props {
  label?: string;
  column: Column<any>;
  multiple?: boolean;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconUnsort?: string;
}

defineOptions({
  name: 'TableHeaderSorting',
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  iconSortAsc: 'lucide:arrow-up-narrow-wide',
  iconSortDesc: 'lucide:arrow-down-wide-narrow',
  iconUnsort: 'lucide:arrow-up-down'
});
const isSorted = computed(() => props.column?.getIsSorted?.() ?? false);

/**
 * Handle click event
 */
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
      :icon="isSorted ? isSorted === 'asc' ? props.iconSortAsc : props.iconSortDesc : props.iconUnsort"
      :color="isSorted ? 'primary' : 'neutral'"
      :variant="isSorted ? 'soft' : 'ghost'"
      class="-mx-2.5"
      @click="onSorting"
    />
  </slot>
</template>
