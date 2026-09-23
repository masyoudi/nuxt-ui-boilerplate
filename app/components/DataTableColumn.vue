<script lang="ts">
import type { VNode } from 'vue';
import type { RowData } from '@tanstack/vue-table';
import type {
  DataTableCellContext,
  DataTableColumnDef,
  DataTableFilterFnOption,
  DataTableHeaderContext
} from '~/utils/data-table';

export interface DataTableColumnProps<T extends RowData = any> extends /* @vue-ignore */ Omit<DataTableColumnDef<T, any>, 'cell' | 'header' | 'footer' | 'filterFn'> {
  accessorKey?: string;
  accessorFn?: (originalRow: T, index: number) => unknown;
  enableOrdering?: boolean;
  filterFn?: DataTableFilterFnOption<T>;
  label?: string;
  visible?: boolean;
}

export interface DataTableColumnSlots<T extends RowData = any> {
  header: (slotProps: DataTableHeaderContext<T, any>) => VNode[];
  default: (slotProps: DataTableCellContext<T, any> & { item: T }) => VNode[];
  footer: (slotProps: DataTableHeaderContext<T, any>) => VNode[];
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
