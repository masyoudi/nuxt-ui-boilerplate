<template>
  <UPopover v-model:open="open" :ui="{ width: 'w-full' }" :popper="{ strategy: 'absolute' }" @update:open="onOpen">
    <!-- Popover trigger -->
    <UInput v-model="inputValue" :placeholder="props.placeholder" :ui="{ wrapper: 'w-full' }" size="md" readonly>
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
        v-model:search="search"
        v-model:selected="selected"
        :options="items"
        :debounce="props.debounce"
        :placeholder="props.placeholder"
        :searchable="props.searchable"
        :loading="loading"
        @select="onSelected"
        @scroll-end="onScrollEnd"
        @reset="onReset"
        @input="onInput"
      >
      </ListBox>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { OptionItem } from '@@/types/ui/autocomplete';

interface Query {
  page: number;
  perpage: number;
  search: string;
}

interface Props {
  url: string;
  label?: string;
  searchable?: boolean;
  debounce?: number;
  placeholder?: string;
  paginated?: boolean;
  uiMenu?: Record<string, any>;
  transformFetchData?: (result: any) => OptionItem[];
  transformFetchQuery?: (result: Query) => Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  debounce: 400,
  placeholder: 'Search...',
  paginated: true,
  transformFetchData: (val: any) => val
});
const emits = defineEmits<{
  (e: 'update:label', val: string): void;
  (e: 'selected', val?: OptionItem): void;
}>();

const _label = ref('');
const inputValue = computed({
  get: () => props.label ?? _label.value,
  set: (val) => {
    _label.value = val;
    emits('update:label', val);
  }
});
const open = ref(false);
const search = ref('');
const page = ref(1);
const perPage = ref(10);
const isLastPage = ref(false);
const selected = ref();
const loading = ref(false);
const query = computed(() => {
  const q = {
    page: page.value,
    perpage: perPage.value,
    search: search.value
  };

  return typeof props.transformFetchQuery === 'function' ? props.transformFetchQuery(q) : q;
});
const isFetched = ref(false);
const options = ref<OptionItem[]>([]);

const items = computed(() => {
  if (!props.paginated) {
    return (options.value ?? []).filter((v) => v.label.toLowerCase().includes(search.value.toLowerCase()));
  }

  return options.value;
});

async function fetchData() {
  try {
    loading.value = true;
    const result = await useRequest(props.url, {
      query: query.value
    });

    isFetched.value = true;
    const arr = props.transformFetchData(result);
    isLastPage.value = arr.length < perPage.value;
    page.value += 1;
    options.value.push(...arr);

    loading.value = false;
  } catch {
    loading.value = false;
  }
}

function onSelected(value: OptionItem) {
  open.value = false;
  inputValue.value = value?.label ?? '';
  emits('selected', value);
}

function onScrollEnd() {
  if ([loading.value, !props.paginated, isLastPage.value].includes(true)) {
    return;
  }

  fetchData();
}

function onReset() {
  selected.value = undefined;
  inputValue.value = '';
  emits('selected');
}

function onOpen(isOpen: boolean) {
  if (!isOpen || (isFetched.value && !props.paginated)) {
    return;
  }

  if (!options.value.length) {
    loading.value = true;
    setTimeout(fetchData, 250);
  }
}

function onInput() {
  if (!props.paginated) {
    return;
  }

  page.value = 1;
  options.value = [];
  isLastPage.value = false;
  nextTick(fetchData);
}
</script>
