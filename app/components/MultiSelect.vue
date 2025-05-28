<script setup lang="ts" generic="M extends boolean = false">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot
} from 'reka-ui';
import type { ComboboxContentProps } from 'reka-ui';
import type { FetchResponse } from 'ofetch';
import { useDebounceFn, createReusableTemplate } from '@vueuse/core';
import { vIntersectionObserver } from '@vueuse/components';
import defu from 'defu';
import theme from '~/utils/theme/multi-select';
import type { MultiSelectColor, MultiSelectSize, MultiSelectVariant } from '~/utils/theme/multi-select';
import type { MultiSelectItem } from '~/types/multi-select';
import type { InputProps } from '#ui/types';

type ModelValue<Multiple extends boolean = false> = Multiple extends true ? MultiSelectItem[] : MultiSelectItem;

type Theme = typeof theme;

interface FetchQuery {
  page: number;
  perpage: number;
  q: string;
}

interface Props<Multiple extends boolean> {
  id?: string;
  name?: string;
  required?: boolean;
  modelValue?: ModelValue<Multiple>;
  items?: MultiSelectItem[];
  multiple?: Multiple & boolean;
  url?: string;
  limit?: number;
  paginated?: boolean;
  transformFetchData?: (result: any, raw: FetchResponse<any>) => MultiSelectItem[];
  transformFetchQuery?: (params: FetchQuery) => Record<string, any>;
  filterSearch?: (item: MultiSelectItem, searchTerm: string, isChild: boolean) => boolean;
  filterRemoveTag?: (currentItem: MultiSelectItem, itemToRemove: MultiSelectItem) => boolean;
  checkSelection?: (item: MultiSelectItem, selected?: MultiSelectItem) => boolean;
  toggle?: boolean;
  class?: string;
  highlight?: boolean;
  color?: MultiSelectColor;
  size?: MultiSelectSize;
  variant?: MultiSelectVariant;
  placeholder?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  deleteIcon?: string;
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: string;
  empty?: string;
  debounce?: number;
  portal?: boolean | string | HTMLElement;
  content?: Omit<ComboboxContentProps, 'as' | 'asChild' | 'forceMount'>;
  searchInput?: boolean | InputProps;
  selectedIcon?: string;
  tagsInputIcon?: string;
  disabled?: boolean;
  ui?: Partial<Record<keyof ReturnType<Theme>, 'string'>>;
}

const props = withDefaults(defineProps<Props<M>>(), {
  transformFetchData: (result: any) => toArray(result).map((val) => ({
    value: val.id,
    label: val.name,
    ...omit(val, ['value', 'label'])
  })),
  filterSearch: (item, text) => item.label.toLowerCase().includes(text.toLowerCase()),
  transformFetchQuery: (params: FetchQuery) => params,
  filterRemoveTag: (currentItem, itemToRemove) => currentItem.value !== itemToRemove.value,
  checkSelection: (item, selected) => item.value === selected?.value,
  toggle: true,
  searchInput: true,
  portal: true,
  placeholder: 'Search...',
  trailingIcon: 'lucide:chevron-down',
  deleteIcon: 'lucide:x',
  loadingText: 'Loading...',
  loadingIcon: 'lucide:loader',
  empty: 'No results found.',
  selectedIcon: 'lucide:check',
  tagsInputIcon: 'lucide:tag',
  limit: 10,
  debounce: 350,
  paginated: true
});

const emits = defineEmits<{
  (e: 'update:modelValue', value?: ModelValue<M>): void;
  (e: 'change', event: Event): void;
  (e: 'focus', event: FocusEvent): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'blur', event: FocusEvent): void;
}>();

const slots = useSlots();

const {
  emitFormBlur,
  emitFormFocus,
  emitFormChange,
  emitFormInput,
  size: formGroupSize,
  color,
  id,
  name,
  highlight,
  disabled: isDisabled,
  ariaAttrs
} = useFormField<InputProps>(props);

const {
  orientation,
  size: buttonGroupSize
} = useButtonGroup<InputProps>(props);

const {
  isLeading,
  isTrailing,
  leadingIconName,
  trailingIconName
} = useComponentIcons(toRef(() => defu(props, { trailingIcon: props.trailingIcon })));

const inputSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const _selected = ref<ModelValue<M>>();
const selected = computed({
  get: () => props.modelValue ?? _selected.value,
  set: (value) => {
    _selected.value = value;
    emits('update:modelValue', value);
  }
});
const search = defineModel<string>('search', { default: '' });
const open = ref(false);

