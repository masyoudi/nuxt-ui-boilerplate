<template>
  <UForm ref="form" :data-form-id="id" :state="{}" @submit="onSubmit">
    <slot />
  </UForm>
</template>

<script setup lang="ts">
import { z } from 'zod';

interface SubmitEvent extends Event {
  data: Record<string, any>;
}

interface Props {
  schema?: z.ZodType | ((data: any) => z.ZodType);
  state?: Record<string, any>;
  submit?: () => void;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});
const emit = defineEmits<{
  (e: 'submit', event: SubmitEvent): void;
}>();

const form = ref();
const stateData = computed(() => props.state ?? {});
const errors = computed(() => form.value?.errors);
const id = useId();
const toast = useToast();

// Clear error
function clear() {
  form.value?.setErrors([]);
}

function setErrors(val: any) {
  form.value?.setErrors(val);

  nextTick(scrollToError);
}

/**
 * Create error path
 * @param value - Array of error path
 * @returns object
 */
function createPath(value: (string | number)[]) {
  const parsed = value.map((path, i) => {
    if (typeof path === 'number') {
      return `[${path}]`;
    }

    if (typeof path === 'string' && i > 0) {
      return '.'.concat(path);
    }

    return path;
  });

  return parsed.join('');
}

/**
 * Get error value
 * @param options - Zod Error
 * @param options.errors - Zod errors value
 * @returns array
 */
function parseError({ errors }: z.ZodError) {
  const arr = errors.map((err) => ({ path: createPath(err.path), message: err.message }));

  return arr.filter((value, index, self) => index === self.findIndex((t) => t.path === value.path));
}

async function validate() {
  try {
    const isFuncSchema = typeof props.schema === 'function';
    const body = stateData.value;
    const result = isFuncSchema ? await props.schema(body).safeParseAsync(body) : await props.schema?.safeParseAsync(body);
    const errors = !result?.success ? (result?.error instanceof z.ZodError ? parseError(result.error) : []) : [];
    const data = result?.data;

    return { data, errors };
  } catch {
    toast.add({ description: 'Validation failed', color: 'red' });
  }
}

// Emit submit event
async function onSubmit(event: SubmitEvent) {
  if (props.disabled) {
    return;
  }

  const validation = await validate();
  if (!validation?.errors || validation?.errors?.length > 0) {
    setErrors(validation?.errors ?? []);
    return;
  }

  event.data = validation.data ?? stateData.value;

  emit('submit', event);
}

async function scrollToError() {
  const formEl = document.querySelector(`[data-form-id="${id}"]`);
  if (!formEl) {
    return;
  }

  const [first] = [...formEl.querySelectorAll('.form-field-error')];
  if (!first) {
    return;
  }

  first.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

defineExpose({
  errors,
  setErrors,
  clear
});
</script>
