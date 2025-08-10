<template>
  <div :class="classes.root({ class: [props.class, props.ui?.root] })">
    <IMaskComponent
      :id="id"
      ref="inputRef"
      v-model:typed="vmodel"
      type="text"
      :name="name"
      :placeholder="placeholder"
      :class="classes.base({ class: props.ui?.base })"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      v-bind="attributes"
      @accept="onAccept"
      @focus="onFocus"
      @blur="onBlur"
      @change="onChange"
    />

    <slot />

    <span
      v-if="isLeading || !!slots.leading"
      :class="classes.leading({ class: props.ui?.leading })"
    >
      <slot name="leading">
        <UIcon
          v-if="isLeading && leadingIconName"
          :name="leadingIconName"
          :class="classes.leadingIcon({ class: props.ui?.leadingIcon })"
        />
      </slot>
    </span>

    <span
      v-if="isTrailing || !!slots.trailing"
      :class="classes.trailing({ class: props.ui?.trailing })"
    >
      <slot name="trailing">
        <UIcon
          v-if="trailingIconName"
          :name="trailingIconName"
          :class="classes.trailingIcon({ class: props.ui?.trailingIcon })"
        />
      </slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import type { FactoryArg } from 'imask';
import type { InputProps } from '@nuxt/ui/components/Input.vue';
import { IMaskComponent } from 'vue-imask';
import type { InputHTMLAttributes, VNode } from 'vue';
import _appConfig from '#build/app.config';
import theme from '#build/ui/input';

type AppConfig = typeof _appConfig & {
  ui: {
    input: Partial<typeof theme>;
  };
};

const input = tv({ extend: tv(theme), ...((_appConfig as AppConfig).ui?.input || {}) });

interface Props {
  modelValue?: string | number;
  mask?: Partial<FactoryArg>;
  name?: string;
  placeholder?: string;
  color?: InputProps['color'];
  variant?: InputProps['variant'];
  size?: InputProps['size'];
  required?: boolean;
  autocomplete?: InputHTMLAttributes['autocomplete'];
  autofocus?: boolean;
  autofocusDelay?: number;
  disabled?: boolean;
  highlight?: boolean;
  class?: any;
  icon?: string;
  leading?: boolean;
  leadingIcon?: string;
  trailing?: boolean;
  trailingIcon?: string;
  loading?: boolean;
  loadingIcon?: string;
  ui?: Partial<typeof input.slots>;
}

const props = withDefaults(defineProps<Props>(), {
  autocomplete: 'off',
  autofocusDelay: 0,
  color: 'primary',
  variant: 'outline',
  mask: () => ({ mask: Number, lazy: false }),
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
  (e: 'focus', event: FocusEvent): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', event: Event): void;
}>();
const slots = defineSlots<{
  leading(): VNode[];
  default(): VNode[];
  trailing(): VNode[];
}>();

const _value = ref('');
const vmodel = computed({
  get: () => String(props.modelValue ?? _value.value),
  set: (val) => {
    _value.value = String(val);
    emits('update:modelValue', String(val));
  }
});

const {
  emitFormFocus,
  emitFormBlur,
  emitFormInput,
  emitFormChange,
  size: formGroupSize,
  color,
  id,
  name,
  highlight,
  ariaAttrs,
  disabled
} = useFormField<Props>(props, {
  deferInputValidation: true
});
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
const { orientation, size: buttonGroupSize } = useButtonGroup<Props>(props);
const inputSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const classes = computed(() => input({
  color: color.value,
  variant: props.variant,
  size: inputSize?.value,
  loading: props.loading,
  highlight: highlight.value,
  leading: isLeading.value || !!slots.leading,
  trailing: isTrailing.value || !!slots.trailing,
  buttonGroup: orientation.value
}));

const inputRef = ref<HTMLInputElement | null>(null);
const attrs: Record<string, any> = useAttrs();

const attributes = computed(() => ({ ...attrs, ...ariaAttrs, ...(typeof props.mask === 'object' && props.mask) }));

/**
 * Set autofocus
 */
function autoFocus() {
  if (props.autofocus) {
    inputRef.value?.focus();
  }
}

/**
 * Handler accept event
 * @param _value - Unmasked value
 * @param event - Event
 */
function onAccept(_value?: string, event?: Event) {
  emitFormInput();

  if (event) {
    onChange(event);
  }
}

/**
 * Handler change event
 * @param event - Event
 */
function onChange(event: Event) {
  emits('change', event);
  emitFormChange();
}

/**
 * Handler focus event
 * @param event - Focus event value
 */
function onFocus(event: FocusEvent) {
  emits('focus', event);
  emitFormFocus();
}

/**
 * Handler blur event
 * @param event - Blur event value
 */
function onBlur(event: FocusEvent) {
  emits('blur', event);
  emitFormBlur();
}

defineExpose({
  inputRef
});

onMounted(() => {
  setTimeout(autoFocus, props.autofocusDelay);
});
</script>
