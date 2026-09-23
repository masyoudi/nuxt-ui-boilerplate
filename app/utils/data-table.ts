import type {
  Cell,
  CellContext,
  Column,
  ColumnDef,
  FilterFnOption,
  Header,
  HeaderContext,
  Row,
  RowData,
  Table,
  TableOptions
} from '@tanstack/vue-table';
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludes as filterArrIncludes,
  filterFn_equals as filterEquals,
  filterFn_inDateRange as filterInDateRange,
  filterFn_inNumberRange as filterInNumberRange,
  filterFn_includesString as filterIncludesString,
  filterFn_weakEquals as filterWeakEquals,
  globalFilteringFeature,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures
} from '@tanstack/vue-table';
import { getObjectValue } from '~~/shared/utils';

function nestedIncludeString(row: { original: RowData }, columnId: string, filterValue: unknown) {
  const value = getObjectValue(row.original as Record<string, any>, columnId);
  return String(value ?? '').toLowerCase().includes(String(filterValue).toLowerCase());
}

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  groupedRowModel: createGroupedRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  filterFns: {
    includesString: filterIncludesString,
    inNumberRange: filterInNumberRange,
    equals: filterEquals,
    arrIncludes: filterArrIncludes,
    inDateRange: filterInDateRange,
    weakEquals: filterWeakEquals,
    nestedIncludeString
  },
  tableMeta: metaHelper<DataTableMeta<any>>(),
  columnMeta: metaHelper<DataTableColumnMeta<any, any>>()
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableTanStackOptions<T extends RowData> = TableOptions<DataTableFeatures, T>;

export type DataTableRow<T extends RowData> = Row<DataTableFeatures, T>;

export type DataTableApi<T extends RowData> = Table<DataTableFeatures, T>;

export type DataTableColumn<T extends RowData, TValue = unknown> = Column<DataTableFeatures, T, TValue>;

export type DataTableCell<T extends RowData, TValue = unknown> = Cell<DataTableFeatures, T, TValue>;

export type DataTableHeader<T extends RowData, TValue = unknown> = Header<DataTableFeatures, T, TValue>;

export type DataTableCellContext<T extends RowData, TValue = unknown> = CellContext<DataTableFeatures, T, TValue>;

export type DataTableHeaderContext<T extends RowData, TValue = unknown> = HeaderContext<DataTableFeatures, T, TValue>;

export type DataTableFilterFnOption<T extends RowData> = FilterFnOption<DataTableFeatures, T>;

type MetaStyle = string | Record<string, string>;

export interface DataTableColumnMeta<T extends RowData, TValue = unknown> {
  class?: {
    th?: string | ((header: DataTableHeader<T, TValue>) => string);
    td?: string | ((cell: DataTableCell<T, TValue>) => string);
  };
  style?: {
    th?: MetaStyle | ((header: DataTableHeader<T, TValue>) => MetaStyle);
    td?: MetaStyle | ((cell: DataTableCell<T, TValue>) => MetaStyle);
  };
  colspan?: {
    td?: string | ((cell: DataTableCell<T, TValue>) => string);
  };
  rowspan?: {
    td?: string | ((cell: DataTableCell<T, TValue>) => string);
  };
}

export interface DataTableMeta<T extends RowData> {
  class?: {
    tr?: string | ((row: DataTableRow<T>) => string);
  };
  style?: {
    tr?: MetaStyle | ((row: DataTableRow<T>) => MetaStyle);
  };
}

export type DataTableColumnDef<T extends RowData, TValue = unknown> = ColumnDef<DataTableFeatures, T, TValue> & {
  meta?: DataTableColumnMeta<T, TValue>;
};
