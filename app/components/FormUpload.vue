<script setup lang="ts">
import { tv } from 'tailwind-variants';

interface Props {
  modelValue?: File | File[];
  multiple?: boolean;
  accept?: string;
  native?: boolean;
  dragDrop?: boolean;
  class?: string;
  dropClass?: string;
  checkType?: (file: File, accept?: string) => boolean;
  disabled?: boolean;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  native: true,
  dragDrop: false,
  checkType: (file: File, accept?: string) => {
    if (!accept) {
      return false;
    }

    const accepts = accept.split(',');

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
}>();

const vmodel = defineModel<File | File[] | undefined>({ default: undefined });

const attrs: Record<string, any> = useAttrs();

const inputAttrs = computed(() => {
  const { class: _, ...parts } = attrs ?? {};

  return parts;
});

const theme = tv({
  slots: {
    root: 'relative',
    drop: 'border border-dashed border-slate-300 rounded-md data-dragover:border-[var(--ui-color-primary-500)]'
  }
});
const ui = theme();

const isDragDropFocus = ref(false);
const inputRef = useTemplateRef('inputRef');

function onClick(event: Event) {
  if (props.disabled) {
    return;
  }

  event.preventDefault();
  inputRef.value?.click();
}

function onFileChange(event: Event | DragEvent) {
  if (props.disabled) {
    return;
  }

  if (props.dragDrop) {
    onDragDropFocus(false);
  }

  const value = (
    (event.target as HTMLInputElement)?.files
    || (event as DragEvent)?.dataTransfer?.files
    || []
  );

  if (value.length === 0) {
    if (!vmodel.value) {
      return;
    }
  }

  if (props.multiple) {
    const values = props.native || !vmodel.value || !Array.isArray(vmodel.value) ? [] : [...vmodel.value];
    for (let i = 0; i < value.length; i++) {
      const file = value[i]!;

      if (props.checkType(file, props.accept)) {
        values.push(file);
      }
    }

    vmodel.value = values;
    return;
  }

  if (props.dragDrop && value.length !== 1) {
    return;
  }

  const file = value[0]!;
  if (props.checkType(file, props.accept)) {
    vmodel.value = file;
  }
  else if (vmodel.value) {
    vmodel.value = undefined;
    clearInput();
  }
  else {
    clearInput();
  }
}

function onFocus(event: Event) {
  emits('focus', event);
}

function onBlur(event: Event) {
  emits('blur', event);
}

function onDragDropFocus(isFocus: boolean) {
  if (props.disabled) {
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

watch(vmodel, (value) => {
  if ((!value || (Array.isArray(value) && value.length <= 0)) && inputRef.value) {
    clearInput();
  }
});
</script>

<template>
  <div :class="ui.root({ class: props.class })">
    <template v-if="!props.dragDrop">
      <slot :onclick="onClick" />
    </template>

    <div
      v-if="props.dragDrop"
      role="button"
      tabindex="0"
      :class="ui.drop({ class: props.dropClass })"
      :data-dragover="isDragDropFocus ? true : null"
      @mouseenter="onDragDropFocus(true)"
      @mouseleave="onDragDropFocus(false)"
      @dragover.prevent="onDragDropFocus(true)"
      @dragleave.prevent="onDragDropFocus(false)"
      @dragenter.prevent="onDragDropFocus(true)"
      @drop.prevent="onFileChange"
    >
      <slot :onclick="onClick" />
    </div>

    <input
      ref="inputRef"
      v-bind="inputAttrs"
      type="file"
      class="absolute inset-0 appearance-none -z-[1]"
      :multiple="props.multiple"
      :accept="props.accept"
      :disabled="props.disabled"
      @change="onFileChange"
      @focus="onFocus"
      @blur="onBlur"
    >
  </div>
</template>
