<style>
:root {
  --vc-gray-50: rgb(var(--color-gray-50));
  --vc-gray-100: rgb(var(--color-gray-100));
  --vc-gray-200: rgb(var(--color-gray-200));
  --vc-gray-300: rgb(var(--color-gray-300));
  --vc-gray-400: rgb(var(--color-gray-400));
  --vc-gray-500: rgb(var(--color-gray-500));
  --vc-gray-600: rgb(var(--color-gray-600));
  --vc-gray-700: rgb(var(--color-gray-700));
  --vc-gray-800: rgb(var(--color-gray-800));
  --vc-gray-900: rgb(var(--color-gray-900));
}

.vc-primary {
  --vc-accent-50: rgb(var(--color-primary-50));
  --vc-accent-100: rgb(var(--color-primary-100));
  --vc-accent-200: rgb(var(--color-primary-200));
  --vc-accent-300: rgb(var(--color-primary-300));
  --vc-accent-400: rgb(var(--color-primary-400));
  --vc-accent-500: rgb(var(--color-primary-500));
  --vc-accent-600: rgb(var(--color-primary-600));
  --vc-accent-700: rgb(var(--color-primary-700));
  --vc-accent-800: rgb(var(--color-primary-800));
  --vc-accent-900: rgb(var(--color-primary-900));
}
</style>

<template>
  <UPopover v-model:open="open" :popper="{ placement: 'bottom-start' }" :disabled="props.disabled">
    <UInput
      :model-value="label"
      :placeholder="props.placeholder"
      :icon="props.icon"
      :ui="{ wrapper: 'w-full' }"
      readonly
      :disabled="props.disabled"
    ></UInput>

    <template #panel="{ close }">
      <VDatePicker v-if="Array.isArray(date)" v-model.range="range" :columns="2" v-bind="{ ...attrs, ...$attrs }" />
      <VDatePicker v-else v-model="date" v-bind="{ ...attrs, ...$attrs }" @dayclick="close" />
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { DatePicker as VDatePicker } from 'v-calendar';
import { format as formatDate, isValid as isValidDate } from 'date-fns';
import 'v-calendar/dist/style.css';

type DateT = Date | number | string;

interface Props {
  modelValue?: DateT | DateT[];
  format?: string;
  placeholder?: string;
  parser?: (val?: DateT | DateT[]) => DateT | DateT[];
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  format: 'dd/MM/yyyy',
  icon: 'i-heroicons:calendar',
  parser: (val?: DateT | DateT[]) => {
    if (!val) {
      return '';
    }

    if (val) {
      return Array.isArray(val) ? val.map((v) => new Date(v).toISOString()) : new Date(val).toISOString();
    }

    return val;
  },
  disabled: false
});
const emits = defineEmits<{
  (e: 'update:modelValue', val?: DateT | DateT[]): void;
}>();

const open = ref(false);

const _date = ref<DateT | DateT[]>();
const date = computed({
  get: () => {
    const value = props.modelValue ?? _date.value;
    return Array.isArray(value) ? [...value] : value;
  },
  set: (value) => {
    _date.value = value;
    emits('update:modelValue', typeof props.parser === 'function' ? props.parser(value) : value);
  }
});

const range = computed({
  get: () => {
    if (!Array.isArray(date.value)) {
      return null;
    }

    const [start, end] = date.value as [DateT, DateT];
    return { start, end };
  },
  set: (value) => {
    if (value?.start && value?.end) {
      open.value = false;
      date.value = [value.start, value.end];
    }
  }
});

const label = computed(() => {
  if (!date.value) {
    return '';
  }

  const dates = (Array.isArray(date.value) ? date.value : [date.value]).filter((_date) => isValidDate(new Date(_date)));
  return dates.map((d) => formatDate(new Date(d), props.format)).join(' - ');
});

const attrs = {
  transparent: true,
  borderless: true,
  color: 'primary',
  'is-dark': {
    selector: 'html',
    darkClass: 'dark'
  },
  'first-day-of-week': 2
};
</script>
