<script setup lang="ts">
import { vOnKeyStroke } from '@vueuse/components';
import { tv } from 'tailwind-variants';
import theme from '~~/app/utils/theme/tag-input';
import type { TagInputColor, TagInputSize, TagInputVariant } from '~~/app/utils/theme/tag-input';

interface Props {
  modelValue?: string[];
  size?: TagInputSize;
  color?: TagInputColor;
  variant?: TagInputVariant;
  itemColor?: TagInputColor;
  itemVariant?: TagInputVariant;
  class?: any;
  placeholder?: string;
  addKeys?: string | string[];
  deleteKeys?: string | string[];
  canAdd?: (item: string, existingItems: string[]) => boolean;
  filterDelete?: (items: string[]) => string[];
  clearOnInvalid?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  variant: 'subtle',
  placeholder: 'Enter multiple value...',
  addKeys: () => ['Enter'],
  deleteKeys: () => 'Backspace',
  canAdd: (item: string, existingItems: string[]) => {
    return !existingItems.includes(item) && item.trim() !== '';
  },
  filterDelete: (items: string[]) => {
    return items.filter((val) => val !== items.at(items.length - 1));
  },
  clearOnInvalid: false,
  disabled: false
});
const emits = defineEmits<{
  (e: 'update:model-value', val: string[]): void;
}>();

const tagInput = tv(theme);
const classes = computed(() => tagInput({
  size: props.size,
  color: props.color,
  variant: props.variant
}));

const input = ref('');
const _items = ref<string[]>([]);
const items = computed({
  get: () => props.modelValue ?? _items.value,
  set: (val) => {
    _items.value = val;
    emits('update:model-value', val);
  }
});

const isEmptyInput = ref(true);
const isFocused = ref(false);
const isDisabled = computed(() => props.disabled);

function onDeleteItem(item: string) {
  items.value = items.value.filter((val) => val !== item);
}

/**
 * Handler keystroke input
 * @param evt - Keyboard event
 */
function onKeyStroke(evt: KeyboardEvent) {
  const _addKeys = Array.isArray(props.addKeys) ? props.addKeys : [props.addKeys];
  if (_addKeys.includes(evt.key)) {
    const canAdd = props.canAdd(input.value, items.value);

    if (canAdd) {
      items.value.push(input.value);
      input.value = '';
      isEmptyInput.value = true;
    }

    if (!canAdd && props.clearOnInvalid) {
      input.value = '';
      isEmptyInput.value = true;
    }
  }

  const _deleteKeys = Array.isArray(props.deleteKeys) ? props.deleteKeys : [props.deleteKeys];
  if (_deleteKeys.includes(evt.key) && isEmptyInput.value && items.value.length > 0) {
    items.value = props.filterDelete(items.value);
  }
}

function onInput() {
  isEmptyInput.value = !input.value.length;
}
</script>

<template>
  <div :class="classes.root({ class: props.class })">
    <div
      :class="classes.wrapper({ disabled: isDisabled })"
      :data-focus="isFocused ? 'true' : null"
    >
      <TagItem
        v-for="(item, i) in items"
        :key="i"
        :color="props.itemColor ?? props.color"
        :variant="props.itemVariant ?? props.variant"
        :size="props.size"
        :closable="!isDisabled"
        @click.stop
        @close="onDeleteItem(item)"
      >
        {{ item }}
      </TagItem>

      <input
        v-model="input"
        v-on-key-stroke="onKeyStroke"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        :placeholder="props.placeholder"
        :class="classes.input()"
        :disabled="isDisabled"
        @keydown.enter.prevent="onKeyStroke"
        @input="onInput"
        @focus="() => isFocused = true"
        @blur="() => isFocused = false"
      >
    </div>
  </div>
</template>
