<script setup lang="ts">
import type {
  CellContext,
  ColumnSort,
  HeaderContext,
  Row,
  ColumnPinningState,
  ColumnSizingState,
  ColumnSizingInfoState,
  RowSelectionState,
  RowPinningState,
  GroupingState,
  useVueTable
} from '@tanstack/vue-table';
import { promiseTimeout } from '@vueuse/core';
import { tv } from 'tailwind-variants';
import TableHeaderSelection from './TableHeaderSelection.vue';
import TableRowSelection from './TableRowSelection.vue';
import TableHeaderSorting from './TableHeaderSorting.vue';
import type { TableFetchParams } from '~/types/table';
import { toArray } from '~~/shared/utils';
import { findNodeChildrens } from '~~/app/utils/helpers';
import theme from '#build/ui/table';
import type { TableProps, TableColumn as _TableColumn } from '#ui/components/Table.vue';

interface GetDataResult {
  data: Record<string, any>[];
  total?: number;
}

type Theme = typeof theme;
type TableColumn = _TableColumn<any>;

type UITable = Partial<Pick<Theme, 'slots'>['slots']>;

type UIToolbar = Partial<Record<keyof ReturnType<typeof toolbarTheme>, string>>;

interface Props {
  items?: Record<string, any>[];
  getData?: (params: TableFetchParams) => GetDataResult | Promise<GetDataResult>;
  paginated?: boolean;
  serverPagination?: boolean;
  showPerPage?: boolean;
  paginationSimple?: boolean;
  caption?: string;
  selectionField?: string;
  selectionMeta?: TableColumn['meta'];
  selectable?: boolean;
  selectableOrder?: number;
  numbering?: boolean;
  numberingLabel?: string;
  numberingOrder?: number;
  numberingMeta?: TableColumn['meta'];
  searchable?: boolean;
  searchFilter?: (currentItem: Record<string, any>, searchTerm: string) => boolean;
  multiSort?: boolean;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconUnsort?: string;
  sticky?: TableProps['sticky'];
  loadingColor?: TableProps['loadingColor'];
  loadingAnimation?: TableProps['loadingAnimation'];
  globalFilterOptions?: TableProps['globalFilterOptions'];
  columnFiltersOptions?: TableProps['columnFiltersOptions'];
  columnPinningOptions?: TableProps['columnPinningOptions'];
  columnSizingOptions?: TableProps['columnSizingOptions'];
  groupingOptions?: TableProps['groupingOptions'];
  rowSelectionOptions?: TableProps['rowSelectionOptions'];
  rowPinningOptions?: TableProps['rowPinningOptions'];
  toggleColumnVisibility?: boolean;
  /**
   * Display table as card on mobile
   */
  mobileCards?: boolean;
  /**
   * Show sorting columns on mobile. Only applicable when mobileCards is true
   */
  showMobileSorting?: boolean;
  meta?: TableProps['meta'];
  onSelect?: TableProps['onSelect'];
  onHover?: TableProps['onHover'];
  onContextmenu?: TableProps['onContextmenu'];
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
  toggleColumnVisibility: true,
  multiSort: false,
  iconSortAsc: 'lucide:arrow-up-narrow-wide',
  iconSortDesc: 'lucide:arrow-down-wide-narrow',
  iconUnsort: 'lucide:arrow-up-down',
  mobileCards: true,
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
  'body-top': (slotProps: {
    ui: {
      tr: string;
      th: string;
      td: string;
    };
  }) => VNode[];
  'body-bottom': (slotProps: {
    ui: {
      tr: string;
      th: string;
      td: string;
    };
  }) => VNode[];
  'top': () => VNode[];
  'middle': () => VNode[];
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

const columnPinning = defineModel<ColumnPinningState>('columnPinning', { default: () => ({}) });
const columnSizing = defineModel<ColumnSizingState>('columnSizing', { default: () => ({}) });
const columnSizingInfo = defineModel<ColumnSizingInfoState>('columnSizingInfo', { default: () => ({}) });
const rowSelection = defineModel<RowSelectionState>('rowSelection', { default: () => ({}) });
const rowPinning = defineModel<RowPinningState>('rowPinning', { default: () => ({}) });
const grouping = defineModel<GroupingState>('grouping', { default: () => ([]) });
const expanded = defineModel<Record<string, boolean>>('expanded', { default: () => ({}) });
const columnVisibility = ref({});

const table = useTemplateRef<{ tableApi: ReturnType<typeof useVueTable<any>> }>('table');

const selection = defineModel<Record<string, any>[]>('selection', {
  default: () => [],
  required: false
});

const headerGroups = computed(() => table.value?.tableApi.getHeaderGroups() ?? []);
const selectionColumn = computed(() => ({
  accessorKey: '__selection',
  label: 'Selection',
  enableSorting: false,
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
  meta: setColumnMeta(props.selectionMeta, 'Selection')
}));

const numberingColumn = computed(() => ({
  accessorKey: '__numbering',
  label: props.numberingLabel,
  enableSorting: false,
  header: () => props.numberingLabel,
  cell: (ctx: CellContext<any, any>) => {
    const index = ctx.row.index;
    if (!props.paginated) {
      return h('span', index + 1);
    }

    return h('span', page.value <= 1 ? index + 1 : (page.value - 1) * perPage.value + (index + 1));
  },
  meta: setColumnMeta(props.numberingMeta, props.numberingLabel)
}));

const columnNodes = computed(() => findNodeChildrens(slots.default(), 'TableColumn'));

const columns = computed(() => {
  const result = columnNodes.value.map((node) => {
    const _props = node.props;
    const children = node.children as any;
    const key = _props?.accessor ?? Math.random().toString(36).slice(2);
    const label = _props?.label ?? '';
    const isSortable = Boolean(_props?.sortable) || (typeof _props?.sortable === 'string' && _props?.sortable === '');
    const excludeProps = ['label', 'accessor', 'sortable', 'visible', 'meta'];
    const parts = Object.entries(omit(_props ?? {}, excludeProps)).reduce((result, [key, value]) => {
      const _key = key.split('-').map((v, i) => i > 0 ? v.substring(0, 1).toUpperCase() + v.substring(1) : v).join('');
      result[_key] = value;

      return result;
    }, {} as Record<string, any>);
    const slotData = {
      data: data.value,
      visibleData: visibleData.value
    };

    return {
      accessorKey: key,
      label,
      enableSorting: isSortable,
      header: (ctx: HeaderContext<any, any>) => {
        if (isSortable) {
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

        return children?.header?.({ ...ctx, ...slotData }) ?? label;
      },
      cell: (ctx: CellContext<any, any>) => {
        return children?.default?.({ ...ctx, item: ctx.row.original, ...slotData }) ?? ctx.row.original?.[key] ?? '';
      },
      ...(children?.footer && { footer: (ctx: HeaderContext<any, any>) => children?.footer?.({ ...ctx, ...slotData }) }),
      meta: setColumnMeta(_props?.meta, label),
      ...parts
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

const visibleColumns = computed(() => {
  const items = table.value?.tableApi?.getAllColumns().filter((col) => col.getCanHide()) ?? [];

  return items.map((column) => ({
    label: columns.value?.find((col) => col.accessorKey === column.id)?.label ?? column.id,
    type: 'checkbox' as const,
    checked: column.getIsVisible(),
    onUpdateChecked: (checked: boolean) => {
      table.value?.tableApi.getColumn(column.id)?.toggleVisibility(!!checked);
    },
    onSelect: (evt?: Event) => {
      evt?.preventDefault();
    }
  }));
});

const columnsSortableIds = computed(() => columns.value.filter((c) => c.enableSorting).map((c) => c.accessorKey));
const hasSorting = computed(() => {
  return headerGroups.value.some((g) => g.headers.some((head) => columnsSortableIds.value.includes(head.id)));
});

const hasPrevPaginationSimple = computed(() => page.value > 1);
const hasNextPaginationSimple = computed(() => {
  return (isServerPagination.value ? data.value.length : visibleData.value.length) >= perPage.value;
});

const hasToolbar = computed(() => {
  const _items = [
    props.showPerPage,
    props.searchable,
    props.toggleColumnVisibility,
    !!slots['toolbar-left-leading'],
    !!slots['toolbar-left-trailing'],
    !!slots['toolbar-right']
  ];

  return _items.some((exists) => exists);
});

const mounted = ref(true);

const themeTable = tv({
  slots: {
    root: 'border-t border-t-default',
    base: '',
    caption: '',
    thead: '',
    tbody: '',
    tfoot: '',
    tr: 'data-[selected=true]:bg-transparent',
    th: 'bg-muted dark:bg-(--ui-color-neutral-950)',
    td: 'whitespace-normal',
    separator: '',
    empty: '',
    loading: ''
  },
  variants: {
    mobileCards: {
      true: {
        tr: 'block lg:table-row',
        th: 'hidden lg:table-cell',
        td: [
          'flex justify-between gap-2.5 lg:table-cell p-2.5 lg:p-4 text-right lg:text-left',
          '[&:has([role=checkbox])]:pe-2.5 lg:[&:has([role=checkbox])]:pe-0',
          'before:content-(--td-label) before:text-default before:font-semibold lg:before:content-[unset]'
        ]
      },
      false: {}
    },
    loading: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [
    {
      mobileCards: true,
      loading: false,
      class: {
        separator: 'bg-transparent lg:bg-(--ui-border-accented)'
      }
    }
  ]
});

const uiTable = computed(() => {
  const themeCustom = themeTable({
    mobileCards: props.mobileCards,
    loading: loading.value
  });

  return {
    root: themeCustom.root({ class: props.ui?.root }),
    base: themeCustom.base({ class: props.ui?.base }),
    caption: themeCustom.caption({ class: props.ui?.caption }),
    thead: themeCustom.thead({ class: props.ui?.thead }),
    tbody: themeCustom.tbody({ class: props.ui?.tbody }),
    tr: themeCustom.tr({ class: props.ui?.tr }),
    th: themeCustom.th({ class: props.ui?.th }),
    td: themeCustom.td({ class: props.ui?.td }),
    separator: themeCustom.separator({ class: props.ui?.separator }),
    empty: themeCustom.empty({ class: props.ui?.empty }),
    loading: themeCustom.loading({ class: props.ui?.loading })
  };
});

const uiTableBodySlots = computed(() => {
  const _theme = tv(theme)({
    sticky: props.sticky,
    loading: loading.value,
    loadingColor: props.loadingColor,
    loadingAnimation: props.loadingAnimation
  });

  return {
    tr: _theme.tr({ class: uiTable.value.tr }),
    th: _theme.th({ class: uiTable.value.th }),
    td: _theme.td({ class: uiTable.value.td })
  };
});

const toolbarTheme = tv({
  slots: {
    root: 'grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5',
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

/**
 * Handle change page
 */
function onPageChange() {
  if (isServerPagination.value) {
    data.value = [];
    fetchData();
  }
}

/**
 * Handle change per page
 * @param val - Perpage value
 */
function onPerPageChange(val: number) {
  perPage.value = val;
  reset();
}

/**
 * Reset and refetching data. only works for server pagination
 */
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

/**
 * Handle sorting
 */
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

/**
 * Handle simple pagination back to previous page
 */
function onPrevPaginationSimple() {
  if (!hasPrevPaginationSimple.value) {
    return;
  }

  page.value = page.value - 1;
  nextTick(onPageChange);
}

/**
 * Handle simple pagination move to next page
 */
function onNextPaginationSimple() {
  if (!hasNextPaginationSimple.value) {
    return;
  }

  page.value = page.value + 1;
  nextTick(onPageChange);
}

function setColumnMeta(meta?: TableColumn['meta'], label?: string) {
  if (typeof label !== 'string') {
    return meta;
  }

  const styleTD = (cell: any) => {
    const result = typeof meta?.style?.td === 'function' ? meta.style.td(cell) : meta?.style?.td;
    const parts = {
      '--td-label': `'${label}'`
    };

    if (typeof result !== 'string') {
      return { ...result, ...parts };
    }

    return `${Object.entries(parts).map((v) => v.join(':')).join(';')};${result}`;
  };

  const style = {
    th: meta?.style?.th,
    td: styleTD
  };

  return { ...meta, style };
}

defineExpose({
  tableApi: table.value?.tableApi,
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
    <slot name="top" />

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
            class="flex grow shrink max-w-[300px]"
          >
            <UInput
              v-model="search"
              :placeholder="props.placeholderSearch"
              icon="lucide:search"
              size="lg"
              class="w-full"
              @keydown.enter.prevent="onSearch"
              @input="onInputSearch"
            />
          </div>

          <UDropdownMenu
            v-if="props.toggleColumnVisibility"
            :items="visibleColumns"
            :content="{ align: 'start' }"
          >
            <UButton
              label="Columns"
              color="info"
              variant="subtle"
              icon="lucide:chart-no-axes-column"
            />
          </UDropdownMenu>

          <UPopover
            v-if="props.mobileCards && props.showMobileSorting && hasSorting"
            :content="{
              align: 'center'
            }"
          >
            <UButton
              label="Sorting"
              :icon="props.iconUnsort"
              class="inline-flex lg:hidden"
            />

            <template #content>
              <div class="w-56 space-y-1 p-1">
                <template
                  v-for="(group, groupIndex) in headerGroups"
                  :key="`mobile-sorting-group-${groupIndex}`"
                >
                  <TableHeaderSorting
                    v-for="(header, index) in group.headers.filter((head) => columnsSortableIds.includes(head.id))"
                    :key="`mobile-sorting-${groupIndex}-${index}`"
                    v-bind="header.getContext()"
                    v-slot="{ onsorting, isSorted }"
                    :multiple="props.multiSort"
                  >
                    <UButton
                      :label="columns.find((c) => c.accessorKey === header.id)?.label"
                      :trailing-icon="isSorted ? isSorted === 'asc' ? props.iconSortAsc : props.iconSortDesc : props.iconUnsort"
                      :color="isSorted ? 'primary' : 'neutral'"
                      :variant="isSorted ? 'soft' : 'ghost'"
                      block
                      @click="onsorting"
                    />
                  </TableHeaderSorting>
                </template>
              </div>
            </template>
          </UPopover>

          <slot name="toolbar-left-trailing" />
        </div>
      </div>

      <div :class="uiToolbar.right">
        <div :class="uiToolbar.rightWrapper">
          <slot name="toolbar-right" />
        </div>
      </div>
    </div>

    <slot name="middle" />

    <UTable
      v-if="mounted"
      ref="table"
      v-model:sorting="sorting"
      v-model:expanded="expanded"
      v-model:column-visibility="columnVisibility"
      v-model:column-pinning="columnPinning"
      v-model:column-sizing="columnSizing"
      v-model:column-sizing-info="columnSizingInfo"
      v-model:row-selection="rowSelection"
      v-model:row-pinning="rowPinning"
      v-model:grouping="grouping"
      :data="visibleData"
      :columns="columns"
      :caption="props.caption"
      :loading="loading"
      :global-filter-options="props.globalFilterOptions"
      :column-filters-options="props.columnFiltersOptions"
      :column-pinning-options="props.columnPinningOptions"
      :column-sizing-options="props.columnSizingOptions"
      :grouping-options="props.groupingOptions"
      :row-selection-options="props.rowSelectionOptions"
      :row-pinning-options="props.rowPinningOptions"
      :ui="uiTable"
      :meta="props.meta"
      :sorting-options="{
        manualSorting: isServerPagination,
        enableMultiSort: props.multiSort
      }"
      :expanded-options="{
        manualExpanding: true
      }"
      :loading-color="props.loadingColor"
      :sticky="props.sticky"
      @select="props.onSelect"
      @hover="props.onHover"
      @contextmenu="props.onContextmenu"
      @update:sorting="onSorting"
    >
      <template
        v-if="!!slots['body-top']"
        #body-top
      >
        <slot
          name="body-top"
          :ui="uiTableBodySlots"
        />
      </template>

      <template
        v-if="!!slots['body-bottom']"
        #body-bottom
      >
        <slot
          name="body-bottom"
          :ui="uiTableBodySlots"
        />
      </template>

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
      class="flex border-t border-t-(--ui-border) py-4"
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
