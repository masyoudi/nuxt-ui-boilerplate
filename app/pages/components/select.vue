<script setup lang="ts">
import { toArray } from '~~/shared/utils';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'select']
});

useHead({
  title: 'Select'
});

const autocomplete = ref();
const multiselect = ref([]);
</script>

<template>
  <div class="w-full p-5">
    <div class="w-full shadow rounded-xl bg-white space-y-5 p-5">
      <UFormField
        label="Autocomplete"
      >
        <AutoComplete
          v-model:selected="autocomplete"
          url="/todos"
          placeholder="Search something great..."
          :transform-fetch-data="(res) => toArray(res).map((item) => ({ value: item.id, label: item.task }))"
          :paginated="false"
        />
      </UFormField>
      <UFormField label="Multiselects">
        <MultiSelect
          v-model:selected="multiselect"
          url="/todos"
          paginated
          class="mb-7"
          color="neutral"
          item-color="primary"
          item-variant="subtle"
          placeholder="Search anything..."
          :transform-fetch-data="(res) => toArray(res).map((val) => ({ value: val.id, label: val.task }))"
          :debounce="500"
        />
      </UFormField>

      <UFormField label="Input">
        <UInput
          size="md"
          placeholder="Input text..."
          class="w-full"
        />
      </UFormField>
    </div>
  </div>
</template>
