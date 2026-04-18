<script setup lang="ts">
import { CalendarDateTime, getLocalTimeZone } from '@internationalized/date';
import { formatDate } from '@vueuse/core';
import type { ButtonProps } from '#ui/components/Button.vue';
import type { CalendarProps } from '#ui/components/Calendar.vue';
import type { DatepickerValue } from '~/types/datepicker';
import theme from '~/theme/datepicker';
import { useFieldGroup } from '@nuxt/ui/composables';

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
  clearable?: boolean;
  clearIcon?: string;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  variant: 'outline',
  placeholder: 'Select date',
  creator: (value: Date) => value as DatepickerValue,
  dismissable: true,
  clearable: true,
  clearIcon: 'lucide:x',
  teleport: true,
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:modelValue', value?: DatepickerValue): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', event: Event): void;
}>();

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
} = useFormField<Props>(props, { deferInputValidation: true });
const { size: fieldGroupSize } = useFieldGroup<Props>(props);

const buttonSize = computed(() => fieldGroupSize.value || formGroupSize.value);
const buttonId = ref(id.value ?? useId());
const buttonElement = ref<HTMLButtonElement>();

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

const isClearable = computed(() => displayDate.value !== '' && props.clearable);

const ui = computed(() => theme({
  size: props.size,
  hasValue: displayDate.value !== ''
}));

/**
 * Format display date
 * @param date - Date value
 */
function format(date: Date) {
  if (!props.formatter || (props.formatter && typeof props.formatter !== 'function')) {
    return formatDate(date, 'DD/MM/YYYY h:mm A');
  }

  return props.formatter(date);
}

/**
 * Update v-model for time value
 * @param val - Date value
 */
function onUpdateTime(val: Date) {
  vmodel.value = new CalendarDateTime(
    val.getFullYear(),
    val.getMonth() + 1,
    val.getDate(),
    val.getHours(),
    val.getMinutes(),
    val.getSeconds()
  );

  onUpdate(val);
}

/**
 * Handle blur event
 * @param event - Focus event
 */
function onBlur(event: FocusEvent) {
  emitFormBlur();
  emits('blur', event);
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

  const event = new CustomEvent('change', eventInit as any);
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

/**
 * Close popover
 */
function close() {
  open.value = false;
}

function onClear() {
  _model.value = undefined;
  emits('update:modelValue', undefined);
  onUpdate(undefined);
}

onMounted(() => {
  buttonElement.value = document.getElementById(buttonId.value) as HTMLButtonElement;
});
</script>

<template>
  <UPopover
    v-model:open="open"
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
        :class="ui.trigger()"
        :ui="{
          leadingIcon: ui.triggerIcon(),
          trailingIcon: ui.triggerTrailingIcon()
        }"
        block
        :icon="props.icon"
        :trailing-icon="props.trailingIcon"
        :size="buttonSize"
        :disabled="disabled"
        @keydown.up.prevent="onKeydownArrowUpAndDown"
        @keydown.down.prevent="onKeydownArrowUpAndDown"
      >
        <span :class="ui.value()">
          {{ displayDate ? displayDate : props.placeholder }}
        </span>

        <template
          v-if="isClearable"
          #trailing
        >
          <span
            :class="ui.clearAction()"
            @click.prevent.stop="onClear"
          >
            <UIcon
              :name="props.clearIcon"
              :class="ui.clearIcon()"
            />
          </span>
        </template>
      </UButton>
    </slot>

    <template #content>
      <UCalendar
        v-model="vmodel"
        class="p-2"
        :min-value="minDate"
        :max-value="maxDate"
        :size="props.calendarSize"
        @update:model-value="onUpdate"
      />
      <div class="w-full flex justify-center px-2 pt-2 pb-4">
        <TimePicker
          :model-value="timeModel"
          @update:model-value="(val) => onUpdateTime(val as Date)"
        />
      </div>

      <slot
        name="footer"
        :onclose="close"
      />
    </template>
  </UPopover>
</template>
