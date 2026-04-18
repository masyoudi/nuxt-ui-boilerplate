<script lang="ts">
import type { FetchResponse } from 'ofetch';
import type { ComboboxRootProps, ComboboxContentProps } from 'reka-ui';
import type { MultiSelectItem } from '~/types/multi-select';
import type { ButtonProps, InputProps, LinkPropsKeys } from '#ui/types';
import { cn, type VariantProps } from 'tailwind-variants';
import type { UseComponentIconsProps } from '@nuxt/ui/composables';
import {
  useForwardPropsEmits,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxCancel,
  ComboboxEmpty,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxAnchor,
  TagsInputRoot,
  TagsInputItem,
  TagsInputItemText,
  TagsInputItemDelete,
  TagsInputInput,
  ComboboxInput,
  ComboboxContent,
  FocusScope,
  ComboboxVirtualizer,
  ComboboxGroup
} from 'reka-ui';
import theme from '~/theme/multi-select';
import { useComponentIcons, useFieldGroup, useFilter, usePortal } from '@nuxt/ui/composables';
import { getEstimateSize } from '@nuxt/ui/utils/virtualizer';
import { createReusableTemplate, reactivePick, useDebounceFn } from '@vueuse/core';
import { vIntersectionObserver } from '@vueuse/components';
import defu from 'defu';
import type { VNode } from 'vue';

type ModelValue<Multiple extends boolean = false> = Multiple extends true ? MultiSelectItem[] : MultiSelectItem;

export type MultiSelectTheme = typeof theme;

export interface MultiSelectFetchQuery {
  page: number;
  perpage: number;
  q: string;
}

type _ComboboxRootProps = 'name' | 'resetSearchTermOnBlur' | 'resetSearchTermOnSelect' | 'resetModelValueOnClear' | 'highlightOnHover' | 'disabled' | 'by';

type UIProps = Record<keyof ReturnType<MultiSelectTheme>, string>;

export interface MultiSelectProps<M extends boolean> extends Pick<ComboboxRootProps, _ComboboxRootProps>, UseComponentIconsProps {
  id?: string;
  required?: boolean;
  /** The controlled value of the MultiSelect. Can be binded-with with `v-model`. */
  modelValue?: ModelValue<M>;
  items?: MultiSelectItem[];
  /** Whether multiple options can be selected or not. */
  multiple?: M & boolean;
  url?: string;
  limit?: number;
  paginated?: boolean;
  transformFetchData?: (result: any, raw: FetchResponse<any>) => MultiSelectItem[];
  transformFetchQuery?: (params: MultiSelectFetchQuery) => Record<string, any>;
  filterFields?: string | string[];
  filterRemoveTag?: (currentItem: MultiSelectItem, itemToRemove: MultiSelectItem) => boolean;
  checkSelection?: (item: MultiSelectItem, selected?: MultiSelectItem) => boolean;
  toggle?: boolean;
  class?: string;
  /** Highlight the ring color like a focus state. */
  highlight?: boolean;
  /**
   * @defaultValue 'primary'
   */
  color?: VariantProps<MultiSelectTheme>['color'];
  /**
   * @defaultValue 'lg'
   */
  size?: VariantProps<MultiSelectTheme>['size'];
  /**
   * @defaultValue 'outline'
   */
  variant?: VariantProps<MultiSelectTheme>['variant'];
  /** The placeholder text when the select is empty. */
  placeholder?: string;
  /** The icon displayed when an item is selected. */
  selectedIcon?: string;
  /**
   * Display a clear button to reset the model value.
   * Can be an object to pass additional props to the Button.
   * @defaultValue false
   */
  clear?: boolean | Partial<Omit<ButtonProps, LinkPropsKeys>>;
  /** The icon displayed in the clear button. */
  clearIcon?: string;
  tagsInputIcon?: string;
  deleteIcon?: string;
  loadingText?: string;
  empty?: string;
  debounce?: number;
  portal?: boolean | string | HTMLElement;
  /**
   * Enable virtualization for large lists.
   * Note: when enabled, all groups are flattened into a single list due to a limitation of Reka UI (https://github.com/unovue/reka-ui/issues/1885).
   * @defaultValue false
   */
  virtualize?: boolean | {
    /**
     * Number of items rendered outside the visible area
     * @defaultValue 12
     */
    overscan?: number;
    /**
     * Estimated size (in px) of each item, or a function that returns the size for a given index
     * @defaultValue 32
     */
    estimateSize?: number | ((index: number) => number);
  };
  /**
   * The content of the menu.
   * @defaultValue ```{ side: 'bottom', sideOffset: 8, collisionPadding: 8, position: 'popper' }```
   */
  content?: Omit<ComboboxContentProps, 'as' | 'asChild' | 'forceMount'>;
  searchInput?: boolean | Omit<InputProps, 'modelValue' | 'defaultValue'>;
  ignoreFilter?: boolean;
  ui?: Partial<UIProps>;
}

