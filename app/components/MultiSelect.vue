<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot
} from 'reka-ui';

import { useDebounceFn } from '@vueuse/core';
import type { ComboBoxItem } from '~/types/combobox';
import tagInputTheme from '~~/app/utils/theme/tag-input';
import tagItemTheme from '~~/app/utils/theme/tag-item';

import type { TagInputColor, TagInputSize, TagInputVariant } from '~~/app/utils/theme/tag-input';

interface FetchQuery {
  page: number;
  perpage: number;
  q: string;
}

interface Props {
  selected?: ComboBoxItem[];
  url: string;
  limit?: number;
  placeholder?: string;
  placeholderSearch?: string;
  transformFetchData?: (result: any) => ComboBoxItem[];
  transformFetchQuery?: (params: FetchQuery) => Record<string, any>;
  size?: TagInputSize;
  color?: TagInputColor;
  variant?: TagInputVariant;
  filter?: (item: ComboBoxItem, searchTerm: string, isChild: boolean) => boolean;
  icon?: string;
  trailingIcon?: string;
  paginated?: boolean;
  debounce?: number;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  limit: 10,
  transformFetchData: (result: any) => toArray(result).map((val) => ({
    value: val.id,
    label: val.name,
    ...omit(val, ['value', 'label'])
  })),
  filter: (item, text) => item.label.toLowerCase().includes(text.toLowerCase()),
  transformFetchQuery: (params: FetchQuery) => params,
  trailingIcon: 'lucide:chevron-down',
  paginated: true,
  debounce: 350,
  teleport: true,
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:selected', val: ComboBoxItem[]): void;
}>();

const uiTaginput = computed(() => tagInputTheme({
  size: props.size,
  color: props.color,
  variant: props.variant
}));

const uiTagItem = computed(() => tagItemTheme());

const {
  emitFormChange,
  emitFormInput,
  disabled
} = useFormField<Props>(props, { deferInputValidation: true });

const open = ref(false);

const _selected = ref<ComboBoxItem[]>([]);
const selectedItem = computed({
  get: () => props.selected ?? _selected.value,
  set: (val) => {
    _selected.value = val;
    emits('update:selected', val);
  }
});

const search = ref('');
const options = ref<ComboBoxItem[]>([]);
const items = computed(() => {
  if (props.paginated) {
    return options.value;
  }

  return (options.value ?? []).reduce((prev, curr) => {
    const hasChilds = Array.isArray(curr._children);
    const childrens = hasChilds ? curr._children!.filter((child) => props.filter(child, search.value, true)) : [];

    if (childrens.length > 0 || props.filter(curr, search.value, false)) {
      prev.push({ ...curr, ...(hasChilds && { _children: childrens }) });
    }

    return prev;
  }, [] as ComboBoxItem[]);
});
const loading = ref(false);
const isFetched = ref(false);

const page = ref(1);
const hasMoreItems = ref(false);
const isDisabled = computed(() => disabled.value);

const debouncedInput = useDebounceFn(() => {
  if (!props.url || !props.paginated) {
    return;
  }

  page.value = 1;
  options.value = [];
  hasMoreItems.value = false;
  nextTick(fetchData);
}, props.debounce);

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

/**
 * Handle selected item combobox
 * @param item - Selected item
 */
async function onSelected(_item?: ComboBoxItem) {
  emitFormChange();
  emitFormInput();

  await nextTick();
  open.value = false;
}

/**
 * Handle infinity scroll combobox
 */
function onScrollEnd() {
  if (!loading.value && hasMoreItems.value && props.paginated) {
    fetchData();
  }
}

function onInput() {
  debouncedInput();
}

watchEffect(() => {
  if (open.value && !options.value.length && !isFetched.value) {
    setTimeout(fetchData, 150);
  }
});
</script>

<template>
  <ComboBox
    v-model="selectedItem"
    v-model:open="open"
    :items="items"
    multiple
    :loading="loading"
    :disabled="isDisabled"
    :portal="props.teleport"
    :search-input="false"
    keep-open-on-select
    @update:model-value="(val) => onSelected(val as ComboBoxItem)"
    @scroll-end="onScrollEnd"
  >
    <ComboboxAnchor as-child>
      <TagsInputRoot
        v-model="selectedItem"
        :class="uiTaginput.wrapper({ disabled: isDisabled })"
      >
        <TagsInputItem
          v-for="(item, index) in selectedItem"
          :key="`${item.value}-${index}`"
          :value="item"
          :class="uiTagItem.base()"
        >
          <TagsInputItemText :class="uiTagItem.text()">
            <slot
              name="item-text"
              :item="item"
              :index="index"
            >
              {{ item.label }}
            </slot>
          </TagsInputItemText>
          <TagsInputItemDelete :class="uiTagItem.close()">
            <UIcon
              name="lucide:x"
              :class="uiTagItem.closeIcon()"
            />
          </TagsInputItemDelete>
        </TagsInputItem>

        <ComboboxInput
          v-model="search"
          as-child
        >
          <TagsInputInput
            :placeholder="props.placeholder"
            :class="uiTaginput.input()"
            @input="onInput"
            @keydown.enter.prevent
          />
        </ComboboxInput>
      </TagsInputRoot>
    </ComboboxAnchor>
  </ComboBox>
</template>
