<script setup lang="ts">
import { CalendarDateTime } from '@internationalized/date';
import { TimeFieldInput, TimeFieldRoot, type TimeFieldRootProps } from 'reka-ui';
import { tv } from 'tailwind-variants';
import type { InputProps } from '#ui/components/Input.vue';
import type { DatepickerValue } from '~/types/datepicker';

interface UIElements {
  base?: string;
  wrapper?: string;
  input?: string;
  leading?: string;
  leadingIcon?: string;
  trailing?: string;
  trailingIcon?: string;
}

interface Props {
  modelValue?: DatepickerValue;
  size?: InputProps['size'];
  color?: InputProps['color'];
  variant?: InputProps['variant'];
  icon?: string;
  trailingIcon?: string;
  min?: Date;
  max?: Date;
  hourCycle?: 12 | 24;
  granularity?: 'hour' | 'minute' | 'second';
  locale?: string;
  hideTimeZone?: boolean;
  step?: TimeFieldRootProps['step'];
  class?: string;
  creator?: (value: Date) => DatepickerValue;
  ui?: UIElements;
  readonly?: boolean;
  disabled?: boolean;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  icon: 'lucide:clock',
  creator: (value: Date) => value as DatepickerValue,
  hourCycle: 24,
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: DatepickerValue): void;
  (e: 'change', event: Event): void;
  (e: 'focus', event: FocusEvent): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'blur', event: FocusEvent): void;
}>();

const slots = useSlots();

