<script setup lang="ts">
import {
  ComboboxContent,
  type ComboboxContentProps,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxItemIndicator,
  ComboboxSeparator,
  ComboboxViewport
} from 'reka-ui';
import defu from 'defu';
import { vIntersectionObserver } from '@vueuse/components';
import { useDebounceFn } from '@vueuse/core';
import type { ComboBoxItem } from '~/types/combobox';
import theme from '~/utils/theme/combobox';
import type { InputProps } from '#ui/types';

interface Props {
  items: ComboBoxItem[];
  search?: string;
  class?: string;
  placeholder?: string;
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: string;
  empty?: string;
  debounce?: number;
  searchInput?: boolean | InputProps;
  multiple?: boolean;
  content?: Omit<ComboboxContentProps, 'as' | 'asChild' | 'forceMount'>;
  checkSelection?: (item: ComboBoxItem, selected: ComboBoxItem) => boolean;
  filterSelected?: (item: ComboBoxItem, selected?: ComboBoxItem | ComboBoxItem[]) => boolean;
  selectedIcon?: string;
  portal?: boolean | string | HTMLElement;
  keepOpenOnSelect?: boolean;
  disabled?: boolean;
  ui?: Partial<Record<keyof ReturnType<typeof theme>, 'string'>>;
}

const props = withDefaults(defineProps<Props>(), {
  searchInput: true,
  placeholder: 'Search...',
  checkSelection: (item, selected) => item.value === selected.value,
  filterSelected: (item, selected) => {
    if (Array.isArray(selected)) {
      return selected.every((val) => val.value !== item.value);
    }

    return true;
  },
  loadingText: 'Loading...',
  loadingIcon: 'lucide:loader',
  empty: 'No results found.',
  selectedIcon: 'lucide:check',
  debounce: 0
});

const emits = defineEmits<{
  (e: 'selected', event: Event): void;
  (e: 'searching', val: string): void;
  (e: 'scroll-end'): void;
}>();

const hasChildren = computed(() => props.items.every((item) => Array.isArray(item._children)));

const selected = defineModel<ComboBoxItem | ComboBoxItem[]>({ default: undefined, required: false });
const data = computed(() => {
  return !hasChildren.value ? [{ id: '', label: '', _children: props.items }] : props.items;
});

const searchTerm = defineModel<string>('search', { default: '', required: false });

const open = defineModel<boolean>('open', { default: false, required: false });
const isLoading = computed(() => props.loading ?? false);

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

const portalProps = usePortal(toRef(() => props.portal));

const _ui = computed(() => theme({

}));

const debouncedInput = useDebounceFn((val: string) => {
  emits('searching', val);
}, props.debounce);

/**
 * Check if item selected
 * @param item - Combobox item
 */
function isSelectedItem(item: ComboBoxItem) {
  if (!selected.value) {
    return false;
  }

  if (!Array.isArray(selected.value)) {
    return props.checkSelection(item, selected.value);
  }

  return selected.value.some((selectedItem) => props.checkSelection(item, selectedItem));
}

function onUpdateInput(val: string) {
  debouncedInput(val);
}

function onIntersectionBottom([entry]: IntersectionObserverEntry[]) {
  if (entry?.isIntersecting) {
    emits('scroll-end');
  }
}
</script>

<template>
  <ComboboxRoot
    v-model="selected"
    v-model:open="open"
    highlight-on-hover
    as-child
    ignore-filter
    :multiple="props.multiple"
    :disabled="props.disabled"
    :reset-search-term-on-blur="false"
    :reset-search-term-on-select="false"
    @keydown.enter="$event.preventDefault()"
  >
    <slot
      :selected="selected"
      :open="open"
    />

    <ComboboxPortal v-bind="portalProps">
      <ComboboxContent
        :class="_ui.content({ class: props.ui?.content })"
        v-bind="contentProps"
      >
        <ComboboxInput
          v-if="!!props.searchInput"
          v-model="searchTerm"
          :display-value="() => searchTerm"
          as-child
        >
          <UInput
            type="text"
            autofocus
            autocomplete="off"
            v-bind="searchInputProps"
            :class="_ui.input({ class: props.ui?.input })"
            @update:model-value="(val) => onUpdateInput(String(val))"
          />
        </ComboboxInput>

        <ComboboxViewport :class="_ui.viewport({ class: props.ui?.viewport })">
          <ComboboxGroup
            v-for="(group, groupIndex) in data"
            :key="`group-${groupIndex}`"
            :class="_ui.group({ class: props.ui?.group })"
          >
            <ComboboxSeparator
              v-if="groupIndex !== 0 && hasChildren"
              :class="_ui.separator({ class: props.ui?.separator })"
            />

            <ComboboxLabel
              v-if="hasChildren"
              :class="_ui.label({ class: props.ui?.label })"
            >
              {{ group.label }}
            </ComboboxLabel>

            <ComboboxItem
              v-for="(item, itemIndex) in toArray<ComboBoxItem>(group._children!)"
              :key="`item-${itemIndex}`"
              :value="item"
              :class="_ui.item({ class: props.ui?.item })"
              :data-state="isSelectedItem(item) ? 'checked' : 'unchecked'"
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
                  :group-index="groupIndex"
                  :index="itemIndex"
                >
                  <UIcon
                    v-if="typeof item.icon === 'string'"
                    :name="item.icon"
                    :class="_ui.itemLeadingIcon({ class: props.ui?.itemLeadingIcon })"
                  />
                </slot>

                <span :class="_ui.itemLabel({ class: props.ui?.itemLabel })">
                  <slot
                    name="item-label"
                    :item="item"
                    :group-index="groupIndex"
                    :index="itemIndex"
                  >
                    {{ item.label }}
                  </slot>
                </span>

                <span :class="_ui.itemTrailing({ class: props.ui?.itemTrailing })">
                  <slot
                    name="item-trailing"
                    :item="item"
                    :group-index="groupIndex"
                    :index="itemIndex"
                  />

                  <ComboboxItemIndicator as-child>
                    <UIcon
                      :name="props.selectedIcon"
                      :class="_ui.itemTrailingIcon({ class: props.ui?.itemTrailingIcon })"
                    />
                  </ComboboxItemIndicator>
                </span>
              </slot>
            </ComboboxItem>
          </ComboboxGroup>

          <ComboboxEmpty
            v-if="!isLoading"
            :class="_ui.empty({ class: props.ui?.empty })"
          >
            <slot
              name="empty"
              :search-term="searchTerm"
            >
              {{ props.empty }}
            </slot>
          </ComboboxEmpty>

          <slot
            v-if="isLoading"
            name="loading"
          >
            <div :class="_ui.loading({ class: props.ui?.loading })">
              <div :class="_ui.loadingSpinner({ class: props.ui?.loadingSpinner })">
                <UIcon
                  :name="props.loadingIcon"
                  :class="_ui.loadingIcon({ class: props.ui?.loadingIcon })"
                />
              </div>
              <div :class="_ui.loadingLabel({ class: props.ui?.loadingLabel })">
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
