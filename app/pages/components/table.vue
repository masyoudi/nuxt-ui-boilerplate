<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { cn } from 'tailwind-variants';
import type { Row } from '@tanstack/vue-table';

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
  right: ['person.jobType']
});
const columnOrder = ref(['__numbering', '__selection', 'todo', 'description', 'status.label']);

const TODO_STATUS = [
  {
    value: 0,
    label: 'All'
  },
  {
    value: 1,
    label: 'Done'
  },
  {
    value: 2,
    label: 'In Progress'
  }
];

const todos = shallowRef(Array.from({ length: 1000 }, (_, index) => {
  const id = index + 1;

  return {
    id,
    todo: `Todo ${id}`,
    description: `Task todo ${id}`,
    status: TODO_STATUS[(id % 2) === 0 ? 1 : 2]!
  };
}));

const virtualItems = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: `4600-${i}`,
  date: '2024-03-11T15:30:00',
  status: 'paid',
  email: 'james.anderson@example.com',
  amount: 594
})));

const tableClientPagingRef = useTemplateRef('tableClientPagingRef');

const filterTodo = ref({
  status: TODO_STATUS[0]!
});

async function fetchData(params: Record<string, any>) {
  const query = {
    ...params,
    modules: 'person,internet'
  };

  const { res } = await useRequest('/faker', {
    method: 'GET',
    query
  });

  return { data: toArray(res.data), total: 200 };
}

function onPointermove(ev: PointerEvent) {
  anchor.value.x = ev.clientX;
  anchor.value.y = ev.clientY;
}

function onHover(_e: Event, row: Record<string, any> | null) {
  selectedRow.value = row;

  open.value = !!row;
}

function bindSearchTable(columnId: string) {
  return {
    'modelValue': String(tableClientPagingRef.value?.api.getColumn(columnId)?.getFilterValue() ?? ''),
    'onUpdate:modelValue': (event: string) => tableClientPagingRef.value?.api.getColumn(columnId)?.setFilterValue(event)
  };
}

function globalFilterTodo(row: Row<(typeof todos.value)[number]>) {
  const { status } = filterTodo.value;
  const isMatches = [
    status && status.value > 0 ? row.original.status.value === status.value : true
  ];

  return isMatches.some((isMatching) => isMatching);
}
</script>

