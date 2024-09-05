<template>
  <div class="relative w-full">
    <!-- Filters -->
    <div class="relative flex items-center gap-5 px-4 py-3">
      <div class="relative inline-flex items-center gap-1.5">
        <span class="text-sm leading-5">Show</span>
        <div class="relative inline-flex">
          <USelect v-model="perPage" :options="[10, 25, 50, 75, 100]" class="w-20" size="md" @update:model-value="refetch" />
        </div>
        <span class="text-sm">entries</span>
      </div>
      <UInput
        v-if="props.searchable"
        v-model="search"
        icon="i-heroicons-magnifying-glass-20-solid"
        :placeholder="props.placeholderSearch"
        size="md"
        @keyup.enter="refetch"
      />
    </div>

    <!-- Table -->
    <UTable
      v-model="selectedRows"
      v-model:sort="sort"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      sort-asc-icon="i-heroicons-arrow-up"
      sort-desc-icon="i-heroicons-arrow-down"
      sort-mode="manual"
      class="w-full"
      :ui="ui.table"
      @update:sort="refetch"
    >
      <template v-for="column in columns.filter((v) => !!v.slotHeader)" #[column.slotHeaderName]="opt">
        <component :is="() => column?.slotHeader?.(opt)"></component>
      </template>

      <template v-for="column in columns.filter((v) => !!v.slotData)" #[column.slotDataName]="opt">
        <component :is="() => column?.slotData?.(opt)"></component>
      </template>

      <template v-if="isExpandable" #expand="{ row, index }">
        <slot name="expand" :row="row" :index="index"></slot>
      </template>
    </UTable>

    <!-- Pagination -->
    <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div>
        <slot name="bottom-left"></slot>
      </div>

      <div class="flex justify-end">
        <UPagination
          v-model="page"
          :page-count="parseInt(String(perPage))"
          :total="total"
          :ui="ui.pagination"
          :disabled="loading"
          @update:model-value="refetch"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { VNode } from 'vue-demi';
import { findNodeChildrens } from '@/utils/helpers';

interface ReturnGetData {
  data: Record<string, any>[];
  total?: number;
}

interface Sorting {
  column: string;
  direction: 'asc' | 'desc';
}

interface Props {
  getData: (params: Record<string, any>) => ReturnGetData | Promise<ReturnGetData>;
  selected?: Record<string, any>[];
  selectable?: boolean;
  searchable?: boolean;
  paginated?: boolean;
  numbering?: boolean;
  sorting?: Partial<Sorting>;
  serverPagination?: boolean;
  placeholderSearch?: string;
}

interface ExpandProps {
  row: Record<string, any>;
  index: number;
}

const props = withDefaults(defineProps<Props>(), {
  paginated: true,
  searchable: true,
  serverPagination: true,
  numbering: true,
  placeholderSearch: 'Search...',
  sorting: () => ({})
});

const emits = defineEmits<{
  (e: 'update:selected', val?: Record<string, any>): void;
}>();

const slots = defineSlots<{
  'default'(): VNode[];
  'bottom-left'(): VNode[];
  'expand'(slotProps: ExpandProps): VNode[];
}>();

const ui = /* ui */ {
  table: {
    td: {
      base: 'max-w-[0]'
    }
  },
  pagination: {
    wrapper: 'flex items-center gap-1',
    rounded: '!rounded-full min-w-[32px] justify-center',
    default: {
      activeButton: {
        variant: 'outline'
      }
    }
  }
};

const columnNumbering = computed(() => ({
  key: '_numbering',
  label: 'No.',
  visible: props.numbering,
  slotDataName: '_numbering-data',
  slotData: ({ index }: any) => {
    return h('span', page.value <= 1 ? index + 1 : (page.value - 1) * perPage.value + (index + 1));
  },
  slotHeader: undefined,
  slotHeaderName: '_numbering-header'
}));

const columns = computed(() => {
  const nodes = findNodeChildrens(slots.default(), 'DataTableColumn').map((vnode, i) => {
    const _props = vnode.props;

    return {
      index: i,
      key: String(_props?.key),
      label: _props?.label ?? '',
      sortable: typeof _props?.sortable === 'boolean' ? _props?.sortable : _props?.sortable === '',
      visible: typeof _props?.visible === 'boolean' ? _props?.visible : true,
      slotData: !!(vnode.children as any)?.default ? slotData(vnode) : undefined,
      slotHeader: !!(vnode.children as any)?.header ? slotHeader(vnode) : undefined,
      slotDataName: String(_props?.key).concat('-data'),
      slotHeaderName: String(_props?.key).concat('-header'),
      class: _props?.class,
      rowClass: _props?.['row-class'] ?? _props?.rowClass
    };
  });

  return [columnNumbering.value, ...nodes].filter((n) => n.visible);
});

const loading = ref(true);
const data = ref<Record<string, any>[]>([]);
const total = ref(0);
const rows = computed(() => data.value);

const _selected = ref<Record<string, any>>([]);
const selectedRows = computed({
  get: () => (typeof props.selected !== 'undefined' || props.selectable ? props.selected ?? _selected.value : undefined),
  set: (value) => {
    _selected.value = value ?? [];
    emits('update:selected', value);
  }
});

// Pagination
const sort = ref<Sorting>(props.sorting as any);
const page = ref(1);
const perPage = ref(10);

const search = ref('');
const filter = computed(() => ({
  page: page.value,
  perpage: perPage.value,
  q: search.value,
  column: sort.value.column,
  direction: sort.value.direction
}));
const isServerPagination = computed(() => props.serverPagination);

const isExpandable = computed(() => !!slots?.expand);

function slotData(vnode: any) {
  const _props = vnode.props;
  const tag = _props?.tag ?? 'span';

  return (option: any) => h(tag, { ..._props }, vnode.children.default(option));
}

function slotHeader(vnode: any) {
  const _props = vnode.props;
  const tag = _props?.headerTag ?? 'span';
  const attrs = {
    class: _props?.headerClass
  };

  return (option: any) => h(tag, { ...attrs }, vnode.children.header(option));
}

/**
 * Get data
 */
async function fetchData() {
  try {
    if (typeof props.getData !== 'function') {
      return;
    }

    loading.value = true;
    const func = props.getData(filter.value);
    const isPromise = func instanceof Promise;
    await nextTick();

    const { data: _data, total: _total } = isPromise ? await func : func;

    data.value = _data;
    total.value = isServerPagination.value ? _total ?? 0 : _data.length;

    loading.value = false;
  } catch {
    loading.value = false;
  }
}

function refetch() {
  if (!isServerPagination.value) {
    return;
  }

  data.value = [];
  loading.value = true;

  setTimeout(fetchData, 450);
}

onMounted(() => {
  fetchData();
});
</script>
