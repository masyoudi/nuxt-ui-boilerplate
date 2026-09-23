<script lang="ts">
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  columnResizingState as ColumnSizingInfoState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowData,
  RowPinningState,
  RowSelectionState,
  SortingState,
  SortDirection,
  TableOptions_ColumnFiltering as ColumnFilteringOptions,
  TableOptions_ColumnGrouping as ColumnGroupingOptions,
  TableOptions_ColumnPinning as ColumnPinningOptions,
  TableOptions_ColumnResizing as ColumnResizingOptions,
  TableOptions_ColumnSizing as ColumnSizingOptions,
  TableOptions_ColumnVisibility as ColumnVisibilityOptions,
  TableOptions_GlobalFiltering as GlobalFilteringOptions,
  TableOptions_RowExpanding as RowExpandingOptions,
  TableOptions_RowPagination as RowPaginationOptions,
  TableOptions_RowPinning as RowPinningOptions,
  TableOptions_RowSelection as RowSelectionOptions,
  TableOptions_RowSorting as RowSortingOptions,
  Updater,
  ColumnVisibilityState as VisibilityState
} from '@tanstack/vue-table';
import type { AppConfig } from '@nuxt/schema';
import type { ComponentConfig, PaginationProps } from '@nuxt/ui';
import type { DataTableColumnProps, DataTableColumnSlots } from './DataTableColumn.vue';
import { FlexRender, useTable } from '@tanstack/vue-table';
import type { VirtualizerOptions } from '@tanstack/vue-virtual';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { createRef, createReusableTemplate, reactivePick } from '@vueuse/core';
import theme from '#build/ui/table';
import { Primitive, useForwardProps } from 'reka-ui';
import { cn, tv, type ClassValue } from 'tailwind-variants';
import { Fragment, camelize, h } from 'vue-demi';
import type { WatchOptions, TransitionProps, VNode } from 'vue-demi';
import DataTableHeaderSorting from './DataTableHeaderSorting.vue';
import defu from 'defu';
import type { ButtonProps } from '@nuxt/ui/components/Button.vue';
import type { CheckboxProps } from '@nuxt/ui/components/Checkbox.vue';
import UCheckbox from '#build/ui/checkbox';
import { dataTableFeatures } from '~/utils/data-table';
import type {
  DataTableApi,
  DataTableCellContext,
  DataTableColumn,
  DataTableColumnDef as TanStackDataTableColumnDef,
  DataTableColumnMeta,
  DataTableFeatures,
  DataTableFilterFnOption,
  DataTableHeader,
  DataTableHeaderContext,
  DataTableMeta,
  DataTableRow as TanStackDataTableRow,
  DataTableTanStackOptions
} from '~/utils/data-table';

export type DataTableItem = RowData;

export type DataTableRow<T extends DataTableItem> = TanStackDataTableRow<T>;

export type DataTableColumnDef<T extends DataTableItem, D = unknown> = TanStackDataTableColumnDef<T, D> & {
  enableOrdering?: boolean;
  label?: string;
  visible?: boolean;
  columns?: DataTableColumnDef<T, unknown>[];
};

export type DataTableOptions<T extends DataTableItem = DataTableItem> = Omit<
  Partial<DataTableTanStackOptions<T>>,
  'features'
  | 'data'
  | 'columns'
  | 'state'
  | 'atoms'
  | 'onGlobalFilterChange'
  | 'onColumnFiltersChange'
  | 'onColumnOrderChange'
  | 'onColumnPinningChange'
  | 'onColumnSizingChange'
  | 'onColumnResizingChange'
  | 'onColumnVisibilityChange'
  | 'onSortingChange'
  | 'onGroupingChange'
  | 'onExpandedChange'
  | 'onRowSelectionChange'
  | 'onRowPinningChange'
  | 'onPaginationChange'
>;

type DataTableTheme = ComponentConfig<typeof theme, AppConfig, 'table'>;

type DataTableThemeUIProps = DataTableTheme['slots'];

