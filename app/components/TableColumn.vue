<script setup lang="ts">
import type { Cell, CellContext, Header, HeaderContext } from '@tanstack/vue-table';

interface ColumnMeta {
  class?: {
    th?: string | ((cell: Header<any, any>) => string);
    td?: string | ((cell: Cell<any, any>) => string);
  };
}

interface Props {
  label?: string;
  accessor?: string;
  visible?: boolean;
  sortable?: boolean;
  meta?: ColumnMeta;
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
  <span />
</template>
