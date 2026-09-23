<script setup lang="ts" generic="IsRange extends boolean = false">
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { formatDate } from '@vueuse/core';
import type { MaskedDateOptions, MaskedPatternOptions } from 'imask';
import { IMaskComponent } from 'vue-imask';
import { cn } from 'tailwind-variants';
import type { ButtonProps } from '#ui/components/Button.vue';
import type { CalendarProps } from '#ui/components/Calendar.vue';
import type { DatepickerPopoverProps, DatepickerValue } from '~/types/datepicker';
import theme from '~/theme/datepicker';
import { useFieldGroup } from '@nuxt/ui/composables';

defineOptions({
  inheritAttrs: false
});

type RangeValue = {
  start: CalendarDate;
  end: CalendarDate;
};

type Hours = [number, number, number, number];

type TModel<R extends boolean = false> = R extends true ? DatepickerValue[] : DatepickerValue;

type DatePickerCalendarProps<R extends boolean> = Omit<
  CalendarProps<R>,
  | 'modelValue'
  | 'defaultValue'
  | 'range'
  | 'multiple'
  | 'minValue'
  | 'maxValue'
  | 'disabled'
  | 'type'
>;

type DatePickerUISlots = Pick<
  typeof theme.slots,
  | 'root'
  | 'input'
  | 'leading'
  | 'leadingIcon'
  | 'trailing'
  | 'trailingIcon'
  | 'clearAction'
  | 'clearIcon'
  | 'calendarAction'
>;

interface Props<R extends boolean> {
  id?: string;
  name?: string;
  range?: R & boolean;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  calendar?: DatePickerCalendarProps<R>;
  icon?: string;
  trailingIcon?: string;
  timeRange?: 'start' | 'end';
  min?: Date;
  max?: Date;
  creator?: (value: Date) => DatepickerValue;
  formatter?: (value: Date) => string;
  mask?: Partial<MaskedDateOptions>;
  placeholder?: string;
  rangePlaceholder?: string;
  popover?: DatepickerPopoverProps;
  clearable?: boolean;
  clearIcon?: string;
  disabled?: boolean;
  ui?: Partial<DatePickerUISlots>;
}

const props = withDefaults(defineProps<Props<IsRange>>(), {
  color: 'neutral',
  variant: 'outline',
  placeholder: 'DD/MM/YYYY',
  rangePlaceholder: 'DD/MM/YYYY - DD/MM/YYYY',
  creator: (value: Date) => value,
  trailingIcon: 'lucide:calendar',
  clearable: true,
  clearIcon: 'lucide:x',
  disabled: false
});
const model = defineModel<TModel<IsRange>>();

const emits = defineEmits<{
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', event: Event): void;
}>();

const open = ref(false);
const {
  emitFormChange,
  emitFormInput,
  emitFormBlur,
  emitFormFocus,
  id,
  name,
  size: formGroupSize,
  color,
  ariaAttrs,
  disabled
} = useFormField<Props<IsRange>>(props, { deferInputValidation: true });
const { size: fieldGroupSize } = useFieldGroup<Props<IsRange>>(props);

const startHours: Hours = [0, 0, 0, 0];
const endHours: Hours = [23, 59, 59, 999];

const inputSize = computed(() => fieldGroupSize.value || formGroupSize.value);
const inputId = ref(id.value ?? useId());
const rootElement = useTemplateRef<HTMLDivElement>('rootElement');

const inputValue = ref('');
const inputDate = ref<Date>();

const singleCalendarValue = computed(() => {
  if (props.range) {
    return undefined;
  }

  const value = model.value;
  if (value === undefined || Array.isArray(value)) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return undefined;
  }

  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
});

