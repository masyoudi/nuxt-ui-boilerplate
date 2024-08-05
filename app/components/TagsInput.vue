<template>
  <div class="relative w-full">
    <div :class="wrapperClass" data-taginput="wrapper" @click="onClickWrapper">
      <div v-for="(val, i) in tags" :key="i" :class="tagClass.wrapper">
        <span :class="tagClass.label">{{ props.formatLabelTag(val) }}</span>
        <span :class="tagClass.close" @click="(evt) => removeItem(i, evt)">
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4"></UIcon>
        </span>
      </div>

      <div :class="inputWrapperClass" data-taginput="input-wrapper">
        <input
          v-model="newItem"
          :class="inputClass"
          :placeholder="props.placeholder"
          :readonly="isAutocomplete"
          @compositionstart="() => (isComposing = true)"
          @compositionend="() => (isComposing = false)"
          @keydown="onKeydown"
        />
      </div>
    </div>

    <UPopover v-model:open="open" :ui="uiPopover" :popper="{ strategy: 'absolute', placement: 'bottom' }" @update:open="onOpenPopover">
      <!-- Popover trigger -->
      <div class="h-px w-full pointer-events-none"></div>

      <!-- Popover panel -->
      <template #panel>
        <ListBox
          v-model:search="search"
          :options="computedData"
          :debounce="props.debounce"
          :loading="loading"
          :placeholder="props.placeholderSearch"
          :selection-index="() => -1"
          :resettable="false"
          @select="onSelected"
          @scroll-end="onScrollEnd"
          @input="onInput"
        >
        </ListBox>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { twJoin } from 'tailwind-merge';
import { useDebounceFn } from '@vueuse/core';
import type { OptionItem } from '@@/types/ui/autocomplete';
import { useFormGroup } from '#ui/composables/useFormGroup.js';
import { useInjectButtonGroup } from '#ui/composables/useButtonGroup.js';
import { mergeConfig } from '#ui/utils';
import appConfig from '#build/app.config.mjs';

type ValueType = string | number | OptionItem;

interface Query {
  page: number;
  perpage: number;
  search: string;
}

interface Props {
  modelValue?: ValueType[];
  url?: string;
  paginated?: boolean;
  options?: OptionItem[];
  separators?: string[];
  confirmKeys?: string[];
  removeOnKeys?: string[];
  createItem?: (val: ValueType) => ValueType;
  beforeAdding?: (val: any) => boolean;
  formatLabelTag?: (val: ValueType) => string;
  transformFetchData?: (result: any) => OptionItem[];
  transformFetchQuery?: (result: Query) => Record<string, any>;
  debounce?: number;
  placeholder?: string;
  placeholderSearch?: string;
  variant?: 'outline' | 'none';
  class?: string;
  ui?: Record<string, any>;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  createItem: (val: ValueType) => val,
  separators: () => [','],
  confirmKeys: () => [',', 'Tab', 'Enter'],
  removeOnKeys: () => ['Backspace'],
  beforeAdding: () => true,
  formatLabelTag: (val: ValueType) => {
    return typeof val === 'object' ? val.label : String(val ?? '');
  },
  transformFetchData: (val: any) => val,
  debounce: 400,
  paginated: true,
  placeholder: 'Add tag',
  placeholderSearch: 'Search...',
  class: '',
  variant: 'outline',
  color: 'white',
  size: 'md'
});
const emits = defineEmits<{
  (e: 'update:modelValue', val: ValueType[]): void;
  (e: 'remove', val: ValueType): void;
  (e: 'input', value: string): void;
}>();

/** UI */
const config = mergeConfig<typeof appConfig.ui.taginput>(appConfig.ui.strategy, appConfig.ui.taginput);
const { ui } = useUI('taginput', toRef(props, 'ui'), config, toRef(props, 'class'));
const { color, size: sizeFormGroup } = useFormGroup(props, config);
const { size: sizeButtonGroup, rounded } = useInjectButtonGroup({ ui, props });
const currentSize = computed(() => sizeButtonGroup.value ?? sizeFormGroup.value);

const wrapperClass = computed(() => {
  const variant = (ui.value.color as any)?.[color.value as string]?.[props.variant as string] || ui.value.variant[props.variant];

  return twJoin(
    ui.value.base,
    rounded.value,
    (ui.value.size as any)[currentSize.value],
    (ui.value.gap as any)[currentSize.value],
    (ui.value.padding as any)[currentSize.value],
    variant?.replaceAll('{color}', color.value)
  );
});

const inputWrapperClass = computed(() => ui.value.input.wrapper);
const inputClass = computed(() =>
  twJoin(ui.value.input.base, ui.value.input.placeholder, isAutocomplete.value ? ui.value.input.autocomplete : '')
);
const tagClass = computed(() => ({
  wrapper: twJoin(ui.value.tag.base, ui.value.tag.background, ui.value.tag.rounded, (ui.value.tag.padding as any)[currentSize.value]),
  label: ui.value.tag.label,
  close: ui.value.tag.close
}));

const uiPopover = /* ui */ {
  width: 'w-full',
  wrapper: 'relative w-full h-px',
  trigger: 'absolute top-0 right-0 left-0 pointer-events-none -z-10'
};

