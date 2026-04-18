<template>
  <UInput :type="visible ? 'text' : 'password'">
    <template #trailing="{ ui }">
      <slot
        name="trailing"
        :ui="ui"
        :visibility="visible"
        :toggle-visibility="toggleVisibilty"
      >
        <UButton
          color="neutral"
          variant="link"
          :size="props.buttonSize"
          :icon="visible ? 'lucide:eye-closed' : 'lucide:eye'"
          :aria-label="visible ? 'Hide password' : 'Show password'"
          :aria-pressed="visible"
          aria-controls="password"
          @click="toggleVisibilty"
        />
      </slot>
    </template>
  </UInput>
</template>

<script setup lang="ts">
import type { ButtonProps } from '#ui/types';

interface Props {
  buttonSize?: ButtonProps['size'];
}

const props = withDefaults(defineProps<Props>(), {
  buttonSize: 'md'
});

const visible = ref(false);

function toggleVisibilty() {
  visible.value = !visible.value;
}
</script>
