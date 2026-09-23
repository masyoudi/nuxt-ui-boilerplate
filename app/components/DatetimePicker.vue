<script setup lang="ts">
import { CalendarDate, Time } from '@internationalized/date';
import type { MaskedPatternOptions } from 'imask';
import { IMaskComponent } from 'vue-imask';
import type { TimeValue } from 'reka-ui';
import { cn } from 'tailwind-variants';
import type { ButtonProps } from '#ui/components/Button.vue';
import type { CalendarProps } from '#ui/components/Calendar.vue';
import type { InputTimeProps } from '#ui/components/InputTime.vue';
import { useFieldGroup } from '@nuxt/ui/composables';
import type { DatepickerPopoverProps, DatepickerValue } from '~/types/datepicker';
import theme from '~/theme/datepicker';

defineOptions({
  inheritAttrs: false
});

type Granularity = NonNullable<InputTimeProps['granularity']>;

type DatetimePickerCalendarProps = Omit<
  CalendarProps,
  | 'modelValue'
  | 'defaultValue'
  | 'range'
  | 'multiple'
  | 'minValue'
  | 'maxValue'
  | 'disabled'
  | 'readonly'
  | 'type'
>;

type DatetimePickerTimeProps = Omit<
  InputTimeProps,
  | 'modelValue'
  | 'defaultValue'
  | 'range'
  | 'minValue'
  | 'maxValue'
  | 'hourCycle'
  | 'granularity'
  | 'locale'
  | 'disabled'
  | 'readonly'
  | 'id'
  | 'name'
>;

type DatetimePickerUISlots = Pick<
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

interface Props {
  id?: string;
  name?: string;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  calendar?: DatetimePickerCalendarProps;
  time?: DatetimePickerTimeProps;
  icon?: string;
  trailingIcon?: string;
  min?: Date;
  max?: Date;
  hourCycle?: 12 | 24;
  granularity?: Granularity;
  locale?: string;
  creator?: (value: Date) => DatepickerValue;
  formatter?: (value: Date) => string;
  mask?: Partial<MaskedPatternOptions>;
  placeholder?: string;
  popover?: DatepickerPopoverProps;
  clearable?: boolean;
  clearIcon?: string;
  readonly?: boolean;
  disabled?: boolean;
  ui?: Partial<DatetimePickerUISlots>;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  variant: 'outline',
  hourCycle: 24,
  granularity: 'minute',
  creator: (value: Date) => value,
  trailingIcon: 'lucide:calendar',
  clearable: true,
  clearIcon: 'lucide:x',
  readonly: false,
  disabled: false
});

const model = defineModel<DatepickerValue>();

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
} = useFormField<Props>(props, { deferInputValidation: true });
const { size: fieldGroupSize } = useFieldGroup<Props>(props);

const inputSize = computed(() => fieldGroupSize.value || formGroupSize.value);
const inputId = ref(id.value ?? useId());
const rootElement = useTemplateRef<HTMLDivElement>('rootElement');
const popoverReference = computed(() => rootElement.value ? rootElement.value : undefined);
const inputValue = ref('');

const ui = computed(() => theme({
  size: inputSize.value,
  color: color.value,
  variant: props.variant
}));

const popoverContent = computed(() => ({
  align: 'end' as const,
  ...props.popover?.content
}));

const popoverUi = computed(() => ({
  ...props.popover?.ui,
  content: cn('z-50', props.popover?.ui?.content)
}));

const timeSegmentCount = computed(() => {
  if (props.granularity === 'hour') {
    return 1;
  }

  return props.granularity === 'second' ? 3 : 2;
});

const timeMaskPattern = computed(() => {
  const segments = Array.from({ length: timeSegmentCount.value }, () => '00').join('{:}');
  return props.hourCycle === 12 ? `${segments} aa` : segments;
});

const datetimeMaskOptions = computed(() => ({
  mask: `00{/}00{/}0000 ${timeMaskPattern.value}`,
  overwrite: true,
  prepareChar: (value: string) => value.toUpperCase(),
  ...props.mask
}) as MaskedPatternOptions);

