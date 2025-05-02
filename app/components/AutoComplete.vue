<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import type { ButtonProps } from '#ui/components/Button.vue';
import { omit, toArray } from '~~/shared/utils';
import type { ListBoxItem } from '~/types/listbox';

interface FetchQuery {
  page: number;
  perpage: number;
  q: string;
}

interface Props {
  url: string;
  limit?: number;
  placeholder?: string;
  placeholderSearch?: string;
  transformFetchData?: (result: any) => ListBoxItem[];
  transformFetchQuery?: (params: FetchQuery) => Record<string, any>;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  icon?: string;
  trailingIcon?: string;
  paginated?: boolean;
  debounce?: number;
  dismissable?: boolean;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  variant: 'outline',
  limit: 10,
  transformFetchData: (result: any) => toArray(result).map((val) => ({
    id: val.id,
    label: val.name,
    ...omit(val, ['id', 'name'])
  })),
  transformFetchQuery: (params: FetchQuery) => params,
  trailingIcon: 'lucide:chevron-down',
  paginated: true,
  debounce: 350,
  dismissable: true,
  teleport: true,
  disabled: false
});

const emits = defineEmits<{
  (e: 'focus', event: FocusEvent): void;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
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
const { size: buttonGroupSize } = useButtonGroup<Props>(props);

const buttonSize = computed(() => buttonGroupSize.value || formGroupSize.value);
const buttonId = ref(id.value ?? useId());
const buttonElement = ref<HTMLButtonElement>();

const open = ref(false);

const selectedItem = defineModel<ListBoxItem>('selected', {
  default: undefined,
  required: false
});

const search = ref('');
const options = ref<ListBoxItem[]>([]);
const items = computed(() => {
  if (!props.paginated) {
    return (options.value ?? []).filter((v) => v.label.toLowerCase().includes(search.value.toLowerCase()));
  }

  return options.value;
});
const inputValue = computed(() => selectedItem.value?.label ?? '');
const loading = ref(false);
const isFetched = ref(false);

const page = ref(1);
const hasMoreItems = ref(false);
const isDisabled = computed(() => props.disabled);

const width = ref('max-content');

async function fetchData() {
  try {
    loading.value = true;
    const query = props.transformFetchQuery({
      page: page.value,
      perpage: props.limit,
      q: search.value
    });

    const { data: result } = await useRequest(props.url, {
      method: 'GET',
      query
    });

    const data = props.transformFetchData(result);
    const hasMore = data.length >= props.limit;

    options.value.push(...data);
    hasMoreItems.value = hasMore;
    page.value = hasMore ? page.value + 1 : page.value;
    isFetched.value = true;
    loading.value = false;
  }
  catch (err) {
    useRequestError(err);
    loading.value = false;
  }
}

/**
 * Handler selected item listbox
 * @param _item - Selected item
 */
async function onSelected(item?: ListBoxItem) {
  const eventInit = {
    target: {
      ...buttonElement.value,
      value: item
    }
  };

  const event = new Event('change', eventInit as any);
  emits('change', event);
  emitFormChange();
  emitFormInput();

  await nextTick();
  open.value = false;
}

/**
 * Handler infinity scroll listbox
 */
function onScrollEnd() {
  if (!loading.value && hasMoreItems.value && props.paginated) {
    fetchData();
  }
}

/**
 * Set listbox width
 */
function setLisboxWidth() {
  if (buttonElement.value) {
    const { width: _width } = buttonElement.value.getBoundingClientRect();
    width.value = String(_width).concat('px');
  }
}

/**
 * Handler input listbox
 */
function onInput() {
  if (!props.paginated) {
    return;
  }

  page.value = 1;
  options.value = [];
  hasMoreItems.value = false;
  nextTick(fetchData);
}

/**
 * Handler update open popover
 * @param isOpen - Popover open/close
 */
function onUpdateOpen(isOpen: boolean) {
  setLisboxWidth();

  if (isOpen) {
    const blurEvent = new FocusEvent('blur', {
      relatedTarget: buttonElement.value
    });

    emits('blur', blurEvent);
    emitFormBlur();
    return;
  }

  const focusEvent = new FocusEvent('focus', {
    relatedTarget: buttonElement.value
  });

  emits('focus', focusEvent);
  emitFormFocus();
}

useResizeObserver(buttonElement, ([entry]) => {
  if (!entry) {
    return;
  }

  setLisboxWidth();
});

watchEffect(() => {
  if (open.value && !options.value.length && !isFetched.value) {
    setTimeout(fetchData, 150);
  }
});

onMounted(() => {
  buttonElement.value = document.getElementById(buttonId.value) as HTMLButtonElement;
});
</script>

<template>
  <div class="relative">
    <UPopover
      v-model:open="open"
      :ui="{ content: `${isDisabled ? 'hidden': ''} z-[55]` }"
      :dismissible="props.dismissable"
      :portal="props.teleport"
      @update:open="onUpdateOpen"
    >
      <UButton
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :id="buttonId"
        :color="color"
        :variant="props.variant"
        class="justify-start font-normal group hover:bg-white"
        :ui="{
          leadingIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700',
          trailingIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700'
        }"
        block
        :icon="props.icon"
        :trailing-icon="props.trailingIcon"
        :size="buttonSize"
        :disabled="disabled"
      >
        <span
          class="overflow-hidden whitespace-nowrap"
          :class="{ 'text-slate-400': !inputValue || inputValue === '' }"
        >
          {{ inputValue ? inputValue : props.placeholder }}
        </span>
      </UButton>

      <template #content>
        <ListBox
          v-if="!isDisabled"
          v-model:search="search"
          v-model:selected="selectedItem"
          :loading="loading"
          :items="items"
          :width="width"
          :placeholder="props.placeholderSearch"
          @update:selected="(val) => onSelected(val as ListBoxItem)"
          @input="onInput"
          @scroll-end="onScrollEnd"
        />
      </template>
    </UPopover>
  </div>
</template>
