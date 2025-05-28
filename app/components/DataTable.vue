<script setup lang="ts">
import type { Cell, CellContext, ColumnSort, Header, HeaderContext, Row, useVueTable } from '@tanstack/vue-table';
import { promiseTimeout } from '@vueuse/core';
import { tv } from 'tailwind-variants';
import TableHeaderSelection from './TableHeaderSelection.vue';
import TableRowSelection from './TableRowSelection.vue';
import TableHeaderSorting from './TableHeaderSorting.vue';
import type { TableFetchParams } from '~/types/table';
import { toArray } from '~~/shared/utils';
import { findNodeChildrens } from '~~/app/utils/helpers';
import type theme from '#build/ui/table';

interface TableMeta {
  class?: {
    tr?: string | ((row: Row<any>) => string);
  };
}

interface ColumnMeta {
  class?: {
    th?: string | ((cell: Header<any, any>) => string);
    td?: string | ((cell: Cell<any, any>) => string);
  };
}

interface GetDataResult {
  data: Record<string, any>[];
  total?: number;
}

type UITable = Partial<Pick<typeof theme, 'slots'>['slots']>;

interface UIToolbar {
  root?: string;
  left?: string;
  leftWrapper?: string;
  right?: string;
  rightWrapper?: string;
}

interface Props {
  items?: Record<string, any>[];
  getData?: (params: TableFetchParams) => GetDataResult | Promise<GetDataResult>;
  paginated?: boolean;
  serverPagination?: boolean;
  showPerPage?: boolean;
  paginationSimple?: boolean;
  selectionField?: string;
  selectionMeta?: ColumnMeta;
  selectable?: boolean;
  selectableOrder?: number;
  numbering?: boolean;
  numberingLabel?: string;
  numberingOrder?: number;
  numberingMeta?: ColumnMeta;
  searchable?: boolean;
  searchFilter?: (currentItem: Record<string, any>, searchTerm: string) => boolean;
  multiSort?: boolean;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconUnsort?: string;
  meta?: TableMeta;
  placeholderSearch?: string;
  ui?: UITable;
  uiToolbar?: UIToolbar;
}

const props = withDefaults(defineProps<Props>(), {
  paginated: true,
  serverPagination: true,
  showPerPage: true,
  selectionField: 'id',
  selectable: false,
  selectableOrder: 0,
  numbering: true,
  numberingLabel: 'No.',
  numberingOrder: 0,
  searchable: true,
  searchFilter: (currentItem: Record<string, any>, searchTerm: string) => {
    return Object.values(currentItem).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
  },
  multiSort: false,
  placeholderSearch: 'Search...'
});

const emits = defineEmits<{
  (e: 'update:items', val: Record<string, any>): void;
  (e: 'removed'): void;
}>();

const slots = defineSlots<{
  'default': () => VNode[];
  'expanded': (slotProps: { row: Row<any> }) => VNode[];
  'filter': (slotProps: { loading: boolean; data: Record<string, any>[] }) => VNode[];
  'toolbar-left-leading': () => VNode[];
  'toolbar-left-trailing': () => VNode[];
  'toolbar-right': () => VNode[];
  'top-up': () => VNode[];
  'top-down': () => VNode[];
  'bottom-up': () => VNode[];
  'bottom-down': () => VNode[];
  'loading': () => VNode[];
  'empty': () => VNode[];
}>();

const _data = ref<Record<string, any>[]>([]);
const data = computed({
  get: () => Array.isArray(props.items) ? props.items : _data.value,
  set: (val) => {
    _data.value = val;
    emits('update:items', val);
  }
});

const page = ref(1);
const perPage = defineModel<number>('perPage', {
  default: 10,
  required: false
});
const perPages = defineModel<number[]>('perPages', {
  default: () => [10, 25, 50, 75, 100],
  required: false
});
const search = ref('');
const isServerPagination = computed(() => !Array.isArray(props.items) && props.serverPagination && props.paginated);

