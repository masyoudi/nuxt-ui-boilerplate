<script setup lang="ts">
import type { CellContext, ColumnSort, HeaderContext, Row, useVueTable } from '@tanstack/vue-table';
import { promiseTimeout } from '@vueuse/core';
import TableHeaderSelection from './TableHeaderSelection.vue';
import TableRowSelection from './TableRowSelection.vue';
import TableHeaderSorting from './TableHeaderSorting.vue';
import type { TableFetchParams } from '~/types/table';
import { toArray } from '~~/shared/utils';
import { findNodeChildrens } from '~~/app/utils/helpers';

interface GetDataResult {
  data: Record<string, any>[];
  total?: number;
}

interface Props {
  items?: Record<string, any>[];
  getData?: (params: TableFetchParams) => GetDataResult | Promise<GetDataResult>;
  sorting?: ColumnSort[];
  perPage?: number;
  paginated?: boolean;
  serverPagination?: boolean;
  paginationSimple?: boolean;
  selection?: Record<string, any>[];
  selectionField?: string;
  selectable?: boolean;
  selectableOrder?: number;
  numbering?: boolean;
  numberingLabel?: string;
  numberingOrder?: number;
  searchable?: boolean;
  searchFilter?: (currentItem: Record<string, any>, searchTerm: string) => boolean;
  multiSort?: boolean;
  placeholderSearch?: string;
}

const props = withDefaults(defineProps<Props>(), {
  paginated: true,
  serverPagination: true,
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
  (e: 'update:perPage', val: number): void;
  (e: 'update:sorting', val: ColumnSort[]): void;
  (e: 'update:selection', val: Record<string, any>[]): void;
  (e: 'removed'): void;
}>();

const slots = defineSlots<{
  default: () => VNode[];
  expanded: (slotProps: { row: Row<any> }) => VNode[];
  filter: (slotProps: { loading: boolean; data: Record<string, any>[] }) => VNode[];
  toolbar: () => VNode[];
}>();

const page = ref(1);
const _perPage = ref(10);
const perPageValue = computed({
  get: () => props.perPage ?? _perPage.value,
  set: (val) => {
    _perPage.value = val;
    emits('update:perPage', val);
  }
});
const perPages = [10, 25, 50, 75, 100];
const search = ref('');
const isServerPagination = computed(() => !Array.isArray(props.items) && props.serverPagination && props.paginated);

const _data = ref<Record<string, any>[]>([]);
const data = computed({
  get: () => Array.isArray(props.items) ? props.items : _data.value,
  set: (val) => {
    _data.value = val;
    emits('update:items', val);
  }
});

const total = ref(0);
const loading = ref(!Array.isArray(props.items));

const _sorting = ref<ColumnSort[]>([]);
const sortingCols = computed({
  get: () => props.sorting ?? _sorting.value,
  set: (val) => {
    _sorting.value = val;
    emits('update:sorting', val);
  }
});

const filteredData = computed(() => data.value.filter((val) => props.searchFilter(val, search.value)));

const visibleData = computed(() => {
  if (isServerPagination.value) {
    return data.value;
  }

  if (!props.paginated || (props.paginated && filteredData.value.length <= perPageValue.value)) {
    return filteredData.value;
  }

  const start = (page.value - 1) * perPageValue.value;
  const end = start + perPageValue.value;
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

const _checked = ref<Record<string, any>[]>([]);
const checked = computed({
  get: () => props.selection ?? _checked.value,
  set: (val) => {
    _checked.value = val;
    emits('update:selection', val);
  }
});

const selectionColumn = computed(() => ({
  id: '__select',
  accessorKey: '__selection',
  label: 'Selection',
  header: ({ table: tbl }: HeaderContext<any, any>) => h(TableHeaderSelection, {
    table: tbl,
    checked: checked.value,
    field: props.selectionField,
    onChange(val) {
      checked.value = val;
    }
  }),
  cell: ({ row }: CellContext<any, any>) => h(TableRowSelection, {
    row,
    checked: checked.value,
    field: props.selectionField,
    onChange() {
      const value = row.original;
      if (!checked.value.some((item) => item?.[props.selectionField] === value?.[props.selectionField])) {
        checked.value.push(value);
        return;
      }

      checked.value = checked.value.filter((item) => item?.[props.selectionField] !== value?.[props.selectionField]);
    }
  })
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

    return h('span', page.value <= 1 ? index + 1 : (page.value - 1) * perPageValue.value + (index + 1));
  }
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
          return h(TableHeaderSorting, { label, column: ctx.column, multiple: props.multiSort });
        }

        return children?.header?.(ctx) ?? label;
      },
      cell: (ctx: CellContext<any, any>) => {
        return children?.default?.({ ...ctx, item: ctx.row.original }) ?? ctx.row.original?.[key] ?? '';
      }
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
  return (isServerPagination.value ? data.value.length : visibleData.value.length) >= perPageValue.value;
});

const mounted = ref(true);

const uiTable = {
  th: 'bg-[#F8FAFC] text-[#6B7280]',
  tr: 'data-[selected=true]:bg-transparent',
  td: 'whitespace-normal'
};

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
      perpage: perPageValue.value,
      limit: perPageValue.value,
      offset: perPageValue.value * (page.value - 1),
      q: search.value,
      sorting: sortingCols.value.map((v) => ({ col: v.id, dir: v.desc ? 'desc' : 'asc' }))
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
  perPageValue.value = val;
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <div class="relative">
        <div class="flex flex-wrap gap-3">
          <div class="inline-flex items-center gap-x-2">
            <div class="inline-flex text-sm">
              Show
            </div>
            <USelect
              v-model:model-value="perPageValue"
              :items="perPages"
              class="w-18"
              @update:model-value="(val) => onPerPageChange(val)"
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
              @keyup.enter="onSearch"
              @input="onInputSearch"
            />
          </div>
        </div>
      </div>
    </div>

    <UTable
      v-if="mounted"
      ref="table"
      v-model:sorting="sortingCols"
      v-model:expanded="expanded"
      v-model:column-visibility="columnVisibility"
      :data="visibleData"
      :columns="columns"
      :loading="loading"
      class="flex-1 border-t border-t-slate-200"
      :ui="uiTable"
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

      <template #empty>
        <div class="flex flex-col py-20">
          <div class="flex justify-center mb-2">
            <UIcon
              :name="loading ? 'lucide:loader' : 'lucide:database'"
              :class="`w-8 h-8 ${loading ? 'animate-spin' : ''}`"
            />
          </div>
          <p class="text-center">
            {{ loading ? 'Loading...' : 'No results found.' }}
          </p>
        </div>
      </template>
    </UTable>

    <div
      class="flex border-t border-t-slate-200 py-4"
    >
      <template v-if="props.paginated">
        <UPagination
          v-if="!props.paginationSimple"
          v-model:page="page"
          active-color="primary"
          :total="totalPagination"
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
      </template>
    </div>
  </div>
</template>
