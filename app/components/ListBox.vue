<template>
  <div class="relative w-full">
    <!-- Search -->
    <UInput
      v-if="props.searchable"
      v-model="search"
      v-on-key-stroke:ArrowDown="[onArrowDown, { eventName: 'keydown' }]"
      v-on-key-stroke:Tab="[onArrowDown, { eventName: 'keydown' }]"
      variant="none"
      :placeholder="props.placeholder"
      autofocus
      @update:model-value="debouncedInput"
    >
    </UInput>

    <!-- Scrollable area -->
    <div
      ref="scrollRef"
      class="w-full max-h-[200px] overflow-y-auto p-1"
      :class="{ 'border-t dark:border-t-slate-700': props.searchable }"
      role="listbox"
      :tabindex="0"
    >
      <div
        v-if="props.resettable"
        ref="resetRef"
        v-on-key-stroke:ArrowDown="[onArrowDown, { eventName: 'keydown' }]"
        v-on-key-stroke:Enter="[onReset, { eventName: 'keydown' }]"
        :class="[...itemClasses, ...resetClasses()]"
        role="option"
        :tabindex="-1"
        @click="onReset"
        @focus="() => resetRef?.setAttribute('data-focus', 'true')"
        @blur="() => resetRef?.setAttribute('data-focus', 'false')"
      >
        Reset
      </div>

      <div
        v-for="(item, i) in items"
        :key="i"
        :ref="(el) => setItemRef(el, i)"
        v-on-key-stroke:ArrowUp="[onArrowUp, { eventName: 'keydown' }]"
        v-on-key-stroke:ArrowDown="[onArrowDown, { eventName: 'keydown' }]"
        v-on-key-stroke:Enter="[() => onSelected(item), { eventName: 'keydown' }]"
        :class="[...itemClasses, ...itemActiveClasses(i)]"
        role="option"
        :tabindex="-1"
        @click="onSelected(item)"
        @mouseenter="() => (hovered = i)"
        @mouseleave="() => (hovered = -1)"
        @focus="() => (hovered = i)"
        @blur="() => (hovered = -1)"
      >
        <slot name="label" :item="item">
          {{ item.label }}
        </slot>

        <span v-if="selectedIndex === i" :class="[uiMenu.option.selectedIcon.wrapper, uiMenu.option.selectedIcon.padding]">
          <UIcon :name="selectedIcon" :class="uiMenu.option.selectedIcon.base" aria-hidden="true" />
        </span>
      </div>

      <slot name="empty">
        <div v-if="!items.length && !loading" class="text-slate-500 text-sm text-center py-4">No results found</div>
      </slot>

      <!-- Intersection element -->
      <div ref="intersectRef" class="py-0.5"></div>

      <!-- Loading -->
      <slot name="loading">
        <div v-if="isLoading" class="flex justify-center select-none gap-2 py-1">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-slate-500"></UIcon>
          <span class="text-sm text-center text-slate-400">Loading...</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver, useDebounceFn } from '@vueuse/core';
import type { OptionItem } from '@@/types/ui/autocomplete';
import { vOnKeyStroke } from '@vueuse/components';
import appConfig from '#build/app.config.mjs';
import { selectMenu } from '#ui/ui.config';
import { mergeConfig } from '#ui/utils';

type SelectedItem = string | number | OptionItem;

interface Props {
  search?: string;
  selected?: SelectedItem;
  selectionIndex?: (currentSelected: SelectedItem, options: OptionItem[]) => number;
  options: OptionItem[];
  loading?: boolean;
  searchable?: boolean;
  placeholder?: string;
  selectedIcon?: string;
  debounce?: number;
  resettable?: boolean;
  uiMenu?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  selectedIcon: 'i-heroicons:check-20-solid',
  selectionIndex: (curr, opts) => {
    const arr = typeof curr === 'object' ? Object.values(curr) : [curr];
    return opts.findIndex((v) => Object.values(v).some((item) => arr.includes(item)));
  },
  resettable: true,
  debounce: 0
});

const emits = defineEmits<{
  (e: 'update:search', val: string): void;
  (e: 'input', val: string): void;
  (e: 'update:selected', val?: SelectedItem): void;
  (e: 'select', val: OptionItem): void;
  (e: 'scroll-end'): void;
  (e: 'reset'): void;
}>();