const total = ref(0);
const loading = ref(!Array.isArray(props.items));

const sorting = defineModel<ColumnSort[]>('sorting', {
  default: () => [],
  required: false
});

const filteredData = computed(() => data.value.filter((val) => props.searchFilter(val, search.value)));

const visibleData = computed(() => {
  if (isServerPagination.value) {
    return data.value;
  }

  if (!props.paginated || (props.paginated && filteredData.value.length <= perPage.value)) {
    return filteredData.value;
  }

  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredData.value.slice(start, end);
});

const totalPagination = computed(() => {
  if (isServerPagination.value) {
    return total.value;
  }

  if (props.paginated && search.value.length > 0) {
    return filteredData.value.length;
  }

  return data.value.length;
});

const expanded = ref({});
const columnVisibility = ref({});

const table = useTemplateRef<{ tableApi: ReturnType<typeof useVueTable> }>('table');

const selection = defineModel<Record<string, any>[]>('selection', {
  default: () => [],
  required: false
});

const selectionColumn = computed(() => ({
  id: '__select',
  accessorKey: '__selection',
  label: 'Selection',
  header: ({ table: tbl }: HeaderContext<any, any>) => h(TableHeaderSelection, {
    table: tbl,
    checked: selection.value,
    field: props.selectionField,
    onChange(val) {
      selection.value = val;
    }
  }),
  cell: ({ row }: CellContext<any, any>) => h(TableRowSelection, {
    row,
    checked: selection.value,
    field: props.selectionField,
    onChange() {
      const value = row.original;
      if (!selection.value.some((item) => item?.[props.selectionField] === value?.[props.selectionField])) {
        selection.value.push(value);
        return;
      }

      selection.value = selection.value.filter((item) => item?.[props.selectionField] !== value?.[props.selectionField]);
    }
  }),
  meta: props.selectionMeta
}));

const numberingColumn = computed(() => ({
  accessorKey: '__numbering',
  label: props.numberingLabel,
  header: () => props.numberingLabel,
  cell: (ctx: CellContext<any, any>) => {
    const index = ctx.row.index;
    if (!props.paginated) {
      return h('span', index + 1);
    }

    return h('span', page.value <= 1 ? index + 1 : (page.value - 1) * perPage.value + (index + 1));
  },
  meta: props.numberingMeta
}));

const columnNodes = computed(() => findNodeChildrens(slots.default(), 'TableColumn'));

const columns = computed(() => {
  const result = columnNodes.value.map((node) => {
    const _props = node.props;
    const children = node.children as any;
    const key = _props?.accessor ?? Math.random().toString(36).slice(2);
    const label = _props?.label ?? '';

    return {
      accessorKey: key,
      label: _props?.label,
      header: (ctx: HeaderContext<any, any>) => {
        if (
          (typeof _props?.sortable === 'boolean' && _props?.sortable)
          || (typeof _props?.sortable === 'string' && _props?.sortable === '')
        ) {
          const sortingProps = {
            label,
            column: ctx.column,
            multiple: props.multiSort,
            iconSortAsc: props.iconSortAsc,
            iconSortDesc: props.iconSortDesc,
            iconUnsort: props.iconUnsort
          };

          return h(TableHeaderSorting, sortingProps);
        }

        return children?.header?.(ctx) ?? label;
      },
      cell: (ctx: CellContext<any, any>) => {
        return children?.default?.({ ...ctx, item: ctx.row.original }) ?? ctx.row.original?.[key] ?? '';
      },
      meta: _props?.meta
    };
  });

  if (props.selectable) {
    result.splice(props.selectableOrder, 0, selectionColumn.value);
  }

  if (props.numbering) {
    result.splice(props.numberingOrder, 0, numberingColumn.value);
  }

  return result;
});

