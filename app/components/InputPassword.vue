<template>
  <UInput :type="visible ? 'text' : 'password'">
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        :size="props.buttonSize"
        :icon="visible ? 'lucide:eye-closed' : 'lucide:eye'"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :aria-pressed="visible"
        aria-controls="password"
        @click="visible = !visible"
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

const visible = ref(false);
</script>