const _model = ref();
const vmodel = computed({
  get: () => {
    const value = props.modelValue ?? _model.value;
    if (!value || (Number.isNaN(new Date(value)))) {
      return undefined;
    }

    const d = new Date(value);
    return new CalendarDateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  },
  set: (val) => {
    if (val) {
      const prev = new Date(props.modelValue ?? _model.value);
      const d = (!Number.isNaN(prev.valueOf()) ? prev : new Date());
      d.setHours(val.hour);
      d.setMinutes(val.minute);
      d.setSeconds(val.second);

      _model.value = d;
      emits('update:modelValue', props.creator(d));
    }
  }
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

const {
  emitFormBlur,
  emitFormFocus,
  emitFormChange,
  emitFormInput,
  size: groupSize,
  color: groupColor,
  id,
  name,
  disabled: isDisabled,
  ariaAttrs
} = useFormField<Props>(props);

const {
  orientation,
  size: buttonGroupSize
} = useButtonGroup<Props>(props);

const inputSize = computed(() => buttonGroupSize.value || groupSize.value);

const theme = tv({
  slots: {
    base: 'relative inline-flex items-center select-none rounded-md',
    wrapper: 'inline-flex items-center grow shrink gap-x-0.5',
    input: 'rounded focus:outline-none focus:ring focus:ring-inset focus:ring-slate-500 data-[placeholder]:text-slate-400 p-0.5',
    leading: 'inline-flex items-center grow-0 shrink-0',
    leadingIcon: 'text-slate-400',
    trailing: 'inline-flex items-center grow-0 shrink-0',
    trailingIcon: 'text-slate-400'
  },
  variants: {
    size: {
      xs: {
        base: 'gap-x-1 px-2 py-0.5',
        input: 'text-xs',
        leadingIcon: 'size-4',
        trailingIcon: 'size-4'
      },
      sm: {
        base: 'gap-x-1.5 px-2 py-1',
        input: 'text-xs',
        leadingIcon: 'size-4',
        trailingIcon: 'size-4'
      },
      md: {
        base: 'gap-x-1.5 px-2.5 py-1',
        input: 'text-sm',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5'
      },
      lg: {
        base: 'gap-x-2 px-3 py-1.5',
        input: 'text-sm',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5'
      },
      xl: {
        base: 'gap-x-2 px-3 py-1.5',
        input: 'text-base',
        leadingIcon: 'size-6',
        trailingIcon: 'size-6'
      }
    },
    variant: {
      outline: 'bg-default ring ring-inset ring-accented',
      soft: 'bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50',
      subtle: 'bg-elevated ring ring-inset ring-accented',
      ghost: 'bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent',
      none: 'bg-transparent'
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      info: '',
      warning: '',
      error: '',
      danger: '',
      neutral: ''
    },
    buttonGroup: {
      horizontal: 'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]',
      vertical: 'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]'
    },
    focus: {
      true: ''
    }
  },
  compoundVariants: [
    {
      color: 'primary',
      variant: ['outline', 'subtle'],
      focus: true,
      class: 'ring-primary'
    },
    {
      color: 'error',
      variant: ['outline', 'subtle'],
      class: 'ring-error'
    },
    {
      color: 'neutral',
      variant: ['outline', 'subtle'],
      class: 'ring-inverted'
    }
  ],
  defaultVariants: {
    color: 'primary',
    variant: 'outline',
    size: 'md'
  }
});

const classes = computed(() => theme({
  size: inputSize.value,
  color: groupColor.value,
  variant: props.variant,
  buttonGroup: orientation.value,
  focus: isFocus.value
}));

const isFocus = ref(false);
const inputSegmentRefs = useTemplateRef('inputSegmentRefs');

function onUpdate(value: any) {
  const eventInit: Record<string, any> = {
    detail: {
      value
    }
  };
  const event = new Event('change', eventInit);
  emits('change', event);
  emitFormChange();
  emitFormInput();
}

function onFocus(event: FocusEvent) {
  isFocus.value = true;
  emits('focus', event);
  emitFormFocus();
}

function onBlur(event: FocusEvent) {
  isFocus.value = false;
  emits('blur', event);
  emitFormBlur();
}

function onClickRoot(evt: Event) {
  const firstInput = toArray(inputSegmentRefs.value).at(0)?.$el;
  const targetType = (evt.target as any)?.getAttribute('data-timepicker');
  if (!firstInput || isDisabled.value || !['root', 'wrapper'].includes(targetType)) {
    return;
  }

  firstInput?.focus();
}
</script>

<template>
  <TimeFieldRoot
    v-bind="{ ...ariaAttrs }"
    :id="id"
    v-slot="{ segments }"
    v-model="vmodel"
    :name="name"
    :min-value="minDate"
    :max-value="maxDate"
    :hour-cycle="props.hourCycle"
    :granularity="props.granularity"
    :locale="props.locale"
    :hide-time-zone="props.hideTimeZone"
    :class="classes.base({ class: [props.ui?.base, props.class] })"
    data-timepicker="root"
    :data-focused="isFocus"
    :readonly="props.readonly"
    :disabled="isDisabled"
    @update:model-value="onUpdate"
    @click="onClickRoot"
  >
    <div
      v-if="!!slots.leading || typeof props.icon === 'string'"
      :class="classes.leading({ class: props.ui?.leading })"
    >
      <slot
        name="leading"
        :ui="classes"
      >
        <UIcon
          v-if="typeof props.icon === 'string'"
          :name="props.icon"
          :class="classes.leadingIcon({ class: props.ui?.leadingIcon })"
        />
      </slot>
    </div>

    <div
      :class="classes.wrapper({ class: props.ui?.wrapper })"
      data-timepicker="wrapper"
    >
      <template
        v-for="item in segments"
        :key="item.part"
      >
        <TimeFieldInput
          v-if="item.part === 'literal'"
          :part="item.part"
          data-part=""
        >
          {{ item.value }}
        </TimeFieldInput>
        <TimeFieldInput
          v-else
          ref="inputSegmentRefs"
          :part="item.part"
          :class="classes.input({ class: props.ui?.input })"
          @focus="onFocus"
          @blur="onBlur"
        >
          {{ item.value }}
        </TimeFieldInput>
      </template>
    </div>

    <div
      v-if="!!slots.trailing || typeof props.trailingIcon === 'string'"
      :class="classes.trailing({ class: props.ui?.trailing })"
    >
      <slot
        name="trailing"
        :ui="classes"
      >
        <UIcon
          v-if="typeof props.trailingIcon === 'string'"
          :name="props.trailingIcon"
          :class="classes.trailingIcon({ class: props.ui?.trailingIcon })"
        />
      </slot>
    </div>
  </TimeFieldRoot>
</template>
