<template>
  <UContainer class="grid grid-cols-1 gap-8 py-10">
    <UCard>
      <DataTable :get-data="fetchData" :sorting="{ column: 'title', direction: 'asc' }">
        <DataTableColumn key="title" label="Title" sortable> </DataTableColumn>
        <DataTableColumn v-slot="{ row }" key="completed" label="Status" sortable>
          <UBadge
            size="xs"
            :label="row.completed ? 'Completed' : 'In Progress'"
            :color="row.completed ? 'emerald' : 'orange'"
            variant="subtle"
          />
        </DataTableColumn>
        <DataTableColumn v-slot="{ row }" key="actions" label="Actions">
          <DataTableActions
            on-edit="/"
            :on-delete="() => toast.add({ description: 'Deleting ' + row.id, color: 'red' })"
          ></DataTableActions>
        </DataTableColumn>
      </DataTable>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'components-data-table']
});

useHead({
  title: 'Data Table'
});

const toast = useToast();

async function fetchData(params: any) {
  const query = {
    q: params.q,
    _page: params.page,
    _limit: params.perpage,
    _sort: params.column,
    _order: params.direction
  };

  const res = await $fetch<any[]>('https://jsonplaceholder.typicode.com/todos', {
    query
  });

  return { data: res, total: res.length >= params.perpage ? 200 : res.length };
}
</script>