interface BaseSlotProps {
  ui: ReturnType<MultiSelectTheme>;
}

interface SlotPropsDefault<M extends boolean> extends BaseSlotProps {
  modelValue?: ModelValue<M>;
  open: boolean;
}

interface SlotPropsItem extends BaseSlotProps {
  item: MultiSelectItem;
  groupIndex: number;
  index: number;
}

export interface MultiSelectSlots<M extends boolean> {
  'default': (props: SlotPropsDefault<M>) => VNode[];
  'leading': (props: SlotPropsDefault<M>) => VNode[];
  'trailing': (props: SlotPropsDefault<M>) => VNode[];
  'item': (props: SlotPropsItem) => VNode[];
  'item-leading': (props: SlotPropsItem) => VNode[];
  'item-trailing': (props: SlotPropsItem) => VNode[];
  'item-label': (props: SlotPropsItem) => VNode[];
  'tags-item-text': (props: Omit<SlotPropsItem, 'groupIndex'>) => VNode[];
  'tags-item-delete': (props: Omit<SlotPropsItem, 'groupIndex'>) => VNode[];
  'tags-input-icon': (props: Pick<SlotPropsDefault<M>, 'open' | 'ui'>) => VNode[];
  'empty': (props: BaseSlotProps & { searchTerm: string }) => VNode[];
  'content-top': (props: BaseSlotProps) => VNode[];
  'loading': (props: BaseSlotProps) => VNode[];
}

export interface MultiSelectEmits<M extends boolean> {
  (e: 'update:modelValue', value?: ModelValue<M>): void;
  (e: 'change', event: Event): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'clear'): void;
}
</script>

<script setup lang="ts" generic="M extends boolean = false">
defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<MultiSelectProps<M>>(), {
  transformFetchData: (result: any) => toArray(result).map((val) => ({
    value: val.id,
    label: val.name,
    ...omit(val, ['value', 'label'])
  })),
  transformFetchQuery: (params: MultiSelectFetchQuery) => params,
  filterFields: 'label',
  filterRemoveTag: (currentItem, itemToRemove) => currentItem.value !== itemToRemove.value,
  checkSelection: (item, selected) => item.value === selected?.value,
  toggle: true,
  searchInput: true,
  portal: true,
  clear: true,
  placeholder: 'Search...',
  trailingIcon: 'lucide:chevron-down',
  clearIcon: 'lucide:x',
  deleteIcon: 'lucide:x',
  loadingText: 'Loading...',
  loadingIcon: 'lucide:loader',
  empty: 'No results found.',
  selectedIcon: 'lucide:check',
  tagsInputIcon: 'lucide:tag',
  limit: 10,
  debounce: 350,
  paginated: true,
  ignoreFilter: false
});

const emits = defineEmits<MultiSelectEmits<M>>();
const slots = defineSlots<MultiSelectSlots<M>>();

const _selected = ref<ModelValue<M>>();
const selected = computed({
  get: () => props.modelValue ?? _selected.value,
  set: (value) => {
    _selected.value = value;
    emits('update:modelValue', value);
  }
});
const searchTerm = defineModel<string>('searchTerm', {
  default: ''
});
const open = ref(false);

const isServerFiltering = computed(() => props.paginated && typeof props.url === 'string');
const ignoreFiltering = computed(() => props.ignoreFilter || isServerFiltering.value);

const data = ref<MultiSelectItem[]>([]);
const groups = computed(() => {
  const _items = Array.isArray(props.items) ? props.items : data.value;
  if (_items.every((item) => Array.isArray(item.children))) {
    return _items;
  }

  return [{ label: '', value: -1, children: _items }];
});

const { filter: filterFn } = useFilter();
const filteredGroups = computed(() => {
  if (ignoreFiltering.value) {
    return groups.value;
  }

  const _groups = groups.value.map((item) => ({
    ...item,
    children: filterFn(toArray(item.children), searchTerm.value, toArray(props.filterFields, true))
  }));

  return _groups.filter((group) => group.children.length > 0);
});
const filteredItems = computed(() => filteredGroups.value.flatMap((item) => item.children!));
const isGrouping = computed(() => filteredGroups.value.every((group) => group.value !== -1 && Array.isArray(group.children)));

