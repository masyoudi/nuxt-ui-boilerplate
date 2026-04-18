<script lang="ts">
import type { CellContext, ColumnDef, FilterFnOption as _FilterFnOption, HeaderContext } from '@tanstack/vue-table';
import type { VNode } from 'vue';

type FilterFnOption = _FilterFnOption<any> | 'nestedIncludeString';

export interface DataTableColumnProps extends Omit<ColumnDef<any, any>, 'cell' | 'header' | 'footer' | 'filterFn'> {
  accessorKey?: string;
  accessorFn?: (originalRow: unknown, index: number) => unknown;
  filterFn?: FilterFnOption;
  label?: string;
  visible?: boolean;
}

export interface DataTableColumnSlots {
  header: (slotProps: HeaderContext<any, any>) => VNode[];
  default: (slotProps: CellContext<any, any> & { item: Record<string, any> }) => VNode[];
  footer: (slotProps: HeaderContext<any, any>) => VNode[];
  columns: () => VNode[];
}
</script>

<script setup lang="ts">
defineOptions({
  name: 'DataTableColumn',
  inheritAttrs: false
});

defineProps<DataTableColumnProps>();
defineSlots<DataTableColumnSlots>();
</script>

<template>
  <span />
</template>