const hasPrevPaginationSimple = computed(() => page.value > 1);
const hasNextPaginationSimple = computed(() => {
  return (isServerPagination.value ? data.value.length : visibleData.value.length) >= perPage.value;
});

const hasToolbar = computed(() => {
  const _items = [
    props.showPerPage,
    props.searchable,
    !!slots['toolbar-left-leading'],
    !!slots['toolbar-left-trailing'],
    !!slots['toolbar-right']
  ];

  return _items.some((exists) => exists);
});

const mounted = ref(true);

const defaultTableTheme = tv({
  slots: {
    root: 'border-t border-t-slate-200',
    base: '',
    caption: '',
    thead: '',
    tbody: '',
    tr: 'data-[selected=true]:bg-transparent',
    th: 'bg-[#F8FAFC] text-[#6B7280]',
    td: 'whitespace-normal',
    empty: '',
    loading: ''
  }
});
const uiTable = computed(() => {
  const _ui = defaultTableTheme();

  return {
    root: _ui.root({ class: props.ui?.root }),
    base: _ui.base({ class: props.ui?.base }),
    caption: _ui.caption({ class: props.ui?.caption }),
    thead: _ui.thead({ class: props.ui?.thead }),
    tbody: _ui.tbody({ class: props.ui?.tbody }),
    tr: _ui.tr({ class: props.ui?.tr }),
    th: _ui.th({ class: props.ui?.th }),
    td: _ui.td({ class: props.ui?.td }),
    empty: _ui.empty({ class: props.ui?.empty }),
    loading: _ui.loading({ class: props.ui?.loading })
  };
});

const toolbarTheme = tv({
  slots: {
    root: 'grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5',
    left: 'relative',
    leftWrapper: 'flex flex-wrap gap-3',
    right: 'relative',
    rightWrapper: 'flex flex-wrap justify-end gap-3'
  }
});
const uiToolbar = computed(() => {
  const _ui = toolbarTheme();

  return {
    root: _ui.root({ class: props.uiToolbar?.root }),
    left: _ui.left({ class: props.uiToolbar?.left }),
    leftWrapper: _ui.leftWrapper({ class: props.uiToolbar?.leftWrapper }),
    right: _ui.right({ class: props.uiToolbar?.right }),
    rightWrapper: _ui.rightWrapper({ class: props.uiToolbar?.rightWrapper })
  };
});

/**
 * Get data
 */
async function fetchData() {
  try {
    if (typeof props.getData !== 'function') {
      return;
    }

    loading.value = true;
    const { data: _data, total: _total } = await props.getData({
      page: page.value,
      perpage: perPage.value,
      limit: perPage.value,
      offset: perPage.value * (page.value - 1),
      q: search.value,
      sorting: sorting.value.map((v) => ({ col: v.id, dir: v.desc ? 'desc' : 'asc' }))
    });

    await promiseTimeout(700);
    data.value = _data;
    total.value = isServerPagination.value ? _total ?? 0 : toArray(_data).length;

    loading.value = false;
  }
  catch {
    loading.value = false;
  }
}

function onPageChange() {
  if (isServerPagination.value) {
    data.value = [];
    fetchData();
  }
}

function onPerPageChange(val: number) {
  perPage.value = val;
  reset();
}

function reset() {
  if (Array.isArray(props.items)) {
    return;
  }

  loading.value = true;
  page.value = 1;
  data.value = [];
  total.value = 0;

  nextTick(fetchData);
}

function onSorting() {
  if (isServerPagination.value) {
    page.value = 1;
    fetchData();
  }
}

function onSearch() {
  if (isServerPagination.value) {
    reset();
  }
}

function onInputSearch() {
  if (isServerPagination.value) {
    return;
  }

  page.value = 1;
}

function onPrevPaginationSimple() {
  if (!hasPrevPaginationSimple.value) {
    return;
  }

  page.value = page.value - 1;
  nextTick(onPageChange);
}