const rootProps = useForwardPropsEmits(
  reactivePick(
    props,
    'modelValue',
    'required',
    'multiple',
    'resetSearchTermOnBlur',
    'resetSearchTermOnSelect',
    'resetModelValueOnClear',
    'highlightOnHover',
    'by'
  ),
  emits
);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => defu(props.content, {
  side: 'bottom',
  sideOffset: 8,
  collisionPadding: 8,
  position: 'popper'
}) as ComboboxContentProps);
const clearProps = computed(() => typeof props.clear === 'object' ? props.clear : {} as Partial<Omit<ButtonProps, LinkPropsKeys>>);
const isVirtualized = computed(() => !!props.virtualize || (typeof props.url === 'string' && !props.paginated));
const virtualizerProps = toRef(() => {
  if (!isVirtualized.value) {
    return false;
  }

  return defu(typeof props.virtualize === 'object' ? props.virtualize : {}, {
    estimateSize: getEstimateSize(filteredItems.value, selectSize.value ?? 'md')
  });
});
const searchInputProps = computed(() => {
  const inputProps = typeof props.searchInput === 'boolean' ? {} : props.searchInput;
  const defaults = {
    placeholder: 'Search...',
    variant: 'none' as const,
    ...(isLoading.value && { trailingIcon: props.loadingIcon })
  };

  const ui = {
    ...inputProps.ui,
    trailingIcon: cn(inputProps.ui?.trailingIcon, isLoading.value ? 'animate-spin' : '')
  };

  return { ...defaults, ...inputProps, ui };
});

const {
  emitFormBlur,
  emitFormFocus,
  emitFormChange,
  emitFormInput,
  size: formFieldSize,
  color,
  id,
  name,
  highlight,
  disabled: isDisabled,
  ariaAttrs
} = useFormField<InputProps>(props);

const { orientation, size: fieldGroupSize } = useFieldGroup<InputProps>(props);
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
const selectSize = computed(() => fieldGroupSize.value || formFieldSize.value);

const page = ref(1);
const hasNextPage = ref(false);
const isAlreadyFetching = ref(false);
const rootRef = useTemplateRef('rootRef');

const _loading = ref(false);
const isLoading = computed(() => props.loading || _loading.value);

const uiTheme = computed(() => theme({
  color: color.value,
  variant: props.variant,
  size: selectSize?.value,
  loading: isLoading.value,
  highlight: highlight.value,
  leading: isLeading.value || !!props.avatar || !!slots?.leading,
  trailing: isTrailing.value || !!slots?.trailing,
  multiple: props.multiple,
  fieldGroup: orientation.value,
  tagsInputIcon: typeof props.tagsInputIcon === 'string',
  virtualize: isVirtualized.value
}));

const [DefineLeadingTrailing, ReuseLeadingTrailing] = createReusableTemplate();
const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate<{ item: MultiSelectItem; groupIndex: number; index: number }>({
  props: {
    item: {
      type: Object,
      required: true
    },
    groupIndex: {
      type: Number,
      required: true
    },
    index: {
      type: Number,
      required: false
    }
  }
});

const debouncedInput = useDebounceFn(() => {
  if (!props.url || !props.paginated || !open.value) {
    return;
  }

  page.value = 1;
  data.value = [];
  hasNextPage.value = false;
  nextTick(fetchData);
}, props.debounce);

async function fetchData() {
  try {
    if (typeof props.url !== 'string' || !import.meta.client) {
      return;
    }

    const prevLastItem = data.value.at(data.value.length - 1);
    _loading.value = true;
    const query = props.transformFetchQuery({
      page: page.value,
      perpage: props.limit,
      q: searchTerm.value
    });

    const { raw, res } = await useRequest(props.url, {
      method: 'GET',
      query
    });

    const _data = props.transformFetchData(res, raw);
    const hasMoreItems = _data.length >= props.limit;

    data.value = [...data.value, ..._data];
    hasNextPage.value = hasMoreItems;
    page.value = hasMoreItems ? page.value + 1 : page.value;
    isAlreadyFetching.value = true;

    // Highlight last seen item to prevent scroll top
    if (prevLastItem) {
      await nextTick();
      rootRef.value?.highlightItem?.(prevLastItem);
    }

    _loading.value = false;
  }
  catch (err) {
    useRequestError(err);
    _loading.value = false;
  }
}