/** Tags */
const _tags = ref<ValueType[]>([]);
const tags = computed({
  get: () => props.modelValue ?? _tags.value,
  set: (val) => {
    _tags.value = val ?? [];
    emits('update:modelValue', val);
  }
});
const newItem = ref('');
const isComposing = ref(false);
const separatorsAsRegExp = computed(() => {
  const mapping = (str: string) => (str ? str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : null);
  return props.separators.length ? new RegExp(props.separators.map(mapping).join('|'), 'g') : null;
});
const tagsLength = computed(() => tags.value.length);

// Autocomplete
const open = ref(false);
const search = ref('');
const page = ref(1);
const perPage = ref(10);
const isLastPage = ref(false);
const isFetched = ref(false);
const loading = ref(false);
const data = ref<OptionItem[]>([]);
const query = computed(() => {
  const q = {
    page: page.value,
    perpage: perPage.value,
    search: search.value
  };

  return typeof props.transformFetchQuery === 'function' ? props.transformFetchQuery(q) : q;
});
const isAfterClosePopover = ref(false);
const hasURL = computed(() => typeof props.url === 'string' && props.url !== '');
const isAutocomplete = computed(() => Array.isArray(props.options) || hasURL.value);

const computedData = computed(() => {
  if (Array.isArray(props.options) || (hasURL.value && !props.paginated)) {
    return (props.options ?? data.value).filter((v) => v.label.toLowerCase().includes(search.value.toLowerCase()));
  }

  return data.value;
});

/**
 * Handle keydown input
 * @param event - KeyboardEvent
 */
function onKeydown(event: KeyboardEvent) {
  if (props.removeOnKeys.includes(event.key) && !newItem.value?.length && tagsLength.value > 0) {
    removeItem(tagsLength.value - 1);
  }

  if (props.confirmKeys.includes(event.key)) {
    // Allow Tab to advance to next field regardless
    if (event.key !== 'Tab') {
      event.preventDefault();
    }

    if (event.key === 'Enter' && isComposing.value) {
      return;
    }

    addItem();
  }
}

/**
 * Handle add item
 * @param item - Item to add
 */
function addItem(item?: ValueType): void {
  item = item || newItem.value.trim();

  if (item) {
    const regExp = separatorsAsRegExp.value;
    if (typeof item === 'string' && !!regExp && item.match(regExp)) {
      const parsed = item.split(regExp).map((t) => t.trim());
      parsed.filter((t) => t.length !== 0).map(addItem);
      return;
    }

    // Add the item input if it is not blank
    // or previously added
    const itemToAdd = props.createItem(item);
    const canAdd = !tags.value.includes(itemToAdd);
    if (canAdd && props.beforeAdding(item)) {
      tags.value = [...tags.value, itemToAdd];
    }
  }

  requestAnimationFrame(() => {
    newItem.value = '';
    emits('input', newItem.value);
  });
}

/**
 * Handle remove item
 * @param index - Index of item
 * @param event - Event
 */
function removeItem(index: number, event?: Event): void {
  const item = tags.value.at(index);
  tags.value = tags.value.toSpliced(index, 1);

  if (item) {
    emits('remove', item);
  }

  if (event) {
    event.stopPropagation();
  }
}

const { execute: fetchData } = useRequest<OptionItem[]>(props.url ?? '/', {
  transform: (_result) => props.transformFetchData(_result),
  query,
  onRequest: () => {
    loading.value = true;
  },
  onResponse: ({ response }) => {
    loading.value = false;
    isFetched.value = true;

    if (!response.ok) {
      return;
    }

    const arr = props.transformFetchData(response._data);
    isLastPage.value = arr.length < perPage.value;
    page.value += 1;
    data.value.push(...arr);
  }
});

const debouncedOpenPopover = useDebounceFn(() => {
  isAfterClosePopover.value = false;
}, 275);

function onClickWrapper(evt: Event) {
  evt.preventDefault();
  const target = evt.target as HTMLElement;

  if (!['wrapper', 'input-wrapper'].includes(target.dataset?.taginput ?? '')) {
    return;
  }

  if (!open.value && !isAfterClosePopover.value && isAutocomplete.value) {
    open.value = true;
  }
}

function onOpenPopover(opened: boolean) {
  if (opened && isFetched.value && !props.paginated) {
    return;
  }

  if (opened && !data.value.length && hasURL.value) {
    loading.value = true;
    setTimeout(fetchData, 250);
  }

  if (!opened) {
    isAfterClosePopover.value = true;
    nextTick(debouncedOpenPopover);
  }
}

/**
 * Handle selected dropdown item
 * @param value - Option item
 */
function onSelected(value: OptionItem) {
  addItem(value);
}

/**
 * Handle input search
 */
function onInput() {
  if (!props.paginated || !hasURL.value) {
    return;
  }

  page.value = 1;
  data.value = [];
  isLastPage.value = false;
  nextTick(fetchData);
}

/**
 * Handle scroll bottom dropdown
 */
function onScrollEnd() {
  if (loading.value || !props.paginated || isLastPage.value || !hasURL.value) {
    return;
  }

  fetchData();
}
</script>
