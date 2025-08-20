<script setup lang="ts">
import { refDebounced } from '@vueuse/core';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'table']
});

useHead({
  title: 'Table'
});

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

const checkedRows = ref([]);

const items = shallowRef(
  [...Array.from({ length: 100 })].map((_, i) => ({
    id: i + 1,
    todo: `Todo ${i + 1}`,
    description: `Task todo ${i + 1}`
  }))
);

async function fetchData(params: Record<string, any>) {
  const query = {
    ...params,
    modules: 'person,internet'
  };

  const { res } = await useRequest('/api-dev/test', {
    method: 'GET',
    query
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
        :numbering="false"
        show-mobile-sorting
        @pointermove="onPointermove"
        @hover="onHover"
      >
        <TableColumn
          label="ID"
          accessor="id"
        />
        <TableColumn
          v-slot="{ item }"
          label="Name"
          sortable
          accessor="fullName"
        >
          {{ item.person.fullName }}
        </TableColumn>
        <TableColumn
          v-slot="{ item }"
          label="Email"
          sortable
          accessor="email"
        >
          {{ item.internet.email }}
        </TableColumn>
        <TableColumn
          v-slot="{ item }"
          label="Job"
        >
          {{ item.person.jobTitle }}
        </TableColumn>
      </DataTable>

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
            {{ selectedRow?.original?.person?.fullName }}
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
