<template>
  <UInput :type="show ? 'text' : 'password'">
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        :size="props.buttonSize"
        :icon="show ? 'lucide:eye-closed' : 'lucide:eye'"
        :aria-label="show ? 'Hide password' : 'Show password'"
        :aria-pressed="show"
        aria-controls="password"
        @click="show = !show"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
import type { ButtonProps } from '#ui/components/Button.vue';

interface Props {
  buttonSize?: ButtonProps['size'];
}

const props = withDefaults(defineProps<Props>(), {
  buttonSize: 'md'
});

const show = ref(false);
</script>
