<script setup lang="ts">
import { refDebounced } from '@vueuse/core';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'table']
});

useHead({
  title: 'Table'
});

const checkedRows = ref([]);

const items = shallowRef(
  [...Array.from({ length: 100 })].map((_, i) => ({
    id: i + 1,
    todo: `Todo ${i + 1}`,
    description: `Task todo ${i + 1}`
  }))
);

const anchor = ref({ x: 0, y: 0 });

const reference = computed(() => ({
  getBoundingClientRect: () => ({
    width: 0,
    height: 0,
    left: anchor.value.x,
    right: anchor.value.x,
    top: anchor.value.y,
    bottom: anchor.value.y,
    ...anchor.value
  }) as DOMRect
}));

const open = ref(false);
const openDebounced = refDebounced(open, 10);
const selectedRow = ref<Record<string, any> | null>(null);
const columnPinning = ref({
  left: [],
  right: ['description']
});

function onPointermove(ev: PointerEvent) {
  anchor.value.x = ev.clientX;
  anchor.value.y = ev.clientY;
}

function onHover(_e: Event, row: Record<string, any> | null) {
  selectedRow.value = row;

  open.value = !!row;
}

async function fetchData(params: Record<string, any>) {
  const { res } = await useRequest('/todos', {
    method: 'GET',
    query: params
  });

  return { data: toArray(res.data), total: 200 };
}
</script>

<template>
  <div class="w-full p-5">
    <UCard class="mb-5">
      <div class="text-lg mb-5">
        Server Side Pagination
      </div>
      <DataTable
        v-model:selection="checkedRows"
        :get-data="fetchData"
        selectable
        multi-sort
        :selectable-order="0"
        :numbering-order="1"
        show-mobile-sorting
        @pointermove="onPointermove"
        @hover="onHover"
      >
        <TableColumn
          label="Task"
          accessor="task"
          sortable
        />
        <TableColumn
          v-slot="{ item }"
          label="Description"
          accessor="description"
          sortable
        >
          {{ item.description }}
        </TableColumn>
      </DataTable>

      <div class="text-md mb-2">
        Checked Rows
      </div>
      <div class="w-full overflow-x-auto">
        <pre>{{ checkedRows }}</pre>
      </div>

      <UPopover
        v-if="selectedRow"
        :open="openDebounced"
        :reference="reference"
        :content="{
          side: 'top',
          sideOffset: 16,
          updatePositionStrategy: 'always'
        }"
      >
        <template #content>
          <div class="px-4 py-2.5">
            {{ selectedRow?.original?.task }}
          </div>
        </template>
      </UPopover>
    </UCard>

    <UCard>
      <div class="text-lg mb-5">
        Client Side Pagination
      </div>
      <DataTable
        v-model:items="items"
        v-model:column-pinning="columnPinning"
        :mobile-cards="false"
      >
        <TableColumn
          label="Todo"
          accessor="todo"
        />
        <TableColumn
          label="Description"
          accessor="description"
        >
          <template #default="{ item }">
            {{ item.description }}
          </template>

          <template #footer="{ data, visibleData }">
            <p class="text-right">
              Todo : {{ visibleData.length }}/{{ data.length }}
            </p>
          </template>
        </TableColumn>
      </DataTable>
    </UCard>
  </div>
</template>
