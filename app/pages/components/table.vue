<script setup lang="ts">
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

async function fetchData(params: Record<string, any>) {
  const { data } = await useRequest('/todos', {
    method: 'GET',
    query: params
  });

  return { data: data, total: 200 };
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
      >
        <TableColumn
          label="Task"
          accessor="task"
          sortable
        />
        <TableColumn
          label="Description"
          accessor="description"
          sortable
        />
      </DataTable>

      <div class="text-md mb-2">
        Checked Rows
      </div>
      <div class="w-full overflow-x-auto">
        <pre>{{ checkedRows }}</pre>
      </div>
    </UCard>

    <UCard>
      <div class="text-lg mb-5">
        Client Side Pagination
      </div>
      <DataTable
        v-model:items="items"
      >
        <TableColumn
          label="Todo"
          accessor="todo"
        />
        <TableColumn
          label="Description"
          accessor="description"
        />
      </DataTable>
    </UCard>
  </div>
</template>
