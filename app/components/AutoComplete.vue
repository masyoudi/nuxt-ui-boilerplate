<script setup lang="ts">
import { promiseTimeout, useResizeObserver } from '@vueuse/core';
import { omit, toArray } from '~~/shared/utils';
import type { ListBoxItem } from '~/types/listbox';

interface FetchQuery {
  page: number;
  perpage: number;
  q: string;
}

interface Props {
  url: string;
  selected?: ListBoxItem;
  limit?: number;
  placeholder?: string;
  placeholderSearch?: string;
  transformFetchData?: (result: any) => ListBoxItem[];
  transformFetchQuery?: (params: FetchQuery) => Record<string, any>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  paginated?: boolean;
  debounce?: number;
  dismissable?: boolean;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
  transformFetchData: (result: any) => toArray(result).map((val) => ({
    id: val.id,
    label: val.name,
    ...omit(val, ['id', 'name'])
  })),
  transformFetchQuery: (params: FetchQuery) => params,
  paginated: true,
  debounce: 350,
  dismissable: true,
  teleport: true,
  disabled: false
});
const emits = defineEmits<{
  (e: 'update:selected', val?: ListBoxItem): void;
}>();

const open = ref(false);

const _selectedItem = ref<ListBoxItem>();
const selectedItem = computed({
  get: () => props.selected ?? _selectedItem.value,
  set: (val) => {
    _selectedItem.value = val;
    emits('update:selected', val);
  }
});
const search = ref('');
const options = ref<ListBoxItem[]>([]);
const items = computed(() => {
  if (!props.paginated) {
    return (options.value ?? []).filter((v) => v.label.toLowerCase().includes(search.value.toLowerCase()));
  }

  return options.value;
});
const inputValue = computed(() => selectedItem.value?.label ?? '');
const loading = ref(false);
const isFetched = ref(false);

const page = ref(1);
const hasMoreItems = ref(false);
const isDisabled = computed(() => props.disabled);

const wrapperRef = useTemplateRef('wrapperRef');
const srOnlyRef = useTemplateRef('srOnlyRef');

const width = ref('max-content');

async function onFocus() {
  await promiseTimeout(50);
  setLisboxWidth();
  if (open.value) {
    return;
  }

  open.value = true;
}

async function fetchData() {
  try {
    loading.value = true;
    const query = props.transformFetchQuery({
      page: page.value,
      perpage: props.limit,
      q: search.value
    });

    const { data: result } = await useRequest(props.url, {
      method: 'GET',
      query
    });

    const data = props.transformFetchData(result);
    const hasMore = data.length >= props.limit;

    options.value.push(...data);
    hasMoreItems.value = hasMore;
    page.value = hasMore ? page.value + 1 : page.value;
    isFetched.value = true;
    loading.value = false;
  }
  catch (err) {
    useRequestError(err);
    loading.value = false;
  }
}

async function onSelected(_item?: ListBoxItem) {
  await nextTick();
  open.value = false;
  setTimeout(() => srOnlyRef.value?.focus?.(), 150);
}

function onScrollEnd() {
  if (!loading.value && hasMoreItems.value && props.paginated) {
    fetchData();
  }
}

function setLisboxWidth() {
  if (wrapperRef.value) {
    const { width: _width } = wrapperRef.value.getBoundingClientRect();
    width.value = `${_width}px`;
  }
}

function onInput() {
  if (!props.paginated) {
    return;
  }

  page.value = 1;
  options.value = [];
  hasMoreItems.value = false;
  nextTick(fetchData);
}

useResizeObserver(wrapperRef, ([entry]) => {
  if (!entry) {
    return;
  }

  setLisboxWidth();
});

watchEffect(() => {
  if (open.value && !options.value.length && !isFetched.value) {
    setTimeout(fetchData, 150);
  }
});
</script>

<template>
  <div class="relative">
    <UPopover
      v-model:open="open"
      :ui="{ content: `${isDisabled ? 'hidden': ''} z-[55]` }"
      :dismissible="props.dismissable"
      :portal="props.teleport"
      @update:open="setLisboxWidth"
    >
      <div
        ref="wrapperRef"
        class="relative block w-full"
        :class="{ 'pointer-events-none': isDisabled }"
        role="button"
        @click.stop.prevent
      >
        <UInput
          :model-value="inputValue"
          class="w-full"
          :size="props.size"
          readonly
          :placeholder="props.placeholder"
          :disabled="isDisabled"
          @focus="onFocus"
          @click.stop
        >
          <template #trailing>
            <UIcon
              name="lucide:chevron-right"
              :class="`w-5 h-5 transition duration-300 text-slate-400 ${open ? 'rotate-90': ''}`"
            />
          </template>
        </UInput>
      </div>

      <template #content>
        <ListBox
          v-if="!isDisabled"
          v-model:search="search"
          v-model:selected="selectedItem"
          :loading="loading"
          :items="items"
          :width="width"
          :placeholder="props.placeholderSearch"
          @update:selected="(val) => onSelected(val as ListBoxItem)"
          @input="onInput"
          @scroll-end="onScrollEnd"
        />
      </template>
    </UPopover>

    <div
      ref="srOnlyRef"
      class="sr-only"
      :tabindex="-1"
    >
      Focusable element after selection
    </div>
  </div>
</template>
