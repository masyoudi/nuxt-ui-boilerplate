<script setup lang="ts">
import type { CellContext, HeaderContext } from '@tanstack/vue-table';
import type { TableColumn } from '#ui/components/Table.vue';

type Column = TableColumn<Record<string, any>>;

type SlotData = {
  item: Record<string, any>;
  data: Record<string, any>[];
  visibleData: Record<string, any>[];
};

interface Props {
  label?: string;
  accessor?: string;
  visible?: boolean;
  sortable?: boolean;
  meta?: Column['meta'];
  enableHiding?: Column['enableHiding'];
  enablePinning?: Column['enablePinning'];
  enableColumnFilter?: Column['enableColumnFilter'];
  filterFn?: Column['filterFn'];
  enableGlobalFilter?: Column['enableGlobalFilter'];
  enableMultiSort?: Column['enableMultiSort'];
  sortUndefined?: Column['sortUndefined'];
  aggregatedCell?: Column['aggregatedCell'];
  aggregationFn?: Column['aggregationFn'];
  enableGrouping?: Column['enableGrouping'];
  getGroupingValue?: Column['getGroupingValue'];
  enableResizing?: Column['enableResizing'];
  maxSize?: Column['maxSize'];
  minSize?: Column['minSize'];
  size?: Column['size'];
  getUniqueValues?: Column['getUniqueValues'];
}

defineOptions({
  name: 'TableColumn',
  inheritAttrs: false
});

withDefaults(defineProps<Props>(), {
  visible: true
});

defineSlots<{
  header: (slotProps: HeaderContext<any, any> & Omit<SlotData, 'item'>) => VNode[];
  default: (slotProps: CellContext<any, any> & SlotData) => VNode[];
  footer?: (slotProps: HeaderContext<any, any> & Omit<SlotData, 'item'>) => VNode[];
}>();
</script>

<template>
  <span />
</template>
