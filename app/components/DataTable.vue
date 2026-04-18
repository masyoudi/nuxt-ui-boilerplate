<script lang="ts">
import type {
  CellContext,
  ColumnDef,
  ColumnFiltersOptions,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningOptions,
  ColumnPinningState,
  ColumnSizingOptions,
  ColumnSizingState,
  ColumnSizingInfoState,
  CoreOptions,
  ExpandedOptions,
  ExpandedState,
  FacetedOptions,
  FilterFnOption,
  GlobalFilterOptions,
  GroupingOptions,
  GroupingState,
  HeaderContext,
  PaginationOptions,
  PaginationState,
  Row,
  RowData,
  RowPinningOptions,
  RowPinningState,
  RowSelectionOptions,
  RowSelectionState,
  SortingOptions,
  SortingState,
  SortDirection,
  Updater,
  VisibilityOptions,
  VisibilityState,
  Column,
  Table
} from '@tanstack/vue-table';
import type { AppConfig } from '@nuxt/schema';
import type { ComponentConfig, PaginationProps, TableRow } from '@nuxt/ui';
import type { DataTableColumnProps, DataTableColumnSlots } from './DataTableColumn.vue';
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable
} from '@tanstack/vue-table';
import type { VirtualizerOptions } from '@tanstack/vue-virtual';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { createRef, createReusableTemplate, reactivePick } from '@vueuse/core';
import theme from '#build/ui/table';
import { Primitive, useForwardProps } from 'reka-ui';
import { cn, tv } from 'tailwind-variants';
import { camelize } from 'vue-demi';
import { useComponentUI } from '@nuxt/ui/composables';
import type { WatchOptions, TransitionProps, VNode } from 'vue-demi';
import TableHeaderSorting from './TableHeaderSorting.vue';
import defu from 'defu';
import type { CheckboxProps } from '@nuxt/ui/components/Checkbox.vue';
import UCheckbox from '#build/ui/checkbox';

declare module '@tanstack/vue-table' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TableState extends SelectedRowsTableState {
  }
}

interface SelectedRowsTableState {
  selectedRows: Record<string, any>[];
}

export type DataTableItem = RowData;

export type DataTableRow<T> = Row<T>;

export type DataTableColumnDef<T extends DataTableItem, D = unknown> = ColumnDef<T, D> & {
  label?: string;
  visible?: boolean;
  columns?: DataTableColumnDef<T, unknown>[];
};

export interface DataTableOptions<T extends DataTableItem = DataTableItem> extends Omit<CoreOptions<T>, 'data' | 'columns' | 'getCoreRowModel' | 'state' | 'onStateChange' | 'renderFallbackValue'> {
  state?: CoreOptions<T>['state'];
  onStateChange?: CoreOptions<T>['onStateChange'];
  renderFallbackValue?: CoreOptions<T>['renderFallbackValue'];
}

type DataTableTheme = ComponentConfig<typeof theme, AppConfig, 'table'>;

interface DataTableColumnNumbering<T> {
  label?: string;
  meta?: DataTableColumnDef<T>['meta'];
}

type SelectionCheckboxProps = Omit<CheckboxProps, 'modelValue' | 'defaultValue'>;

interface DataTableColumnSelection<T> {
  label?: string;
  checkboxHeaderProps?: SelectionCheckboxProps | ((cell: HeaderContext<T, unknown>) => SelectionCheckboxProps);
  checkboxCellProps?: SelectionCheckboxProps | ((cell: CellContext<T, unknown>) => SelectionCheckboxProps);
  meta?: DataTableColumnDef<T>['meta'];
}

interface UILayout {
  virtualizer?: string;
  pagination?: string;
}

