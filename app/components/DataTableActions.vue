<template>
  <div class="flex flex-wrap gap-2">
    <slot name="left"></slot>
    <UButton
      v-if="['string', 'function'].includes(typeof props.onEdit)"
      icon="i-heroicons-pencil-square"
      size="xs"
      color="green"
      :ui="{ rounded: 'rounded-full' }"
      variant="solid"
      :to="typeof props.onEdit === 'string' ? props.onEdit : undefined"
      @click="typeof props.onEdit === 'function' ? props.onEdit : undefined"
    />
    <UButton
      v-if="typeof props.onDelete === 'function'"
      icon="i-heroicons-trash"
      size="xs"
      color="red"
      :ui="{ rounded: 'rounded-full' }"
      variant="solid"
      @click="props.onDelete"
    />
    <slot name="right"></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  onEdit?: string | (() => void);
  onDelete?: () => void;
}

const props = defineProps<Props>();
</script>