interface DataTableColumnNumbering<T extends DataTableItem> {
  label?: string;
  meta?: DataTableColumnDef<T>['meta'];
}

type SelectionCheckboxProps = Omit<CheckboxProps, 'modelValue' | 'defaultValue'>;

interface DataTableColumnSelection<T extends DataTableItem> {
  label?: string;
  checkboxHeaderProps?: SelectionCheckboxProps | ((cell: DataTableHeaderContext<T, unknown>) => SelectionCheckboxProps);
  checkboxCellProps?: SelectionCheckboxProps | ((cell: DataTableCellContext<T, unknown>) => SelectionCheckboxProps);
  meta?: DataTableColumnDef<T>['meta'];
}

interface UILayout {
  pagination?: string;
}

export interface DataTableColumnReorderingOptions {
  animationDuration?: number;
  handleProps?: ButtonProps;
}

export interface DataTableColumnReorderEvent {
  columnId: string;
  targetColumnId: string;
  oldIndex: number;
  newIndex: number;
  columnOrder: ColumnOrderState;
}

export interface DataTableProps<T extends DataTableItem = DataTableItem> {
  autoResetAll?: DataTableTanStackOptions<T>['autoResetAll'];
  debugAll?: DataTableTanStackOptions<T>['debugAll'];
  debugCells?: DataTableTanStackOptions<T>['debugCells'];
  debugColumns?: DataTableTanStackOptions<T>['debugColumns'];
  debugHeaders?: DataTableTanStackOptions<T>['debugHeaders'];
  debugRows?: DataTableTanStackOptions<T>['debugRows'];
  debugTable?: DataTableTanStackOptions<T>['debugTable'];
  defaultColumn?: DataTableTanStackOptions<T>['defaultColumn'];
  getRowId?: DataTableTanStackOptions<T>['getRowId'];
  getSubRows?: DataTableTanStackOptions<T>['getSubRows'];
  initialState?: DataTableTanStackOptions<T>['initialState'];
  mergeOptions?: DataTableTanStackOptions<T>['mergeOptions'];
  renderFallbackValue?: DataTableTanStackOptions<T>['renderFallbackValue'];
  as?: any;
  items?: T[];
  getData?: (params: GetDataParams) => GetDataResult<T> | Promise<GetDataResult<T>>;
  columns?: DataTableColumnDef<T>[];
  meta?: DataTableMeta<T>;
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
   * Note: row pinning is not supported when virtualization is enabled.
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
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/global-filtering)
   */
  globalFilterOptions?: Omit<GlobalFilteringOptions<DataTableFeatures, T>, 'onGlobalFilterChange'>;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/column-filtering)
   */
  columnFiltersOptions?: Omit<ColumnFilteringOptions<DataTableFeatures, T>, 'onColumnFiltersChange'>;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/column-pinning)
   */
  columnPinningOptions?: Omit<ColumnPinningOptions, 'onColumnPinningChange'>;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/column-sizing)
   */
  columnSizingOptions?: Omit<ColumnSizingOptions & ColumnResizingOptions, 'onColumnSizingChange' | 'onColumnResizingChange'>;
  /**
   * Enable drag-and-drop column reordering for unpinned leaf columns.
   */
  columnReordering?: boolean | DataTableColumnReorderingOptions;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/column-visibility)
   */
  visibilityOptions?: Omit<ColumnVisibilityOptions, 'onColumnVisibilityChange'>;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/sorting)
   */
  sortingOptions?: Omit<RowSortingOptions, 'onSortingChange'>;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/grouping)
   */
  groupingOptions?: Omit<ColumnGroupingOptions, 'onGroupingChange'>;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/expanding)
   */
  expandedOptions?: Omit<RowExpandingOptions<DataTableFeatures, T>, 'onExpandedChange'>;
  expandedTransition?: TransitionProps;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/row-selection)
   */
  rowSelectionOptions?: Omit<RowSelectionOptions<DataTableFeatures, T>, 'onRowSelectionChange'>;
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/row-pinning)
   */
  rowPinningOptions?: Omit<RowPinningOptions<DataTableFeatures, T>, 'onRowPinningChange'>;
  pagination?: false | 'client' | 'server';
  /**
   * @see [Guide](https://tanstack.com/table/latest/docs/guide/pagination)
   */
  paginationOptions?: Omit<RowPaginationOptions, 'onPaginationChange'>;
  numbering?: false | DataTableColumnNumbering<T>;
  selection?: boolean | DataTableColumnSelection<T>;
  class?: any;
  /**
   * Display the table as card on mobile screen
   */
  mobileCards?: boolean;
  onSelect?: (e: Event, row: DataTableRow<T>) => void;
  onHover?: (e: Event, row: DataTableRow<T> | null) => void;
  onContextmenu?: ((e: Event, row: DataTableRow<T>) => void) | Array<((e: Event, row: DataTableRow<T>) => void)>;
  onColumnReorder?: (event: DataTableColumnReorderEvent) => void;
  variant?: 'striped' | 'bordered' | 'separated';
  ui?: Partial<Record<keyof DataTableThemeUIProps, ClassValue>>;
  uiPagination?: PaginationProps['ui'];
  uiLayout?: UILayout;
}

