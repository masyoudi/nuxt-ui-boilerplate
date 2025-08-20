<script setup lang="ts">
import type { Row } from '@tanstack/vue-table';

interface Props {
  row: Row<any>;
  checked: Record<string, any>[];
  field: string;
  disabled?: boolean;
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
  const currentValue = getObjectValue(currentRow.value?.original, props.field);
  return checkedRows.value.some((item) => getObjectValue(item, props.field) === currentValue);
});
</script>

<template>
  <UCheckbox
    :model-value="isChecked"
    aria-label="Select row"
    :disabled="props.disabled"
    @update:model-value="() => emits('change')"
  />
</template>