export interface DataTableProps<T extends DataTableItem = DataTableItem> extends DataTableOptions<T> {
  as?: any;
  items?: T[];
  getData?: (params: GetDataParams) => GetDataResult<T> | Promise<GetDataResult<T>>;
  columns?: ColumnDef<T>[];
  sticky?: boolean | 'header' | 'footer';
  loading?: boolean;
  /**
   * @defaultValue 'primary'
   */
  loadingColor?: DataTableTheme['variants']['loadingColor'];
  /**
   * @defaultValue 'carousel'
   */
  loadingAnimation?: DataTableTheme['variants']['loadingAnimation'];
  /**
   * Use the `watchOptions` prop to customize reactivity (for ex: disable deep watching for changes in your data or limiting the max traversal depth). This can improve performance by reducing unnecessary re-renders, but it should be used with caution as it may lead to unexpected behavior if not managed properly.
   * @see [API](https://vuejs.org/api/options-state.html#watch)
   * @see [Guide](https://vuejs.org/guide/essentials/watchers.html)
   * @defaultValue { deep: true }
   */
  watchOptions?: WatchOptions;
  /**
   * Enable virtualization for large datasets.
   * Note: when enabled, the divider between rows, sticky and row pinning properties are not supported.
   * @see https://tanstack.com/virtual/latest/docs/api/virtualizer#options
   * @defaultValue false
   */
  virtualize?: boolean | (Partial<Omit<VirtualizerOptions<Element, Element>, 'getScrollElement' | 'count' | 'estimateSize' | 'overscan'>> & {
    /**
     * Number of items rendered outside the visible area
     * @defaultValue 12
     */
    overscan?: number;
    /**
     * Estimated size (in px) of each item, or a function that returns the size for a given index
     * @defaultValue 65
     */
    estimateSize?: number | ((index: number) => number);
  });
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/global-filtering#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/global-filtering)
   */
  globalFilterOptions?: Omit<GlobalFilterOptions<T>, 'onGlobalFilterChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/column-filtering#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/column-filtering)
   */
  columnFiltersOptions?: Omit<ColumnFiltersOptions<T>, 'getFilteredRowModel' | 'onColumnFiltersChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/column-pinning#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/column-pinning)
   */
  columnPinningOptions?: Omit<ColumnPinningOptions, 'onColumnPinningChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/column-sizing#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/column-sizing)
   */
  columnSizingOptions?: Omit<ColumnSizingOptions, 'onColumnSizingChange' | 'onColumnSizingInfoChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/column-visibility#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/column-visibility)
   */
  visibilityOptions?: Omit<VisibilityOptions, 'onColumnVisibilityChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/sorting#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/sorting)
   */
  sortingOptions?: Omit<SortingOptions<T>, 'getSortedRowModel' | 'onSortingChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/grouping#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/grouping)
   */
  groupingOptions?: Omit<GroupingOptions, 'onGroupingChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/expanding#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/expanding)
   */
  expandedOptions?: Omit<ExpandedOptions<T>, 'getExpandedRowModel' | 'onExpandedChange'>;
  expandedTransition?: TransitionProps;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/row-selection#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/row-selection)
   */
  rowSelectionOptions?: Omit<RowSelectionOptions<T>, 'onRowSelectionChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/row-pinning#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/row-pinning)
   */
  rowPinningOptions?: Omit<RowPinningOptions<T>, 'onRowPinningChange'>;
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/column-faceting#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/column-faceting)
   */
  facetedOptions?: FacetedOptions<T>;
  pagination?: false | 'client' | 'server';
  /**
   * @see [API](https://tanstack.com/table/v8/docs/api/features/pagination#table-options)
   * @see [Guide](https://tanstack.com/table/v8/docs/guide/pagination)
   */
  paginationOptions?: Omit<PaginationOptions, 'onPaginationChange'>;
  numbering?: false | DataTableColumnNumbering<T>;
  selection?: boolean | DataTableColumnSelection<T>;
  class?: any;
  /**
   * Display the table as card on mobile screen
   */
  mobileCards?: boolean;
  onSelect?: (e: Event, row: TableRow<T>) => void;
  onHover?: (e: Event, row: TableRow<T> | null) => void;
  onContextmenu?: ((e: Event, row: TableRow<T>) => void) | Array<((e: Event, row: TableRow<T>) => void)>;
  variant?: 'striped' | 'bordered' | 'separated';
  ui?: DataTableTheme['slots'];
  uiPagination?: PaginationProps['ui'];
  uiLayout?: UILayout;
}

interface ExpoandedSlotProps<T> {
  table: Table<T>;
  row: Row<T>;
  ui: Record<'tr' | 'td', string>;
}

interface BodySlotProps<T> {
  table: Table<T>;
  ui: Record<'tr' | 'td', string>;
}

export interface DataTableSlots<T> {
  'default': () => VNode[];
  'caption': () => VNode[];
  'expanded': (props: ExpoandedSlotProps<T>) => VNode[];
  'body-top': (props: BodySlotProps<T>) => VNode[];
  'body-bottom': (props: BodySlotProps<T>) => VNode[];
  'loading': () => VNode[];
  'empty': () => VNode[];
}

interface GetDataParamsSorting {
  col: string;
  dir: SortDirection;
}

export interface GetDataParams {
  page: number;
  perpage: number;
  sorting?: GetDataParamsSorting[];
  orderBy?: string;
  orderDir?: SortDirection;
}

export interface GetDataResult<T> {
  data: T[];
  total?: number;
}
</script>

<script setup lang="ts" generic="T extends DataTableItem">
const props = withDefaults(defineProps<DataTableProps<T>>(), {
  as: 'div',
  pagination: 'client',
  virtualize: false,
  getRowId: (row: any) => row.id,
  expandedTransition: () => ({
    enterActiveClass: 'animate-[slide-in-from-top-and-fade_200ms_ease-out]',
    leaveActiveClass: 'animate-[slide-out-to-top-and-fade_200ms_ease-in]'
  }),
  watchOptions: () => ({
    deep: true
  }),
  numbering: () => ({
    label: '#'
  })
});
const slots = defineSlots<DataTableSlots<T>>();

