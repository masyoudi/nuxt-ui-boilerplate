<template>
  <div :class="classes.root({ class: [props.class, props.ui?.root] })">
    <IMaskComponent
      :id="id"
      ref="maskInputRef"
      v-model:unmasked="model"
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
import type {
  MaskedNumberOptions,
  MaskedPatternOptions,
  MaskedRegExpOptions
} from 'imask';
import type { InputProps } from '@nuxt/ui/components/Input.vue';
import { IMaskComponent } from 'vue-imask';
import type { ComponentPublicInstance, InputHTMLAttributes, VNode } from 'vue';
import _appConfig from '#build/app.config';
import theme from '#build/ui/input';
import { useComponentIcons, useFieldGroup } from '@nuxt/ui/composables';

defineOptions({
  inheritAttrs: false
});

type AppConfig = typeof _appConfig & {
  ui: {
    input: Partial<typeof theme>;
  };
};

const input = tv({ extend: tv(theme), ...((_appConfig as AppConfig).ui?.input || {}) });

type InputMaskOptions = MaskedNumberOptions | MaskedPatternOptions | MaskedRegExpOptions;

interface Props {
  mask?: InputMaskOptions;
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
const model = defineModel<string>({ default: '' });

const emits = defineEmits<{
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', event: Event): void;
}>();
const slots = defineSlots<{
  leading(): VNode[];
  default(): VNode[];
  trailing(): VNode[];
}>();

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
const { orientation, size: fieldGroupSize } = useFieldGroup<Props>(props);
const inputSize = computed(() => fieldGroupSize.value || formGroupSize.value);

const classes = computed(() => input({
  color: color.value,
  variant: props.variant,
  size: inputSize?.value,
  loading: props.loading,
  highlight: highlight.value,
  leading: isLeading.value || !!slots.leading,
  trailing: isTrailing.value || !!slots.trailing,
  fieldGroup: orientation.value
}));

const maskInputRef = useTemplateRef<ComponentPublicInstance>('maskInputRef');
const inputRef = computed<HTMLInputElement | null>(() => {
  const element = maskInputRef.value?.$el;

  return element instanceof HTMLInputElement ? element : null;
});
const attrs = useAttrs();

const attributes = computed(() => ({
  ...attrs,
  ...ariaAttrs,
  ...(typeof props.mask === 'object' && props.mask)
}));

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
 */
function onAccept() {
  emitFormInput();
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

let autofocusTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  if (!props.autofocus) {
    return;
  }

  autofocusTimer = setTimeout(autoFocus, props.autofocusDelay);
});

onBeforeUnmount(() => {
  if (autofocusTimer) {
    clearTimeout(autofocusTimer);
  }
});
</script>
