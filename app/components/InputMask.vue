<template>
  <div :class="classes.root({ class: [props.class, props.ui?.root] })">
    <IMaskComponent
      :id="id"
      ref="inputRef"
      v-model:typed="modelValue"
      type="text"
      :name="name"
      :placeholder="placeholder"
      :class="classes.base({ class: props.ui?.base })"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      v-bind="attributes"
      @accept="onAccept"
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
import { tv, type VariantProps } from 'tailwind-variants';
import type { AppConfig } from '@nuxt/schema';
import type { FactoryArg } from 'imask';
import { IMaskComponent } from 'vue-imask';
import _appConfig from '#build/app.config';
import theme from '#build/ui/input';
import type { InputProps, InputSlots, InputEmits } from '#ui/components/Input.vue';

const appConfig = _appConfig as AppConfig & { ui: { input: Partial<typeof theme> } };
const input = tv({ extend: tv(theme), ...(appConfig.ui?.input || {}) });

type InputVariants = VariantProps<typeof input>;

interface Props extends Omit<InputProps, 'as' | 'type' | 'avatar' | 'color'> {
  modelValue?: string | number;
  mask?: Partial<FactoryArg>;
  color?: InputVariants['color'];
}

const props = withDefaults(defineProps<Props>(), {
  autocomplete: 'off',
  autofocusDelay: 0,
  color: 'primary',
  variant: 'outline',
  mask: () => ({ mask: Number, lazy: false }),
  disabled: false
});

const emits = defineEmits<InputEmits>();
const slots = defineSlots<InputSlots>();

const _value = ref('');
const modelValue = computed({
  get: () => String(props.modelValue ?? _value.value),
  set: (val) => {
    _value.value = String(val);
    emits('update:modelValue', String(val));
  }
});

const {
  emitFormBlur,
  emitFormInput,
  emitFormChange,
  size: formGroupSize,
  color,
  id,
  name,
  highlight,
  disabled
} = useFormField<Props>(props, {
  deferInputValidation: true
});
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
const { orientation, size: buttonGroupSize } = useButtonGroup<Props>(props);
const inputSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const classes = computed(() => input({
  type: 'text' as InputVariants['type'],
  color: color.value as InputVariants['color'],
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

const attributes = computed(() => ({ ...attrs, ...(typeof props.mask === 'object' && props.mask) }));

function autoFocus() {
  if (props.autofocus) {
    inputRef.value?.focus();
  }
}

function onAccept(_value?: string, event?: Event) {
  emitFormInput();

  if (event) {
    onChange(event);
  }
}

function onChange(event: Event) {
  emitFormChange();
  emits('change', event);
}

function onBlur(event: FocusEvent) {
  emitFormBlur();
  emits('blur', event);
}

defineExpose({
  inputRef
});

onMounted(() => {
  setTimeout(autoFocus, props.autofocusDelay);
});
</script>