const tableThemeVariants = {
  mobileCards: {
    true: {
      base: 'block lg:table',
      tbody: 'block lg:table-row-group',
      thead: 'w-full hidden lg:table-row-group',
      tr: 'block lg:table-row',
      th: 'hidden lg:table-cell',
      td: [
        'flex lg:table-cell justify-between gap-2.5 p-2.5 lg:p-4 text-right lg:text-left',
        '[&:has([role=checkbox])]:pe-2.5 lg:[&:has([role=checkbox])]:pe-0',
        'before:content-[attr(data-label)] before:text-default before:font-semibold lg:before:content-[unset]'
      ]
    }
  },
  variant: {
    bordered: {
      root: 'border border-default rounded-md',
      th: 'not-first:border-l not-first:border-l-default'
    },
    striped: {
      tbody: '[&>tr]:even:bg-white [&>tr]:odd:bg-secondary-50'
    },
    separated: {
      th: 'py-1'
    }
  }
};

const tableThemeCompoundVariants = [
  {
    loading: false,
    variant: 'bordered' as const,
    class: {
      separator: 'bg-(--ui-border)'
    }
  },
  {
    mobileCards: true,
    variant: 'bordered' as const,
    class: {
      td: 'lg:not-first:border-l lg:not-first:border-l-default'
    }
  },
  {
    mobileCards: false,
    variant: 'bordered' as const,
    class: {
      td: 'not-first:border-l not-first:border-l-default'
    }
  },
  {
    variant: 'separated' as const,
    virtualize: false,
    class: {
      tbody: 'divide-0'
    }
  },
  {
    variant: 'separated' as const,
    mobileCards: true,
    class: {
      base: 'border-collapse lg:border-separate border-spacing-y-0 lg:border-spacing-y-3',
      tbody: 'space-y-3 lg:space-y-0',
      tr: 'border border-neutral-300 lg:border-0 rounded-lg lg:rounded-none divide-y divide-neutral-100 lg:divide-y-0',
      td: 'lg:border-y lg:first:border-l lg:last:border-r lg:border-neutral-300 lg:first:rounded-s-lg lg:last:rounded-e-lg'
    }
  },
  {
    variant: 'separated' as const,
    mobileCards: false,
    class: {
      base: 'border-separate border-spacing-x-0 border-spacing-y-3',
      td: 'border-y first:border-l last:border-r border-neutral-300 first:rounded-s-lg last:rounded-e-lg'
    }
  }
];

const uiTable = computed(() => {
  const _theme = tv({
    extend: tv(theme),
    variants: tableThemeVariants,
    compoundVariants: tableThemeCompoundVariants
  });

  return _theme({
    sticky: props.virtualize ? false : props.sticky,
    loading: isLoading.value,
    loadingColor: props.loadingColor,
    loadingAnimation: props.loadingAnimation,
    virtualize: !!props.virtualize,
    mobileCards: props.mobileCards,
    variant: !props.virtualize ? props.variant : undefined
  });
});
const uiTableProp = useComponentUI('table', props);

const wrapperRef = useTemplateRef('wrapperRef');
const tableRef = useTemplateRef<HTMLTableElement>('tableRef');

const numberingProps = computed(() => props.numbering ? props.numbering : undefined);
const columnNumbering = computed<DataTableColumnDef<T>>(() => ({
  accessorKey: '__numbering',
  id: '__numbering',
  label: numberingProps.value?.label,
  enableSorting: false,
  enableMultiSort: false,
  enableColumnFilter: false,
  enableGlobalFilter: false,
  enableGrouping: false,
  visible: props.numbering !== false,
  header: () => numberingProps.value?.label ?? '#',
  cell: ({ row, table }) => {
    if (props.pagination === false) {
      return h('span', row.index + 1);
    }

    const index = props.pagination === 'server' ? row.index : table.getRowModel().rows.findIndex((r) => r.id === row.id);
    const { pageIndex, pageSize } = paginationState.value;
    const page = pageIndex ?? 0;
    const perPage = pageSize ?? 0;
    const num = page * perPage + index + 1;

    return h('span', num);
  },
  meta: numberingProps.value?.meta
}));

const selectionProps = toRef(() => defu(typeof props.selection === 'boolean' ? {} : props.selection, {
  label: 'Selection'
}));
const columnSelection = computed<DataTableColumnDef<T>>(() => ({
  accessorKey: '__selection',
  id: '__selection',
  label: selectionProps.value?.label,
  enableSorting: false,
  enableMultiSort: false,
  enableColumnFilter: false,
  enableGlobalFilter: false,
  enableGrouping: false,
  visible: props.selection === true || typeof props.selection === 'object',
  header: (ctx) => {
    const checkboxProps: CheckboxProps = {
      modelValue: ctx.table.getIsSomePageRowsSelected() ? 'indeterminate' : ctx.table.getIsAllPageRowsSelected(),
      size: 'lg',
      ...resolveValue(selectionProps.value.checkboxHeaderProps, ctx)
    };

    if (props.pagination === 'server') {
      const rowIds = ctx.table.getRowModel().rows.map((item) => String(item.id));
      const selectedIds = Object.keys(selectedRows.value);
      const isSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.includes(id));
      checkboxProps.modelValue = isSelected ? true : selectedIds.length > 0 ? 'indeterminate' : false;
    }

    return h(UCheckbox, {
      ...checkboxProps,
      'onUpdate:modelValue': (val: boolean | 'indeterminate') => ctx.table.toggleAllRowsSelected(!!val)
    });
  },
  cell: (ctx) => {
    const checkboxProps = {
      modelValue: ctx.row.getIsSelected(),
      size: 'lg',
      disabled: !ctx.row.getCanSelect(),
      ...resolveValue(selectionProps.value.checkboxCellProps, ctx)
    };

    return h(UCheckbox, {
      ...checkboxProps,
      'onUpdate:modelValue': (val: boolean | 'indeterminate') => ctx.row.toggleSelected(!!val)
    });
  },
  meta: selectionProps.value?.meta
}));

