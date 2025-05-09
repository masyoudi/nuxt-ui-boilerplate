<script setup lang="ts">
import { ComboboxAnchor, ComboboxTrigger } from 'reka-ui';
import type { ButtonProps } from '#ui/components/Button.vue';
import { omit, toArray } from '~~/shared/utils';
import type { ComboBoxItem } from '~/types/combobox';

interface FetchQuery {
  page: number;
  perpage: number;
  q: string;
}

interface Props {
  selected?: ComboBoxItem;
  url: string;
  limit?: number;
  placeholder?: string;
  placeholderSearch?: string;
  transformFetchData?: (result: any) => ComboBoxItem[];
  transformFetchQuery?: (params: FetchQuery) => Record<string, any>;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  filter?: (item: ComboBoxItem, searchTerm: string, isChild: boolean) => boolean;
  icon?: string;
  trailingIcon?: string;
  paginated?: boolean;
  debounce?: number;
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  variant: 'outline',
  limit: 10,
  transformFetchData: (result: any) => toArray(result).map((val) => ({
    value: val.id,
    label: val.name,
    ...omit(val, ['value', 'label'])
  })),
  filter: (item, text) => item.label.toLowerCase().includes(text.toLowerCase()),
  transformFetchQuery: (params: FetchQuery) => params,
  trailingIcon: 'lucide:chevron-down',
  paginated: true,
  debounce: 350,
  teleport: true,
  disabled: false
});

const emits = defineEmits<{
  (e: 'update:selected', val?: ComboBoxItem): void;
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

const open = ref(false);

const _selected = ref<ComboBoxItem>();
const selectedItem = computed({
  get: () => props.selected ?? _selected.value,
  set: (val) => {
    _selected.value = val;
    emits('update:selected', val);
  }
});

const search = ref('');
const options = ref<ComboBoxItem[]>([]);
const items = computed(() => {
  if (props.paginated) {
    return options.value;
  }

  return (options.value ?? []).reduce((prev, curr) => {
    const hasChilds = Array.isArray(curr._children);
    const childrens = hasChilds ? curr._children!.filter((child) => props.filter(child, search.value, true)) : [];

    if (childrens.length > 0 || props.filter(curr, search.value, false)) {
      prev.push({ ...curr, ...(hasChilds && { _children: childrens }) });
    }

    return prev;
  }, [] as ComboBoxItem[]);
});
const displayLabel = computed(() => selectedItem.value?.label ?? '');
const loading = ref(false);
const isFetched = ref(false);

const page = ref(1);
const hasMoreItems = ref(false);
const isDisabled = computed(() => props.disabled);

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
 * Handle selected item combobox
 * @param item - Selected item
 */
async function onSelected(item?: ComboBoxItem) {
  const eventInit = {
    target: {
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
 * Handle infinity scroll combobox
 */
function onScrollEnd() {
  if (!loading.value && hasMoreItems.value && props.paginated) {
    fetchData();
  }
}

/**
 * Handle input combobox
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
  if (isOpen) {
    const blurEvent = new FocusEvent('blur');

    emits('blur', blurEvent);
    emitFormBlur();
    return;
  }

  const focusEvent = new FocusEvent('focus');

  emits('focus', focusEvent);
  emitFormFocus();
}

/**
 * Handle keyboard arrow up & down
 */
function onKeydownArrowUpAndDown() {
  if (!open.value) {
    open.value = true;
  }
}

watchEffect(() => {
  if (open.value && !options.value.length && !isFetched.value) {
    setTimeout(fetchData, 150);
  }
});
</script>

<template>
  <div class="relative">
    <ComboBox
      v-model="selectedItem"
      v-model:search="search"
      v-model:open="open"
      :items="items"
      :loading="loading"
      :disabled="isDisabled"
      :debounce="props.debounce"
      :portal="props.teleport"
      @searching="() => onInput()"
      @update:model-value="(val) => onSelected(val as ComboBoxItem)"
      @update:open="onUpdateOpen"
      @scroll-end="onScrollEnd"
    >
      <ComboboxAnchor as-child>
        <ComboboxTrigger as-child>
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
            :tabindex="null"
            @keydown.up.prevent="onKeydownArrowUpAndDown"
            @keydown.down.prevent="onKeydownArrowUpAndDown"
          >
            <span
              class="overflow-hidden whitespace-nowrap"
              :class="{ 'text-slate-400': !displayLabel || displayLabel === '' }"
            >
              {{ displayLabel ? displayLabel : props.placeholder }}
            </span>
          </UButton>
        </ComboboxTrigger>
      </ComboboxAnchor>
    </ComboBox>
  </div>
</template>
