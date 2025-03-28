<script setup lang="ts">
import { CalendarDateTime, getLocalTimeZone } from '@internationalized/date';
import { formatDate } from '@vueuse/core';
import type { ButtonProps } from '#ui/components/Button.vue';
import type { CalendarProps } from '#ui/components/Calendar.vue';
import type { DatepickerValue } from '~/types/datepicker';

interface Props {
  id?: string;
  modelValue?: DatepickerValue;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  calendarSize?: CalendarProps<any, any>['size'];
  icon?: string;
  trailingIcon?: string;
  min?: Date;
  max?: Date;
  creator?: (value: Date) => DatepickerValue;
  formatter?: (value: Date) => string;
  placeholder?: string;
  dismissable?: boolean;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  variant: 'outline',
  placeholder: 'Pick a date',
  icon: 'i-lucide-calendar',
  creator: (value: Date) => value as DatepickerValue,
  dismissable: true,
  teleport: true,
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: DatepickerValue): void;
  (e: 'blur', event: FocusEvent): void;
}>();

const {
  emitFormBlur,
  emitFormFocus,
  id,
  size: formGroupSize,
  color,
  disabled } = useFormField<Props>(props, { deferInputValidation: true });
const { size: buttonGroupSize } = useButtonGroup<Props>(props);

const buttonSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const open = ref(false);

const _model = ref();
const vmodel = computed({
  get: () => {
    const value = props.modelValue ?? _model.value;
    if (!value || (Number.isNaN(new Date(value).valueOf()))) {
      return undefined;
    }

    const d = new Date(value);
    return new CalendarDateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  },
  set: (val) => {
    if (val) {
      const value = (val as CalendarDateTime).toDate(getLocalTimeZone());
      _model.value = value;
      emits('update:modelValue', props.creator(value));
    }
  }
});

const timeModel = computed(() => {
  if (!vmodel.value) {
    return undefined;
  }

  return vmodel.value.toDate(getLocalTimeZone());
});

const minDate = computed(() => {
  if (!props.min || (props.min && Number.isNaN(new Date(props.min).valueOf()))) {
    return undefined;
  }

  const d = new Date(props.min);
  return new CalendarDateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
});

const maxDate = computed(() => {
  if (!props.max || (props.max && Number.isNaN(new Date(props.max).valueOf()))) {
    return undefined;
  }

  const d = new Date(props.max);
  return new CalendarDateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
});

const displayDate = computed(() => {
  if (!vmodel.value || (vmodel.value && typeof vmodel.value.toDate !== 'function')) {
    return '';
  }

  const val = vmodel.value as CalendarDateTime;
  return format(val.toDate(getLocalTimeZone()));
});

function format(date: Date) {
  if (!props.formatter || (props.formatter && typeof props.formatter !== 'function')) {
    return formatDate(date, 'DD/MM/YYYY h:mm A');
  }

  return props.formatter(date);
}

function onUpdateTime(val: Date) {
  vmodel.value = new CalendarDateTime(
    val.getFullYear(),
    val.getMonth() + 1,
    val.getDate(),
    val.getHours(),
    val.getMinutes(),
    val.getSeconds()
  );
}

function onBlur(event: FocusEvent) {
  emitFormBlur();
  emits('blur', event);
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :content="{ align: 'start' }"
    :dismissible="props.dismissable"
    :portal="props.teleport"
  >
    <UButton
      :id="id"
      :color="color"
      :variant="props.variant"
      class="justify-start font-normal group hover:bg-white"
      :ui="{
        leadingIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700'
      }"
      block
      :icon="props.icon"
      :trailing-icon="props.trailingIcon"
      :size="buttonSize"
      :disabled="disabled"
      @blur="onBlur"
      @focus="emitFormFocus"
    >
      <span :class="{ 'text-slate-400': !displayDate }">{{ displayDate ? displayDate : props.placeholder }}</span>
    </UButton>

    <template #content>
      <UCalendar
        v-model="vmodel"
        class="p-2"
        :min-value="minDate"
        :max-value="maxDate"
        :size="props.calendarSize"
      />
      <div class="w-full flex justify-center px-2 pt-2 pb-4">
        <TimePicker
          :model-value="timeModel"
          @update:model-value="(val) => onUpdateTime(val as Date)"
        />
      </div>
    </template>
  </UPopover>
</template>
