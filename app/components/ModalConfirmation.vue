<template>
  <UModal
    v-model:open="open"
    :dismissible="!loading"
    :ui="{
      overlay: cn('bg-black/20 backdrop-blur-sm', props.ui?.overlay),
      content: cn('divide-none ring-transparent', props.ui?.content),
      header: props.ui?.header,
      body: cn('py-3 sm:py-3', props.ui?.body),
      footer: cn('justify-center gap-4 py-5 sm:py-5', props.ui?.footer)
    }"
    :close="props.close"
  >
    <template
      v-if="hasHeader"
      #header
    >
      <slot name="header">
        <slot name="title">
          <component
            :is="props.title"
            v-if="isTitleVNode"
          />
          <div
            v-if="typeof props.title === 'string'"
            class="w-full text-lg text-center font-semibold"
          >
            {{ props.title }}
          </div>
        </slot>
      </slot>
    </template>
    <template #body>
      <slot name="body">
        <component
          :is="props.description"
          v-if="isDescriptionVNode"
        />
        <div
          v-if="typeof props.description === 'string'"
          class="text-center py-2"
        >
          {{ props.description }}
        </div>
      </slot>
    </template>
    <template #footer>
      <slot name="actions">
        <UButton
          v-if="props.buttonCancel !== false"
          v-bind="buttonCancelProps"
          @click="onClose"
        />

        <UButton
          v-if="props.buttonConfirm !== false"
          v-bind="buttonConfirmProps"
          :loading="loading"
          @click="onConfirmed"
        />
      </slot>
    </template>
  </UModal>
</template>

<script lang="ts">
import type { ButtonProps } from '@nuxt/ui';
import { promiseTimeout } from '@vueuse/core';
import defu from 'defu';
import { cn } from 'tailwind-variants';

interface UIModalConfirmation {
  overlay?: string;
  content?: string;
  header?: string;
  body?: string;
  footer?: string;
}

export interface ModalConfirmationProps {
  title?: string | VNode;
  description?: string | VNode;
  buttonCancel?: ButtonProps | false;
  buttonConfirm?: ButtonProps | false;
  onConfirm?: (event: MouseEvent) => Promise<void> | void;
  disimissible?: boolean;
  close?: boolean;
  ui?: UIModalConfirmation;
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<ModalConfirmationProps>(), {
  close: false
});
const emits = defineEmits<{
  (e: 'close', confirmed: boolean): void;
}>();

const open = defineModel<boolean>('open', { default: false });

const buttonCancelProps = computed(() => defu(props.buttonCancel !== false ? props.buttonCancel : {}, {
  label: 'Cancel',
  color: 'neutral' as const,
  variant: 'outline' as const,
  class: 'px-6'
}));

const buttonConfirmProps = computed(() => defu(props.buttonConfirm !== false ? props.buttonConfirm : {}, {
  label: 'Confirm',
  color: 'primary' as const,
  variant: 'solid' as const,
  class: 'px-6'
}));
const isTitleVNode = computed(() => isVnode(props.title));
const isDescriptionVNode = computed(() => isVnode(props.description));
const slots = useSlots();
const hasHeader = computed(() => {
  return !!slots.header || !!slots.title || typeof props.title !== 'undefined';
});

const loading = ref(false);

async function onConfirmed(event: MouseEvent) {
  try {
    if (typeof props.onConfirm !== 'function') {
      emits('close', true);
      return;
    }

    loading.value = true;
    await props.onConfirm(event);

    emits('close', true);
    loading.value = false;
  }
  catch (err: any) {
    loading.value = false;
    displayError(err);
  }
}

async function onClose() {
  emits('close', false);

  await promiseTimeout(300);
  if (!open.value) {
    return;
  }

  open.value = false;
}

function isVnode(node: any) {
  return typeof node === 'object' && node !== null && '__v_isVNode' in node;
}
</script>
