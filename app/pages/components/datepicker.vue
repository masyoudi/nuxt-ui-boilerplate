<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'datepicker']
});

useHead({
  title: 'Datepicker'
});

const datePicker = ref('');
const datePickerRange = ref([]);
const datetimePicker = ref('');
</script>

<template>
  <div class="w-full p-5">
    <UCard>
      <UFormField
        label="Datepicker"
        class="mb-5"
      >
        <DatePicker
          v-model="datePicker"
        />
      </UFormField>

      <UFormField
        label="Datepicker Range"
        class="mb-5"
      >
        <DatePicker
          v-model="datePickerRange"
          range
        />
      </UFormField>

      <UFormField
        label="Datetimepicker"
        class="mb-5"
      >
        <DatetimePicker v-model="datetimePicker" />
      </UFormField>
    </UCard>
  </div>
</template>