const columnNodes = computed(() => {
  if (typeof slots.default !== 'function') {
    return [];
  }

  return findNodeChildrens(slots.default(), 'DataTableColumn');
});

const columnDefs = computed(() => {
  if (Array.isArray(props.columns)) {
    return props.columns as DataTableColumnDef<T>[];
  }

  const _columns = [
    columnSelection.value,
    columnNumbering.value,
    ...columnNodes.value.map((node, i) => defineColumn(node, i))
  ];

  return filterVisibleColumn(_columns);
});

const hasFooter = computed(() => {
  function findFooterRecursive(columns: typeof columnDefs.value) {
    for (const column of columns) {
      if (typeof column.footer === 'function') {
        return true;
      }

      if ('columns' in column && findFooterRecursive(column.columns as typeof columnDefs.value)) {
        return true;
      }
    }

    return false;
  }

  return findFooterRecursive(columnDefs.value);
});

const globalFilter = defineModel<string | Record<string, any>>('globalFilter');
const columnFilters = defineModel<ColumnFiltersState>('columnFilters');
const columnOrder = defineModel<ColumnOrderState>('columnOrder');
const columnPinning = defineModel<ColumnPinningState>('columnPinning');
const columnSizing = defineModel<ColumnSizingState>('columnSizing');
const columnSizingInfo = defineModel<ColumnSizingInfoState>('columnSizingInfo');
const columnVisibility = defineModel<VisibilityState>('columnVisibility');
const sorting = defineModel<SortingState>({
  default: () => [],
  required: false
});
const grouping = defineModel<GroupingState>('grouping');
const expanded = defineModel<ExpandedState>('expanded');
const selectedRows = ref<Record<string, Record<string, any>>>({});
const rowSelection = defineModel<RowSelectionState>('rowSelection', {
  default: () => ({}),
  required: false
});
const rowPinning = defineModel<RowPinningState>('rowPinning');
const perPages = defineModel<number[]>('perPages', {
  default: () => [10, 25, 50, 75, 100]
});

const paginationState = ref<PaginationState>({ pageIndex: 0, pageSize: 10 });
const isPaginated = computed(() => props.pagination === 'client' || props.pagination === 'server');
const isServerPagination = computed(() => props.pagination === 'server');

const data = createRef(props.items ?? [], props.watchOptions?.deep !== false);
const total = ref(0);

const _loading = ref(false);
const isLoading = computed({
  get: () => props.loading || _loading.value,
  set: (value) => {
    _loading.value = value;
  }
});

const TABLE_OPTIONS = [
  '_features',
  'autoResetAll',
  'debugAll',
  'debugCells',
  'debugColumns',
  'debugHeaders',
  'debugRows',
  'debugTable',
  'defaultColumn',
  'getRowId',
  'getSubRows',
  'initialState',
  'mergeOptions',
  'renderFallbackValue'
] as const;

const tableProps = useForwardProps(reactivePick(props, ...TABLE_OPTIONS));