interface ExpoandedSlotProps<T extends DataTableItem> {
  table: DataTableApi<T>;
  row: DataTableRow<T>;
  ui: Record<'tr' | 'td', string>;
}

interface BodySlotProps<T extends DataTableItem> {
  table: DataTableApi<T>;
  ui: Record<'tr' | 'td', string>;
}

export interface DataTableSlots<T extends DataTableItem> {
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
      th: 'not-first:border-l not-first:border-l-default whitespace-normal',
      td: 'whitespace-normal'
    },
    striped: {
      tbody: '[&>tr]:even:bg-white dark:[&>tr]:even:bg-elevated [&>tr]:odd:bg-secondary-50 dark:[&>tr]:odd:bg-secondary-700/10',
      th: 'whitespace-normal',
      td: 'whitespace-normal'
    },
    separated: {
      th: 'whitespace-normal py-1',
      td: 'whitespace-normal'
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
      tr: 'border border-default lg:border-0 rounded-lg lg:rounded-none divide-y divide-neutral-100 lg:divide-y-0',
      td: 'lg:border-y lg:first:border-l lg:last:border-r lg:border-default lg:first:rounded-s-lg lg:last:rounded-e-lg'
    }
  },
  {
    variant: 'separated' as const,
    mobileCards: false,
    class: {
      base: 'border-separate border-spacing-x-0 border-spacing-y-3',
      td: 'border-y first:border-l last:border-r border-default first:rounded-s-lg last:rounded-e-lg'
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
    sticky: props.sticky,
    loading: isLoading.value,
    loadingColor: props.loadingColor,
    loadingAnimation: props.loadingAnimation,
    mobileCards: props.mobileCards,
    variant: !props.virtualize ? props.variant : undefined
  });
});

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
  enableOrdering: false,
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
  enableOrdering: false,
  visible: props.selection === true || typeof props.selection === 'object',
  header: (ctx) => {
    const isAllRowsSelected = ctx.table.getIsAllPageRowsSelected();
    const isSomeRowsSelected = ctx.table.getIsSomePageRowsSelected();
    const checkboxProps: CheckboxProps = {
      modelValue: isAllRowsSelected ? true : isSomeRowsSelected ? 'indeterminate' : false,
      size: 'lg',
      ...resolveValue(selectionProps.value.checkboxHeaderProps, ctx)
    };

    return h(UCheckbox, {
      ...checkboxProps,
      'onUpdate:modelValue': (val: boolean | 'indeterminate') => {
        ctx.table.toggleAllRowsSelected(val !== false);
      }
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
const meta = computed(() => props.meta ?? {});
const total = ref(0);

const _loading = ref(isServerPagination.value);
const isLoading = computed({
  get: () => props.loading || _loading.value,
  set: (value) => {
    _loading.value = value;
  }
});

const TABLE_OPTIONS = [
  'autoResetAll',
  'debugAll',
  'debugCells',
  'debugColumns',
  'debugHeaders',
  'debugRows',
  'debugTable',
  'defaultColumn',
  'getSubRows',
  'initialState',
  'mergeOptions',
  'renderFallbackValue'
] as const;

const tableProps = useForwardProps(reactivePick(props, ...TABLE_OPTIONS));
const getResolvedRowId: NonNullable<DataTableTanStackOptions<T>['getRowId']> = (row, index, parent) => {
  const rowId = props.getRowId?.(row, index, parent) ?? (row as Record<string, any>).id;
  if (rowId === undefined || rowId === null || rowId === '') {
    throw new Error('[DataTable] Each row must have an id or getRowId must return a stable, non-empty ID.');
  }

  return String(rowId);
};
const tableState = computed(() => ({
  ...(globalFilter.value !== undefined && { globalFilter: globalFilter.value }),
  ...(columnFilters.value !== undefined && { columnFilters: columnFilters.value }),
  ...(columnVisibility.value !== undefined && { columnVisibility: columnVisibility.value }),
  ...(columnPinning.value !== undefined && { columnPinning: columnPinning.value }),
  ...(expanded.value !== undefined && { expanded: expanded.value }),
  rowSelection: rowSelection.value,
  ...(rowPinning.value !== undefined && { rowPinning: rowPinning.value }),
  sorting: sorting.value,
  ...(grouping.value !== undefined && { grouping: grouping.value }),
  ...(columnOrder.value !== undefined && { columnOrder: columnOrder.value }),
  ...(columnSizing.value !== undefined && { columnSizing: columnSizing.value }),
  ...(columnSizingInfo.value !== undefined && { columnResizing: columnSizingInfo.value }),
  pagination: paginationState.value
}));

const tableApi = useTable({
  features: dataTableFeatures,
  ...tableProps.value,
  get data() {
    return data.value;
  },
  get columns() {
    return columnDefs.value;
  },
  get getRowId() {
    return getResolvedRowId;
  },
  get meta() {
    return meta.value;
  },
  ...(props.globalFilterOptions || {}),
  ...(globalFilter.value !== undefined && {
    onGlobalFilterChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, globalFilter)
  }),
  ...(props.columnFiltersOptions || {}),
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
    onColumnResizingChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, columnSizingInfo)
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
  get manualSorting() {
    return isServerPagination.value;
  },
  onSortingChange: (updaterOrValue: any) => onSorting(updaterOrValue),
  ...(props.groupingOptions || {}),
  ...(grouping.value !== undefined && {
    onGroupingChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, grouping)
  }),
  ...(props.expandedOptions || {}),
  get getRowCanExpand() {
    return props.expandedOptions?.getRowCanExpand ?? (typeof slots.expanded === 'function' ? () => true : undefined);
  },
  ...(expanded.value !== undefined && {
    onExpandedChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, expanded)
  }),
  get manualPagination() {
    return !isPaginated.value || isServerPagination.value;
  },
  get rowCount() {
    return isServerPagination.value ? total.value : undefined;
  },
  ...(props.paginationOptions || {}),
  onPaginationChange: (updaterOrValue: any) => valueUpdater(updaterOrValue, paginationState),
  state: tableState
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

const virtualItems = computed(() => virtualizer ? virtualizer.value.getVirtualItems() : []);
const virtualPaddingTop = computed(() => virtualItems.value[0]?.start ?? 0);
const virtualPaddingBottom = computed(() => {
  const itemsLength = virtualizer ? virtualItems.value.length : 0;
  if (!virtualizer || itemsLength <= 0) {
    return 0;
  }

  return virtualizer.value.getTotalSize() - (virtualItems.value[itemsLength - 1]?.end ?? 0);
});

const hoveredRowId = ref<string | undefined>();
const columnReorderingOptions = computed(() => {
  if (!props.columnReordering) {
    return undefined;
  }

  const handleProps = {
    icon: 'lucide:grip-vertical',
    color: 'neutral' as const,
    variant: 'ghost' as const,
    size: 'xs' as const
  };

  return defu(typeof props.columnReordering === 'object' ? props.columnReordering : {}, {
    animationDuration: 240,
    handleProps
  });
});
const draggedColumnId = ref<string | null>(null);
const dropTargetColumnId = ref<string | null>(null);

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
  const props = Object.fromEntries(camelizeProps) as DataTableColumnProps<T>;

  const visible = normalizeBoolProps(props.visible) ?? true;
  const accessorKey = props.accessorKey ?? '';
  const accessorFn = typeof props.accessorFn === 'function' ? props.accessorFn : (row: T) => getObjectValue(row as any, accessorKey);
  const filterFn = typeof props.filterFn === 'function' || typeof props.filterFn === 'string' ? props.filterFn as DataTableFilterFnOption<T> : 'auto';
  const label = props.label ?? '';
  const enableHiding = visible ? normalizeBoolProps(props.enableHiding) : false;
  const enablePinning = normalizeBoolProps(props.enablePinning);
  const enableSorting = normalizeBoolProps(props.enableSorting);
  const enableMultiSort = normalizeBoolProps(props.enableMultiSort);
  const slot = (node.children || {} as unknown) as DataTableColumnSlots<T>;
  const columns = toArray(slot?.columns?.());
  const header = (ctx: DataTableHeaderContext<T, unknown>) => {
    if (!enableSorting) {
      return typeof slot.header === 'function' ? h(Fragment, null, slot.header({ ...ctx })) : label;
    }

    const sortingProps = {
      label,
      column: ctx.column,
      multiple: enableMultiSort
    };

    return h(DataTableHeaderSorting, sortingProps);
  };

  const cell = (ctx: DataTableCellContext<T, unknown>) => {
    if (typeof slot.default === 'function') {
      return h(Fragment, null, slot.default({ ...ctx, item: ctx.row.original }));
    }

    return getObjectValue(ctx.row.original as any, accessorKey);
  };

  const footer = (ctx: DataTableHeaderContext<T, any>) => h(Fragment, null, slot.footer({ ...ctx }));

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
    enableOrdering: normalizeBoolProps(props.enableOrdering),
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
  if (index === paginationState.value.pageIndex) {
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
    displayError(err);
  }
  finally {
    isLoading.value = false;
  }
}

