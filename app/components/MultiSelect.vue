<script setup lang="ts">
import { vOnKeyStroke } from '@vueuse/components';
import { promiseTimeout, useResizeObserver, useDebounceFn } from '@vueuse/core';
import { tv } from 'tailwind-variants';
import theme from '~~/app/utils/theme/tag-input';
import { omit, toArray } from '~~/shared/utils';
import type { TagInputColor, TagInputSize, TagInputVariant } from '~~/app/utils/theme/tag-input';
import type { ListBoxItem } from '~/types/listbox';

interface FetchQuery {
  page: number;
  perpage: number;
  q: string;
}

interface Props {
  url?: string;
  selected?: ListBoxItem[];
  options?: ListBoxItem[];
  size?: TagInputSize;
  color?: TagInputColor;
  variant?: TagInputVariant;
  itemColor?: TagInputColor;
  itemVariant?: TagInputVariant;
  class?: any;
  placeholder?: string;
  transformFetchData?: (result: any) => ListBoxItem[];
  transformFetchQuery?: (params: FetchQuery) => Record<string, any>;
  debounce?: number;
  paginated?: boolean;
  limit?: number;
  dismissable?: boolean;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  limit: 10,
  placeholder: 'Search...',
  transformFetchData: (result: any) => toArray(result).map((val) => ({
    id: val.id,
    label: val.name,
    ...omit(val, ['id', 'name'])
  })),
  transformFetchQuery: (params: FetchQuery) => params,
  debounce: 350,
  dismissable: true,
  teleport: true,
  disabled: false
});
const emits = defineEmits<{
  (e: 'update:selected', val: ListBoxItem[]): void;
}>();

const multiSelect = tv(theme);
const classes = computed(() => multiSelect({
  size: props.size,
  color: props.color,
  variant: props.variant
}));

const search = ref('');
const _selected = ref<ListBoxItem[]>([]);
const selectedItems = computed({
  get: () => props.selected ?? _selected.value,
  set: (val) => {
    _selected.value = val;
    emits('update:selected', val);
  }
});
const loading = ref(false);
const items = ref<ListBoxItem[]>([]);
const computedItems = computed(() => {
  if (!props.url) {
    return (props.options ?? []).filter((val) => val.label.toLowerCase().includes(search.value.toLowerCase()));
  }

  if (!props.paginated) {
    return (items.value ?? []).filter((val) => val.label.toLowerCase().includes(search.value.toLowerCase()));
  }

  return items.value;
});
const isEmptySearch = ref(true);

const isFetched = ref(false);
const page = ref(1);
const hasMoreItems = ref(false);

const isDisabled = computed(() => props.disabled);

const wrapperRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const listboxRef = ref();
const width = ref('max-content');

const open = ref(false);

const debouncedInput = useDebounceFn(() => {
  if (!props.url || !props.paginated) {
    return;
  }

  page.value = 1;
  items.value = [];
  hasMoreItems.value = false;
  nextTick(fetchData);
}, props.debounce);

function onDeleteItem(event: Event, item: ListBoxItem) {
  event.stopPropagation();
  selectedItems.value = selectedItems.value.filter((val) => val.id !== item.id);
}

function onKeystrokeSearch(evt: KeyboardEvent) {
  if (evt.key === 'Backspace' && isEmptySearch.value && selectedItems.value.length > 0) {
    const lastItem = selectedItems.value.at(selectedItems.value.length - 1);
    selectedItems.value = selectedItems.value.filter((val) => val.id !== lastItem?.id);
    return;
  }

  const listBoxItemFirst = listboxRef.value?.itemsRef?.at?.(0);

  if (evt.key === 'ArrowDown' && listBoxItemFirst instanceof HTMLElement) {
    listBoxItemFirst.focus();
  }
}

function onInput() {
  isEmptySearch.value = !search.value.length;
  debouncedInput();
}

async function onFocus() {
  await nextTick();
  setLisboxWidth();
  await promiseTimeout(50);
  setTimeout(() => inputRef.value?.focus(), 25);

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

    const { data: result } = await useRequest(props.url ?? '', {
      method: 'GET',
      query
    });

    const data = props.transformFetchData(result);
    const hasMore = data.length >= props.limit;

    items.value.push(...data);
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

useResizeObserver(wrapperRef, ([entry]) => {
  if (!entry) {
    return;
  }

  setLisboxWidth();
});

watchEffect(() => {
  if (open.value && !items.value.length && !isFetched.value) {
    setTimeout(fetchData, 150);
  }
});
</script>

<template>
  <div
    :class="classes.root({ class: props.class })"
  >
    <UPopover
      v-model:open="open"
      :ui="{ content: `${isDisabled ? 'hidden' : ''} z-[55]` }"
      :dismissible="props.dismissable"
      :portal="props.teleport"
      @update:open="setLisboxWidth"
    >
      <div
        ref="wrapperRef"
        :class="classes.wrapper({ disabled: isDisabled })"
        role="button"
        :data-focus="open ? 'true': null"
        @click.stop.prevent
      >
        <TagItem
          v-for="(item, i) in selectedItems"
          :key="i"
          :size="props.size"
          :color="props.itemColor ?? props.color"
          :variant="props.itemVariant ?? props.variant"
          :closable="!isDisabled"
          @click.stop
          @close="(evt) => onDeleteItem(evt, item)"
        >
          {{ item.label }}
        </TagItem>

        <input
          ref="inputRef"
          v-model="search"
          v-on-key-stroke="onKeystrokeSearch"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          :placeholder="props.placeholder"
          :class="classes.input()"
          :disabled="isDisabled"
          @click.stop
          @focus="onFocus"
          @input="onInput"
        >
      </div>

      <template #content>
        <ListBox
          v-if="!disabled"
          ref="listboxRef"
          v-model:selected="selectedItems"
          :loading="loading"
          :items="computedItems"
          :width="width"
          :searchable="false"
          multiple
          @scroll-end="onScrollEnd"
        />
      </template>
    </UPopover>
  </div>
</template>