const tableApi = useVueTable({
  ...tableProps.value,
  get data() {
    return data.value;
  },
  get columns() {
    return columnDefs.value;
  },
  filterFns: {
    nestedIncludeString: (row, columnId, filterValue) => {
      const value = getObjectValue(row.original, columnId);
      return String(value ?? '').toLowerCase().includes(String(filterValue).toLowerCase());
    }
  },
  getCoreRowModel: getCoreRowModel(),
  ...(props.globalFilterOptions || {}),
  ...(globalFilter.value !== undefined && {
    onGlobalFilterChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, globalFilter)
  }),
  ...(props.columnFiltersOptions || {}),
  ...(!isServerPagination.value && {
    getFilteredRowModel: getFilteredRowModel()
  }),
  get manualFiltering() {
    return isServerPagination.value;
  },
  ...(columnFilters.value !== undefined && {
    onColumnFiltersChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, columnFilters)
  }),
  ...(columnOrder.value !== undefined && {
    onColumnOrderChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, columnOrder)
  }),
  ...(props.columnPinningOptions || {}),
  ...(columnPinning.value !== undefined && {
    onColumnPinningChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, columnPinning)
  }),
  ...(props.columnSizingOptions || {}),
  ...(columnSizing.value !== undefined && {
    onColumnSizingChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, columnSizing)
  }),
  ...(columnSizingInfo.value !== undefined && {
    onColumnSizingInfoChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, columnSizingInfo)
  }),
  ...(props.rowSelectionOptions || {}),
  ...(rowSelection.value !== undefined && {
    onRowSelectionChange: (updaterOrValue: any) => onRowSelectionChange(updaterOrValue)
  }),
  ...(props.rowPinningOptions || {}),
  ...(rowPinning.value !== undefined && {
    onRowPinningChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, rowPinning)
  }),
  ...(props.visibilityOptions || {}),
  ...(columnVisibility.value !== undefined && {
    onColumnVisibilityChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, columnVisibility)
  }),
  ...(props.sortingOptions || {}),
  ...(!isServerPagination.value && {
    getSortedRowModel: getSortedRowModel()
  }),
  get manualSorting() {
    return isServerPagination.value;
  },
  onSortingChange: (updaterOrValue: any) => onSorting(updaterOrValue),
  ...(props.groupingOptions || {}),
  ...(grouping.value !== undefined && {
    onGroupingChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, grouping)
  }),
  ...(props.expandedOptions || {}),
  getExpandedRowModel: getExpandedRowModel(),
  ...(expanded.value !== undefined && {
    onExpandedChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, expanded)
  }),
  get manualPagination() {
    return isPaginated.value && isServerPagination.value;
  },
  get rowCount() {
    return isServerPagination.value ? total.value : undefined;
  },
  ...((isPaginated.value && !isServerPagination.value) && {
    getPaginationRowModel: getPaginationRowModel()
  }),
  ...(props.paginationOptions || {}),
  onPaginationChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, paginationState),
  ...(props.facetedOptions || {}),
  state: {
    get globalFilter() {
      return globalFilter.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get columnPinning() {
      return columnPinning.value;
    },
    get expanded() {
      return expanded.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get rowPinning() {
      return rowPinning.value;
    },
    get sorting() {
      return sorting.value;
    },
    get grouping() {
      return grouping.value;
    },
    get columnOrder() {
      return columnOrder.value;
    },
    get columnSizing() {
      return columnSizing.value;
    },
    get columnSizingInfo() {
      return columnSizingInfo.value;
    },
    get pagination() {
      return paginationState.value;
    },
    get selectedRows() {
      return Object.values(selectedRows.value);
    }
  }
});

const rows = computed(() => tableApi.getRowModel().rows);
const topRows = computed(() => props.virtualize ? [] : tableApi.getTopRows());
const bottomRows = computed(() => props.virtualize ? [] : tableApi.getBottomRows());
const centerRows = computed(() => topRows.value.length || bottomRows.value.length ? tableApi.getCenterRows() : rows.value);

const virtualizerProps = toRef(() => defu(typeof props.virtualize === 'boolean' ? {} : props.virtualize, {
  estimateSize: 65,
  overscan: 12
}));

const virtualizer = !!props.virtualize && useVirtualizer({
  ...virtualizerProps.value,
  get count() {
    return centerRows.value.length;
  },
  getScrollElement: () => wrapperRef.value as Element,
  estimateSize: (index: number) => {
    const estimate = virtualizerProps.value.estimateSize;
    return typeof estimate === 'function' ? estimate(index) : estimate;
  }
});

const renderedSize = computed(() => {
  if (!virtualizer) {
    return 0;
  }

  const virtualItems = virtualizer.value.getVirtualItems();
  if (!virtualItems?.length) {
    return 0;
  }

  return virtualItems.reduce((sum, item) => sum + item.size, 0);
});

const [DefineTableTemplate, ReuseTableTemplate] = createReusableTemplate();
const [DefineRowTemplate, ReuseRowTemplate] = createReusableTemplate<{ row: DataTableRow<T>; style?: Record<string, string> }>({
  props: {
    row: {
      type: Object,
      required: true
    },
    style: {
      type: Object,
      required: false
    }
  }
});

