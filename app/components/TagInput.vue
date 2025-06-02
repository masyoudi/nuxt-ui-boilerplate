<script setup lang="ts">
import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot
} from 'reka-ui';
import theme from '~/utils/theme/tag-input';
import type { TagInputColor, TagInputSize, TagInputVariant } from '~/utils/theme/tag-input';

type Theme = typeof theme;

interface Props {
  id?: string;
  name?: string;
  required?: boolean;
  modelValue?: string[];
  addOnBlur?: boolean;
  addOnPaste?: boolean;
  addOnTab?: boolean;
  convertValue?: (value: string) => string;
  delimiter?: string | RegExp;
  duplicate?: boolean;
  max?: number;
  class?: string;
  highlight?: boolean;
  color?: TagInputColor;
  size?: TagInputSize;
  variant?: TagInputVariant;
  placeholder?: string;
  icon?: string;
  deleteIcon?: string;
  disabled?: boolean;
  ui?: Partial<Record<keyof ReturnType<Theme>, 'string'>>;
}

const props = withDefaults(defineProps<Props>(), {
  deleteIcon: 'lucide:x',
  icon: 'lucide:tag'
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
  (e: 'invalid', value: string): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'addTag', value: string): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'removeTag', value: string): void;
  (e: 'change', event: Event): void;
  (e: 'focus', event: FocusEvent): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'blur', event: FocusEvent): void;
}>();

const slots = useSlots();

const {
  emitFormBlur,
  emitFormFocus,
  emitFormChange,
  emitFormInput,
  size: formGroupSize,
  color,
  id,
  name,
  disabled: isDisabled,
  ariaAttrs
} = useFormField<Props>(props);

const {
  orientation,
  size: buttonGroupSize
} = useButtonGroup<Props>(props);

const inputSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const classes = computed(() => theme({
  color: color.value,
  size: inputSize.value,
  variant: props.variant,
  buttonGroup: orientation.value,
  leading: typeof props.icon === 'string'
}));

const _tags = ref<string[]>([]);
const tags = computed({
  get: () => props.modelValue ?? _tags.value,
  set: (value) => {
    _tags.value = value;
    emits('update:modelValue', value);
  }
});

/**
 * Handle update model value
 */
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
  emits('focus', event);
  emitFormFocus();
}

function onBlur(event: FocusEvent) {
  emits('blur', event);
  emitFormBlur();
}
</script>

<template>
  <TagsInputRoot
    :id="id"
    v-model="tags"
    :name="name"
    :add-on-blur="props.addOnBlur"
    :add-on-paste="props.addOnPaste"
    :add-on-tab="props.addOnTab"
    :convert-value="props.convertValue"
    :delimiter="props.delimiter"
    :duplicate="props.duplicate"
    :disabled="isDisabled"
    :class="classes.base({ class: [props.ui?.base, props.class] })"
    @update:model-value="onUpdate"
    @add-tag="emits('addTag', $event)"
    @invalid="emits('invalid', $event)"
    @remove-tag="emits('removeTag', $event)"
    @keydown.enter.prevent
  >
    <TagsInputItem
      v-for="item in tags"
      :key="item"
      :value="item"
      :class="classes.item({ class: props.ui?.item })"
    >
      <TagsInputItemText :class="classes.itemText({ class: props.ui?.itemText })" />
      <TagsInputItemDelete :class="classes.itemDelete({ class: props.ui?.itemDelete })">
        <UIcon
          :name="props.deleteIcon"
          :class="classes.itemDeleteIcon({ class: props.ui?.itemDeleteIcon })"
        />
      </TagsInputItemDelete>
    </TagsInputItem>

    <div :class="classes.wrapper({ class: props.ui?.wrapper })">
      <TagsInputInput
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :placeholder="props.placeholder"
        :class="classes.input({ class: props.ui?.input })"
        @focus="onFocus"
        @blur="onBlur"
      />

      <span
        v-if="typeof props.icon === 'string' || !!slots.icon"
        :class="classes.leading({ class: props.ui?.leading })"
      >
        <slot
          name="icon"
          :ui="ui"
        >
          <UIcon
            v-if="typeof props.icon === 'string'"
            :name="props.icon"
            :class="classes.leadingIcon({ class: props.ui?.leadingIcon })"
          />
        </slot>
      </span>
    </div>
  </TagsInputRoot>
</template>
