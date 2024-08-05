<template>
  <UForm ref="form" :data-form-id="id" :state="state" :validate-on="['submit']" @submit="onSubmit">
    <slot />
  </UForm>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ disabled?: boolean; submit?: () => void }>(), {
  disabled: false
});
const emit = defineEmits<{
  (e: 'submit', event: Event): void;
}>();

const form = ref();
const state = ref({});
const errors = computed(() => form.value?.errors);
const id = useId();

// Clear error
function clear() {
  form.value?.setErrors([]);
}

function setErrors(val: any) {
  form.value?.setErrors(val);

  setTimeout(scrollToError, 275);
}

// Emit submit event
function onSubmit(event: Event) {
  if (props.disabled) {
    return;
  }

  (document.activeElement as any)?.blur();
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
