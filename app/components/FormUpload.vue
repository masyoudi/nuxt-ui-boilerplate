<script setup lang="ts">
import { tv } from 'tailwind-variants';

interface Props {
  modelValue?: File | File[];
  id?: string;
  name?: string;
  multiple?: boolean;
  accept?: string;
  dragDrop?: boolean;
  class?: string;
  dropClass?: string;
  validateType?: (file: File, accept?: string) => boolean;
  validateSize?: (fileSize: number) => boolean;
  disabled?: boolean;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  dragDrop: false,
  validateType: (file: File, accept?: string) => {
    // Allow all file types if `accept` not provided
    if (!accept) {
      return true;
    }

    const accepts = accept.split(',').filter((v) => v !== '');
    if (!accepts.length) {
      return true;
    }

    return accepts.some((_accept) => {
      const type = _accept.trim();

      if (type.substring(0, 1) === '.') {
        const extension = file.name.toLowerCase().slice(-type.length);
        return extension === type.toLowerCase();
      }

      return file.type.match(type);
    });
  },
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: File | File[]): void;
  (e: 'focus', event: Event): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (e: 'blur', event: Event): void;
  (e: 'drop', focused: boolean): void;
  (e: 'invalidSize', files: File[]): void;
}>();

const vmodel = defineModel<File | File[] | undefined>({ default: undefined });

const attrs: Record<string, any> = useAttrs();

const inputAttrs = computed(() => {
  const { class: _, ...parts } = attrs ?? {};

  return parts;
});

const {
  name,
  emitFormChange,
  emitFormInput,
  emitFormBlur,
  emitFormFocus,
  id,
  ariaAttrs,
  disabled: isDisabled
} = useFormField<Props>(props, { deferInputValidation: true });

const theme = tv({
  slots: {
    root: 'relative',
    drop: 'border border-dashed border-slate-300 rounded-md data-dragover:border-(--ui-primary) focus:border-(--ui-primary)'
  }
});
const ui = theme();

const isDragDropFocus = ref(false);
const inputRef = useTemplateRef('inputRef');

/**
 * Handle click input
 * @param event - Event
 */
function onClick(event: Event) {
  if (isDisabled.value) {
    return;
  }

  event.preventDefault();
  inputRef.value?.click();
}

/**
 * Handle file changed
 * @param e - Event
 */
function onFileChange(e: Event | DragEvent) {
  if (isDisabled.value) {
    return;
  }

  if (props.dragDrop) {
    onDragDropFocus(false);
  }

  const fileList = ((e.target as HTMLInputElement)?.files || (e as DragEvent)?.dataTransfer?.files);
  const files = fileList ? [...fileList].filter((file) => props.validateType(file, props.accept)) : undefined;
  if (!files) {
    return;
  }

  const hasValidationSize = typeof props.validateSize === 'function';
  const _files = files.filter((file) => hasValidationSize ? props.validateSize(file.size) : true);

  if (hasValidationSize && _files.length !== files.length) {
    emits('invalidSize', files.filter((file) => !props.validateSize!(file.size)));
  }

  if (props.multiple) {
    vmodel.value = [...(Array.isArray(vmodel.value) ? vmodel.value : []), ..._files];
  }
  else {
    const [file] = _files;
    vmodel.value = file;
  }

  emitFormChange();
  emitFormInput();

  clearInput();
}

/**
 * Handle on focus
 * @param event - Focus event
 */
function onFocus(event: Event) {
  emits('focus', event);
  emitFormFocus();
}

/**
 * Handle on blur
 * @param event - Focus event
 */
function onBlur(event: Event) {
  emits('blur', event);
  emitFormBlur();
}

/**
 * Handle drag and drop
 * @param event - Focus event
 */
function onDragDropFocus(isFocus: boolean) {
  if (isDisabled.value) {
    return;
  }

  isDragDropFocus.value = isFocus;
  emits('drop', isFocus);
}

function clearInput() {
  if (!inputRef.value) {
    return;
  }

  inputRef.value.value = '';
}
</script>

<template>
  <div :class="ui.root({ class: props.class })">
    <template v-if="!props.dragDrop">
      <slot :onclick="onClick" />
    </template>

    <div
      v-if="props.dragDrop"
      role="button"
      :tabindex="-1"
      :class="ui.drop({ class: props.dropClass })"
      :data-dragover="isDragDropFocus ? true : null"
      @mouseenter="onDragDropFocus(true)"
      @mouseleave="onDragDropFocus(false)"
      @dragover.prevent="onDragDropFocus(true)"
      @dragleave.prevent="onDragDropFocus(false)"
      @dragenter.prevent="onDragDropFocus(true)"
      @drop.prevent="onFileChange"
      @click.stop.prevent="onClick"
    >
      <slot :onclick="onClick" />
    </div>

    <input
      v-bind="{ ...inputAttrs, ...ariaAttrs }"
      :id="id"
      ref="inputRef"
      :name="name"
      type="file"
      class="absolute inset-0 appearance-none opacity-0 -z-[1]"
      :multiple="props.multiple"
      :accept="props.accept"
      :disabled="isDisabled"
      @change="onFileChange"
      @focus="onFocus"
      @blur="onBlur"
    >
  </div>
</template>