const configMenu = mergeConfig<typeof selectMenu>(appConfig.ui.strategy, appConfig.ui.selectMenu, selectMenu);
const { ui: uiMenu } = useUI('selectMenu', toRef(props, 'uiMenu'), configMenu);

const items = computed(() => props.options);
const _search = ref('');
const search = computed({
  get: () => props.search ?? _search.value,
  set: (val: string) => {
    _search.value = val;
    emits('update:search', val);
  }
});

const _selected = ref();
const selectedItem = computed({
  get: () => props.selected ?? _selected.value,
  set: (val?: SelectedItem) => {
    _selected.value = val;
    emits('update:selected', val);
  }
});
const selectedIndex = computed(() => {
  if (!selectedItem.value) {
    return -1;
  }

  return props.selectionIndex(selectedItem.value, items.value);
});

const focusIndex = ref(-1);
const isLoading = computed(() => props.loading);

const resetRef = ref<HTMLDivElement>();
const scrollRef = ref();
const intersectRef = ref();

const hovered = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);

const itemClasses = computed(() => [
  uiMenu.value.option.base,
  uiMenu.value.option.rounded,
  uiMenu.value.option.padding,
  uiMenu.value.option.size,
  uiMenu.value.option.color,
  'outline-none'
]);
const itemActiveClasses = (index: number) => {
  return [
    hovered.value === index ? uiMenu.value.option.active : uiMenu.value.option.inactive,
    selectedIndex.value === index ? uiMenu.value.option.selected : ''
  ];
};
const resetClasses = () => [
  'hover:bg-gray-50 dark:hover:bg-gray-900 text-slate-400',
  resetRef.value?.dataset?.focus === 'true' ? 'bg-gray-50 dark:bg-gray-900' : ''
];

/**
 * Intersection observer handler
 */
function onIntersecting([entry]: IntersectionObserverEntry[]) {
  if (entry?.isIntersecting) {
    emits('scroll-end');
  }
}

/**
 * Handle selected option
 * @param item - Selected item
 */
function onSelected(item: OptionItem) {
  selectedItem.value = item;
  emits('select', item);
}

/**
 * Handle reset
 */
function onReset() {
  search.value = '';
  selectedItem.value = undefined;
  emits('reset');
}

/**
 * Handle arrow down keyboard
 * @param e - KeyboardEvent
 */
async function onArrowDown(e: KeyboardEvent) {
  e.preventDefault();
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || document.activeElement === resetRef.value) {
    focusIndex.value = 0;
    await nextTick();
    setFocusOption();
    return;
  }

  if (focusIndex.value === itemRefs.value.length - 1) {
    return;
  }

  const hasNext = !!itemRefs.value[focusIndex.value + 1] && focusIndex.value < itemRefs.value.length - 1;
  focusIndex.value = hasNext ? focusIndex.value + 1 : itemRefs.value.length - 1;
  await nextTick();
  setFocusOption();
}

/**
 * Handle arrow up keyboard
 * @param e - KeyboardEvent
 */
async function onArrowUp(e: KeyboardEvent) {
  e.preventDefault();

  if (focusIndex.value === 0 && !!resetRef.value) {
    itemRefs.value[focusIndex.value]?.blur?.();
    resetRef.value?.focus?.();
    await nextTick();
    focusIndex.value = -1;
    return;
  }

  const hasPrev = focusIndex.value > 0;
  focusIndex.value = hasPrev ? focusIndex.value - 1 : 0;
  await nextTick();
  setFocusOption();
}

function setFocusOption() {
  itemRefs.value[focusIndex.value]?.focus?.();
}

/**
 * Set refs
 * @param element - HTMLElement
 * @param index - Index of items
 */
function setItemRef(element: any, index: number) {
  if (!element) {
    return;
  }

  itemRefs.value[index] = element;
}

const { stop } = useIntersectionObserver(intersectRef, onIntersecting, { root: scrollRef });

const debouncedInput = useDebounceFn((val: string) => {
  emits('input', val);
}, props.debounce);

onBeforeUnmount(() => {
  stop();
});
</script>
