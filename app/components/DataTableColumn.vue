<template>
  <span></span>
</template>

<script setup lang="ts">
interface Sorting {
  column: string;
  direction?: 'asc' | 'desc';
}

interface DefaultSlotColumn {
  index: number;
  key: string;
  label: string;
  class?: string;
  rowClass?: string;
  sortable: boolean;
  visible: boolean;
}

interface DefaultSlot {
  column: DefaultSlotColumn;
  row: any;
  index: number;
}

interface HeaderSlot {
  sort: Sorting;
  column: any;
  onSort: (col: Sorting) => void;
}

interface Props {
  label?: string;
  key: string;
  tag?: string;
  sortable?: boolean;
  visible?: boolean;
  headerTag?: string;
  headerClass?: string;
}

defineSlots<{
  'default'(options: DefaultSlot): VNode[];
  'header'(options: HeaderSlot): VNode[];
}>();

withDefaults(defineProps<Props>(), {
  tag: 'span',
  sortable: false,
  visible: true
});

defineOptions({
  name: 'DataTableColumn',
  inheritAttrs: false
});
</script>