const rangeCalendarValue = computed<RangeValue | null>(() => {
  if (!props.range) {
    return null;
  }

  const value = model.value;
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }

  const [start, end] = value.map((item) => new Date(item));
  if (!start || !end || Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    return null;
  }

  return {
    start: new CalendarDate(start.getFullYear(), start.getMonth() + 1, start.getDate()),
    end: new CalendarDate(end.getFullYear(), end.getMonth() + 1, end.getDate())
  };
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

const dateMaskOptions = computed(() => ({
  mask: Date,
  pattern: 'd{/}`m{/}`Y',
  format: formatInputDate,
  parse: parseInputDate,
  min: normalizeDateLimit(props.min),
  max: normalizeDateLimit(props.max),
  autofix: 'pad' as const,
  overwrite: true,
  ...props.mask
}) as MaskedDateOptions);

const rangeDateMaskOptions: MaskedPatternOptions = {
  mask: '00{/}00{/}0000 - 00{/}00{/}0000',
  overwrite: true
};

const displayDate = computed(() => {
  if (rangeCalendarValue.value) {
    const { start, end } = rangeCalendarValue.value;
    return `${format(start.toDate(getLocalTimeZone()))} - ${format(end.toDate(getLocalTimeZone()))}`;
  }

  if (singleCalendarValue.value) {
    return format(singleCalendarValue.value.toDate(getLocalTimeZone()));
  }

  return '';
});

const isClearable = computed(() => props.clearable && inputValue.value !== '');

const ui = computed(() => theme({
  size: inputSize.value,
  color: color.value,
  variant: props.variant,
  hasValue: displayDate.value !== ''
}));

const popoverReference = computed(() => rootElement.value ? rootElement.value : undefined);
const popoverContent = computed(() => ({
  align: 'end' as const,
  ...props.popover?.content
}));

const popoverUi = computed(() => ({
  ...props.popover?.ui,
  content: cn('z-50', props.popover?.ui?.content)
}));

function normalizeDateLimit(value?: Date) {
  if (!value || Number.isNaN(new Date(value).valueOf())) {
    return undefined;
  }

  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatInputDate(value: Date | null) {
  if (!value) {
    return '';
  }

  return formatDate(value, 'DD/MM/YYYY');
}

function parseInputDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  return isValid ? date : null;
}

function isWithinDateLimits(value: Date) {
  const min = normalizeDateLimit(props.min);
  const max = normalizeDateLimit(props.max);
  const date = normalizeDateLimit(value);

  return !!date && (!min || date >= min) && (!max || date <= max);
}

function parseRangeInput(value: string) {
  const [startValue, endValue, ...rest] = value.split(' - ');
  if (!startValue || !endValue || rest.length > 0) {
    return undefined;
  }

  const start = parseInputDate(startValue);
  const end = parseInputDate(endValue);
  if (!start || !end || !isWithinDateLimits(start) || !isWithinDateLimits(end) || start > end) {
    return undefined;
  }

  return [start, end] as const;
}

function syncInputValues(values: Date[]) {
  const [start, end] = values;
  const dates = props.range && start && end ? [start, end] : start ? [start] : [];

  inputDate.value = props.range ? undefined : start;
  inputValue.value = dates.map(formatInputDate).join(' - ');
}

function getModelDates() {
  const modelValue = model.value;

  if (props.range) {
    if (!Array.isArray(modelValue) || modelValue.length !== 2) {
      return [];
    }

    const values = modelValue.map((value) => new Date(value));
    return values.every((value) => !Number.isNaN(value.valueOf())) ? values : [];
  }

  if (modelValue === undefined || Array.isArray(modelValue)) {
    return [];
  }

  const value = new Date(modelValue);
  return Number.isNaN(value.valueOf()) ? [] : [value];
}

function getInputHours(position: 'start' | 'end'): Hours {
  if (props.range) {
    return position === 'start' ? startHours : endHours;
  }

  const current = new Date();
  const currentHours: Hours = [
    current.getHours(),
    current.getMinutes(),
    current.getSeconds(),
    current.getMilliseconds()
  ];
  return props.timeRange === 'start' ? startHours : props.timeRange === 'end' ? endHours : currentHours;
}

function withInputHours(value: Date, position: 'start' | 'end') {
  const date = new Date(value);
  date.setHours(...getInputHours(position));
  return date;
}

function onInputAccept(value: string) {
  emitFormInput();

  if (!props.range && value.length !== 10) {
    inputDate.value = undefined;
  }
}

function onInputComplete(value: Date | null) {
  if (!value || Number.isNaN(value.valueOf())) {
    return;
  }

  inputDate.value = value;
  const date = withInputHours(value, 'start');
  model.value = props.creator(date) as TModel<IsRange>;
  onUpdate(date);
}

function onRangeInputComplete(value: string) {
  const range = parseRangeInput(value);
  if (!range) {
    return;
  }

  const values = [
    withInputHours(range[0], 'start'),
    withInputHours(range[1], 'end')
  ];
  model.value = values.map((date) => props.creator(date)) as TModel<IsRange>;
  onUpdate(values);
}

function onMaskedInputBlur() {
  const isValid = props.range ? !!parseRangeInput(inputValue.value) : !!inputDate.value;

  if (inputValue.value !== '' && isValid) {
    return;
  }

  if (inputValue.value === '') {
    onClear();
    return;
  }

  syncInputValues(getModelDates());
}

function format(date: Date) {
  if (!props.formatter || (props.formatter && typeof props.formatter !== 'function')) {
    return formatDate(date, 'DD/MM/YYYY');
  }

  return props.formatter(date);
}

function isValueRange(value: unknown): value is RangeValue {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const range = value as Partial<RangeValue>;
  return range.start instanceof CalendarDate && range.end instanceof CalendarDate;
}

function close() {
  open.value = false;
}

function onBlur(event: FocusEvent) {
  emits('blur', event);
  emitFormBlur();
}

function onUpdateOpen(isOpen: boolean) {
  if (!isOpen) {
    const blurEvent = new FocusEvent('blur', {
      relatedTarget: rootElement.value
    });
    onBlur(blurEvent);
    return;
  }

  const focusEvent = new FocusEvent('focus', {
    relatedTarget: rootElement.value
  });
  emits('focus', focusEvent);
  emitFormFocus();
}

function onSingleCalendarUpdate(value: unknown) {
  if (!(value instanceof CalendarDate)) {
    return;
  }

  const current = new Date();
  const currentHours: Hours = [
    current.getHours(),
    current.getMinutes(),
    current.getSeconds(),
    current.getMilliseconds()
  ];
  const hours = props.timeRange === 'start' ? startHours : props.timeRange === 'end' ? endHours : currentHours;
  const date = new Date(value.toDate(getLocalTimeZone()).setHours(...hours));

  model.value = props.creator(date) as TModel<IsRange>;
  syncInputValues([date]);
  open.value = false;
  onUpdate(date);
}

function onRangeCalendarUpdate(value: unknown) {
  if (!isValueRange(value)) {
    return;
  }

  const values = [
    new Date(value.start.toDate(getLocalTimeZone()).setHours(...startHours)),
    new Date(value.end.toDate(getLocalTimeZone()).setHours(...endHours))
  ];

  model.value = values.map((date) => props.creator(date)) as TModel<IsRange>;
  syncInputValues(values);
  open.value = false;
  onUpdate(values);
}

function onUpdate(value: unknown) {
  const event = new Event('change');
  Object.defineProperty(event, 'target', { value: { value } });
  emits('change', event);

  emitFormChange();
  emitFormInput();
}

function onClear() {
  model.value = (props.range ? [] : undefined) as TModel<IsRange> | undefined;
  syncInputValues([]);
  onUpdate(undefined);
}

function onWatch() {
  syncInputValues(getModelDates());
}

watch(model, onWatch, {
  immediate: true,
  deep: true
});
</script>

<template>
  <div
    ref="rootElement"
    v-bind="{ ...$attrs, ...ariaAttrs }"
    :class="ui.root({ class: props.ui?.root })"
  >
    <span
      v-if="props.icon"
      :class="ui.leading({ class: props.ui?.leading })"
    >
      <UIcon
        :name="props.icon"
        :class="ui.leadingIcon({ class: props.ui?.leadingIcon })"
      />
    </span>

    <IMaskComponent
      v-if="props.range"
      :id="inputId"
      v-model="inputValue"
      v-bind="rangeDateMaskOptions"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :name="name"
      :placeholder="props.rangePlaceholder"
      :class="ui.input({ class: props.ui?.input })"
      :disabled="disabled"
      @accept:masked="onInputAccept($event)"
      @complete:masked="onRangeInputComplete($event)"
      @blur="onMaskedInputBlur"
    />

    <IMaskComponent
      v-else
      :id="inputId"
      v-model="inputValue"
      v-bind="dateMaskOptions"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :name="name"
      :placeholder="props.placeholder"
      :class="ui.input({ class: props.ui?.input })"
      :disabled="disabled"
      @accept:masked="onInputAccept($event)"
      @complete:typed="onInputComplete($event)"
      @blur="onMaskedInputBlur"
    />

    <span :class="ui.trailing({ class: props.ui?.trailing })">
      <button
        v-if="isClearable"
        type="button"
        aria-label="Clear date"
        :class="ui.clearAction({ class: props.ui?.clearAction })"
        :disabled="disabled"
        @click.prevent.stop="onClear"
      >
        <UIcon
          :name="props.clearIcon"
          :class="ui.clearIcon({ class: props.ui?.clearIcon })"
        />
      </button>

      <UPopover
        v-bind="props.popover"
        v-model:open="open"
        mode="click"
        :reference="popoverReference"
        :ui="popoverUi"
        :content="popoverContent"
        @update:open="onUpdateOpen"
      >
        <button
          type="button"
          aria-label="Toggle calendar"
          :aria-expanded="open"
          :class="ui.calendarAction({ class: props.ui?.calendarAction })"
          :disabled="disabled"
        >
          <UIcon
            :name="props.trailingIcon"
            :class="ui.trailingIcon({ class: props.ui?.trailingIcon })"
          />
        </button>

        <template #content>
          <UCalendar
            v-if="props.range"
            v-bind="props.calendar"
            :model-value="rangeCalendarValue"
            class="p-2"
            :min-value="minDate"
            :max-value="maxDate"
            range
            :disabled="disabled"
            @update:model-value="onRangeCalendarUpdate"
          />

          <UCalendar
            v-else
            v-bind="props.calendar"
            :model-value="singleCalendarValue"
            class="p-2"
            :min-value="minDate"
            :max-value="maxDate"
            :disabled="disabled"
            @update:model-value="onSingleCalendarUpdate"
          />

          <slot
            name="footer"
            :on-close="close"
          />
        </template>
      </UPopover>
    </span>
  </div>
</template>