const inputPlaceholder = computed(() => {
  if (props.placeholder) {
    return props.placeholder;
  }

  const segments = [
    'HH',
    ...(timeSegmentCount.value >= 2 ? ['MM'] : []),
    ...(timeSegmentCount.value === 3 ? ['SS'] : [])
  ];

  const suffix = props.hourCycle === 12 ? ' AM/PM' : '';
  return `DD/MM/YYYY ${segments.join(':')}${suffix}`;
});

const calendarValue = computed(() => {
  const value = getModelDate();
  if (!value) {
    return undefined;
  }

  return new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
});

const timeValue = computed(() => {
  const value = getModelDate();
  if (!value) {
    return undefined;
  }

  return new Time(value.getHours(), value.getMinutes(), value.getSeconds());
});

const minDate = computed(() => toCalendarDate(props.min));
const maxDate = computed(() => toCalendarDate(props.max));
const minTime = computed(() => getBoundaryTime(props.min));
const maxTime = computed(() => getBoundaryTime(props.max));
const isClearable = computed(() => props.clearable && !props.readonly && inputValue.value !== '');

function normalizeDate(value?: Date) {
  if (!value || Number.isNaN(value.valueOf())) {
    return undefined;
  }

  return new Date(value);
}

function getModelDate() {
  if (model.value === undefined) {
    return undefined;
  }

  return normalizeDate(new Date(model.value));
}

function toCalendarDate(value?: Date) {
  const date = normalizeDate(value);
  if (!date) {
    return undefined;
  }

  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function isSameDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function getBoundaryTime(boundary?: Date) {
  const date = normalizeDate(boundary);
  const selected = getModelDate();
  if (!date || !selected || !isSameDate(date, selected)) {
    return undefined;
  }

  return new Time(date.getHours(), date.getMinutes(), date.getSeconds());
}

function clampDate(value: Date) {
  const min = normalizeDate(props.min);
  const max = normalizeDate(props.max);

  if (min && value < min) {
    return min;
  }
  if (max && value > max) {
    return max;
  }

  return value;
}

function parseDatePart(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);
  const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  return isValid ? { day, month, year } : undefined;
}

function parseTimePart(value: string) {
  const parts = value.trim().split(' ');
  const period = props.hourCycle === 12 ? parts.pop()?.toUpperCase() : undefined;
  const segments = parts.join(' ').split(':').map(Number);

  if (segments.length !== timeSegmentCount.value || segments.some(Number.isNaN)) {
    return undefined;
  }

  const [rawHour = -1, minute = 0, second = 0] = segments;
  let hour = rawHour;
  if (minute > 59 || second > 59) {
    return undefined;
  }

  if (props.hourCycle === 12) {
    if (hour < 1 || hour > 12 || !['AM', 'PM'].includes(period ?? '')) {
      return undefined;
    }

    hour = hour % 12 + (period === 'PM' ? 12 : 0);
  }
  else if (hour < 0 || hour > 23) {
    return undefined;
  }

  return { hour, minute, second };
}

function parseInputDate(value: string) {
  const separatorIndex = value.indexOf(' ');
  if (separatorIndex < 0) {
    return undefined;
  }

  const date = parseDatePart(value.slice(0, separatorIndex));
  const time = parseTimePart(value.slice(separatorIndex + 1));
  if (!date || !time) {
    return undefined;
  }

  const result = new Date(
    date.year,
    date.month - 1,
    date.day,
    time.hour,
    time.minute,
    time.second
  );
  const min = normalizeDate(props.min);
  const max = normalizeDate(props.max);

  if ((min && result < min) || (max && result > max)) {
    return undefined;
  }

  return result;
}

