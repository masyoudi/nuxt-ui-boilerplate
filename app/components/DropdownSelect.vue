<template>
  <UPopover v-model:open="open" :ui="{ width: 'w-full' }" :popper="{ strategy: 'absolute' }">
    <!-- Popover trigger -->
    <UInput v-model="label" :placeholder="props.placeholder" :ui="{ wrapper: 'w-full' }" size="md" readonly>
      <template #trailing>
        <UIcon
          name="i-heroicons-chevron-right-20-solid"
          class="w-5 h-5 transition-transform text-gray-400 dark:text-gray-500"
          :class="{ 'transform rotate-90': open }"
        />
      </template>
    </UInput>

    <!-- Popover panel -->
    <template #panel>
      <ListBox
        v-model:selected="selected"
        :options="items"
        :placeholder="props.placeholder"
        :searchable="props.searchable"
        :loading="loading"
        @select="onSelected"
        @reset="onReset"
        @update:search="onSearch"
      >
        <template #empty>
          <p v-if="!items.length" class="text-sm text-slate-400 text-center">No data available</p>
        </template>
      </ListBox>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { OptionItem } from '@@/types/ui/autocomplete';

interface Props {
  modelValue?: string | number;
  options: OptionItem[];
  searchable?: boolean;
  placeholder?: string;
  uiMenu?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  placeholder: 'Search...'
});
const emits = defineEmits<{
  (e: 'update:modelValue', val: string | number): void;
}>();

const label = ref('');
const search = ref('');
const selected = ref();
const vmodel = computed({
  get: () => (props.modelValue as string | number) ?? '',
  set: (value) => emits('update:modelValue', value)
});

const open = ref(false);
const loading = ref(false);

const items = computed(() => {
  return props.options.filter((v) => v.label.toLowerCase().includes(search.value.toLowerCase()));
});

function onSearch(q: string) {
  search.value = q;
}

function onSelected(value: OptionItem) {
  open.value = false;
  label.value = value.label;
  vmodel.value = value.id;
  search.value = '';
}

function onReset() {
  selected.value = undefined;
  label.value = '';
}

watchEffect(() => {
  const item = props.options.find((v) => v.id === vmodel.value);
  selected.value = item;
  label.value = item?.label ?? '';
});
</script>