const data = ref<MultiSelectItem[]>([]);
const _items = computed(() => Array.isArray(props.items) ? props.items : data.value);
const hasChildren = computed(() => {
  if (!_items.value.length) {
    return false;
  }

  return _items.value.every((item) => (
    Array.isArray(item.children) && item.children.every((child) => typeof child === 'object' && child !== null)
  ));
});

const options = computed(() => {
  if (!_items.value.length) {
    return [];
  }

  if (props.paginated && typeof props.url === 'string' && !Array.isArray(props.items)) {
    return !hasChildren.value ? [{ label: '', value: '', children: _items.value }] : _items.value;
  }

  const _options = !hasChildren.value ? [{ label: '', value: '', children: _items.value }] : _items.value;
  return _options.reduce((prev: MultiSelectItem[], item) => {
    const hasChilds = Array.isArray(item.children);
    const children = hasChilds ? item.children!.filter((child) => props.filterSearch(child, search.value, hasChildren.value)) : [];

    if (children.length > 0 || props.filterSearch(item, search.value, false)) {
      prev.push({ ...item, ...(hasChilds && { children }) });
    }

    return prev;
  }, []);
});

const page = ref(1);
const hasMoreItems = ref(false);
const isFetched = ref(false);

const _loading = ref(false);
const isLoading = computed(() => props.loading || _loading.value);

const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => defu(props.content, {
  side: 'bottom',
  sideOffset: 8,
  collisionPadding: 8,
  position: 'popper'
}) as ComboboxContentProps);
const searchInputProps = toRef(() => defu(props.searchInput, {
  placeholder: 'Search...',
  variant: 'none'
}) as InputProps);

const classes = computed(() => theme({
  color: color.value,
  variant: props.variant,
  size: inputSize?.value,
  loading: isLoading.value,
  highlight: highlight.value,
  leading: isLeading.value || !!slots?.leading,
  trailing: isTrailing.value || !!slots?.trailing,
  multiple: props.multiple,
  buttonGroup: orientation.value,
  tagsInputIcon: typeof props.tagsInputIcon === 'string'
}));

const [DefineLeadingTrailing, ReuseLeadingTrailing] = createReusableTemplate();

const debouncedInput = useDebounceFn(() => {
  if (!props.url || !props.paginated || !open.value) {
    return;
  }

  page.value = 1;
  data.value = [];
  hasMoreItems.value = false;
  nextTick(fetchData);
}, props.debounce);

/**
 * Fetch data from API
 */
async function fetchData() {
  try {
    if (typeof props.url !== 'string' || !import.meta.client) {
      return;
    }

    _loading.value = true;
    const query = props.transformFetchQuery({
      page: page.value,
      perpage: props.limit,
      q: search.value
    });

    const { raw, data: result } = await useRequest(props.url, {
      method: 'GET',
      query
    });

    const _data = props.transformFetchData(result, raw);
    const hasMore = _data.length >= props.limit;

    data.value = [...data.value, ..._data];
    hasMoreItems.value = hasMore;
    page.value = hasMore ? page.value + 1 : page.value;
    isFetched.value = true;
    _loading.value = false;
  }
  catch (err) {
    useRequestError(err);
    _loading.value = false;
  }
}

/**
 * Handle update model value
 */
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
}

/**
 * Handle open popover
 * @param value - Is open
 */
function onUpdateOpen(value: boolean) {
  if (!value) {
    const event = new FocusEvent('blur');
    emits('blur', event);
    emitFormBlur();
    return;
  }

  if (!options.value.length && !isFetched.value) {
    setTimeout(fetchData, 150);
  }

  const event = new FocusEvent('focus');
  emits('focus', event);
  emitFormFocus();
}

/**
 * Handle remove tag item
 * @param value - Value to remove
 */
function onRemoveTag(value: MultiSelectItem) {
  if (props.multiple) {
    const currentValue = toArray(selected.value as MultiSelectItem[]);
    const filtered = currentValue.filter((item) => props.filterRemoveTag(item, value));

    _selected.value = filtered as ModelValue<M>;
    emits('update:modelValue', filtered as ModelValue<M>);
  }
}

/**
 * Handle focus input
 * @param event - Focus event
 */
function onFocus(event: FocusEvent) {
  emits('focus', event);
  emitFormFocus();
}

/**
 * Handle blur input
 * @param event - Focus event
 */
