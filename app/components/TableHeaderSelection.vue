<script setup lang="ts">
import type { Table, Row } from '@tanstack/vue-table';

interface Props {
  table: Table<any>;
  checked: Record<string, any>[];
  field: string;
  label?: string;
  selectionCheck?: (item: Record<string, any>, row: Row<any>) => boolean;
}

defineOptions({
  name: 'TableHeaderSelection',
  inheritAttrs: false
});

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'change', val: Record<string, any>[]): void;
}>();

const rows = computed(() => props.table.getRowModel().rows);
const checkedRows = computed(() => props.checked);

const isCheckedAll = computed(() => {
  if (!rows.value.length) {
    return false;
  }

  return rows.value.every((row) => {
    const rowValue = row.original;
    if (!getObjectValue(rowValue, props.field)) {
      return false;
    }

    return checkedRows.value.map((r) => getObjectValue(r, props.field)).includes(getObjectValue(rowValue, props.field));
  });
});

/**
 * Handle change value
 */
function onChange() {
  if (isCheckedAll.value) {
    emits('change', []);
    return;
  }

  const check = props.selectionCheck;
  const values = checkedRows.value.map((item) => getObjectValue(item, props.field));
  const _rows = rows.value.filter((row) => check?.(row.original, row) ?? true);
  const isCheckedVisible = _rows.every((row) => values.includes(getObjectValue(row.original, props.field)));
  if (isCheckedVisible) {
    const selected = checkedRows.value.filter((item) => {
      return !_rows.map((row) => getObjectValue(row.original, props.field)).includes(getObjectValue(item, props.field));
    });

    emits('change', selected);
    return;
  }

  const uncheckedRows = rows.value.filter((row) => {
    const isSelectable = typeof check === 'function' ? check(row.original, row) : true;
    return !values.includes(getObjectValue(row.original, props.field)) && isSelectable;
  });

  emits('change', [...checkedRows.value, ...uncheckedRows.map((r) => r.original)]);
}
</script>

<template>
  <UCheckbox
    :model-value="isCheckedAll ? true : checkedRows.length > 0 ? 'indeterminate' : false"
    :label="props.label"
    aria-label="Select all"
    @update:model-value="onChange"
  />
</template>