<template>
  <div class="w-full p-5">
    <UCard class="mb-5">
      <div class="text-lg font-semibold mb-5">
        Server Side Pagination &amp; Responsive Table
      </div>
      <DataTable
        :get-data="fetchData"
        selection
        :numbering="false"
        pagination="server"
        mobile-cards
        @pointermove="onPointermove"
        @hover="onHover"
      >
        <DataTableColumn
          label="ID"
          accessor-key="id"
        />
        <DataTableColumn
          v-slot="{ item }"
          label="Name"
          accessor-key="fullName"
        >
          {{ item.person.fullName }}
        </DataTableColumn>
        <DataTableColumn
          v-slot="{ item }"
          label="Email"
          accessor-key="email"
        >
          {{ item.internet.email }}
        </DataTableColumn>
        <DataTableColumn
          v-slot="{ item }"
          label="Job"
        >
          {{ item.person.jobTitle }}
        </DataTableColumn>
      </DataTable>
    </UCard>

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

    <UCard class="mb-5">
      <div class="text-lg font-semibold mb-5">
        Client Side Pagination
      </div>
      <DataTable
        ref="tableClientPagingRef"
        v-model:items="todos"
        v-model:global-filter="filterTodo"
        v-model:column-order="columnOrder"
        :mobile-cards="false"
        variant="bordered"
        :global-filter-options="{
          enableGlobalFilter: true,
          globalFilterFn: globalFilterTodo
        }"
        selection
      >
        <DataTableColumn
          label="Todo"
          accessor-key="todo"
        />
        <DataTableColumn
          label="Description"
          accessor-key="description"
        >
          <template #default="{ item }">
            {{ item.description }}
          </template>

          <template #footer>
            <p class="text-right">
              Total Todo
            </p>
          </template>
        </DataTableColumn>
        <DataTableColumn
          label="Status"
          accessor-key="status.label"
          filter-fn="nestedIncludeString"
        >
          <template #header>
            <div class="flex justify-between w-full">
              <div>Status</div>
              <div>
                <UPopover>
                  <UButton
                    icon="ph:funnel-bold"
                    variant="soft"
                    size="sm"
                  />

                  <template #content="{ close }">
                    <div class="w-56 p-4">
                      <div class="text-sm font-semibold mb-3">
                        Filter Status
                      </div>
                      <USelectMenu
                        v-model="filterTodo.status"
                        :items="TODO_STATUS"
                        placeholder="Select status"
                        class="w-full mb-5"
                      />

                      <div class="w-full flex justify-end gap-2">
                        <UButton
                          label="Close"
                          color="neutral"
                          variant="outline"
                          size="sm"
                          @click="close()"
                        />
                        <UButton
                          label="Apply"
                          size="sm"
                          @click="() => {
                            tableClientPagingRef?.api.setGlobalFilter({ ...filterTodo })
                            close()
                          }"
                        />
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </div>
          </template>
          <template #default="{ item }">
            <UBadge
              :color="item.status.value === 1 ? 'success' : 'info'"
              variant="soft"
            >
              {{ item.status.label }}
            </UBadge>
          </template>

          <template #footer>
            <p class="text-right">
              {{ todos.length }}
            </p>
          </template>
        </DataTableColumn>

        <template #body-top="{ ui }">
          <tr :class="ui.tr">
            <td :class="cn(ui.td, 'p-0')">
              <!--  -->
            </td>
            <td :class="cn(ui.td, 'p-0')">
              <!--  -->
            </td>
            <td :class="cn(ui.td, 'p-0')">
              <UInput
                v-bind="bindSearchTable('todo')"
                placeholder="Search todo..."
                variant="ghost"
                size="lg"
                :ui="{
                  root: 'w-full',
                  base: 'rounded-none'
                }"
              />
            </td>
            <td :class="cn(ui.td, 'p-0')">
              <UInput
                v-bind="bindSearchTable('description')"
                placeholder="Search description..."
                variant="ghost"
                size="lg"
                :ui="{
                  root: 'w-full',
                  base: 'rounded-none'
                }"
              />
            </td>
            <td :class="cn(ui.td, 'p-0')">
              <UInput
                v-bind="bindSearchTable('status.label')"
                placeholder="Search status..."
                variant="ghost"
                size="lg"
                :ui="{
                  root: 'w-full',
                  base: 'rounded-none'
                }"
              />
            </td>
          </tr>
        </template>
      </DataTable>
    </UCard>

    <UCard class="mb-5">
      <div class="text-lg font-semibold mb-5">
        With Column Pinning
      </div>
      <DataTable
        v-model:column-pinning="columnPinning"
        :get-data="fetchData"
        pagination="server"
        variant="bordered"
        :ui="{
          th: 'data-[pinned=right]:bg-primary-50',
          td: 'data-[pinned=right]:bg-primary-50'
        }"
      >
        <DataTableColumn
          label="First Name"
          accessor-key="person.firstName"
        />

        <DataTableColumn
          label="Last Name"
          accessor-key="person.lastName"
        />

        <DataTableColumn
          v-slot="{ item }"
          label="Gender"
          accessor-key="person.gender"
        >
          {{ String(item.person.gender).toLowerCase().includes('man') ? 'Male' : 'Female' }}
        </DataTableColumn>

        <DataTableColumn
          label="Username"
          accessor-key="internet.username"
        />

        <DataTableColumn
          label="Email"
          accessor-key="internet.email"
        />

        <DataTableColumn
          label="Bio"
          accessor-key="person.bio"
        />

        <DataTableColumn
          label="Job Type"
          accessor-key="person.jobType"
        />
        <DataTableColumn
          label="Job Title"
          accessor-key="person.jobTitle"
        />
      </DataTable>
    </UCard>

    <UCard
      class="mb-5"
      :ui="{
        body: 'p-0 sm:p-0'
      }"
    >
      <div class="text-lg font-semibold px-5 pt-5">
        Virtualization
      </div>
      <DataTable
        :items="virtualItems"
        :pagination="false"
        virtualize
        :ui="{
          root: 'h-150'
        }"
      >
        <DataTableColumn
          v-for="(_col, key) in virtualItems.at(0)"
          :key="`virtual.${key}`"
          :label="ucFirst(key)"
          :accessor-key="key"
        />
      </DataTable>
    </UCard>

    <UCard class="mb-5">
      <div class="text-lg font-semibold mb-5">
        Table Striped
      </div>

      <DataTable
        :get-data="fetchData"
        pagination="server"
        :row-selection-options="{
          enableRowSelection: (r) => r.original.id > 1
        }"
        variant="striped"
        selection
        mobile-cards
      >
        <DataTableColumn
          v-slot="{ row }"
          label="Expand"
        >
          <UButton
            icon="lucide:chevron-down"
            :ui="{
              leadingIcon: `transition-transform ${row.getIsExpanded() ? 'duration-200 rotate-180' : ''}`
            }"
            @click="row.toggleExpanded()"
          />
        </DataTableColumn>
        <DataTableColumn
          label="Name"
          enable-sorting
          accessor-key="person.fullName"
          filter-fn="nestedIncludeString"
        />
        <DataTableColumn
          v-slot="{ row }"
          label="Email"
          enable-sorting
          accessor-key="email"
        >
          {{ row.original.internet.email }}
        </DataTableColumn>
        <DataTableColumn
          v-slot="{ row }"
          label="Job"
        >
          {{ row.original.person.jobTitle }}
        </DataTableColumn>

        <template #expanded="{ row, table, ui }">
          <tr
            :class="ui.tr"
          >
            <td
              :class="ui.td"
              :colspan="table.getVisibleFlatColumns().length"
            >
              <div class="font-semibold mb-2">
                Expanded: {{ row.original.id }}
              </div>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Officia tempore voluptas commodi nisi doloremque numquam magnam voluptatibus soluta,
                beatae molestiae laboriosam possimus nesciunt aperiam reprehenderit corporis voluptate?
                Vel, consectetur quis.
              </p>
            </td>
          </tr>
        </template>
      </DataTable>
    </UCard>

    <UCard class="mb-5">
      <div class="text-lg font-semibold mb-5">
        Table Separated
      </div>

      <DataTable
        :get-data="fetchData"
        pagination="server"
        variant="separated"
        selection
        :mobile-cards="true"
      >
        <DataTableColumn
          label="Name"
          accessor-key="person.fullName"
        />
        <DataTableColumn
          v-slot="{ row }"
          label="Email"
          accessor-key="email"
        >
          {{ row.original.internet.email }}
        </DataTableColumn>
        <DataTableColumn
          v-slot="{ row }"
          label="Job"
        >
          {{ row.original.person.jobTitle }}
        </DataTableColumn>
      </DataTable>
    </UCard>
  </div>
</template>