function onBlur(event: FocusEvent) {
  emits('blur', event);
  emitFormBlur();
}

/**
 * Handle search
 * @param value - Search value
 */
function onInput(value: string) {
  search.value = value;
  debouncedInput();
}

/**
 * Handle selected item
 * @param event - Select event
 * @param item - Selected item
 */
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

/**
 * Handle infinity scroll combobox
 */
function onScrollEnd() {
  if (!isLoading.value && hasMoreItems.value && props.paginated && open.value) {
    fetchData();
  }
}

/**
 * Handle intersection observer
 */
function onIntersectionBottom([entry]: IntersectionObserverEntry[]) {
  if (entry?.isIntersecting) {
    onScrollEnd();
  }
}

function onOpenContent() {
  open.value = true;
  nextTick(() => onUpdateOpen(true));
}
</script>

<template>
  <DefineLeadingTrailing>
    <span
      v-if="isLeading || !!slots.leading"
      :class="classes.leading({ class: props.ui?.leading })"
    >
      <slot
        name="leading"
        :model-value="modelValue"
        :open="open"
        :ui="ui"
      >
        <UIcon
          v-if="isLeading && leadingIconName"
          :name="leadingIconName"
          :class="classes.leadingIcon({ class: props.ui?.leadingIcon })"
        />
      </slot>
    </span>

    <component
      :is="props.multiple ? ComboboxTrigger : 'span'"
      v-if="isTrailing || !!slots.trailing"
      :class="classes.trailing({ class: props.ui?.trailing })"
    >
      <slot
        name="trailing"
        :model-value="modelValue"
        :open="open"
        :ui="ui"
      >
        <UIcon
          v-if="trailingIconName"
          :name="trailingIconName"
          :class="classes.trailingIcon({ class: props.ui?.trailingIcon })"
        />
      </slot>
    </component>
  </DefineLeadingTrailing>

  <ComboboxRoot
    :id="id"
    ref="rootRef"
    v-model="selected"
    v-model:open="open"
    :name="name"
    :class="classes.root({ class: [props.ui?.root, props?.class] })"
    ignore-filter
    :required="required"
    :as-child="!!props.multiple"
    :multiple="props.multiple"
    :reset-search-term-on-blur="false"
    :reset-search-term-on-select="false"
    :by="(a, b) => props.checkSelection(a, b)"
    :disabled="isDisabled"
    @update:model-value="onUpdate"
    @update:open="onUpdateOpen"
    @keydown.enter.prevent
  >
    <ComboboxAnchor
      :as-child="!props.multiple"
      :class="classes.base({ class: props.ui?.base })"
    >
      <TagsInputRoot
        v-if="multiple"
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
          :class="classes.tagsItem({ class: props.ui?.tagsItem })"
        >
          <TagsInputItemText :class="classes.tagsItemText({ class: props.ui?.tagsItemText })">
            <slot
              name="tags-item-text"
              :item="item"
              :index="index"
            >
              {{ item.label }}
            </slot>
          </TagsInputItemText>

          <TagsInputItemDelete
            :class="classes.tagsItemDelete({ class: props.ui?.tagsItemDelete })"
            :disabled="disabled"
          >
            <slot
              name="tags-item-delete"
              :item="item"
              :index="index"
            >
              <UIcon
                :name="props.deleteIcon"
                :class="classes.tagsItemDeleteIcon({ class: props.ui?.tagsItemDeleteIcon })"
              />
            </slot>
          </TagsInputItemDelete>
        </TagsInputItem>

        <div :class="classes.tagsInput({ class: props.ui?.tagsInput })">
          <ComboboxInput
            v-model="search"
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
                :class="classes.tagsInputInput({ class: props.ui?.tagsInputInput })"
                @keydown.enter.prevent
              />
            </ComboboxTrigger>
          </ComboboxInput>

          <span
            v-if="typeof props.tagsInputIcon === 'string' || !!slots['tags-input-icon']"
            :class="classes.tagsInputLeading({ class: props.ui?.tagsInputLeading })"
          >
            <slot
              name="tags-input-icon"
              :open="open"
              :ui="ui"
            >
              <UIcon
                v-if="typeof props.tagsInputIcon === 'string'"
                :name="props.tagsInputIcon"
                :class="classes.tagsInputLeadingIcon({ class: props.ui?.tagsInputLeadingIcon })"
              />
            </slot>
          </span>
        </div>

        <ReuseLeadingTrailing />
      </TagsInputRoot>
      <ComboboxTrigger
        v-else
        :class="classes.base({ class: props.ui?.base })"
        :tabindex="0"
        @keydown.up.down.enter.prevent="onOpenContent"
      >
        <slot
          :model-value="selected"
          :open="open"
        >
          <span
            v-if="(selected as MultiSelectItem)?.label"
            :class="classes.value({ class: props.ui?.value })"
          >
            {{ (selected as MultiSelectItem)?.label }}
          </span>
          <span
            v-else
            :class="classes.placeholder({ class: props.ui?.placeholder })"
          >
            {{ placeholder ?? '&nbsp;' }}
          </span>
        </slot>

        <ReuseLeadingTrailing />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal v-bind="portalProps">
      <ComboboxContent
        :class="classes.content({ class: props.ui?.content })"
        v-bind="contentProps"
      >
        <ComboboxInput
          v-if="!!props.searchInput && !props.multiple"
          v-model="search"
          :display-value="() => search"
          as-child
        >
          <UInput
            type="text"
            autofocus
            autocomplete="off"
            v-bind="searchInputProps"
            :class="classes.searchInput({ class: props.ui?.searchInput })"
            @update:model-value="(val) => onInput(String(val))"
          />
        </ComboboxInput>

        <ComboboxViewport
          :class="classes.viewport({ class: props.ui?.viewport })"
        >
          <ComboboxGroup
            v-for="(group, groupIndex) in options"
            :key="`group-${groupIndex}`"
            :class="classes.group({ class: props.ui?.group })"
          >
            <ComboboxSeparator
              v-if="groupIndex !== 0 && hasChildren"
              :class="classes.separator({ class: props.ui?.separator })"
            />

            <ComboboxLabel
              v-if="hasChildren"
              :class="classes.label({ class: props.ui?.label })"
            >
              {{ group.label }}
            </ComboboxLabel>

            <ComboboxItem
              v-for="(item, itemIndex) in toArray<MultiSelectItem>(group.children!)"
              :key="`item-${itemIndex}`"
              :value="item"
              :class="classes.item({ class: props.ui?.item })"
              :disabled="item.disabled"
              @select="onSelect($event, item)"
            >
              <slot
                name="item"
                :item="item"
                :group-index="groupIndex"
                :index="itemIndex"
              >
                <slot
                  name="item-leading"
                  :item="item"
                  :open="open"
                  :group-index="groupIndex"
                  :index="itemIndex"
                >
                  <UIcon
                    v-if="typeof item.icon === 'string'"
                    :name="item.icon"
                    :class="classes.itemLeadingIcon({ class: props.ui?.itemLeadingIcon })"
                  />
                </slot>

                <span :class="classes.itemLabel({ class: props.ui?.itemLabel })">
                  <slot
                    name="item-label"
                    :item="item"
                    :open="open"
                    :group-index="groupIndex"
                    :index="itemIndex"
                  >
                    {{ item.label }}
                  </slot>
                </span>

                <span :class="classes.itemTrailing({ class: props.ui?.itemTrailing })">
                  <slot
                    name="item-trailing"
                    :item="item"
                    :open="open"
                    :group-index="groupIndex"
                    :index="itemIndex"
                  />

                  <ComboboxItemIndicator as-child>
                    <UIcon
                      :name="props.selectedIcon"
                      :class="classes.itemTrailingIcon({ class: props.ui?.itemTrailingIcon })"
                    />
                  </ComboboxItemIndicator>
                </span>
              </slot>
            </ComboboxItem>
          </ComboboxGroup>

          <ComboboxEmpty
            v-if="!isLoading"
            :class="classes.empty({ class: props.ui?.empty })"
          >
            <slot
              name="empty"
              :search-term="search"
            >
              {{ props.empty }}
            </slot>
          </ComboboxEmpty>

          <slot
            v-if="isLoading"
            name="loading"
          >
            <div :class="classes.loading({ class: props.ui?.loading })">
              <div :class="classes.loadingSpinner({ class: props.ui?.loadingSpinner })">
                <UIcon
                  :name="props.loadingIcon"
                  :class="classes.loadingIcon({ class: props.ui?.loadingIcon })"
                />
              </div>
              <div :class="classes.loadingLabel({ class: props.ui?.loadingLabel })">
                {{ props.loadingText }}
              </div>
            </div>
          </slot>

          <div
            v-intersection-observer="onIntersectionBottom"
            class="w-full h-0.5"
          />
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