function isColumnReorderable(header: DataTableHeader<T>) {
  const column = header.column;
  const columnDef = column.columnDef as DataTableColumnDef<T>;

  return !!columnReorderingOptions.value
    && !header.isPlaceholder
    && header.subHeaders.length === 0
    && !column.id.startsWith('__')
    && !column.getIsPinned()
    && columnDef.enableOrdering !== false;
}

function getColumnReorderLabel(header: DataTableHeader<T>) {
  return (header.column.columnDef as DataTableColumnDef<T>)?.label ?? header.column.id;
}

function resetColumnReorderState() {
  draggedColumnId.value = null;
  dropTargetColumnId.value = null;
}

function getColumnHeaderPositions() {
  const positions = new Map<string, number>();

  tableRef.value?.querySelectorAll<HTMLTableRowElement>('[data-column-order-id]').forEach((element) => {
    const columnId = element.dataset.columnOrderId;
    if (columnId) {
      positions.set(columnId, element.getBoundingClientRect().left);
    }
  });

  return positions;
}

function animateTableRow(element: HTMLTableRowElement, prevPositions: Map<string, number>, duration: number) {
  const columnId = element.dataset.columnOrderId;
  const previousLeft = columnId ? prevPositions.get(columnId) : undefined;
  if (previousLeft === undefined) {
    return;
  }

  const offsetX = previousLeft - element.getBoundingClientRect().left;
  if (offsetX === 0) {
    return;
  }

  const keyframes = [
    {
      transform: `translateX(${offsetX}px)`
    },
    {
      transform: 'translateX(0)'
    }
  ];

  element.animate(keyframes, {
    duration,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
  });
}

