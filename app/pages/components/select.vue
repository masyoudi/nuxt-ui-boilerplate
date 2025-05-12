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
const multiselects = ref<any[]>([]);
</script>

<template>
  <div class="w-full p-5">
    <div class="w-full shadow rounded-xl bg-white space-y-5 p-5">
      <UFormField label="Autocomplete">
        <UButtonGroup
          class="w-full"
        >
          <UButton>Group</UButton>
          <MultiSelect
            v-model="autocomplete"
            url="/todos"
            paginated
            placeholder="Search anything..."
            :transform-fetch-data="(res) => toArray(res).map((val) => ({ value: val.id, label: val.task }))"
            :debounce="500"
          />
        </UButtonGroup>
      </UFormField>

      <UFormField label="Multiselect">
        <MultiSelect
          v-model="multiselects"
          multiple
          url="/todos"
          paginated
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