function onUpdate(value: any) {
  const eventInit: Record<string, any> = {
    detail: {
      value
    }
  };
  const event = new Event('change', eventInit);
  emits('change', event);
  emitFormChange();
  emitFormInput();

  if (props.resetSearchTermOnSelect) {
    searchTerm.value = '';
  }
}

function onUpdateOpen(value: boolean) {
  if (!value) {
    const event = new FocusEvent('blur');
    emits('blur', event);
    emitFormBlur();
    return;
  }

  if (!filteredGroups.value.length && !isAlreadyFetching.value) {
    setTimeout(fetchData, 150);
  }

  const event = new FocusEvent('focus');
  emits('focus', event);
  emitFormFocus();
}

function onRemoveTag(value: MultiSelectItem) {
  if (props.multiple) {
    const currentValue = toArray(selected.value as MultiSelectItem[]);
    const filtered = currentValue.filter((item) => props.filterRemoveTag(item, value));
    selected.value = filtered as ModelValue<M>;
  }
}

function onFocus(event: FocusEvent) {
  emits('focus', event);
  emitFormFocus();
}

function onBlur(event: FocusEvent) {
  emits('blur', event);
  emitFormBlur();
}

function onInput(value: string) {
  searchTerm.value = value;
  console.log(filteredGroups.value);
  debouncedInput();
}

function onSelect(event: Event, item: MultiSelectItem) {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (!props.multiple && props.toggle && props.checkSelection(item, selected.value as MultiSelectItem)) {
    selected.value = undefined;
  }

  item.onSelect?.(event);
}

function onIntersectionBottom([entry]: IntersectionObserverEntry[]) {
  if (entry?.isIntersecting && !isLoading.value && hasNextPage.value && props.paginated && open.value) {
    fetchData();
  }
}

function onOpenContent() {
  open.value = true;
  nextTick(() => onUpdateOpen(true));
}

function isModelValueEmpty() {
  if (props.multiple && Array.isArray(selected.value)) {
    return selected.value.length === 0;
  }

  return selected.value === undefined || selected.value === null;
}

function onClear() {
  emits('clear');
  selected.value = props.multiple ? [] as unknown as ModelValue<M> : undefined;
}
</script>