async function animateColumnOrder(previousPositions: Map<string, number>) {
  await nextTick();

  const duration = columnReorderingOptions.value?.animationDuration ?? 0;
  if (duration <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  tableRef.value?.querySelectorAll<HTMLTableRowElement>('[data-column-order-id]').forEach((element) => {
    animateTableRow(element, previousPositions, duration);
  });
}

function onColumnDragStart(event: DragEvent, columnId: string) {
  draggedColumnId.value = columnId;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnId);
  }
}

function onColumnDragEnter(event: DragEvent, header: DataTableHeader<T>) {
  if (!isColumnReorderable(header)) {
    return;
  }

  event.preventDefault();
  dropTargetColumnId.value = header.column.id;
}

function onColumnDragOver(event: DragEvent, header: DataTableHeader<T>) {
  if (!isColumnReorderable(header)) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

async function onColumnDrop(event: DragEvent, targetColumnId: string) {
  event.preventDefault();

  const sourceColumnId = draggedColumnId.value ?? event.dataTransfer?.getData('text/plain');
  if (!sourceColumnId || sourceColumnId === targetColumnId) {
    resetColumnReorderState();
    return;
  }

  const nextOrder = tableApi.getAllLeafColumns().map((column) => column.id);
  const oldIndex = nextOrder.indexOf(sourceColumnId);
  const targetIndex = nextOrder.indexOf(targetColumnId);
  if (oldIndex === -1 || targetIndex === -1) {
    resetColumnReorderState();
    return;
  }

  const previousPositions = getColumnHeaderPositions();
  nextOrder.splice(oldIndex, 1);
  nextOrder.splice(targetIndex, 0, sourceColumnId);
  columnOrder.value = nextOrder;

  await animateColumnOrder(previousPositions);
  props.onColumnReorder?.({
    columnId: sourceColumnId,
    targetColumnId,
    oldIndex,
    newIndex: nextOrder.indexOf(sourceColumnId),
    columnOrder: nextOrder
  });
  resetColumnReorderState();
}

function onRowSelect(e: Event, row: DataTableRow<T>) {
  if (typeof props.onSelect !== 'function') {
    return;
  }

  const target = e.target as HTMLElement;
  const isInteractive = target.closest('a, button, input, label, select, textarea');
  if (isInteractive) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  if ((e as KeyboardEvent).repeat) {
    return;
  }

  props.onSelect(e, row);
}

function onRowHover(e: Event, row: DataTableRow<T> | null) {
  if (typeof props.onHover !== 'function') {
    return;
  }

  hoveredRowId.value = row ? getResolvedRowId(row.original, row.index) : undefined;
  props.onHover(e, row);
}

function onRowContextmenu(e: Event, row: DataTableRow<T>) {
  if (!props.onContextmenu) {
    return;
  }

  if (Array.isArray(props.onContextmenu)) {
    props.onContextmenu.forEach((fn) => fn(e, row));
    return;
  }
  props.onContextmenu(e, row);
}

function getColumnStyles(column: DataTableColumn<T>): Record<string, string> {
  const styles: Record<string, string> = {};
  const pinned = column.getIsPinned();

  if (pinned === 'start') {
    styles.insetInlineStart = `${column.getStart(pinned)}px`;
  }
  else if (pinned === 'end') {
    styles.insetInlineEnd = `${column.getAfter(pinned)}px`;
  }

  return styles;
}

function getColumnPinningSection(column: DataTableColumn<T>) {
  const position = column.getIsPinned();
  if (!position) {
    return undefined;
  }

  return column.getIsFirstColumn(position) ? 'start' : column.getIsLastColumn(position) ? 'end' : 'middle';
}

function getColumnMeta(column: DataTableColumn<T>): DataTableColumnMeta<T> | undefined {
  return column.columnDef.meta as DataTableColumnMeta<T> | undefined;
}

function resolveValue<T, Arg = undefined>(prop: T | ((arg: Arg) => T), arg?: Arg): T | undefined {
  if (typeof prop === 'function') {
    // @ts-expect-error: TS can't know if prop is a function here
    return prop(arg);
  }
  return prop;
}

function resolveHeaderClass(header: DataTableHeader<T>) {
  const isDragged = draggedColumnId.value === header.column.id;
  const isDropped = dropTargetColumnId.value === header.column.id && draggedColumnId.value !== header.column.id;
  return [
    isColumnReorderable(header) && 'p-0 transition-[opacity,background-color,box-shadow] duration-200',
    isDragged && 'opacity-40',
    isDropped && 'bg-primary/10 ring-1 ring-primary/30',
    props.ui?.th,
    resolveValue(getColumnMeta(header.column)?.class?.th, header)
  ];
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
  selectedRows,
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
        :data-hovered="hoveredRowId === getResolvedRowId(row.original, row.index)"
        :role="props.onSelect ? 'button' : undefined"
        :tabindex="props.onSelect ? 0 : undefined"
        data-slot="tr"
        :class="uiTable.tr({ class: [props.ui?.tr, resolveValue(meta.class?.tr, row)] })"
        :style="[resolveValue(meta.style?.tr, row), style]"
        @click="onRowSelect($event, row)"
        @keydown.self.exact.enter.space="onRowSelect($event, row)"
        @pointerenter="onRowHover($event, row)"
        @pointerleave="onRowHover($event, null)"
        @contextmenu="onRowContextmenu($event, row)"
      >
        <td
          v-for="cell in row.getVisibleCells()"
          :key="cell.id"
          :colspan="resolveValue(getColumnMeta(cell.column)?.colspan?.td, cell)"
          :rowspan="resolveValue(getColumnMeta(cell.column)?.rowspan?.td, cell)"
          data-slot="td"
          :data-label="getHeaderLabel(cell.column)"
          :data-pinned="cell.column.getIsPinned()"
          :data-pinned-index="cell.column.getIsPinned() ? cell.column.getPinnedIndex() : undefined"
          :data-pinned-section="getColumnPinningSection(cell.column)"
          :class="uiTable.td({
            class: [props.ui?.td, resolveValue(getColumnMeta(cell.column)?.class?.td, cell)],
            pinned: !!cell.column.getIsPinned()
          })"
          :style="[
            getColumnStyles(cell.column),
            resolveValue(getColumnMeta(cell.column)?.style?.td, cell)
          ]"
        >
          <FlexRender
            :cell="cell"
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
            tr: uiTable.tr({ class: props.ui?.tr }),
            td: uiTable.td({ class: props.ui?.td })
          }"
        />
      </TransitionGroup>
    </DefineRowTemplate>

    <DefineTableTemplate>
      <table
        ref="tableRef"
        data-slot="base"
        :class="uiTable.base({ class: [props.ui?.base] })"
      >
        <caption
          v-if="!!slots.caption"
          data-slot="caption"
          :class="uiTable.caption({ class: props.ui?.caption })"
        >
          <slot name="caption" />
        </caption>

        <thead
          data-slot="thead"
          :class="uiTable.thead({ class: props.ui?.thead })"
        >
          <tr
            v-for="headerGroup in tableApi?.getHeaderGroups() ?? []"
            :key="headerGroup.id"
            data-slot="tr"
            :class="uiTable.tr({ class: props.ui?.tr })"
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
              :data-column-order-id="isColumnReorderable(header) ? header.column.id : undefined"
              :data-reorderable="isColumnReorderable(header) || undefined"
              :data-dragging="draggedColumnId === header.column.id || undefined"
              :data-drop-target="dropTargetColumnId === header.column.id && draggedColumnId !== header.column.id || undefined"
              :class="uiTable.th({
                class: resolveHeaderClass(header),
                pinned: !!header.column.getIsPinned()
              })"
              :style="[
                getColumnStyles(header.column),
                resolveValue(getColumnMeta(header.column)?.style?.th, header)
              ]"
              @dragstart="isColumnReorderable(header) && onColumnDragStart($event, header.column.id)"
              @dragenter="onColumnDragEnter($event, header)"
              @dragover="onColumnDragOver($event, header)"
              @drop="isColumnReorderable(header) && onColumnDrop($event, header.column.id)"
              @dragend="resetColumnReorderState"
            >
              <div
                v-if="isColumnReorderable(header)"
                class="flex h-full w-full items-center gap-2"
                :class="props.variant === 'separated' ? 'px-4 py-1' : 'px-4 py-3.5'"
              >
                <UButton
                  class="cursor-grab active:cursor-grabbing"
                  v-bind="columnReorderingOptions?.handleProps"

                  :draggable="true"
                  :aria-label="`Move ${getColumnReorderLabel(header)} column`"
                  @click.stop
                />

                <div class="min-w-0 flex-1">
                  <FlexRender :header="header" />
                </div>
              </div>

              <FlexRender
                v-else-if="!header.isPlaceholder"
                :header="header"
              />
            </th>
          </tr>

          <tr
            data-slot="separator"
            :class="uiTable.separator({ class: props.ui?.separator })"
          />
        </thead>
        <tbody
          data-slot="tbody"
          :class="uiTable.tbody({ class: props.ui?.tbody })"
        >
          <slot
            name="body-top"
            :table="tableApi"
            :ui="{
              tr: uiTable.tr({ class: props.ui?.tr }),
              td: uiTable.td({ class: props.ui?.td })
            }"
          />

          <template v-if="rows.length">
            <ReuseRowTemplate
              v-for="row in topRows"
              :key="row.id"
              :row="row"
            />

            <template v-if="virtualizer">
              <tr
                v-if="virtualPaddingTop > 0"
                :style="{ height: `${virtualPaddingTop}px` }"
                aria-hidden="true"
              >
                <td :colspan="tableApi.getAllLeafColumns().length" />
              </tr>
              <template
                v-for="virtualRow in virtualizer.getVirtualItems()"
                :key="centerRows[virtualRow.index]?.id ?? `virtual-${virtualRow.index}`"
              >
                <ReuseRowTemplate
                  v-if="centerRows[virtualRow.index]"
                  :row="centerRows[virtualRow.index]!"
                  :style="{ height: `${virtualRow.size}px` }"
                />
              </template>

              <tr
                v-if="virtualPaddingBottom > 0"
                :style="{ height: `${virtualPaddingBottom}px` }"
                aria-hidden="true"
              >
                <td :colspan="tableApi.getAllLeafColumns().length" />
              </tr>
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
              :class="uiTable.loading({ class: props.ui?.loading })"
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
              :class="uiTable.empty({ class: props.ui?.empty })"
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
              tr: uiTable.tr({ class: props.ui?.tr }),
              td: uiTable.td({ class: props.ui?.td })
            }"
          />
        </tbody>
        <tfoot
          v-if="hasFooter"
          :class="uiTable.tfoot({ class: props.ui?.tfoot })"
          data-slot="tfoot"
        >
          <tr
            data-slot="separator"
            :class="uiTable.separator({ class: props.ui?.separator })"
          />
          <tr
            v-for="footerGroup in tableApi.getFooterGroups()"
            :key="footerGroup.id"
            data-slot="tr"
            :class="uiTable.tr({ class: props.ui?.tr })"
          >
            <th
              v-for="header in footerGroup.headers"
              :key="header.id"
              :colSpan="header.colSpan"
              data-slot="th"
              :class="uiTable.th({ class: props.ui?.th })"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :footer="header"
              />
            </th>
          </tr>
        </tfoot>
      </table>
    </DefineTableTemplate>

    <div
      ref="wrapperRef"
      :class="uiTable.root({ class: ['w-full flex-1', props.ui?.root] })"
    >
      <ReuseTableTemplate />
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
            :model-value="paginationState.pageSize"
            :items="perPages"
            @update:model-value="onChangePerPage"
          />
        </div>
      </div>

      <UPagination
        :page="paginationState.pageIndex + 1"
        :items-per-page="paginationState.pageSize"
        :total="tableApi?.getRowCount() || 0"
        :ui="props.uiPagination"
        class="flex justify-end"
        @update:page="onChangePage"
      />
    </div>
  </Primitive>
</template>