function formatInputDate(value: Date) {
  const date = [value.getDate(), value.getMonth() + 1, value.getFullYear()]
    .map((part, index) => index === 2 ? String(part).padStart(4, '0') : String(part).padStart(2, '0'))
    .join('/');

  const hour = props.hourCycle === 12 ? value.getHours() % 12 || 12 : value.getHours();
  const time = [hour, value.getMinutes(), value.getSeconds()]
    .slice(0, timeSegmentCount.value)
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
  const period = props.hourCycle === 12 ? ` ${value.getHours() >= 12 ? 'PM' : 'AM'}` : '';

  return `${date} ${time}${period}`;
}

function syncInputValue(value?: Date) {
  inputValue.value = value ? formatInputDate(value) : '';
}

function onUpdate(value: unknown) {
  const event = new Event('change');
  Object.defineProperty(event, 'target', { value: { value } });

  emits('change', event);
  emitFormChange();
  emitFormInput();
}

function commitDate(value: Date) {
  const date = clampDate(value);
  model.value = props.creator(date);
  syncInputValue(date);
  onUpdate(date);
}

function onInputAccept() {
  emitFormInput();
}

function onInputComplete(value: string) {
  const date = parseInputDate(value);
  if (date) {
    commitDate(date);
  }
}

function onInputBlur() {
  if (inputValue.value === '') {
    onClear();
    return;
  }

  const date = parseInputDate(inputValue.value);
  if (!date) {
    syncInputValue(getModelDate());
  }
}

function onCalendarUpdate(value: unknown) {
  if (!(value instanceof CalendarDate)) {
    return;
  }

  const current = getModelDate() ?? new Date();
  commitDate(new Date(
    value.year,
    value.month - 1,
    value.day,
    current.getHours(),
    current.getMinutes(),
    current.getSeconds(),
    current.getMilliseconds()
  ));
}

function onTimeUpdate(value?: TimeValue) {
  if (!value) {
    return;
  }

  const current = getModelDate() ?? new Date();
  current.setHours(value.hour, value.minute, value.second, 0);
  commitDate(current);
}

function onBlur(event: FocusEvent) {
  emits('blur', event);
  emitFormBlur();
}

function onUpdateOpen(isOpen: boolean) {
  if (!isOpen) {
    onBlur(new FocusEvent('blur', { relatedTarget: rootElement.value }));
    return;
  }

  emits('focus', new FocusEvent('focus', { relatedTarget: rootElement.value }));
  emitFormFocus();
}

function close() {
  open.value = false;
}

function onClear() {
  model.value = undefined;
  syncInputValue();
  onUpdate(undefined);
}

watch(model, () => {
  syncInputValue(getModelDate());
}, { immediate: true });

watch([() => props.hourCycle, () => props.granularity], () => {
  syncInputValue(getModelDate());
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
      :id="inputId"
      v-model="inputValue"
      v-bind="datetimeMaskOptions"
      type="text"
      inputmode="text"
      autocomplete="off"
      :name="name"
      :placeholder="inputPlaceholder"
      :class="ui.input({ class: props.ui?.input })"
      :readonly="props.readonly"
      :disabled="disabled"
      @accept:masked="onInputAccept"
      @complete:masked="onInputComplete($event)"
      @blur="onInputBlur"
    />

    <span :class="ui.trailing({ class: props.ui?.trailing })">
      <button
        v-if="isClearable"
        type="button"
        aria-label="Clear datetime"
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
          aria-label="Toggle datetime picker"
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
            v-bind="props.calendar"
            :model-value="calendarValue"
            class="p-2"
            :min-value="minDate"
            :max-value="maxDate"
            :disabled="disabled"
            :readonly="props.readonly"
            @update:model-value="onCalendarUpdate"
          />

          <div class="flex w-full justify-center px-2 pt-2 pb-4">
            <UInputTime
              v-bind="props.time"
              :model-value="timeValue"
              :hour-cycle="props.hourCycle"
              :granularity="props.granularity"
              :locale="props.locale"
              :min-value="minTime"
              :max-value="maxTime"
              :disabled="disabled"
              :readonly="props.readonly"
              @update:model-value="onTimeUpdate($event as TimeValue)"
            />
          </div>

          <slot
            name="footer"
            :on-close="close"
          />
        </template>
      </UPopover>
    </span>
  </div>
</template>