function defineColumn(node: VNode, index: number, depth = 0): DataTableColumnDef<T, unknown> {
  const camelizeProps = Object.entries(node.props || {}).map(([k, v]) => [camelize(k), v]);
  const props = Object.fromEntries(camelizeProps) as DataTableColumnProps;

  const visible = normalizeBoolProps(props.visible) ?? true;
  const accessorKey = props.accessorKey ?? '';
  const accessorFn = typeof props.accessorFn === 'function' ? props.accessorFn : (row: T) => getObjectValue(row as any, accessorKey);
  const filterFn = typeof props.filterFn === 'function' || typeof props.filterFn === 'string' ? props.filterFn as FilterFnOption<T> : 'auto';
  const label = props.label ?? '';
  const enableHiding = visible ? normalizeBoolProps(props.enableHiding) : false;
  const enablePinning = normalizeBoolProps(props.enablePinning);
  const enableSorting = normalizeBoolProps(props.enableSorting);
  const enableMultiSort = normalizeBoolProps(props.enableMultiSort);
  const slot = (node.children || {} as unknown) as DataTableColumnSlots;
  const columns = toArray(slot?.columns?.());
  const header = (ctx: HeaderContext<T, unknown>) => {
    if (!enableSorting) {
      return slot?.header?.({ ...ctx }) ?? label;
    }

    const sortingProps = {
      label,
      column: ctx.column,
      multiple: enableMultiSort
    };

    return h(TableHeaderSorting, sortingProps);
  };

  const cell = (ctx: CellContext<T, unknown>) => {
    const item = ctx.row.original as Record<string, any>;
    return slot?.default?.({ ...ctx, item }) ?? getObjectValue(ctx.row.original as any, accessorKey);
  };

  const footer = (ctx: HeaderContext<any, any>) => {
    return slot?.footer({ ...ctx });
  };

  return {
    ...props,
    visible,
    id: accessorKey || (props.id ?? `${depth + 1}.${index}.${Math.random().toString(16).slice(2)}`),
    accessorKey,
    accessorFn,
    filterFn,
    label,
    header,
    cell,
    footer: typeof slot.footer === 'function' ? footer : undefined,
    enableHiding,
    enablePinning,
    enableSorting,
    enableMultiSort,
    enableGrouping: normalizeBoolProps(props.enableGrouping),
    enableColumnFilter: normalizeBoolProps(props.enableColumnFilter),
    enableGlobalFilter: normalizeBoolProps(props.enableGlobalFilter),
    enableResizing: normalizeBoolProps(props.enableResizing),
    ...(columns.length > 0 && { columns: columns.map((columnNode, i) => defineColumn(columnNode, i, depth + 1)) })
  };
}

function normalizeBoolProps(value: unknown) {
  if (typeof value === 'boolean' || typeof value === 'string') {
    return typeof value === 'boolean' ? value : value === '';
  }

  return undefined;
}

function filterVisibleColumn(columns: DataTableColumnDef<T, unknown>[]): DataTableColumnDef<T, unknown>[] {
  return columns.filter((column) => column.visible).map((column) => ({
    ...column,
    ...(Array.isArray(column.columns) && {
      columns: filterVisibleColumn(column.columns)
    })
  }));
}

function valueUpdater<U extends Updater<any>>(updaterOrValue: U, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function' ? updaterOrValue(ref.value) : updaterOrValue;
}

function onChangePage(value: number) {
  const index = value - 1;
  if (index === tableApi.getState().pagination.pageIndex) {
    return;
  }

  tableApi?.setPageIndex(index);
  if (isServerPagination.value) {
    data.value = [];
    fetchData();
  }
}

function onChangePerPage(value: number) {
  tableApi?.setPageSize(value);
  if (isServerPagination.value) {
    fetchData();
  }
}

function onSorting(updaterOrValue: any) {
  valueUpdater(updaterOrValue, sorting);
  if (isServerPagination.value) {
    data.value = [];
    fetchData();
  }
}

async function onRowSelectionChange(updaterOrValue: any) {
  valueUpdater(updaterOrValue, rowSelection);
  await nextTick();

  const rowsMap = Object.fromEntries(
    tableApi.getSelectedRowModel().rows.map((item) => [item.id, item.original as Record<string, any>])
  );

  if (!isServerPagination.value) {
    selectedRows.value = rowsMap;
    return;
  }

  const selectedIds = Object.keys(rowSelection.value || {});
  selectedRows.value = Object.fromEntries(
    Object.entries({ ...selectedRows.value, ...rowsMap }).filter(([key]) => selectedIds.includes(key))
  );
}

async function fetchData() {
  try {
    if (typeof props.getData !== 'function') {
      return;
    }

    isLoading.value = true;
    const _sorting = sorting.value.map((v) => ({
      col: v.id,
      dir: v.desc ? 'desc' as const : 'asc' as const
    }));

    const result = await props.getData({
      page: paginationState.value.pageIndex + 1,
      perpage: paginationState.value.pageSize,
      ...(tableApi.options.enableMultiSort && _sorting.length > 0 && {
        sorting: _sorting
      }),
      ...(!tableApi.options.enableMultiSort && _sorting.length === 1 && {
        orderBy: _sorting[0]?.col,
        orderDir: _sorting[0]?.dir
      })
    });

    data.value = result.data;
    total.value = isServerPagination.value ? result.total ?? 0 : result.data.length;
  }
  catch (err) {
    useRequestError(err);
  }
  finally {
    isLoading.value = false;
  }
}

function onRowSelect(e: Event, row: TableRow<T>) {
  if (typeof props.onSelect !== 'function') {
    return;
  }

  const target = e.target as HTMLElement;
  const isInteractive = target.closest('button') || target.closest('a');
  if (isInteractive) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  props.onSelect(e, row);
}