function onNextPaginationSimple() {
  if (!hasNextPaginationSimple.value) {
    return;
  }

  page.value = page.value + 1;
  nextTick(onPageChange);
}

defineExpose({
  tableApi: computed(() => table.value?.tableApi),
  reset
});

watch(() => columnNodes.value.map((v) => v.props), () => {
  mounted.value = false;
  expanded.value = {};
  nextTick(() => mounted.value = true);
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="w-full">
    <slot name="top-up" />

    <div
      v-if="hasToolbar"
      :class="uiToolbar.root"
    >
      <div :class="uiToolbar.left">
        <div :class="uiToolbar.leftWrapper">
          <slot name="toolbar-left-leading" />

          <div
            v-if="props.showPerPage"
            class="inline-flex items-center gap-x-2"
          >
            <div class="inline-flex text-sm">
              Show
            </div>
            <USelect
              v-model:model-value="perPage"
              :items="perPages"
              class="w-18"
              @update:model-value="(val) => onPerPageChange(Number(val))"
            />
          </div>

          <div
            v-if="props.searchable"
            class="flex grow shrink"
          >
            <UInput
              v-model="search"
              :placeholder="props.placeholderSearch"
              icon="lucide:search"
              size="lg"
              @keydown.enter.prevent="onSearch"
              @input="onInputSearch"
            />
          </div>

          <slot name="toolbar-left-trailing" />
        </div>
      </div>

      <div :class="uiToolbar.right">
        <div :class="uiToolbar.rightWrapper">
          <slot name="toolbar-right" />
        </div>
      </div>
    </div>

    <slot name="top-down" />

    <UTable
      v-if="mounted"
      ref="table"
      v-model:sorting="sorting"
      v-model:expanded="expanded"
      v-model:column-visibility="columnVisibility"
      :data="visibleData"
      :columns="columns"
      :loading="loading"
      :ui="uiTable"
      :meta="props.meta"
      :sorting-options="{
        manualSorting: isServerPagination,
        enableMultiSort: props.multiSort
      }"
      @update:sorting="onSorting"
    >
      <template #expanded="{ row }">
        <slot
          name="expanded"
          :row="row"
        />
      </template>

      <template #loading>
        <slot name="loading">
          <div class="flex flex-col py-20">
            <div class="flex justify-center mb-2">
              <UIcon
                name="lucide:loader"
                class="size-8 animate-spin"
              />
            </div>
            <p class="text-center">
              Loading...
            </p>
          </div>
        </slot>
      </template>

      <template #empty>
        <slot name="empty">
          <div class="flex flex-col py-20">
            <div class="flex justify-center mb-2">
              <UIcon
                name="lucide:database"
                class="size-8"
              />
            </div>
            <p class="text-center">
              No results found.
            </p>
          </div>
        </slot>
      </template>
    </UTable>

    <slot name="bottom-up" />

    <div
      v-if="props.paginated"
      class="flex border-t border-t-slate-200 py-4"
    >
      <UPagination
        v-if="!props.paginationSimple"
        v-model:page="page"
        active-color="primary"
        :total="totalPagination"
        :items-per-page="perPage"
        show-edges
        :sibling-count="1"
        @update:page="onPageChange"
      />
      <div
        v-else
        class="flex flex-wrap gap-2"
      >
        <UButton
          class="min-w-8 justify-center"
          icon="lucide:chevron-left"
          color="neutral"
          variant="soft"
          :disabled="!hasPrevPaginationSimple"
          @click="onPrevPaginationSimple"
        />

        <UButton class="min-w-8 justify-center">
          {{ page }}
        </UButton>
        <UButton
          class="min-w-8 justify-center"
          icon="lucide:chevron-right"
          color="neutral"
          variant="soft"
          :disabled="!hasNextPaginationSimple"
          @click="onNextPaginationSimple"
        />
      </div>
    </div>

    <slot name="bottom-down" />
  </div>
</template>
