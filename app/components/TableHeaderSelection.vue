<script setup lang="ts">
import type { Table } from '@tanstack/vue-table';

interface Props {
  table: Table<any>;
  checked: Record<string, any>[];
  field: string;
}

defineOptions({
  name: 'TableHeaderSelection',
  inheritAttrs: false
});

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'change', val: Record<string, any>[]): void;
}>();

const tbl = computed(() => props.table);
const checkedRows = computed(() => props.checked);
const currentRows = computed<Record<string, any>[]>(() => tbl.value.getRowModel().rows.map((item) => ({ ...item.original })));
const isCheckedAll = computed(() => {
  if (!currentRows.value.length) {
    return false;
  }

  return currentRows.value.every((item) => {
    if (!item?.[props.field]) {
      return false;
    }

    return checkedRows.value.map((c) => c?.[props.field]).includes(item?.[props.field]);
  });
});

function onChange() {
  if (isCheckedAll.value) {
    emits('change', []);
    return;
  }

  const uncheckedRows = currentRows.value.filter((item) => {
    return !checkedRows.value.map((c) => c?.[props.field]).includes(item?.[props.field]);
  });

  emits('change', [...checkedRows.value, ...uncheckedRows]);
}
</script>

<template>
  <UCheckbox
    :model-value="isCheckedAll ? true : checkedRows.length > 0 ? 'indeterminate' : false"
    aria-label="Select all"
    @update:model-value="onChange"
  />
</template>