function onRowHover(e: Event, row: TableRow<T> | null) {
  if (typeof props.onHover !== 'function') {
    return;
  }

  props.onHover(e, row);
}

function onRowContextmenu(e: Event, row: TableRow<T>) {
  if (!props.onContextmenu) {
    return;
  }

  if (Array.isArray(props.onContextmenu)) {
    props.onContextmenu.forEach((fn) => fn(e, row));
    return;
  }
  props.onContextmenu(e, row);
}

function getColumnStyles(column: Column<T>): Record<string, string> {
  const styles: Record<string, string> = {};
  const pinned = column.getIsPinned();

  if (pinned === 'left' || pinned === 'right') {
    const fnName = pinned === 'left' ? 'getStart' : 'getAfter';
    styles[pinned] = `${column[fnName](pinned)}px`;
  }

  return styles;
}

function getColumnPinningSection(column: Column<T>) {
  if (!column.getIsPinned()) {
    return undefined;
  }

  const left = tableApi.getState().columnPinning.left ?? [];
  const position = left.length > 0 && left.includes(column.id) ? 'left' : 'right';

  return column.getIsFirstColumn(position) ? 'start' : column.getIsLastColumn(position) ? 'end' : 'middle';
}

function resolveValue<T, Arg = undefined>(prop: T | ((arg: Arg) => T), arg?: Arg): T | undefined {
  if (typeof prop === 'function') {
    // @ts-expect-error: TS can't know if prop is a function here
    return prop(arg);
  }
  return prop;
}

function getHeaderLabel(column: DataTableColumnDef<T>) {
  for (const col of columnDefs.value) {
    if (col?.id === column.id) {
      return col.label;
    }

    if (Array.isArray(col.columns) && col.columns.length > 0) {
      return col.columns.find(getHeaderLabel);
    }
  }

  return undefined;
}

watch(() => props.items, () => {
  data.value = props.items ? [...props.items] : [];
}, props.watchOptions);

