<script setup lang="ts" generic="IsRange extends boolean = false">
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { formatDate } from '@vueuse/core';
import type { ButtonProps } from '#ui/components/Button.vue';
import type { CalendarProps } from '#ui/components/Calendar.vue';
import type { DatepickerValue } from '~/types/datepicker';
import { toArray } from '~~/shared/utils';

type RangeValue = {
  start: CalendarDate;
  end: CalendarDate;
};

type TModel<R extends boolean = false> = R extends true ? DatepickerValue[] : DatepickerValue;

interface Props<R extends boolean> {
  id?: string;
  modelValue?: TModel<R>;
  range?: R & boolean;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  calendarSize?: CalendarProps<any, any>['size'];
  icon?: string;
  trailingIcon?: string;
  min?: Date;
  max?: Date;
  creator?: (value: Date) => TModel<R>;
  formatter?: (value: Date) => string;
  placeholder?: string;
  dismissable?: boolean;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props<IsRange>>(), {
  color: 'neutral',
  variant: 'outline',
  placeholder: 'Select date',
  creator: (value: Date) => value as TModel<IsRange>,
  dismissable: true,
  teleport: true,
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: DatepickerValue | DatepickerValue[]): void;
  (e: 'focus', event: FocusEvent): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', event: Event): void;
}>();

const open = ref(false);
const hasModel = ref(!props.range ? typeof props.modelValue !== 'undefined' : Array.isArray(props.modelValue));
const {
  emitFormChange,
  emitFormInput,
  emitFormBlur,
  emitFormFocus,
  id,
  size: formGroupSize,
  color,
  ariaAttrs,
  disabled
} = useFormField<Props<IsRange>>(props, { deferInputValidation: true });
const { size: buttonGroupSize } = useButtonGroup<Props<IsRange>>(props);

const buttonSize = computed(() => buttonGroupSize.value || formGroupSize.value);
const buttonId = ref(id.value ?? useId());
const buttonElement = ref<HTMLButtonElement>();

const _model = ref();
const vmodel = computed({
  get: () => {
    const value = hasModel.value ? props.modelValue : _model.value;
    if (
      !value
      || (!props.range && Number.isNaN(new Date(value).valueOf()))
      || (props.range && !Array.isArray(value))
      || (props.range && Array.isArray(value) && value.length !== 2)
      || (props.range && Array.isArray(value) && value.some((val) => Number.isNaN(new Date(val !== null ? val : undefined).valueOf())))
    ) {
      return undefined as any;
    }

    if (props.range) {
      const [start, end] = toArray(value).map((v) => new Date(v)) as [Date, Date];

      return {
        start: new CalendarDate(start.getFullYear(), start.getMonth() + 1, start.getDate()),
        end: new CalendarDate(end.getFullYear(), end.getMonth() + 1, end.getDate())
      };
    }

    const d = new Date(value);
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  },
  set: (val) => {
    if (props.range && isValueRange(val as RangeValue)) {
      const { start, end } = val as RangeValue;
      const values = [start.toDate(getLocalTimeZone()), new Date(end.toDate(getLocalTimeZone()).setHours(23, 59, 59, 999))];
      _model.value = values;
      emits('update:modelValue', values.map((v) => props.creator(v)) as DatepickerValue[]);
    }

    if (!props.range && val) {
      const value = (val as CalendarDate).toDate(getLocalTimeZone());
      _model.value = value;
      emits('update:modelValue', props.creator(value));
    }

    open.value = false;
  }
});

const minDate = computed(() => {
  if (!props.min || (props.min && Number.isNaN(new Date(props.min).valueOf()))) {
    return undefined;
  }

  const d = new Date(props.min);
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
});

const maxDate = computed(() => {
  if (!props.max || (props.max && Number.isNaN(new Date(props.max).valueOf()))) {
    return undefined;
  }

  const d = new Date(props.max);
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
});

