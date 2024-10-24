<script setup lang="ts">
import { ListboxContent, ListboxFilter, ListboxGroup, ListboxItem, ListboxRoot } from 'reka-ui';
import { vIntersectionObserver } from '@vueuse/components';
import { useDebounceFn } from '@vueuse/core';
import theme from '~/utils/theme/listbox';
import type { ListboxSize } from '~/utils/theme/listbox';
import type { ListBoxItem } from '~/types/listbox';

interface Props {
  items: ListBoxItem[];
  search?: string;
  selected?: ListBoxItem | ListBoxItem[];
  class?: string;
  width?: string;
  size?: ListboxSize;
  placeholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  debounce?: number;
  searchable?: boolean;
  multiple?: boolean;
  checkSelection?: (item: ListBoxItem, selected: ListBoxItem) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  width: 'max-content',
  size: 'md',
  placeholder: 'Search...',
  checkSelection: (item, selected) => item.id === selected.id,
  emptyMessage: 'No results found.',
  debounce: 0
});

const emits = defineEmits<{
  (e: 'update:search', value: string): void;
  (e: 'update:selected', value?: ListBoxItem | ListBoxItem[]): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'input', val: string): void;
  (e: 'scroll-end'): void;
}>();

const ui = computed(() => theme({ size: props.size }));

const data = computed(() => props.items);
const _selected = ref<ListBoxItem | ListBoxItem[]>();
const selectedValue = computed({
  get: () => props.selected ?? _selected.value,
  set: (val) => {
    _selected.value = val;
    emits('update:selected', val);
  }
});

const _search = ref('');
const searchTerm = computed({
  get: () => props.search ?? _search.value,
  set: (val) => {
    _search.value = val;
    emits('update:search', val);
  }
});
const isLoading = computed(() => props.loading ?? false);

const debouncedInput = useDebounceFn((val: string) => {
  emits('input', val);
}, props.debounce);

/**
 * Check if item selected
 * @param item - Listbox item
 */
function isItemSelected(item: ListBoxItem) {
  if (!selectedValue.value) {
    return false;
  }

  if (!Array.isArray(selectedValue.value)) {
    return props.checkSelection(item, selectedValue.value);
  }

  return selectedValue.value.some((selectedItem) => props.checkSelection(item, selectedItem));
}

function onIntersectionBottom([entry]: IntersectionObserverEntry[]) {
  if (entry?.isIntersecting) {
    emits('scroll-end');
  }
}
</script>

<template>
  <ListboxRoot
    v-model="selectedValue"
    highlight-on-hover
    :style="`width: ${props.width}`"
    :multiple="props.multiple"
    :class="ui.root({ class: props.class })"
    :by="(a, b) => props.checkSelection(a as any, b as any)"
  >
    <div
      v-if="props.searchable"
      :class="ui.inputWrapper()"
    >
      <ListboxFilter
        v-model:model-value="searchTerm"
        :placeholder="props.placeholder"
        :class="ui.input()"
        @update:model-value="(val) => debouncedInput(String(val))"
      />
    </div>
    <ListboxContent :class="ui.viewport()">
      <ListboxGroup
        v-if="data.length > 0"
        :class="ui.group()"
      >
        <ListboxItem
          v-for="item in data"
          :key="item.id"
          :value="item"
          :class="ui.item()"
          :data-state="isItemSelected(item) ? 'checked' : 'unchecked'"
        >
          <span :class="ui.itemLabel()">{{ item.label }}</span>
          <span
            v-if="isItemSelected(item)"
            :class="ui.itemTrailing()"
          >
            <UIcon
              name="lucide:check"
              :class="ui.itemTrailingIcon()"
            />
          </span>
        </ListboxItem>
      </ListboxGroup>

      <slot
        v-if="!isLoading && !data.length"
        name="empty"
      >
        <div :class="ui.empty()">
          <p :class="ui.emptyLabel()">
            {{ props.emptyMessage }}
          </p>
        </div>
      </slot>

      <slot
        v-if="isLoading"
        name="loading"
      >
        <div :class="ui.loading()">
          <div :class="ui.loadingSpinner()">
            <UIcon
              name="lucide:loader"
              :class="ui.loadingIcon()"
            />
          </div>
          <div :class="ui.loadingLabel()">
            Loading...
          </div>
        </div>
      </slot>

      <div
        v-intersection-observer="onIntersectionBottom"
        class="w-full h-0.5"
      />
    </ListboxContent>
  </ListboxRoot>
</template>
