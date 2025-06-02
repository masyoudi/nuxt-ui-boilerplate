<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'datepicker']
});

useHead({
  title: 'Datepicker'
});

const datepicker = ref('');
const datepickerRange = ref([]);
const datetimepicker = ref('');
const timepicker = ref('');
</script>

<template>
  <div class="w-full p-5">
    <div class="w-full shadow rounded-xl bg-white p-5">
      <UFormField
        label="Datepicker"
        class="mb-5"
      >
        <DatePicker v-model="datepicker" />
      </UFormField>
      <UFormField
        label="Datepicker Range"
        class="mb-5"
      >
        <DatePicker
          v-model="datepickerRange"
          range
        />
      </UFormField>
      <UFormField
        label="Datetimepicker"
        class="mb-5"
      >
        <DatetimePicker
          v-model="datetimepicker"
          icon="lucide:calendar"
        />
      </UFormField>
      <UFormField
        label="Timepicker"
        class="mb-5"
      >
        <UButtonGroup class="w-full">
          <UButton label="Timepicker" />
          <TimePicker
            v-model="timepicker"
            class="grow shrink"
            color="error"
          />
        </UButtonGroup>
      </UFormField>
    </div>
  </div>
</template>
