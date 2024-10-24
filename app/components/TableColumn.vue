<script setup lang="ts">
import type { CellContext, HeaderContext } from '@tanstack/vue-table';

interface Props {
  label?: string;
  accessor?: string;
  visible?: boolean;
  sortable?: boolean;
}

defineOptions({
  name: 'TableColumn',
  inheritAttrs: false
});

withDefaults(defineProps<Props>(), {
  visible: true
});

defineSlots<{
  header: (options: HeaderContext<any, any>) => VNode[];
  default: (options: CellContext<any, any> & { item: Record<string, any> }) => VNode[];
}>();
</script>

<template>
  <span class="sr-only" />
</template>
