<script setup lang="ts">
import type { Row } from '@tanstack/vue-table';

interface Props {
  row: Row<any>;
  checked: Record<string, any>[];
  field: string;
}

defineOptions({
  name: 'TableRowSelection',
  inheritAttrs: false
});

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'change'): void;
}>();

const currentRow = computed(() => props.row);
const checkedRows = computed(() => props.checked);

const isChecked = computed(() => {
  return checkedRows.value.some((item) => item?.[props.field] === currentRow.value?.original?.[props.field]);
});
</script>

<template>
  <UCheckbox
    :model-value="isChecked"
    aria-label="Select row"
    @update:model-value="() => emits('change')"
  />
</template>