<template>
  <DefineLeadingTrailing v-slot="{ $slots }">
    <span
      v-if="isLeading || !!avatar || !!slots.leading"
      data-slot="leading"
      :class="uiTheme.leading({ class: props.ui?.leading })"
    >
      <slot
        name="leading"
        :model-value="modelValue"
        :open="open"
        :ui="uiTheme"
      >
        <UIcon
          v-if="isLeading && leadingIconName"
          :name="leadingIconName"
          :class="uiTheme.leadingIcon({ class: props.ui?.leadingIcon })"
        />
        <UAvatar
          v-else-if="!!avatar"
          v-bind="avatar"
          data-slot="itemLeadingAvatar"
          :class="uiTheme.itemLeadingAvatar({ class: props.ui?.itemLeadingAvatar })"
        />
      </slot>
    </span>

    <component
      :is="$slots.default"
      v-if="!!$slots.default"
    />

    <component
      :is="props.multiple ? ComboboxTrigger : 'span'"
      v-if="isTrailing || !!slots.trailing || !!clear"
      data-slot="trailing"
      :class="uiTheme.trailing({ class: props.ui?.trailing })"
    >
      <slot
        name="trailing"
        :model-value="modelValue"
        :open="open"
        :ui="uiTheme"
      >
        <ComboboxCancel
          v-if="!!clear && !isModelValueEmpty() && !props.multiple"
          as-child
        >
          <UButton
            as="span"
            :icon="clearIcon"
            :size="selectSize"
            variant="link"
            color="neutral"
            tabindex="-1"
            v-bind="clearProps"
            :class="uiTheme.trailingClear({ class: props.ui?.trailingClear })"
            @click.stop="onClear"
          />
        </ComboboxCancel>
        <UIcon
          v-else-if="trailingIconName"
          :name="trailingIconName"
          :class="uiTheme.trailingIcon({ class: props.ui?.trailingIcon })"
        />
      </slot>
    </component>
  </DefineLeadingTrailing>

  <DefineItemTemplate v-slot="{ item, groupIndex, index }">
    <ComboboxItem
      :value="item"
      :class="uiTheme.item({ class: props.ui?.item })"
      :disabled="item.disabled"
      @select="onSelect($event, item)"
    >
      <slot
        name="item"
        :item="item"
        :group-index="groupIndex"
        :index="index"
        :ui="uiTheme"
      >
        <slot
          name="item-leading"
          :item="item"
          :group-index="groupIndex"
          :index="index"
          :ui="uiTheme"
        >
          <UIcon
            v-if="typeof item.icon === 'string'"
            :name="item.icon"
            :class="uiTheme.itemLeadingIcon({ class: props.ui?.itemLeadingIcon })"
          />
        </slot>

        <span :class="uiTheme.itemLabel({ class: props.ui?.itemLabel })">
          <slot
            name="item-label"
            :item="item"
            :group-index="groupIndex"
            :index="index"
            :ui="uiTheme"
          >
            {{ item.label }}
          </slot>
        </span>

        <span :class="uiTheme.itemTrailing({ class: props.ui?.itemTrailing })">
          <slot
            name="item-trailing"
            :item="item"
            :group-index="groupIndex"
            :index="index"
            :ui="uiTheme"
          />

          <ComboboxItemIndicator as-child>
            <UIcon
              :name="props.selectedIcon"
              :class="uiTheme.itemTrailingIcon({ class: props.ui?.itemTrailingIcon })"
            />
          </ComboboxItemIndicator>
        </span>
      </slot>
    </ComboboxItem>
  </DefineItemTemplate>

  <ComboboxRoot
    :id="id"
    ref="rootRef"
    v-bind="{ ...rootProps, ...$attrs, ...ariaAttrs }"
    v-model="selected"
    v-model:open="open"
    :name="name"
    :class="uiTheme.root({ class: [props.ui?.root, props?.class] })"
    ignore-filter
    :required="props.required"
    :as-child="!!props.multiple"
    :multiple="props.multiple"
    :disabled="isDisabled"
    @update:model-value="onUpdate"
    @update:open="onUpdateOpen"
    @keydown.enter.prevent
  >
    <ComboboxAnchor
      :as-child="!props.multiple"
      :class="uiTheme.base({ class: props.ui?.base })"
    >
      <TagsInputRoot
        v-if="props.multiple"
        v-slot="{ modelValue: tags }"
        :model-value="(selected as MultiSelectItem[])"
        :disabled="isDisabled"
        delimiter=""
        as-child
        @remove-tag="onRemoveTag"
      >
        <TagsInputItem
          v-for="(item, index) in (tags as MultiSelectItem[])"
          :key="index"
          :value="item"
          :class="uiTheme.tagsItem({ class: props.ui?.tagsItem })"
        >
          <TagsInputItemText :class="uiTheme.tagsItemText({ class: props.ui?.tagsItemText })">
            <slot
              name="tags-item-text"
              :item="item"
              :index="index"
              :ui="uiTheme"
            >
              {{ item.label }}
            </slot>
          </TagsInputItemText>

          <TagsInputItemDelete
            :class="uiTheme.tagsItemDelete({ class: props.ui?.tagsItemDelete })"
            :disabled="disabled"
          >
            <slot
              name="tags-item-delete"
              :item="item"
              :index="index"
              :ui="uiTheme"
            >
              <UIcon
                :name="props.deleteIcon"
                :class="uiTheme.tagsItemDeleteIcon({ class: props.ui?.tagsItemDeleteIcon })"
              />
            </slot>
          </TagsInputItemDelete>
        </TagsInputItem>

        <div :class="uiTheme.tagsInput({ class: props.ui?.tagsInput })">
          <ComboboxInput
            v-model="searchTerm"
            as-child
            @focus="onFocus"
            @blur="onBlur"
            @update:model-value="onInput"
          >
            <ComboboxTrigger as-child>
              <TagsInputInput
                ref="inputRef"
                v-bind="{ ...$attrs, ...ariaAttrs }"
                type="text"
                :tabindex="null"
                :placeholder="placeholder"
                :class="uiTheme.tagsInputInput({ class: props.ui?.tagsInputInput })"
                @keydown.enter.prevent
              />
            </ComboboxTrigger>
          </ComboboxInput>

          <span
            v-if="typeof props.tagsInputIcon === 'string' || !!slots['tags-input-icon']"
            :class="uiTheme.tagsInputLeading({ class: props.ui?.tagsInputLeading })"
          >
            <slot
              name="tags-input-icon"
              :open="open"
              :ui="uiTheme"
            >
              <UIcon
                v-if="typeof props.tagsInputIcon === 'string'"
                :name="props.tagsInputIcon"
                :class="uiTheme.tagsInputLeadingIcon({ class: props.ui?.tagsInputLeadingIcon })"
              />
            </slot>
          </span>
        </div>

        <ReuseLeadingTrailing />
      </TagsInputRoot>
      <ComboboxTrigger
        v-else
        :class="uiTheme.base({ class: props.ui?.base })"
        :tabindex="0"
        @keydown.up.down.enter.prevent="onOpenContent"
      >
        <ReuseLeadingTrailing>
          <slot
            :model-value="selected"
            :open="open"
            :ui="uiTheme"
          >
            <span
              v-if="(selected as MultiSelectItem)?.label"
              :class="uiTheme.value({ class: props.ui?.value })"
            >
              {{ (selected as MultiSelectItem)?.label }}
            </span>
            <span
              v-else
              :class="uiTheme.placeholder({ class: props.ui?.placeholder })"
            >
              {{ placeholder ?? '&nbsp;' }}
            </span>
          </slot>
        </ReuseLeadingTrailing>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal v-bind="portalProps">
      <ComboboxContent
        :class="uiTheme.content({ class: props.ui?.content })"
        v-bind="contentProps"
        data-slot="content"
      >
        <FocusScope
          trapped
          data-slot="focusScope"
          :class="uiTheme.focusScope({ class: props.ui?.focusScope })"
        >
          <slot
            name="content-top"
            :ui="uiTheme"
          />
          <ComboboxInput
            v-if="!!props.searchInput && !props.multiple"
            v-model="searchTerm"
            :display-value="() => searchTerm"
            as-child
          >
            <UInput
              type="text"
              autofocus
              autocomplete="off"
              v-bind="searchInputProps"
              :class="uiTheme.searchInput({ class: props.ui?.searchInput })"
              data-slot="searchInput"
              @update:model-value="(val) => onInput(String(val))"
            />
          </ComboboxInput>

          <div
            role="presentation"
            data-slot="viewport"
            :class="uiTheme.viewport({ class: props.ui?.viewport })"
          >
            <template v-if="isVirtualized">
              <ComboboxVirtualizer
                v-slot="{ option, virtualItem }"
                :options="filteredItems"
                :text-content="(v) => v.label"
                v-bind="virtualizerProps"
              >
                <ReuseItemTemplate
                  :item="option"
                  :group-index="0"
                  :index="virtualItem.index"
                />
              </ComboboxVirtualizer>
            </template>
            <template v-else>
              <ComboboxGroup
                v-for="(group, groupIndex) in filteredGroups"
                :key="`group-${groupIndex}`"
                :class="uiTheme.group({ class: props.ui?.group })"
              >
                <ComboboxSeparator
                  v-if="groupIndex !== 0 && isGrouping"
                  :class="uiTheme.separator({ class: props.ui?.separator })"
                />

                <ComboboxLabel
                  v-if="isGrouping"
                  :class="uiTheme.label({ class: props.ui?.label })"
                >
                  {{ group.label }}
                </ComboboxLabel>

                <ReuseItemTemplate
                  v-for="(item, itemIndex) in toArray<MultiSelectItem>(group.children!)"
                  :key="`item-${groupIndex}.${itemIndex}`"
                  :item="item"
                  :group-index="groupIndex"
                  :index="itemIndex"
                />
              </ComboboxGroup>
            </template>

            <ComboboxEmpty
              v-if="!isLoading"
              :class="uiTheme.empty({ class: props.ui?.empty })"
            >
              <slot
                name="empty"
                :search-term="searchTerm"
                :ui="uiTheme"
              >
                {{ props.empty }}
              </slot>
            </ComboboxEmpty>

            <slot
              v-if="isLoading"
              name="loading"
              :ui="uiTheme"
            >
              <div :class="uiTheme.loading({ class: props.ui?.loading })">
                <div :class="uiTheme.loadingSpinner({ class: props.ui?.loadingSpinner })">
                  <UIcon
                    :name="props.loadingIcon"
                    :class="uiTheme.loadingIcon({ class: props.ui?.loadingIcon })"
                  />
                </div>
                <div :class="uiTheme.loadingLabel({ class: props.ui?.loadingLabel })">
                  {{ props.loadingText }}
                </div>
              </div>
            </slot>

            <div
              v-intersection-observer="onIntersectionBottom"
              class="w-full h-0.5"
            />
          </div>
        </FocusScope>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>;
