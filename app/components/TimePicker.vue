<template>
  <TimeFieldRoot
    v-slot="{ segments }"
    v-model="vmodel"
    :min-value="minDate"
    :max-value="maxDate"
    :hour-cycle="props.hourCycle"
    :granularity="props.granularity"
    :class="classes.root({ class: [props.ui?.root, props.class], focus: focus })"
  >
    <div :class="classes.iconWrapper({ class: props.ui?.iconWrapper })">
      <UIcon
        :name="props.icon"
        :class="classes.icon({ class: props.ui?.icon })"
      />
    </div>

    <template
      v-for="item in segments"
      :key="item.part"
    >
      <TimeFieldInput
        v-if="item.part === 'literal'"
        :class="classes.literal({ class: props.ui?.literal })"
        :part="item.part"
      >
        {{ item.value }}
      </TimeFieldInput>
      <TimeFieldInput
        v-else
        :part="item.part"
        :class="classes.input({ class: props.ui?.input })"
        @focus="() => focus = true"
        @blur="() => focus = false"
      >
        {{ item.value }}
      </TimeFieldInput>
    </template>
  </TimeFieldRoot>
</template>

<script setup lang="ts">
import { CalendarDateTime } from '@internationalized/date';
import { TimeFieldInput, TimeFieldRoot } from 'reka-ui';
import { tv } from 'tailwind-variants';
import type { ButtonProps } from '#ui/components/Button.vue';
import type { CalendarProps } from '#ui/components/Calendar.vue';
import type { DatepickerValue } from '~/types/datepicker';

interface UIElements {
  root?: string;
  input?: string;
  literal?: string;
  iconWrapper?: string;
  icon?: string;
}

interface Props {
  modelValue?: DatepickerValue;
  size?: ButtonProps['size'];
  calendarSize?: CalendarProps<any, any>['size'];
  icon?: string;
  min?: Date;
  max?: Date;
  hourCycle?: 12 | 24;
  granularity?: 'hour' | 'minute' | 'second';
  class?: string;
  creator?: (value: Date) => DatepickerValue;
  ui?: UIElements;
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
}>();

const theme = tv({
  slots: {
    root: 'relative inline-flex select-none bg-white items-center rounded-md text-center border border-slate-300 gap-x-0.5 px-2.5 py-0.5',
    input: 'rounded focus:outline-none focus:shadow-[0_0_0_1px] focus:shadow-slate-700 data-[placeholder]:text-slate-400 p-0.5',
    literal: '',
    iconWrapper: 'inline-flex pointer-events-none mr-2',
    icon: 'text-slate-500'
  },
  variants: {
    focus: {
      true: ''
    }
  },
  compoundSlots: [
    {
      focus: true,
      slots: ['root'],
      class: 'border-slate-400'
    }
  ]
});

const classes = computed(() => theme());
const focus = ref(false);

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
</script>