const displayDate = computed(() => {
  if (!vmodel.value || (props.range && !isValueRange(vmodel.value as RangeValue))) {
    return '';
  }

  if (props.range) {
    const { start, end } = vmodel.value as RangeValue;
    return `${format(start.toDate(getLocalTimeZone()))} - ${format(end.toDate(getLocalTimeZone()))}`;
  }

  const val = vmodel.value as CalendarDate;
  return format(val.toDate(getLocalTimeZone()));
});

/**
 * Format display date
 * @param date - Date value
 */
function format(date: Date) {
  if (!props.formatter || (props.formatter && typeof props.formatter !== 'function')) {
    return formatDate(date, 'DD/MM/YYYY');
  }

  return props.formatter(date);
}

/**
 * Check is range date
 * @param value - Range date value
 */
function isValueRange(value: RangeValue) {
  return (
    Object.keys(value).length === 2
    && Object.keys(value).every((k) => ['start', 'end'].includes(k))
    && typeof value?.start === 'object'
    && typeof value?.end === 'object'
  );
}

/**
 * Close popover
 */
function close() {
  open.value = false;
}

/**
 * Handle blur event
 * @param event - Focus event
 */
function onBlur(event: FocusEvent) {
  emits('blur', event);
  emitFormBlur();
}

/**
 * Listener on update open popover
 */
function onUpdateOpen(isOpen: boolean) {
  if (!isOpen) {
    const blurEvent = new FocusEvent('blur', {
      relatedTarget: buttonElement.value
    });
    onBlur(blurEvent);
    return;
  }

  const focusEvent = new FocusEvent('focus', {
    relatedTarget: buttonElement.value
  });
  emits('focus', focusEvent);
  emitFormFocus();
}

/**
 * Handler on update value calendar
 * @param value - Calendar value
 */
function onUpdate(value: any) {
  const eventInit = {
    target: {
      value
    }
  };

  const event = new Event('change', eventInit as any);
  emits('change', event);

  emitFormChange();
  emitFormInput();
}

/**
 * Handle keyboard arrow up & down
 */
function onKeydownArrowUpAndDown() {
  if (!open.value) {
    open.value = true;
  }
}

watch(() => props.modelValue, () => {
  if (
    (props.range && Array.isArray(props.modelValue))
    || (!props.range && typeof props.modelValue !== 'undefined')
  ) {
    hasModel.value = true;
  }
});

onMounted(() => {
  buttonElement.value = document.getElementById(buttonId.value) as HTMLButtonElement;
});
</script>

<template>
  <UPopover
    v-model:open="open"
    :ui="{ content: 'z-50' }"
    :content="{ align: 'start' }"
    :dismissible="props.dismissable"
    :portal="props.teleport"
    @update:open="onUpdateOpen"
  >
    <slot
      :open="open"
      :display-date="displayDate"
      :disabled="disabled"
    >
      <UButton
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :id="buttonId"
        :color="color"
        :variant="props.variant"
        class="justify-start font-normal group hover:bg-white"
        :ui="{
          leadingIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700',
          trailingIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700'
        }"
        block
        :icon="props.icon"
        :trailing-icon="props.trailingIcon"
        :size="buttonSize"
        :disabled="disabled"
        @keydown.up.prevent="onKeydownArrowUpAndDown"
        @keydown.down.prevent="onKeydownArrowUpAndDown"
      >
        <span
          class="overflow-hidden whitespace-nowrap"
          :class="{ 'text-slate-400': !displayDate }"
        >
          {{ displayDate ? displayDate : props.placeholder }}
        </span>
      </UButton>
    </slot>

    <template #content>
      <UCalendar
        v-model="vmodel"
        class="p-2"
        :min-value="minDate"
        :max-value="maxDate"
        :range="props.range"
        :size="props.calendarSize"
        @update:model-value="onUpdate"
      />

      <slot
        name="footer"
        :onclose="close"
      />
    </template>
  </UPopover>
</template>