defineExpose({
  api: tableApi,
  tableRef,
  wrapperRef
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Primitive
    :as="props.as"
    data-slot="root"
    :class="cn('w-full', props?.class)"
  >
    <DefineRowTemplate v-slot="{ row, style }">
      <tr
        :data-selected="row.getIsSelected()"
        :data-selectable="!!props.onSelect || !!props.onHover || !!props.onContextmenu"
        :data-expanded="row.getIsExpanded()"
        :data-pinned="row.getIsPinned() || undefined"
        :role="props.onSelect ? 'button' : undefined"
        :tabindex="props.onSelect ? 0 : undefined"
        data-slot="tr"
        :class="uiTable.tr({ class: [uiTableProp.tr, resolveValue(tableApi.options.meta?.class?.tr, row)] })"
        :style="[
          resolveValue(tableApi.options.meta?.style?.tr, row),
          style
        ]"
        @click="onRowSelect($event, row)"
        @pointerenter="onRowHover($event, row)"
        @pointerleave="onRowHover($event, null)"
        @contextmenu="onRowContextmenu($event, row)"
      >
        <td
          v-for="cell in row.getVisibleCells()"
          :key="cell.id"
          :colspan="resolveValue(cell.column.columnDef.meta?.colspan?.td, cell)"
          :rowspan="resolveValue(cell.column.columnDef.meta?.rowspan?.td, cell)"
          data-slot="td"
          :data-label="getHeaderLabel(cell.column)"
          :data-pinned="cell.column.getIsPinned()"
          :data-pinned-index="cell.column.getIsPinned() ? cell.column.getPinnedIndex() : undefined"
          :data-pinned-section="getColumnPinningSection(cell.column)"
          :class="uiTable.td({
            class: [uiTableProp.td, resolveValue(cell.column.columnDef.meta?.class?.td, cell)],
            pinned: !!cell.column.getIsPinned()
          })"
          :style="[
            getColumnStyles(cell.column),
            resolveValue(cell.column.columnDef.meta?.style?.td, cell)
          ]"
        >
          <FlexRender
            :render="cell.column.columnDef.cell"
            :props="cell.getContext()"
          />
        </td>
      </tr>

      <TransitionGroup v-bind="props.expandedTransition">
        <slot
          v-if="row.getIsExpanded()"
          name="expanded"
          :row="row"
          :table="tableApi"
          :ui="{
            tr: uiTable.tr({ class: uiTableProp.tr }),
            td: uiTable.td({ class: uiTableProp.td })
          }"
        />
      </TransitionGroup>
    </DefineRowTemplate>

    <DefineTableTemplate>
      <table
        ref="tableRef"
        data-slot="base"
        :class="uiTable.base({ class: [uiTableProp.base] })"
      >
        <caption
          v-if="!!slots.caption"
          data-slot="caption"
          :class="uiTable.caption({ class: uiTableProp.caption })"
        >
          <slot name="caption" />
        </caption>

        <thead
          data-slot="thead"
          :class="uiTable.thead({ class: uiTableProp.thead })"
        >
          <tr
            v-for="headerGroup in tableApi?.getHeaderGroups() ?? []"
            :key="headerGroup.id"
            data-slot="tr"
            :class="uiTable.tr({ class: uiTableProp.tr })"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan > 1 ? header.colSpan : undefined"
              :rowspan="header.rowSpan > 1 ? header.rowSpan : undefined"
              data-slot="th"
              :data-pinned="header.column.getIsPinned()"
              :data-pinned-index="header.column.getIsPinned() ? header.column.getPinnedIndex() : undefined"
              :data-pinned-section="getColumnPinningSection(header.column)"
              :class="uiTable.th({
                class: [uiTableProp.th, resolveValue(header.column.columnDef.meta?.class?.th, header)],
                pinned: !!header.column.getIsPinned()
              })"
              :style="[
                getColumnStyles(header.column),
                resolveValue(header.column.columnDef.meta?.style?.th, header)
              ]"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>

          <tr
            data-slot="separator"
            :class="uiTable.separator({ class: uiTableProp.separator })"
          />
        </thead>
        <tbody
          data-slot="tbody"
          :class="uiTable.tbody({ class: uiTableProp.tbody })"
        >
          <slot
            name="body-top"
            :table="tableApi"
            :ui="{
              tr: uiTable.tr({ class: uiTableProp.tr }),
              td: uiTable.td({ class: uiTableProp.td })
            }"
          />

          <template v-if="rows.length">
            <ReuseRowTemplate
              v-for="row in topRows"
              :key="row.id"
              :row="row"
            />

            <template v-if="virtualizer">
              <template
                v-for="(virtualRow, index) in virtualizer.getVirtualItems()"
                :key="centerRows[virtualRow.index]?.id"
              >
                <ReuseRowTemplate
                  :row="centerRows[virtualRow.index]!"
                  :style="{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`
                  }"
                />
              </template>
            </template>

            <template v-else>
              <ReuseRowTemplate
                v-for="row in centerRows"
                :key="row.id"
                :row="row"
              />
            </template>

            <ReuseRowTemplate
              v-for="row in bottomRows"
              :key="row.id"
              :row="row"
            />
          </template>

          <tr v-else-if="isLoading">
            <td
              :colspan="tableApi?.getAllLeafColumns().length"
              data-slot="loading"
              :class="uiTable.loading({ class: uiTableProp?.loading })"
            >
              <slot name="loading">
                <div class="text-center">
                  Loading...
                </div>
              </slot>
            </td>
          </tr>

          <tr v-else>
            <td
              :colspan="tableApi?.getAllLeafColumns().length"
              data-slot="empty"
              :class="uiTable.empty({ class: uiTableProp?.empty })"
            >
              <slot name="empty">
                No data available.
              </slot>
            </td>
          </tr>

          <slot
            name="body-bottom"
            :table="tableApi"
            :ui="{
              tr: uiTable.tr({ class: uiTableProp.tr }),
              td: uiTable.td({ class: uiTableProp.td })
            }"
          />
        </tbody>
        <tfoot
          v-if="hasFooter"
          :class="uiTable.tfoot({ class: uiTableProp.tfoot })"
          data-slot="tfoot"
          :style="virtualizer && {
            transform: `translateY(${virtualizer.getTotalSize() - renderedSize}px)`
          }"
        >
          <tr
            data-slot="separator"
            :class="uiTable.separator({ class: uiTableProp.separator })"
          />
          <tr
            v-for="footerGroup in tableApi.getFooterGroups()"
            :key="footerGroup.id"
            data-slot="tr"
            :class="uiTable.tr({ class: uiTableProp.tr })"
          >
            <th
              v-for="header in footerGroup.headers"
              :key="header.id"
              :colSpan="header.colSpan"
              data-slot="th"
              :class="uiTable.th({ class: uiTableProp.th })"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.footer"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </tfoot>
      </table>
    </DefineTableTemplate>

    <div
      ref="wrapperRef"
      :class="uiTable.root({ class: ['w-full flex-1', uiTableProp.root] })"
    >
      <div
        v-if="virtualizer"
        :class="props.uiLayout?.virtualizer"
        :style="{ height: `${virtualizer.getTotalSize()}px` }"
      >
        <ReuseTableTemplate />
      </div>
      <ReuseTableTemplate v-else />
    </div>

    <div
      v-if="isPaginated"
      :class="cn('grid grid-cols-1 lg:grid-cols-[max-content_1fr] gap-4 py-4', props.uiLayout?.pagination)"
    >
      <div>
        <div class="flex items-center gap-3">
          <div class="inline-flex text-sm">
            Rows per page
          </div>
          <USelect
            :model-value="tableApi?.getState().pagination.pageSize"
            :items="perPages"
            @update:model-value="onChangePerPage"
          />
        </div>
      </div>

      <UPagination
        :page="(tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="tableApi?.getState().pagination.pageSize"
        :total="tableApi?.getRowCount() || 0"
        :ui="props.uiPagination"
        class="flex justify-end"
        @update:page="onChangePage"
      />
    </div>
  </Primitive>
</template>
